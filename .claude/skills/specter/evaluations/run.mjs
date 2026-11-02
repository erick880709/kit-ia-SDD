#!/usr/bin/env node
// run.mjs — Evaluation Harness de Specter. Evaluación determinista y offline: carga el dataset
// dorado (cases/*.json), aplica el Quality Gate a cada artefacto y calcula las métricas. La
// generación por LLM queda separada: este harness solo valida artefactos ya producidos.
//
// Uso: node run.mjs [--root <dir>] [--json]
// Salidas: evaluations/results.json y docs/specter-2.0/EVALUATION-REPORT.md
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { validate } from "../scripts/engine.mjs";
import { computeMetrics } from "./metrics.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadCases() {
  const dir = path.join(__dirname, "cases");
  return fs.readdirSync(dir).filter(f => f.endsWith(".json")).sort()
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}

function isObservable(ca) {
  return typeof ca?.scenario === "string" && ca.scenario.trim().length > 0
    || typeof ca?.then === "string" && ca.then.trim().length > 0;
}

function detectAmbiguities(artifact, ambiguities) {
  const haystack = [...(artifact.open_questions || []), ...(artifact.assumptions || [])].join(" ").toLowerCase();
  return ambiguities.filter(a => haystack.includes(String(a).toLowerCase()));
}

function evaluateCase(kase) {
  const artifacts = [];
  const titles = new Set();
  let duplicatesDetected = 0;
  const ambiguitiesDetectedSet = new Set();

  for (const spec of kase.artifacts || []) {
    const report = validate(spec.kind, spec.data);
    const d = spec.data;
    const hasOrigin = spec.kind === "user_story"
      ? !!(d.epic_id || (Array.isArray(d.requirement_ids) && d.requirement_ids.length))
      : !!(d.parent_hu_id || d.epic_id);
    const caTotal = spec.kind === "user_story" ? (d.acceptance_criteria || []).length : 0;
    const caObservable = spec.kind === "user_story"
      ? (d.acceptance_criteria || []).filter(isObservable).length : 0;

    artifacts.push({
      case: kase.id,
      kind: spec.kind,
      id: spec.id,
      state: report.state,
      score: report.score,
      expected_state: spec.expected_state,
      hasOrigin,
      hasAnchor: spec.kind === "technical_task" ? hasOrigin : undefined,
      caTotal,
      caObservable,
      requirement_ids: d.requirement_ids || [],
    });

    // Detección de duplicados por título entre HU del mismo caso.
    if (spec.kind === "user_story" && d.title) {
      const key = String(d.title).toLowerCase();
      if (titles.has(key)) duplicatesDetected++;
      else titles.add(key);
    }

    // Detección de ambigüedades inyectadas.
    for (const amb of detectAmbiguities(d, kase.ambiguities || [])) {
      ambiguitiesDetectedSet.add(`${kase.id}:${amb}`);
    }
  }

  return { artifacts, duplicatesDetected, ambiguitiesDetected: ambiguitiesDetectedSet.size };
}

function main() {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const cases = loadCases();

  const collected = {
    artifacts: [],
    requirementIds: [],
    ambiguitiesInjected: 0,
    ambiguitiesDetected: 0,
    duplicatesInjected: 0,
    duplicatesDetected: 0,
  };
  const perCase = [];

  for (const kase of cases) {
    const r = evaluateCase(kase);
    collected.artifacts.push(...r.artifacts);
    collected.requirementIds.push(...(kase.requirements || []));
    collected.ambiguitiesInjected += (kase.ambiguities || []).length;
    collected.ambiguitiesDetected += r.ambiguitiesDetected;
    collected.duplicatesInjected += kase.duplicates_injected || 0;
    collected.duplicatesDetected += r.duplicatesDetected;
    perCase.push({
      id: kase.id,
      name: kase.name,
      artifacts: r.artifacts.map(a => ({ id: a.id, kind: a.kind, state: a.state, expected: a.expected_state, score: a.score })),
    });
  }

  const metrics = computeMetrics(collected);
  const results = { cases: perCase, metrics, artifacts: collected.artifacts };

  const resultsFile = path.join(__dirname, "results.json");
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2) + "\n", "utf8");

  const report = renderReport(perCase, metrics);
  const reportFile = path.join(__dirname, "..", "..", "..", "..", "docs", "specter-2.0", "EVALUATION-REPORT.md");
  fs.mkdirSync(path.dirname(reportFile), { recursive: true });
  fs.writeFileSync(reportFile, report, "utf8");

  if (json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log(`Evaluation Harness: ${cases.length} casos, ${collected.artifacts.length} artefactos.`);
    for (const [id, m] of Object.entries(metrics)) {
      console.log(`  ${id}: ${m.value === null ? "N/A" : m.value}`);
    }
    console.log(`Reporte: ${path.relative(process.cwd(), reportFile)}`);
  }
  return 0;
}

function renderReport(perCase, metrics) {
  const rows = Object.entries(metrics).map(([id, m]) =>
    `| ${id} | ${m.value === null ? "N/A" : m.value} | ${m.formula} |`);
  const caseRows = perCase.map(c =>
    `| ${c.id} | ${c.name} | ${c.artifacts.map(a => `${a.id}:${a.state}${a.state === a.expected ? "" : ` (esperado ${a.expected})`}`).join(", ")} |`);
  return `# Specter 2.0 — Reporte del Evaluation Harness

> Generado por \`evaluations/run.mjs\` (determinista, sin LLM). No declarar mejora sin métricas.

## Métricas (Specter 2.0 medido)

| Métrica | Valor | Fórmula |
|---|---|---|
${rows}

## Resultados por caso

| Caso | Nombre | Artefactos (estado) |
|---|---|---|
${caseRows}

## Comparación 1.0 vs 2.0

Specter 1.0 no tenía Quality Gate determinista, contratos ni trazabilidad estructurada. Los
valores de referencia están en \`evaluations/baseline-v1.json\`; las métricas que 1.0 no medía se
marcan como N/A. La mejora solo se declara donde 2.0 mide un valor y 1.0 no lo hacía.
`;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) process.exitCode = main();
export { evaluateCase, loadCases, main };
