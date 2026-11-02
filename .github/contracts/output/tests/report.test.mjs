import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { validateResult } from '../validate.mjs';
import { examples, example, seedProject } from './contract-tests.mjs';
import { render, fromCtrf } from '../render-report.mjs';
import { readCtrf } from '../validators/qa/ctrf.mjs';
import { CAPABILITIES, loadContract, executionMetrics } from '../validators/qa/qa.mjs';

function project(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-report-node-'));
  t.after(() => { assert(path.basename(root).startsWith('qa-report-node-')); fs.rmSync(root, { recursive: true, force: true }); });
  return root;
}
for (const capability of CAPABILITIES) {
  for (const { name, value } of examples(capability).filter(item => item.value.artifacts.some(a => a.kind === 'test_results'))) {
    test(`Reporte ${capability}/${name}: contrato y Markdown usan el mismo veredicto`, async t => {
      const root = seedProject(project(t), capability);
      const normalized = (await validateResult(value, { projectRoot: root })).result;
      const report = normalized.artifacts.find(a => a.kind === 'test_results');
      const [metrics, cases] = fromCtrf(readCtrf(report.path, root), root, normalized.data);
      const observations = Object.fromEntries(normalized.metrics.map(item => [item.id, item.value]));
      assert.equal(metrics.recommendation, observations['qa.recommendation']);
      const markdown = render(metrics, cases);
      assert(markdown.includes(`**Veredicto: ${observations['qa.recommendation']}**`));
      assert(markdown.includes(`- Pasaron: ${metrics.counts.passed}`));
      assert(markdown.includes(`- Fallaron: ${metrics.counts.failed}`));
      assert(markdown.endsWith('la autenticidad de evidencias ni sustituye la aprobación del release.\n'));
    });
  }
}

function ctrfInput(root) {
  const attachments = [];
  for (const [name, contentType, file] of [['video', 'video/webm', 'video.webm'], ['trace', 'application/zip', 'trace.zip'], ['screenshot', 'image/png', 'test-finished-1.png']]) {
    const relative = `resources/qa/test-results/run-1/tc-01-chromium/${file}`;
    fs.mkdirSync(path.join(root, path.dirname(relative)), { recursive: true });
    fs.writeFileSync(path.join(root, relative), 'Entrada local de la prueba del renderer.');
    attachments.push({ name, contentType, path: relative });
  }
  return {
    reportFormat: 'CTRF', specVersion: '0.1.0',
    results: {
      tool: { name: 'playwright' },
      summary: { tests: 1, passed: 1, failed: 0, pending: 0, skipped: 0, other: 0, start: 0, stop: 1 },
      tests: [{ name: 'TC-01 [critical] login', status: 'passed', duration: 10, retries: 0, suite: ['chromium', 'login.spec.ts'], attachments }],
    },
  };
}
const expected = [{ id: 'TC-01', project: 'chromium', priority: 'critical' }];
const criteria = [{ id: 'gate', status: 'met', evidence: 'Criterios satisfechos.' }];

for (const [name, mutate, recommendation, patch = {}] of [
  ['todos satisfechos', () => {}, 'GO'],
  ['reintento', value => { value.results.tests[0].retries = 1; }, 'GO with known risks'],
  ['alcance desconocido', () => {}, 'GO with known risks', { expected: null }],
  ['evidencia faltante', value => { value.results.tests[0].attachments.shift(); }, 'GO with known risks'],
  ['fallo crítico', value => { value.results.tests[0].status = 'failed'; }, 'NO-GO'],
  ['caso omitido', value => { value.results.tests[0].status = 'skipped'; }, 'NO-GO'],
  ['caso sin estado concluyente', value => { value.results.tests[0].status = 'other'; }, 'NO-GO'],
  ['corrida vacía', value => { value.results.tests = []; }, 'NO-GO'],
  ['caso sin ID trazable', value => { value.results.tests[0].name = 'login sin identificador'; }, 'NO-GO'],
  ['criterio incumplido', () => {}, 'NO-GO', { exitCriteria: [{ id: 'gate', status: 'failed', evidence: 'Incumplido.' }] }],
]) test(`CTRF: ${name} produce ${recommendation}`, t => {
  const root = project(t), report = ctrfInput(root); mutate(report);
  const [metrics, cases] = fromCtrf(report, root, { expected, exitCriteria: criteria, ...patch });
  assert.equal(metrics.recommendation, recommendation);
  assert(render(metrics, cases).includes(`**Veredicto: ${recommendation}**`));
  if (name === 'reintento') assert.equal(metrics.retriedCases, 1);
  if (name === 'evidencia faltante') assert.deepEqual(metrics.evidenceGaps, [{ id: 'TC-01', project: 'chromium', missing: ['video'] }]);
  if (name === 'caso omitido') assert.equal(metrics.counts['not-run'], 1);
});

