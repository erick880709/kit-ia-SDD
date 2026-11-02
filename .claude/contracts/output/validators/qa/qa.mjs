// Shared QA acceptance rules. This module assesses supplied data; it runs no suites.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateResultsRoot } from '../../results-root.mjs';
import { readCtrf, executionFromCtrf } from './ctrf.mjs';
import { readCoverage } from './coverage.mjs';
import {
  require,
  readJSON,
  objectFields,
  nonempty,
  integer,
  isInteger,
  sequence,
  uniqueStrings,
  percentage,
  observation,
  subset,
  equal,
  isObject,
  resolveReal,
  within,
  isFile,
  formatList,
} from "../../rules.mjs";
export const SKILLS = fileURLToPath(new URL("../../../../skills/", import.meta.url));
export const CAPABILITIES = [
  "ranger",
  "qa-ranger-plan-pruebas",
  "qa-ranger-playwright",
  "qa-ranger-karate",
  "qa-ranger-unitarias",
  "qa-ranger-selenium",
  "qa-ranger-jmeter",
  "qa-ranger-robotframework",
];
export function validateInvocation(
  value,
  artifacts,
  checks,
  {
    projectRoot = null,
    expectedEvidencePolicy = null,
    expectedTask = null,
    expectedDeliverables = null,
    expectedScope = null,
  } = {},
) {
  const capability = value.capabilityId;
  require(CAPABILITIES.includes(
    capability,
  ), `Skill QA no registrada: ${capability}`);
  if (expectedTask !== null)
    require([
      "design",
      "implement",
      "review",
      "diagnose",
      "execute",
      "report",
    ].includes(expectedTask), "Tarea QA desconocida");
  if (expectedDeliverables !== null) {
    require(capability ===
      "qa-ranger-plan-pruebas", "expected_deliverables solo aplica al plan");
    require(expectedDeliverables.length &&
      expectedDeliverables.every((x) =>
        ["test_plan", "test_runbook"].includes(x),
      ), "Entregables del plan desconocidos");
  }
  if (value.data !== null) {
    if (expectedTask !== null)
      require((capability === "qa-ranger-plan-pruebas"
        ? "design"
        : value.data.task) ===
        expectedTask, "La tarea no coincide con el encargo del host");
    if (expectedDeliverables !== null)
      require(equal(
        new Set(value.data.deliverables ?? ["test_plan", "test_runbook"]),
        new Set(expectedDeliverables),
      ), "Los entregables no coinciden con el encargo del host");
  }
  if (expectedScope !== null) sequence(expectedScope, "alcance del host");
  return validate(value, artifacts, checks, expectedEvidencePolicy, projectRoot, expectedScope);
}
export function loadContract(capability, skills = SKILLS) {
  require(CAPABILITIES.includes(
    capability,
  ), `Skill QA no registrada: ${capability}`);
  skills = resolveReal(skills);
  const basePath = resolveReal(
    path.join(path.dirname(skills), "contracts/output/validators/qa/qa-policy.json"),
  );
  require(within(
    basePath,
    path.dirname(skills),
  ), "Política QA fuera del paquete");
  const base = readJSON(basePath);
  const file = resolveReal(
    path.join(skills, capability, "contracts/output-contract.json"),
  );
  require(within(file, skills), "Contrato fuera del paquete");
  require(isFile(
    path.join(path.dirname(path.dirname(file)), "SKILL.md"),
  ), "El contrato debe pertenecer a una skill existente");
  const contract = readJSON(file);
  validateResultsRoot(contract);
  require(resolveReal(path.resolve(path.dirname(file), contract.policy)) ===
    basePath, "Política QA no reconocida");
  require(base.policyId === "qa", "Identidad de política QA inconsistente");
  require(contract.capabilityId ===
    capability, "Identidad de contrato inconsistente");
  require(contract.contractVersion ===
    base.contractVersion, "Versión de contrato no compatible");
  uniqueStrings(
    contract.preconditions.map((c) => c.id),
    "preconditions del contrato",
  );
  for (const group of contract.requiredArtifacts)
    require(group.length &&
      group.every((k) =>
        Object.hasOwn(base.artifactKinds, k),
      ), "Artefactos del contrato no admitidos");
  return [contract, base];
}
function sourceArtifact(id, artifacts, kinds = null) {
  require(typeof id === "string" &&
    artifacts.has(id), "Referencia a evidencia no declarada");
  require(kinds === null ||
    kinds.includes(artifacts.get(id).kind), "Tipo de evidencia incorrecto");
}
export function planMetrics(data, base) {
  objectFields(
    data,
    ["requirements", "cases", "exclusions"],
    ["deliverables"],
    "data de plan",
  );
  if (Object.hasOwn(data, "deliverables")) {
    const selected = uniqueStrings(data.deliverables, "deliverables");
    require(selected.size &&
      subset(
        selected,
        new Set(["test_plan", "test_runbook"]),
      ), "Entregables de plan no admitidos");
  }
  const requirements = uniqueStrings(data.requirements, "requirements");
  const covered = new Set(),
    caseIds = new Set(),
    excluded = new Set();
  sequence(data.cases, "cases");
  for (const c of data.cases) {
    objectFields(
      c,
      ["id", "requirements", "expectedResult"],
      [],
      "caso del plan",
    );
    nonempty(c.id, "case.id");
    require(!caseIds.has(c.id), "Caso duplicado en el plan");
    caseIds.add(c.id);
    const refs = uniqueStrings(c.requirements, "case.requirements");
    require(refs.size &&
      subset(
        refs,
        requirements,
      ), "Caso sin requisito o con requisito desconocido");
    nonempty(c.expectedResult, "case.expectedResult");
    refs.forEach((r) => covered.add(r));
  }
  sequence(data.exclusions, "exclusions");
  for (const e of data.exclusions) {
    objectFields(e, ["requirement", "reason"], [], "exclusión");
    const ref = e.requirement;
    require(typeof ref === "string" &&
      requirements.has(ref) &&
      !excluded.has(ref) &&
      !covered.has(ref), "Exclusión duplicada, desconocida o ya cubierta");
    nonempty(e.reason, "exclusion.reason");
    excluded.add(ref);
  }
  return {
    requirementsTotal: requirements.size,
    requirementsCovered: covered.size,
    requirementsExcluded: excluded.size,
    casesDesigned: caseIds.size,
    requirementsCoveragePercent: percentage(covered.size, requirements.size),
    requirementsWithoutDecision: [...requirements]
      .filter((r) => !covered.has(r) && !excluded.has(r))
      .sort(),
  };
}
/**
 * Mide la cobertura unitaria leyendo el reporte nativo declarado como coverage_report.
 * @param {{scope: string, include?: string[], exclude?: string[]} | null} coverage - Alcance medido.
 */
