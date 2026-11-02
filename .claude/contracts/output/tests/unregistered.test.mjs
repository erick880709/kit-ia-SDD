import test from 'node:test';
import assert from 'node:assert/strict';
import { validateResult } from '../validate.mjs';
import { example } from './contract-tests.mjs';
for (const capability of ['qa-no-registrada', 'ranger-no-registrado', 'skill-desconocida']) test(`rechaza capacidad no registrada: ${capability}`, async () => {
  const value = example('ranger'); value.capabilityId = capability; value.artifacts = [];
  await assert.rejects(validateResult(value, { projectRoot: process.cwd() }), { message: `Capacidad no registrada: ${capability}` });
});