test('CTRF: rechaza reportes ajenos, pruebas inválidas y casos duplicados', t => {
  const root = project(t);
  for (const [mutate, error] of [
    [value => { value.results.tests[0].status = 'done'; }, /Prueba CTRF inválida/],
    [value => { value.results.tests.push(structuredClone(value.results.tests[0])); }, /duplicado en el CTRF/],
  ]) { const report = ctrfInput(root); mutate(report); assert.throws(() => fromCtrf(report, root, { expected, exitCriteria: criteria }), error); }
  const file = path.join(root, 'resources/qa/reports/ctrf.json'); fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ ...ctrfInput(root), reportFormat: 'JUnit' }));
  assert.throws(() => readCtrf('resources/qa/reports/ctrf.json', root), /no es CTRF/);
  assert.throws(() => readCtrf('../fuera.json', root), /fuera del proyecto|inexistente/);
});

test('CTRF: la evidencia debe existir dentro del proyecto, en resources/qa', t => {
  const root = project(t), report = ctrfInput(root);
  report.results.tests[0].attachments[0].path = 'resources/qa/missing.webm';
  assert.throws(() => fromCtrf(report, root), /Evidencia inexistente/);
  const outside = project(t), file = path.join(outside, 'video.webm'); fs.writeFileSync(file, 'Entrada externa.');
  report.results.tests[0].attachments[0].path = file;
  assert.throws(() => fromCtrf(report, root), /fuera del proyecto/);
  fs.writeFileSync(path.join(root, 'video.webm'), 'Fuera de resources/qa.');
  report.results.tests[0].attachments[0].path = 'video.webm';
  assert.throws(() => fromCtrf(report, root), /resources\/qa/);
});

test('CTRF de API y unitarias acredita raw_results sin exigir captura de navegador', t => {
  const root = project(t);
  for (const level of ['api', 'unit']) {
    const report = ctrfInput(root); report.results.tests[0].attachments = [];
    const [metrics] = fromCtrf(report, root, { expected: expected.map(c => ({ ...c, project: '' })), exitCriteria: criteria, evidencePolicy: { level, required: ['raw_results'], override: null } });
    assert.equal(metrics.recommendation, 'GO'); assert.equal(metrics.casesMissingEvidence, 0);
  }
});

test('Markdown ordena casos/proyectos, escapa pipes y muestra brechas', t => {
  const root = project(t);
  const [metrics] = fromCtrf(ctrfInput(root), root, { expected, exitCriteria: criteria });
  const rows = [{ id: 'Z', project: 'webkit', priority: 'high', status: 'failed', error: 'error|detalle\nsegunda línea', evidence: [] },
    { id: 'A', project: 'firefox', priority: 'critical', status: 'passed', evidence: ['raw'] },
    { id: 'A', project: 'chromium', priority: 'critical', status: 'passed', evidence: ['raw'] }];
  const markdown = render(metrics, rows);
  assert(markdown.indexOf('| A | chromium') < markdown.indexOf('| A | firefox'));
  assert(markdown.indexOf('| A | firefox') < markdown.indexOf('| Z | webkit'));
  assert(markdown.includes('error\\|detalle<br>segunda línea'));
});