export function coverageMetrics(coverage, override, artifacts, base, projectRoot = null) {
  const policy = base.unitCoverage;
  let target = policy.defaultTarget;
  if (override !== null) {
    objectFields(override, ["value", "reason"], [], "targetOverride");
    target = override.value;
    require(typeof target === "number" &&
      Number.isFinite(target) &&
      target >= 0 &&
      target <= 100, "Meta unitaria fuera de rango");
    nonempty(override.reason, "targetOverride.reason");
  }
  if (coverage === null)
    return {
      unitCoverage: null,
      unitCoverageTarget: target,
      unitCoverageTargetMet: null,
    };
  objectFields(coverage, ["scope"], ["include", "exclude"], "coverage");
  nonempty(coverage.scope, "coverage.scope");
  const filters = {};
  for (const key of ["include", "exclude"])
    if (Object.hasOwn(coverage, key)) filters[key] = [...uniqueStrings(coverage[key], `coverage.${key}`)];
  const reports = [...artifacts.values()].filter((a) => a.kind === "coverage_report");
  require(reports.length === 1 && typeof reports[0].path === "string" && projectRoot !== null,
    "La cobertura requiere un solo artefacto coverage_report con el archivo nativo del runner");
  const totals = readCoverage(reports[0].path, projectRoot, filters);
  return { ...coverageFromTotals(totals, target, policy), coverageSource: reports[0].id };
}
export function coverageFromTotals(totals, target, policy) {
  const percentages = {},
    measured = [];
  for (const metric of policy.metrics) {
    const counts = totals[metric];
    if (!counts) {
      percentages[metric] = null;
      continue;
    }
    require(counts.covered <= counts.total, "Cobertura mayor al denominador");
    percentages[metric] = percentage(counts.covered, counts.total);
    measured.push(
      counts.total ? (100 * counts.covered) / counts.total >= target : null,
    );
  }
  return {
    unitCoverage: percentages,
    unitCoverageCounts: Object.fromEntries(policy.metrics.map((m) => [m, totals[m] ?? null])),
    unitCoverageTarget: target,
    unitCoverageSupportedMetrics: policy.metrics.filter((m) => totals[m]),
    unitCoverageTargetMet: !measured.length
      ? null
      : measured.includes(false)
        ? false
        : measured.includes(null)
          ? null
          : true,
  };
}
export function evidencePolicy(value, base) {
  objectFields(value, ["level", "required", "override"], [], "evidencePolicy");
  require(Object.hasOwn(
    base.evidencePolicy.defaults,
    value.level,
  ), "Nivel de evidencia no admitido");
  const required = uniqueStrings(value.required, "evidencePolicy.required");
  require(required.size &&
    subset(
      required,
      new Set(base.evidencePolicy.kinds),
    ), "Tipos de evidencia no admitidos");
  const defaults = new Set(base.evidencePolicy.defaults[value.level]);
  if (value.override !== null) {
    objectFields(value.override, ["reason"], [], "evidencePolicy.override");
    nonempty(value.override.reason, "evidencePolicy.override.reason");
  }
  require(subset(defaults, required) ||
    value.override !==
      null, "Reducir evidencia requiere una excepción explícita del encargo");
  return required;
}
export function executionMetrics(data, artifacts, base) {
  objectFields(
    data,
    [
      "expected",
      "cases",
      "runErrors",
      "exitCriteria",
      "sourceArtifact",
      "evidencePolicy",
    ],
    [],
    "data de ejecución",
  );
  const requiredEvidence = evidencePolicy(data.evidencePolicy, base);
  sourceArtifact(data.sourceArtifact, artifacts, ["raw_results", "test_results"]);
  const expected = new Map(),
    actual = new Map(),
    knownScope = data.expected !== null;
  const key = (c) => JSON.stringify([c.id, c.project]);
  if (knownScope) {
    sequence(data.expected, "expected");
    for (const c of data.expected) {
      objectFields(c, ["id", "project", "priority"], [], "caso previsto");
      nonempty(c.id, "expected.id");
      require(typeof c.project === "string", "expected.project inválido");
      require(base.priorities.includes(c.priority), "Prioridad no admitida");
      require(!expected.has(key(c)), "Caso/proyecto previsto duplicado");
      expected.set(key(c), c);
    }
  }
  sequence(data.cases, "cases");
  for (const c of data.cases) {
    objectFields(
      c,
      ["id", "project", "priority", "status", "retries", "evidence"],
      [],
      "caso ejecutado",
    );
    nonempty(c.id, "case.id");
    require(typeof c.project === "string", "case.project inválido");
    require(base.priorities.includes(c.priority), "Prioridad no admitida");
    require(Object.hasOwn(
      base.caseStates,
      c.status,
    ), "Estado de caso no admitido");
    integer(c.retries, "case.retries", c, "retries");
    uniqueStrings(c.evidence, "case.evidence");
    c.evidence.forEach((id) =>
      sourceArtifact(id, artifacts, base.evidencePolicy.kinds),
    );
    require(!actual.has(key(c)), "Caso/proyecto ejecutado duplicado");
    actual.set(key(c), c);
  }
  uniqueStrings(data.runErrors, "runErrors");
  sequence(data.exitCriteria, "exitCriteria");
  const criterionIds = new Set();
  for (const c of data.exitCriteria) {
    objectFields(c, ["id", "status", "evidence"], [], "criterio de salida");
    nonempty(c.id, "criterion.id");
    require(!criterionIds.has(c.id), "Criterio de salida duplicado");
    criterionIds.add(c.id);
    require(["met", "failed", "unknown"].includes(
      c.status,
    ), "Estado de criterio inválido");
    nonempty(c.evidence, "criterion.evidence");
  }
  const counts = { passed: 0, failed: 0, blocked: 0, "not-run": 0 };
  let criticalUnpassed = false,
    missingEvidence = 0,
    retried = 0;
  const evidenceGaps = [];
  const keys = [...new Set([...expected.keys(), ...actual.keys()])].sort(
    (a, b) => {
      const x = JSON.parse(a),
        y = JSON.parse(b);
      return compare(x[0], y[0]) || compare(x[1], y[1]);
    },
  );
  for (const k of keys) {
    const c = actual.get(k),
      state = c ? base.caseStates[c.status] : "not-run";
    counts[state]++;
    const critical = [c, expected.get(k)].some(
      (v) => v && v.priority === base.assessmentPolicy.blockingPriority,
    );
    criticalUnpassed ||= critical && state !== "passed";
    if (c && ["passed", "failed"].includes(state)) {
      const captured = new Set(
        c.evidence.map((ref) => artifacts.get(ref).kind),
      );
      const missing = [...requiredEvidence]
        .filter((kind) => !captured.has(kind))
        .sort();
      if (missing.length) {
        missingEvidence++;
        evidenceGaps.push({ id: c.id, project: c.project, missing });
      }
    }
    retried += c && c.retries ? 1 : 0;
  }
  const executed = counts.passed + counts.failed,
    plannedExecuted = [...expected.keys()].filter(
      (k) =>
        actual.has(k) &&
        ["passed", "failed"].includes(base.caseStates[actual.get(k).status]),
    ).length;
  const policy = base.assessmentPolicy;
  let verdict;
  if (data.runErrors.length) verdict = policy.runErrors;
  else if (criticalUnpassed) verdict = policy.unpassedCritical;
  else if (!executed || !counts.passed) verdict = policy.emptyRun;
  else if (data.exitCriteria.some((c) => c.status === "failed"))
    verdict = policy.unmetExitCriteria;
  else if (
    !knownScope ||
    !expected.size ||
    !equal(new Set(actual.keys()), new Set(expected.keys())) ||
    counts.failed ||
    counts.blocked ||
    counts["not-run"] ||
    retried ||
    missingEvidence ||
    !data.exitCriteria.length ||
    data.exitCriteria.some((c) => c.status !== "met")
  )
    verdict = policy.incompleteOrUnknown;
  else verdict = policy.allSatisfied;
  return {
    plannedCases: knownScope ? expected.size : null,
    executedCases: executed,
    plannedExecutedCases: knownScope ? plannedExecuted : null,
    executionPercent: knownScope
      ? percentage(plannedExecuted, expected.size)
      : null,
    passPercent: percentage(counts.passed, executed),
    counts,
    retriedCases: retried,
    casesMissingEvidence: missingEvidence,
    recommendation: verdict,
    evidenceGaps,
  };
}
export function compare(a, b) {
  const x = [...a],
    y = [...b];
  for (let i = 0; i < Math.min(x.length, y.length); i++) {
    const delta = x[i].codePointAt(0) - y[i].codePointAt(0);
    if (delta) return delta;
  }
  return x.length - y.length;
}
function scopeKeys(list, base) {
  sequence(list, "alcance del host");
  const keys = new Set();
  for (const c of list) {
    objectFields(c, ["id", "project", "priority"], [], "caso previsto del host");
    nonempty(c.id, "expected.id");
    require(typeof c.project === "string", "expected.project inválido");
    require(base.priorities.includes(c.priority), "Prioridad no admitida");
    const key = JSON.stringify([c.id, c.project]);
    require(!keys.has(key), "Caso/proyecto previsto duplicado");
    keys.add(key);
  }
  return new Set(list.map((c) => JSON.stringify([c.id, c.project, c.priority])));
}
// Toda corrida QA llega como CTRF del runner (artefacto test_results); el agente no la transcribe.
export function validate(
  result,
  artifacts,
  checks,
  expectedEvidencePolicy = null,
  projectRoot = null,
  expectedScope = null,
) {
  const [contract, base] = loadContract(result.capabilityId);
  if (expectedScope !== null) scopeKeys(expectedScope, base);
  require(result.contractVersion ===
    base.contractVersion, "Versión QA incompatible");
  const requiredChecks = new Set(contract.preconditions.map((c) => c.id));
  require(subset(
    requiredChecks,
    new Set(checks.keys()),
  ), "Faltan precondiciones de la capacidad QA");
  const completed = result.status === "completed";
  for (const a of artifacts.values()) {
    require(Object.hasOwn(
      base.artifactKinds,
      a.kind,
    ), "Tipo de artefacto QA desconocido");
    const prefix = base.artifactKinds[a.kind];
    require(!Object.hasOwn(a, "path") ||
      prefix === null ||
      a.path.startsWith(
        prefix,
      ), "Los documentos y evidencias QA deben estar en resources/qa/");
    if (["video", "trace", "screenshot"].includes(a.kind))
      require(!Object.hasOwn(
        a,
        "content",
      ), "Evidencia binaria requiere path o uri, no texto inline");
  }
  const kinds = new Set([...artifacts.values()].map((a) => a.kind));
  if (completed) {
    require([...requiredChecks].every(
      (c) => checks.get(c).passed === true,
    ), "completed exige precondiciones satisfechas");
    for (const alternatives of contract.requiredArtifacts)
      require(alternatives.some((k) =>
        kinds.has(k),
      ), `Falta entregable requerido: ${formatList(alternatives)}`);
  }
  const data = result.data;
  if (expectedEvidencePolicy !== null) {
    evidencePolicy(expectedEvidencePolicy, base);
    const declared = isObject(data) ? data.evidencePolicy : undefined;
    if (declared !== undefined)
      require(equal(
        declared,
        expectedEvidencePolicy,
      ), "La política de evidencia no coincide con el encargo del host");
    else
      require(!completed, "Falta ejecución con la política de evidencia del host");
  }
  if (
    result.capabilityId === "qa-ranger-plan-pruebas" &&
    checks.get("requirements_available").passed !== true
  ) {
    require(data ===
      null, "Sin requisitos disponibles, data debe ser null; registrar preguntas en pending");
    require(!artifacts.size, "Sin requisitos disponibles, artifacts debe estar vacío; no se entrega un plan basado en supuestos");
  }
  if (data === null) return [];
  const metrics = {};
  if (result.capabilityId === "qa-ranger-plan-pruebas") {
    Object.assign(metrics, planMetrics(data, base));
    if (completed) {
      require((data.deliverables ?? ["test_plan", "test_runbook"]).every((k) =>
        kinds.has(k),
      ), "Falta un entregable solicitado del plan");
      require(metrics.requirementsTotal > 0 &&
        !metrics.requirementsWithoutDecision
          .length, "Plan incompleto: requisitos sin caso ni exclusión justificada");
    }
  } else {
    objectFields(
      data,
      ["task"],
      [
        "design",
        "coverage",
        "targetOverride",
        "coverageTargetRequired",
        "expected",
        "exitCriteria",
        "evidencePolicy",
      ],
      "data QA",
    );
    const task = data.task;
    require(contract.tasks.includes(task), "Tarea QA no admitida");
    const reports = [...artifacts.values()].filter((a) => a.kind === "test_results");
    require(reports.length <= 1, "Declara un solo reporte test_results por resultado");
    const runFields = ["expected", "exitCriteria", "evidencePolicy"].filter((k) => Object.hasOwn(data, k));
    let ctrf = null;
    if (reports.length) {
      require(typeof reports[0].path === "string" && projectRoot !== null,
        "El reporte test_results debe ser un archivo local del proyecto");
      // Escenario: el encargo fija el alcance; sin él no se sabe si faltaron casos.
      // El agente declara expected (null si de verdad se desconoce) en vez de omitirlo.
      if (["execute", "implement", "report"].includes(task))
        require(Object.hasOwn(data, "expected"), "Declara data.expected: la lista de casos acordada, o null si se desconoce");
      if (expectedScope !== null)
        require(Array.isArray(data.expected) && equal(scopeKeys(data.expected, base), scopeKeys(expectedScope, base)),
          "data.expected no coincide con el alcance que fijó el host");
      ctrf = executionFromCtrf(reports[0].id, readCtrf(reports[0].path, projectRoot), projectRoot, {
        expected: Object.hasOwn(data, "expected") ? data.expected : null,
        exitCriteria: data.exitCriteria ?? [],
        evidencePolicy: data.evidencePolicy,
      });
    } else
      require(!runFields.length, `${formatList(runFields)} solo aplican con un reporte test_results (CTRF)`);
    const execution = ctrf?.execution;
    const runArtifacts = ctrf ? new Map([...artifacts, ...ctrf.artifacts]) : artifacts;
    if (task === "design") {
      require(!Object.hasOwn(data, "coverage") && !ctrf, "Diseño no acredita ejecución ni cobertura");
      require(!kinds.has(
        "test_code",
      ), "Código implementado debe usar task implement");
    }
    if (Object.hasOwn(data, "design")) {
      require(task === "design", "design solo aplica a la tarea de diseño");
      Object.assign(metrics, planMetrics(data.design, base));
      if (completed)
        require(metrics.requirementsTotal > 0 &&
          !metrics.requirementsWithoutDecision.length, "Diseño incompleto");
    }
    if (completed && contract.taskArtifacts) {
      for (const alternatives of contract.taskArtifacts[task])
        require(alternatives.some((k) =>
          kinds.has(k),
        ), `Falta entregable de ${task}: ${formatList(alternatives)}`);
      if (task === "design" && result.capabilityId !== "ranger")
        require(Object.hasOwn(
          data,
          "design",
        ), "Diseño requiere requisitos, casos y exclusiones");
    }
    require(Object.hasOwn(data, "coverage") ===
      Object.hasOwn(
        data,
        "targetOverride",
      ), "coverage y targetOverride se declaran juntos");
    if (Object.hasOwn(data, "coverage"))
      Object.assign(
        metrics,
        coverageMetrics(data.coverage, data.targetOverride, artifacts, base, projectRoot),
      );
    if (Object.hasOwn(data, "coverageTargetRequired")) {
      require(typeof data.coverageTargetRequired ===
        "boolean", "coverageTargetRequired debe ser booleano");
      if (completed && data.coverageTargetRequired)
        require(metrics.unitCoverageTargetMet ===
          true, "Meta unitaria acordada sin acreditar");
    }
    const implementation =
      task === "implement" ||
      (result.capabilityId === "ranger" && kinds.has("test_code"));
    if (implementation) {
      const { passed = 0, failed = 0, skipped = 0 } = ctrf?.summary ?? {};
      Object.assign(metrics, {
        testVerification: failed === 0 && passed > 0 ? "passed" : passed + failed ? "failed" : "not_run",
        testsPassed: passed,
        testsFailed: failed,
        testsSkipped: skipped,
      });
      if (completed)
        require(metrics.testVerification ===
          "passed", "Implementación sin verificación satisfactoria: entrega partial o failed");
    }
    if (execution !== undefined) {
      Object.assign(metrics, executionMetrics(execution, runArtifacts, base));
      if (result.capabilityId === "qa-ranger-unitarias")
        require(execution.evidencePolicy.level ===
          "unit", "La skill de unitarias requiere ejecución de nivel unit");
    }
    const requiresRun =
      task === "execute" ||
      (task === "implement" &&
        (result.capabilityId !== "ranger" || execution !== undefined));
    if (completed && requiresRun) {
      require(execution !== undefined, "La tarea requiere el reporte CTRF del runner (artefacto test_results)");
      require(metrics.plannedCases !== null &&
        metrics.plannedCases > 0 &&
        metrics.plannedExecutedCases === metrics.plannedCases &&
        !metrics.counts.blocked &&
        !metrics.counts["not-run"] &&
        !execution.runErrors
          .length, "Ejecución incompleta: entrega partial o failed");
      require(!metrics.casesMissingEvidence, "Falta evidencia obligatoria: entrega partial o failed");
    }
    if (completed && task === "report")
      require(execution !== undefined, "Reporte de corrida requiere el reporte CTRF del runner (artefacto test_results)");
  }
  return observations(metrics, result, ctrfSource(result));
}
export function ctrfSource(result) {
  return result.artifacts.some((a) => a.kind === "test_results") ? "machine_report" : "declared_data";
}
export function observations(values, result, source = "declared_data") {
  const data = result.data,
    evidence = result.artifacts.map((a) => a.id),
    ratios = {};
  if (Object.hasOwn(values, "requirementsCoveragePercent"))
    ratios.requirementsCoveragePercent = [
      values.requirementsCovered,
      values.requirementsTotal,
    ];
  if (Object.hasOwn(values, "executionPercent")) {
    ratios.executionPercent = [
      values.plannedExecutedCases,
      values.plannedCases,
    ];
    ratios.passPercent = [values.counts.passed, values.executedCases];
  }
  const output = [];
  // La cobertura sale del archivo del runner y la corrida del CTRF; el plan lo declara el agente.
  const PLAN = new Set(["requirementsTotal", "requirementsCovered", "requirementsExcluded", "casesDesigned", "requirementsCoveragePercent"]);
  const origin = (key) =>
    PLAN.has(key) ? "declared_data" : key.startsWith("unitCoverage") ? "machine_report" : source;
  for (const [key, value] of Object.entries(values)) {
    if (key === "evidenceGaps")
      value.forEach((gap, i) =>
        output.push(
          observation(
            `qa.evidenceMissing.${i + 1}`,
            gap.missing.join(","),
            "artifact_kinds",
            result,
            evidence,
            { scope: `${gap.id} / ${gap.project}`, source: origin(key) },
          ),
        ),
      );
    if (
      [
        "requirementsWithoutDecision",
        "unitCoverageSupportedMetrics",
        "unitCoverageCounts",
        "coverageSource",
        "plannedExecutedCases",
        "evidenceGaps",
      ].includes(key)
    )
      continue;
    if (key === "unitCoverage") {
      const coverage = data.coverage;
      for (const name of ["lines", "branches", "functions", "statements"]) {
        const counts = values.unitCoverageCounts?.[name] ?? null;
        output.push(
          observation(
            `qa.unitCoverage.${name}`,
            value ? value[name] : null,
            "percent",
            result,
            values.coverageSource ? [values.coverageSource] : [],
            {
              scope: coverage?.scope,
              source: origin(key),
              numerator: counts?.covered ?? null,
              denominator: counts?.total ?? null,
            },
          ),
        );
      }
    } else if (key === "counts")
      for (const [name, count] of Object.entries(value))
        output.push(
          observation(`qa.cases.${name}`, count, "count", result, evidence, { source: origin(key) }),
        );
    else {
      const unit =
        Object.hasOwn(ratios, key) || key === "unitCoverageTarget"
          ? "percent"
          : key === "unitCoverageTargetMet"
            ? "boolean"
            : key === "recommendation"
              ? "decision"
              : key === "testVerification"
                ? "status"
                : "count";
      const counts = ratios[key]
        ? { numerator: ratios[key][0], denominator: ratios[key][1] }
        : {};
      const scope =
        key.startsWith("unitCoverage") && data.coverage
          ? data.coverage.scope
          : null;
      output.push(
        observation(`qa.${key}`, value, unit, result, evidence, {
          scope,
          source: origin(key),
          ...counts,
        }),
      );
    }
  }
  return output;
}
