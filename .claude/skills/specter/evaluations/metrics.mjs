// metrics.mjs — Métricas del Evaluation Harness de Specter. Funciones puras y deterministas
// con fórmula y denominador explícitos. No dependen de red, reloj ni modelos de lenguaje.

function ratio(numerator, denominator) {
  if (!denominator) return null; // no aplica (sin observaciones)
  return Math.round((numerator / denominator) * 1000) / 1000;
}

/**
 * @param {object} collected — datos agregados por run.mjs
 * @returns {object} mapa id → {value, formula, denominator}
 */
export function computeMetrics(collected) {
  const {
    artifacts = [],
    requirementIds = [],
    ambiguitiesInjected = 0,
    ambiguitiesDetected = 0,
    duplicatesInjected = 0,
    duplicatesDetected = 0,
  } = collected;

  const hus = artifacts.filter(a => a.kind === "user_story");
  const tts = artifacts.filter(a => a.kind === "technical_task");
  const total = artifacts.length;

  // 1. Requirement Coverage: requisitos cubiertos por ≥1 HU / requisitos totales del golden.
  const coveredReqs = new Set(hus.flatMap(h => h.requirement_ids || []));
  const reqCoverage = ratio(
    requirementIds.filter(r => coveredReqs.has(r)).length,
    requirementIds.length,
  );

  // 2. Story Readiness: HU READY / HU totales.
  const storyReadiness = ratio(hus.filter(h => h.state === "READY").length, hus.length);

  // 3. Traceability Coverage: (HU con origen + TT ancladas) / (HU + TT).
  const huWithOrigin = hus.filter(h => h.hasOrigin).length;
  const ttAnchored = tts.filter(t => t.hasAnchor).length;
  const traceabilityCoverage = ratio(huWithOrigin + ttAnchored, total);

  // 4. Acceptance Criteria Testability: CA observables / CA totales.
  const caTotal = hus.reduce((s, h) => s + (h.caTotal || 0), 0);
  const caObservable = hus.reduce((s, h) => s + (h.caObservable || 0), 0);
  const caTestability = ratio(caObservable, caTotal);

  // 5. Duplicate Detection Rate: duplicados detectados / inyectados (1.0 si no se inyectaron).
  const dupRate = ratio(duplicatesDetected, duplicatesInjected) ?? 1;

  // 6. Ambiguity Detection Rate: ambigüedades detectadas / inyectadas (1.0 si no se inyectaron).
  const ambRate = ratio(ambiguitiesDetected, ambiguitiesInjected) ?? 1;

  // 7. Technical Task Completeness: media del score de las TT / 100.
  const ttCompleteness = tts.length
    ? ratio(tts.reduce((s, t) => s + (t.score || 0), 0) / tts.length, 100)
    : null;

  // 8. First Pass Quality Gate Rate: artefactos READY en primera pasada / artefactos.
  const firstPass = ratio(artifacts.filter(a => a.state === "READY").length, total);

  // 9. False Acceptance Rate: READY según gate pero no esperado READY / total READY.
  const readyCount = artifacts.filter(a => a.state === "READY").length;
  const falseAccepted = artifacts.filter(a => a.state === "READY" && a.expected_state !== "READY").length;
  const far = ratio(falseAccepted, readyCount);

  // 10. False Rejection Rate: no-READY según gate pero esperado READY / total no-READY.
  const notReadyCount = artifacts.filter(a => a.state !== "READY").length;
  const falseRejected = artifacts.filter(a => a.state !== "READY" && a.expected_state === "READY").length;
  const frr = ratio(falseRejected, notReadyCount);

  return {
    requirement_coverage: { value: reqCoverage, formula: "requisitos cubiertos / requisitos totales" },
    story_readiness: { value: storyReadiness, formula: "HU READY / HU totales" },
    traceability_coverage: { value: traceabilityCoverage, formula: "(HU con origen + TT ancladas) / (HU + TT)" },
    acceptance_criteria_testability: { value: caTestability, formula: "CA observables / CA totales" },
    duplicate_detection: { value: dupRate, formula: "duplicados detectados / duplicados inyectados" },
    ambiguity_detection: { value: ambRate, formula: "ambigüedades detectadas / ambigüedades inyectadas" },
    technical_task_completeness: { value: ttCompleteness, formula: "media del score de TT / 100" },
    first_pass_quality_gate_rate: { value: firstPass, formula: "artefactos READY / artefactos totales" },
    false_acceptance_rate: { value: far, formula: "READY no esperados / total READY" },
    false_rejection_rate: { value: frr, formula: "no-READY esperados READY / total no-READY" },
  };
}
