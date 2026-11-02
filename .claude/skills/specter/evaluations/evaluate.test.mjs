import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateCase, loadCases } from "./run.mjs";
import { computeMetrics } from "./metrics.mjs";

test("el harness carga al menos 10 casos", () => {
  const cases = loadCases();
  assert.ok(cases.length >= 10);
});

test("los casos dorados coinciden con el veredicto del gate (sin falsos positivos)", () => {
  const cases = loadCases();
  const collected = {
    artifacts: [],
    requirementIds: [],
    ambiguitiesInjected: 0,
    ambiguitiesDetected: 0,
    duplicatesInjected: 0,
    duplicatesDetected: 0,
  };
  for (const c of cases) {
    const r = evaluateCase(c);
    collected.artifacts.push(...r.artifacts);
    collected.requirementIds.push(...(c.requirements || []));
    collected.ambiguitiesInjected += (c.ambiguities || []).length;
    collected.ambiguitiesDetected += r.ambiguitiesDetected;
    collected.duplicatesInjected += c.duplicates_injected || 0;
    collected.duplicatesDetected += r.duplicatesDetected;
  }
  const metrics = computeMetrics(collected);
  assert.equal(metrics.false_acceptance_rate.value, 0);
  assert.equal(metrics.false_rejection_rate.value, 0);
  assert.equal(metrics.duplicate_detection.value, 1);
  assert.equal(metrics.ambiguity_detection.value, 1);
  assert.equal(metrics.requirement_coverage.value, 1);
});

test("el caso de épica ambigua detecta la ambigüedad y queda en refinamiento", () => {
  const kase = loadCases().find(c => c.id === "epic-ambigua");
  const r = evaluateCase(kase);
  assert.equal(r.ambiguitiesDetected, 1);
  const hu = r.artifacts.find(a => a.id === "HU-02");
  assert.equal(hu.state, "NEEDS_REFINEMENT");
  assert.equal(hu.expected_state, "NEEDS_REFINEMENT");
});

test("determinismo del harness: dos ejecuciones producen las mismas métricas", () => {
  const cases = loadCases();
  const run = () => {
    const collected = { artifacts: [], requirementIds: [], ambiguitiesInjected: 0, ambiguitiesDetected: 0, duplicatesInjected: 0, duplicatesDetected: 0 };
    for (const c of cases) {
      const r = evaluateCase(c);
      collected.artifacts.push(...r.artifacts);
      collected.requirementIds.push(...(c.requirements || []));
      collected.ambiguitiesInjected += (c.ambiguities || []).length;
      collected.ambiguitiesDetected += r.ambiguitiesDetected;
      collected.duplicatesInjected += c.duplicates_injected || 0;
      collected.duplicatesDetected += r.duplicatesDetected;
    }
    return computeMetrics(collected);
  };
  assert.deepEqual(run(), run());
});