test('Renderer distribuido funciona solo con Node y devuelve exit 2 para NO-GO', t => {
  const root = project(t), kit = fileURLToPath(new URL('../../../../', import.meta.url));
  const filter = source => !/(?:^|[\\/])(?:node_modules|tests|evals|__pycache__)(?:[\\/]|$)/.test(source) && !source.endsWith('.py');
  for (const relative of ['.claude/contracts/output']) fs.cpSync(path.join(kit, relative), path.join(root, relative), { recursive: true, filter });
  const helper = path.join(root, 'scripts/generate-execution-report.mjs'); fs.mkdirSync(path.dirname(helper));
  fs.copyFileSync(new URL('../generate-execution-report.mjs', import.meta.url), helper);
  const report = ctrfInput(root); report.results.tests = [];
  const file = path.join(root, 'resources/qa/reports/ctrf.json'), out = path.join(root, 'resources/qa/reports/empty.md');
  fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(report));
  const run = spawnSync(process.execPath, [helper, '--ctrf', 'resources/qa/reports/ctrf.json', '--out', out, '--fail-on-no-go'], { cwd: root, encoding: 'utf8', env: { ...process.env, PATH: path.dirname(process.execPath) } });
  assert.equal(run.status, 2, run.stdout + run.stderr); assert.match(fs.readFileSync(out, 'utf8'), /Veredicto: NO-GO/);
});

test('Renderer rechaza una política QA ajena o de otra versión', t => {
  const kit = fileURLToPath(new URL('../../../../', import.meta.url));
  const filter = source => !/(?:^|[\\/])(?:node_modules|tests|evals|__pycache__)(?:[\\/]|$)/.test(source);
  for (const [field, value, error] of [['policyId', 'otra', /Identidad de política QA/], ['contractVersion', '9.9.9', /Versión de política QA/]]) {
    const root = project(t), output = path.join(root, '.claude/contracts/output');
    fs.cpSync(path.join(kit, '.claude/contracts/output'), output, { recursive: true, filter });
    const policy = path.join(output, 'validators/qa/qa-policy.json');
    fs.writeFileSync(policy, JSON.stringify({ ...JSON.parse(fs.readFileSync(policy, 'utf8')), [field]: value }));
    const report = ctrfInput(root), file = path.join(root, 'resources/qa/reports/ctrf.json');
    fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(report));
    const run = spawnSync(process.execPath, [path.join(output, 'generate-execution-report.mjs'), '--ctrf', 'resources/qa/reports/ctrf.json', '--out', path.join(root, 'r.md'), '--project-root', root], { encoding: 'utf8' });
    assert.equal(run.status, 1, run.stdout + run.stderr); assert.match(run.stderr + run.stdout, error);
  }
});

test('CLI contractual lee el CTRF del resultado y rechaza flags incompatibles', t => {
  const root = seedProject(project(t), 'qa-ranger-playwright'), value = example('qa-ranger-playwright', item => item.data?.task === 'execute');
  const file = path.join(root, 'result.json'), out = path.join(root, 'report.md'); fs.writeFileSync(file, JSON.stringify(value));
  const helper = fileURLToPath(new URL('../generate-execution-report.mjs', import.meta.url));
  const run = spawnSync(process.execPath, [helper, '--result', file, '--out', out, '--project-root', root], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stdout + run.stderr);
  const report = readCtrf(value.artifacts.find(item => item.kind === 'test_results').path, root);
  const [metrics, cases] = fromCtrf(report, root, { expected: value.data.expected, evidencePolicy: value.data.evidencePolicy, exitCriteria: value.data.exitCriteria });
  assert.equal(fs.readFileSync(out, 'utf8'), render(metrics, cases).replaceAll('\n', os.EOL));
  for (const [extra, status] of [[['--ctrf', file], 2], [['--evidence-policy', file], 1], [['--exit-criteria', file], 1], [['--expected', file], 1]]) {
    const invalid = spawnSync(process.execPath, [helper, '--result', file, '--out', out, '--project-root', root, ...extra], { encoding: 'utf8' }); assert.equal(invalid.status, status);
  }
});
