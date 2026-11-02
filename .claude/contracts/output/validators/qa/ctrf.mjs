// Lee un reporte CTRF (https://ctrf.io) y lo convierte en la ejecución que evalúan las reglas QA.
// Los casos, estados, reintentos y evidencias salen del reporte del runner, nunca del modelo.
import path from "node:path";
import {
  require,
  readJSON,
  isObject,
  resolveReal,
  within,
  isFile,
} from "../../rules.mjs";

const CTRF_STATES = {
  passed: "passed",
  failed: "failed",
  skipped: "skipped",
  pending: "not-run",
  other: "blocked",
};
const PRIORITIES = ["critical", "high", "medium", "low"];
// Prefijos de ID que documentan Ranger y sus playbooks (funcional, seguridad, fraude, API,
// accesibilidad, unitarias y rendimiento).
const CASE_ID = /\b(?:TC|SEC|FRAUD|API|A11Y|UT|PERF)-[A-Za-z0-9-]+\b/i;

/** Lee y comprueba la forma mínima de un reporte CTRF dentro del proyecto. */
export function readCtrf(file, projectRoot) {
  projectRoot = resolveReal(projectRoot);
  const real = resolveReal(path.resolve(projectRoot, file));
  require(within(real, projectRoot) && isFile(real), `Reporte CTRF inexistente o fuera del proyecto: ${file}`);
  const report = readJSON(real);
  require(isObject(report) && report.reportFormat === "CTRF", "El reporte de resultados no es CTRF (reportFormat)");
  require(isObject(report.results) && Array.isArray(report.results.tests), "El reporte CTRF no tiene results.tests");
  require(isObject(report.results.summary), "El reporte CTRF no tiene results.summary");
  return report;
}

export function caseIdentity(test) {
  const annotations = Array.isArray(test.extra?.annotations) ? test.extra.annotations : [];
  const annotated = (type) => annotations.find((a) => a?.type === type)?.description;
  const tagged = (test.tags || []).map((t) => String(t).replace(/^@/, ""));
  const id = annotated("case") || test.name.match(CASE_ID)?.[0] || tagged.find((t) => CASE_ID.test(t)) || null;
  const priority = [annotated("priority"), test.name.match(/\[(critical|high|medium|low)\]/i)?.[1], ...tagged]
    .map((p) => p?.toLowerCase())
    .find((p) => PRIORITIES.includes(p)) || null;
  return { id, priority };
}

function attachmentKind(attachment) {
  if (["video", "trace"].includes(attachment.name)) return attachment.name;
  if (String(attachment.contentType || "").startsWith("image/")) return "screenshot";
  return "log";
}

/**
 * Construye la ejecución QA a partir del CTRF.
 * @returns {{execution: object, artifacts: Map<string, object>, summary: object}}
 *   `artifacts` contiene la evidencia de cada caso como artefactos de solo lectura para las reglas.
 */
export function executionFromCtrf(sourceId, report, projectRoot, { expected = null, exitCriteria = [], evidencePolicy } = {}) {
  projectRoot = resolveReal(projectRoot);
  const artifacts = new Map();
  const runErrors = [];
  const cases = [];
  const seen = new Set();
  report.results.tests.forEach((test, index) => {
    require(isObject(test) && typeof test.name === "string" && Object.hasOwn(CTRF_STATES, test.status),
      `Prueba CTRF inválida en la posición ${index}`);
    // Fuera de navegador, suite suele ser una clase o paquete Java, no un proyecto del plan.
    const browserSuite = evidencePolicy?.level === "browser" && Array.isArray(test.suite) && test.suite.length > 1;
    const project = typeof test.browser === "string" ? test.browser : browserSuite ? String(test.suite[0]) : "";
    // Escenario: los proyectos de preparación (login, datos) no son casos del plan.
    // Se excluyen del conteo; si fallan, la corrida queda con error porque sus dependientes no corren.
    const setupProject = Array.isArray(test.suite) && ["setup", "teardown"].includes(test.suite[0]);
    if (["setup", "teardown"].includes(project) || setupProject || /\.(setup|teardown)\.[cm]?[jt]s$/.test(String(test.filePath || ""))) {
      if (CTRF_STATES[test.status] === "failed") runErrors.push(`Falló la preparación de la corrida: ${test.name}`);
      return;
    }
    const identity = caseIdentity(test);
    // Escenario: una suite unitaria tiene cientos de pruebas sin ID de caso del plan.
    // En nivel unit se identifican por su nombre y no impiden el veredicto.
    const unit = evidencePolicy?.level === "unit";
    const id = identity.id || (unit ? test.name : null);
    const priority = identity.priority || (unit ? "medium" : null);
    // Escenario: un caso sin ID o prioridad verificable no se puede trazar al plan.
    // Se conserva en la ejecución y la corrida queda con error para impedir un GO.
    if (!id || !priority) runErrors.push(`Caso sin ID o prioridad verificable: ${test.name}`);
    const caseId = id || `UNTRACED-${index + 1}`;
    const key = JSON.stringify([caseId, project]);
    require(!seen.has(key), `Caso/proyecto duplicado en el CTRF: ${caseId} / ${project}`);
    seen.add(key);
    const evidence = [sourceId];
    for (const [n, attachment] of (test.attachments || []).entries()) {
      if (!isObject(attachment) || typeof attachment.path !== "string") continue;
      const file = resolveReal(path.resolve(projectRoot, attachment.path));
      require(within(file, projectRoot) && isFile(file), `Evidencia inexistente o fuera del proyecto: ${attachment.path}`);
      const relative = path.relative(projectRoot, file).split(path.sep).join("/");
      require(relative.startsWith("resources/qa/"), `La evidencia debe estar en resources/qa/: ${relative}`);
      const artifactId = `ctrf-${index + 1}-${n + 1}`;
      artifacts.set(artifactId, { id: artifactId, kind: attachmentKind(attachment), path: relative });
      evidence.push(artifactId);
    }
    cases.push({
      id: caseId,
      project,
      priority: priority || "high",
      status: CTRF_STATES[test.status],
      retries: Number.isInteger(test.retries) && test.retries >= 0 ? test.retries : 0,
      evidence,
    });
  });
  require(isObject(evidencePolicy), "La ejecución con CTRF requiere data.evidencePolicy");
  // El propio CTRF es la evidencia raw_results de cada caso de API o unitario.
  artifacts.set(sourceId, { id: sourceId, kind: "raw_results" });
  // Los conteos deben corresponder a los casos leídos; el resumen puede incluir setup/teardown.
  return {
    execution: {
      expected,
      cases,
      runErrors,
      exitCriteria,
      sourceArtifact: sourceId,
      evidencePolicy,
    },
    artifacts,
    summary: {
      passed: cases.filter((c) => c.status === "passed").length,
      failed: cases.filter((c) => c.status === "failed").length,
      skipped: cases.filter((c) => !["passed", "failed"].includes(c.status)).length,
    },
  };
}
