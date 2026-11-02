import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateResultsRoot, resolveResultsFolder } from '../results-root.mjs';
import { CAPABILITIES, loadContract } from '../validators/qa/qa.mjs';
test('resultsRoot: todas las capacidades QA declaran ubicación contractual separada de reportes', () => {
  for (const capability of CAPABILITIES) {
    const [contract] = loadContract(capability); assert.equal(contract.resultsRoot, 'resources/qa/contracts'); assert.equal(contract.contractVersion, '0.1.0');
    assert.equal(resolveResultsFolder(contract, 'run-123', process.cwd()), path.resolve('resources/qa/contracts/run-123'));
  }
});
test('resultsRoot: campo obligatorio, ruta relativa y runId no permiten escapar del proyecto', () => {
  for (const resultsRoot of [undefined, null, '', '/', 'C:/out', '../out', 'resources/../out', './out', 'out//runs', 'out\\runs', 'out:stream']) assert.throws(() => validateResultsRoot({ resultsRoot }));
  for (const runId of ['', '.', '..', '../otro', '/otro', 'C:otro', 'otro\\run']) assert.throws(() => resolveResultsFolder({ resultsRoot: 'resources/qa/contracts' }, runId, process.cwd()));
});
test('resultsRoot: loadContract rechaza skills sin declaración o con ruta inválida', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-results-root-')), skills = path.join(root, 'skills');
  t.after(() => { assert(path.basename(root).startsWith('qa-results-root-')); fs.rmSync(root, { recursive: true, force: true }); });
  const policy = path.join(root, 'contracts/output/validators/qa');
  fs.mkdirSync(path.join(skills, 'ranger/contracts'), { recursive: true }); fs.mkdirSync(policy, { recursive: true });
  fs.copyFileSync(new URL('../validators/qa/qa-policy.json', import.meta.url), path.join(policy, 'qa-policy.json'));
  fs.writeFileSync(path.join(skills, 'ranger/SKILL.md'), 'test');
  const [contract] = loadContract('ranger'); delete contract.resultsRoot; fs.writeFileSync(path.join(skills, 'ranger/contracts/output-contract.json'), JSON.stringify(contract));
  assert.throws(() => loadContract('ranger', skills), /declarar resultsRoot/);
  contract.resultsRoot = '../out'; fs.writeFileSync(path.join(skills, 'ranger/contracts/output-contract.json'), JSON.stringify(contract));
  assert.throws(() => loadContract('ranger', skills), /relativa/);
});
