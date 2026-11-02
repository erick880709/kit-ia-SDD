import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
import { readJSON } from '../rules.mjs';
import { validateResult } from '../validate.mjs';
import { SKILLS, loadContract } from '../validators/qa/qa.mjs';

export function examples(capability) {
  const folder = path.join(SKILLS, capability, 'contracts/examples');
  return fs.readdirSync(folder).filter(name => name.endsWith('.json')).sort().map(name => ({ name, value: readJSON(path.join(folder, name)) }));
}
export function example(capability, predicate = value => value.status === 'completed') {
  const found = examples(capability).find(item => predicate(item.value));
  assert(found, `Falta ejemplo de ${capability} para la regla probada`); return structuredClone(found.value);
}
// Escenario: un ejemplo referencia archivos del proyecto (CTRF, evidencias).
// contracts/examples/project/ se copia al proyecto temporal antes de validar.
export function seedProject(root, capability) {
  const fixture = path.join(SKILLS, capability, 'contracts/examples/project');
  if (fs.existsSync(fixture)) fs.cpSync(fixture, root, { recursive: true });
  return root;
}
function emptyProject(t) { const root = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-contract-')); t.after(() => { assert(path.basename(root).startsWith('qa-contract-')); fs.rmSync(root, { recursive: true, force: true }); }); return root; }
export function contractTests(capability) {
  const project = t => seedProject(emptyProject(t), capability);
  const input = example(capability), [contract, base] = loadContract(capability);
  const metrics = result => Object.fromEntries(result.metrics.map(item => [item.id, item.value]));
  for (const { name, value } of examples(capability)) test(`${capability}: ${name} normaliza y conserva métricas al revalidar`, async t => {
    const projectRoot = project(t), first = await validateResult(value, { projectRoot });
    assert.equal(first.valid, true); assert.equal(first.result.capabilityId, contract.capabilityId);
    assert.deepEqual((await validateResult(first.result, { projectRoot })).result, first.result);
  });
  for (const [name, mutate, error] of [
    ['versión desconocida', value => { value.contractVersion = '1.0.0'; }, /contractVersion/],
    ['campo adicional', value => { value.phase = 'done'; }, /Additional properties/],
    ['capabilityId inválido', value => { value.capabilityId = 'invalid/id'; }, /capabilityId/],
    ['identidad escrita por el agente', value => { value.agentId = 'ranger'; }, /Additional properties/],
    ['resumen vacío', value => { value.summary = ''; }, /summary/],
    ['checks no es lista', value => { value.checks = {}; }, /checks/],
    ['estado desconocido', value => { value.status = 'done'; }, /status/],
    ['artefacto duplicado', value => { value.artifacts.push(structuredClone(value.artifacts[0])); }, /duplicado/],
    ['comprobación duplicada', value => { value.checks.push(structuredClone(value.checks[0])); }, /duplicadas/],
    ['partial sin pendiente', value => { value.status = 'partial'; value.pending = []; }, /incompleta debe identificar/],
    ['precondición no satisfecha', value => { value.checks[0].passed = false; }, /precondiciones/],
    ['comprobación sin booleano', value => { value.checks[0].passed = 'met'; }, /passed/],
    ['digest que no coincide', value => { const item = value.artifacts.find(a => a.path) ?? value.artifacts[0]; if (!item.path) { delete item.content; delete item.uri; item.path = 'resources/qa/fixture.md'; } item.digest = { sha256: '0'.repeat(64) }; }, /digest no coincide|inexistente/],
    ['ruta que sale del proyecto', value => { const item = value.artifacts[0]; delete item.content; delete item.uri; item.path = '../out.md'; }, /artifact.path/],
    ['archivo inexistente', value => { const item = value.artifacts[0]; delete item.content; delete item.uri; item.path = 'resources/qa/missing.md'; }, /inexistente/],
    ['dos representaciones de un artefacto', value => { const item = value.artifacts[0]; if (item.path) item.content = 'Texto adicional.'; else item.path = 'resources/qa/report.md'; }, /valid under each|exactly|oneOf/],
  ]) test(`${capability}: rechaza ${name}`, async t => { const projectRoot = project(t), value = structuredClone(input); mutate(value); await assert.rejects(validateResult(value, { projectRoot }), error); });
  test(`${capability}: corrobora la capacidad y la tarea asignadas por el host`, async t => {
    const projectRoot = project(t), value = structuredClone(input);
    const opts = { projectRoot, expectedCapabilityId: capability, expectedTask: capability === 'qa-ranger-plan-pruebas' ? 'design' : value.data.task };
    assert.equal((await validateResult(value, opts)).valid, true);
    await assert.rejects(validateResult(value, { ...opts, expectedCapabilityId: 'otra-skill' }), /capabilityId no coincide/);
    await assert.rejects(validateResult(value, { ...opts, expectedTask: opts.expectedTask === 'execute' ? 'report' : 'execute' }), /tarea no coincide/);
  });
  test(`${capability}: las métricas son derivadas y no pueden reemplazarse`, async t => {
    const projectRoot = project(t), value = (await validateResult(structuredClone(input), { projectRoot })).result;
    if (value.metrics.length) value.metrics[0].value = 'inventado';
    else value.metrics.push({ id: 'qa.invented', value: 0, unit: 'count', source: 'declared_data', scope: 'test', evidenceRefs: [] });
    await assert.rejects(validateResult(value, { projectRoot }), /metrics no coincide/);
  });
  const incomplete = examples(capability).find(item => ['input_required', 'failed'].includes(item.value.status));
  if (incomplete) test(`${capability}: bloqueo conserva datos nulos y pendientes responsables`, async t => {
    const projectRoot = project(t), value = structuredClone(incomplete.value); assert.equal((await validateResult(value, { projectRoot })).valid, true);
    value.pending = []; await assert.rejects(validateResult(value, { projectRoot }), /incompleta debe identificar/);
  });
  const design = examples(capability).find(item => item.value.data?.task === 'design');
  if (design) test(`${capability}: diseño exige trazabilidad y no acredita ejecución`, async t => {
    const projectRoot = project(t), value = structuredClone(design.value); value.data.execution = {}; await assert.rejects(validateResult(value, { projectRoot }), /Diseño no acredita|execution/);
    delete value.data.execution; delete value.data.design.cases; await assert.rejects(validateResult(value, { projectRoot }), /Diseño requiere|data de plan: faltan campos/);
  });
  if (design) test(`${capability}: código implementado no puede ocultarse como diseño`, async t => {
    const value = structuredClone(design.value); value.artifacts.push({ id: 'hidden-code', kind: 'test_code', content: 'Código implementado.' });
    await assert.rejects(validateResult(value, { projectRoot: project(t) }), /Código implementado debe usar task implement/);
  });
  if (capability === 'qa-ranger-plan-pruebas') {
    for (const [name, mutate, error] of [
      ['requisito sin decisión', value => value.data.requirements.push('AC-99'), /requisitos sin caso ni exclusión/],
      ['referencia desconocida', value => value.data.cases[0].requirements.push('AC-99'), /requisito desconocido/],
      ['caso duplicado', value => value.data.cases.push(structuredClone(value.data.cases[0])), /Caso duplicado/],
      ['exclusión repetida', value => value.data.exclusions.push(structuredClone(value.data.exclusions[0])), /Exclusión duplicada/],
      ['requisito cubierto y excluido', value => value.data.exclusions[0].requirement = value.data.cases[0].requirements[0], /ya cubierta/],
      ['entregable solicitado omitido', value => value.artifacts.pop(), /entregable solicitado/],
    ]) test(`${capability}: rechaza ${name}`, async t => { const projectRoot = project(t), value = structuredClone(input); mutate(value); await assert.rejects(validateResult(value, { projectRoot }), error); });
    test(`${capability}: exclusiones justificadas no inflan cobertura`, async t => {
      const result = (await validateResult(structuredClone(input), { projectRoot: project(t) })).result, observed = metrics(result);
      assert.equal(observed['qa.requirementsCoveragePercent'], 50); assert.equal(observed['qa.casesDesigned'], 1);
    });
    test(`${capability}: conserva encargo de solo plan y rechaza agregar runbook`, async t => {
      const projectRoot = project(t), value = structuredClone(input); value.data.deliverables = ['test_plan']; value.artifacts = value.artifacts.filter(item => item.kind === 'test_plan');
      assert.equal((await validateResult(value, { projectRoot, expectedDeliverables: ['test_plan'] })).valid, true);
      await assert.rejects(validateResult(input, { projectRoot, expectedDeliverables: ['test_plan'] }), /entregables no coinciden/);
    });
    test(`${capability}: sin requisitos no permite fabricar plan ni métricas`, async t => {
      const projectRoot = project(t), value = structuredClone(incomplete.value); value.data = structuredClone(input.data); await assert.rejects(validateResult(value, { projectRoot }), /data debe ser null/);
      value.data = null; value.artifacts = structuredClone(input.artifacts); await assert.rejects(validateResult(value, { projectRoot }), /artifacts debe estar vacío/);
    });
  }
  const ctrfRun = examples(capability).find(item => item.value.status === 'completed' && ['execute', 'implement'].includes(item.value.data?.task) && item.value.artifacts.some(a => a.kind === 'test_results'));
  if (ctrfRun) {
    const ctrfPath = ctrfRun.value.artifacts.find(a => a.kind === 'test_results').path;
    const level = ctrfRun.value.data.evidencePolicy.level;
    const withReport = (t, mutate) => { const root = project(t), file = path.join(root, ctrfPath), report = readJSON(file); mutate(report, root); fs.writeFileSync(file, JSON.stringify(report)); return root; };
    test(`${capability}: la ejecución sale del CTRF y no se transcribe`, async t => {
      for (const field of ['execution', 'verification']) {
        const value = structuredClone(ctrfRun.value); value.data[field] = {};
        await assert.rejects(validateResult(value, { projectRoot: project(t) }), new RegExp(field));
      }
      const observed = (await validateResult(structuredClone(ctrfRun.value), { projectRoot: project(t) })).result.metrics;
      assert(observed.filter(m => m.id.startsWith('qa.cases.')).every(m => m.source === 'machine_report'));
    });
    const rejections = [
      ['caso omitido por el runner', report => { report.results.tests[0].status = 'skipped'; }, /Ejecución incompleta|sin verificación/],
      ['reporte que no es CTRF', report => { report.reportFormat = 'otro'; }, /no es CTRF/],
    ];
    if (level !== 'unit') rejections.push(['caso sin ID trazable', report => { report.results.tests[0].name = 'caso sin identificador'; }, /Ejecución incompleta/]);
    if (level === 'browser') rejections.push(
      ['evidencia sin capturar', report => { report.results.tests[0].attachments = []; }, /Falta evidencia obligatoria/],
      ['evidencia que no existe en disco', (report, root) => { fs.rmSync(path.join(root, report.results.tests[0].attachments[0].path)); }, /Evidencia inexistente/],
    );
    for (const [name, mutate, error] of rejections) test(`${capability}: con CTRF rechaza ${name}`, async t => {
      await assert.rejects(validateResult(structuredClone(ctrfRun.value), { projectRoot: withReport(t, mutate) }), error);
    });
    for (const [name, mutate, error] of [
      ['alcance omitido', value => { delete value.data.expected; }, /Declara data\.expected/],
      ['alcance desconocido en una corrida completa', value => { value.data.expected = null; }, /Ejecución incompleta/],
      ['tipo de evidencia desconocido', value => value.data.evidencePolicy.required.push('inventado'), /Tipos de evidencia no admitidos/],
      ['nivel de evidencia desconocido', value => { value.data.evidencePolicy.level = 'inventado'; }, /Nivel de evidencia no admitido/],
      ['reducción sin excepción', value => { const policy = value.data.evidencePolicy; policy.required = policy.required.length > 1 ? policy.required.slice(0, -1) : ['log']; }, /Reducir evidencia/],
      ['política omitida', value => { delete value.data.evidencePolicy; }, /evidencePolicy/],
    ]) test(`${capability}: con CTRF rechaza ${name}`, async t => { const value = structuredClone(ctrfRun.value); mutate(value); await assert.rejects(validateResult(value, { projectRoot: project(t) }), error); });
    test(`${capability}: el host fija alcance y política, y la tarea no puede cambiarse por report`, async t => {
      const projectRoot = project(t), value = structuredClone(ctrfRun.value);
      assert.equal((await validateResult(value, { projectRoot, expectedScope: value.data.expected })).valid, true);
      await assert.rejects(validateResult(value, { projectRoot, expectedScope: [{ id: 'OTRO-01', project: '', priority: 'high' }] }), /alcance que fijó el host/);
      const policy = structuredClone(value.data.evidencePolicy), changed = structuredClone(value);
      changed.data.evidencePolicy.required = ['log']; changed.data.evidencePolicy.override = { reason: 'Cambio unilateral' };
      await assert.rejects(validateResult(changed, { projectRoot, expectedEvidencePolicy: policy }), /política de evidencia no coincide/);
      const report = structuredClone(value); report.data.task = 'report';
      await assert.rejects(validateResult(report, { projectRoot, expectedTask: value.data.task }), /tarea no coincide/);
    });
    test(`${capability}: un reporte con fallo crítico termina en NO-GO`, async t => {
      const value = structuredClone(ctrfRun.value); value.data.task = 'report';
      if (!value.artifacts.some(a => a.kind === 'report')) value.artifacts.push({ id: 'report-final', kind: 'report', content: 'El caso crítico falló.' });
      for (const field of ['coverage', 'targetOverride', 'coverageTargetRequired']) delete value.data[field];
      value.artifacts = value.artifacts.filter(a => !['test_code', 'coverage_report'].includes(a.kind));
      const projectRoot = withReport(t, report => { const test = report.results.tests.find(x => /\[critical\]/.test(x.name)) ?? report.results.tests[0]; test.status = 'failed'; report.results.summary.passed--; report.results.summary.failed++; });
      const observed = metrics((await validateResult(value, { projectRoot })).result);
      assert.equal(observed['qa.recommendation'], 'NO-GO');
    });
  }
  const implemented = examples(capability).find(item => item.value.data?.task === 'implement' && item.value.status === 'completed');
  if (implemented) test(`${capability}: implementación requiere CTRF satisfactorio${implemented.value.data.coverageTargetRequired ? ' y la meta de cobertura' : ''}`, async t => {
    const value = structuredClone(implemented.value);
    const report = value.artifacts.find(a => a.kind === 'test_results').path;
    const failing = project(t), file = path.join(failing, report), ctrf = readJSON(file);
    ctrf.results.tests[0].status = 'failed'; ctrf.results.summary.passed--; ctrf.results.summary.failed++;
    fs.writeFileSync(file, JSON.stringify(ctrf));
    await assert.rejects(validateResult(value, { projectRoot: failing }), /sin verificación satisfactoria|Ejecución incompleta/);
    const missing = structuredClone(value); missing.artifacts = missing.artifacts.filter(a => a.kind !== 'test_results');
    for (const field of ['expected', 'exitCriteria', 'evidencePolicy']) delete missing.data[field];
    await assert.rejects(validateResult(missing, { projectRoot: project(t) }), /Falta entregable|sin verificación|requiere el reporte CTRF/);
    if (value.data.coverageTargetRequired) {
      const low = project(t), source = path.join(low, value.artifacts.find(a => a.kind === 'coverage_report').path);
      fs.writeFileSync(source, JSON.stringify({ total: { lines: { total: 100, covered: 90 } } }));
      await assert.rejects(validateResult(value, { projectRoot: low }), /Meta unitaria acordada sin acreditar/);
    }
  });
}
