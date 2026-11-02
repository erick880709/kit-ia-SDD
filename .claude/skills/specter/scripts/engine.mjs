// engine.mjs — Motor determinista de validación y Quality Gate de Specter 2.1.
//
// Sin dependencias nuevas: usa el paquete `yaml` (presente) y el validador JSON Schema
// standalone generado desde contracts/*.schema.json. Aplica reglas de calidad ponderadas en seis
// dimensiones y una precedencia de estados estricta: BLOCKED > NEEDS_REFINEMENT > READY.
// Ningún artefacto con error de JSON Schema alcanza READY.
import fs from "node:fs";
import { parse as parseYaml } from "yaml";
import { validateStory as schemaValidateStory, validateTask as schemaValidateTask } from "../contracts/specter-schemas.validate.mjs";

// ───────────────────────────── contratos (espejo de los schemas) ─────────────────────────────

export const CONTRACTS = {
  user_story: {
    required: ["id", "type", "title", "status", "schema_version", "artifact_version", "created_at", "updated_at"],
    discriminator: "Historia de Usuario",
    enums: {
      status: ["draft", "ready", "needs_refinement", "blocked"],
      priority: ["Alta", "Media", "Baja"],
      points: [1, 2, 3, 5, 8, 13],
      functional_complexity: ["baja", "media", "alta"],
      technical_complexity: ["baja", "media", "alta"],
    },
  },
  technical_task: {
    required: ["id", "type", "title", "parent_hu_id", "status", "schema_version", "artifact_version", "created_at", "updated_at"],
    discriminator: "Tarea Técnica",
    enums: {
      status: ["draft", "ready", "needs_refinement", "blocked"],
      priority: ["Alta", "Media", "Baja"],
      points: [1, 2, 3, 5, 8, 13],
      functional_complexity: ["baja", "media", "alta"],
      technical_complexity: ["baja", "media", "alta"],
    },
  },
};

const PENDING_MARKERS = ["pendiente", "no_especificado", "no especificado", "por_definir", "por definir"];
const GENERIC_TITLES = ["historia de usuario", "tarea", "tarea tecnica", "tarea técnica", "hu", "tt", "titulo", "título", "nueva historia", "nueva tarea", "historia", "task", "story"];
const GENERIC_VALUES = ["valor", "valor de negocio", "negocio", "mejorar", "mejora", "mejorar la experiencia", "optimizar", "agregar valor"];

// ───────────────────────────── utilidades ─────────────────────────────

export function parseFrontmatter(filePath) {
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const m = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (!m) throw new Error(`${filePath}: falta frontmatter YAML`);
  return parseYaml(m[1]);
}

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function isNonEmptyArray(v) {
  return Array.isArray(v) && v.length > 0;
}

function isId(v) {
  return typeof v === "string" && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(v);
}

function normalize(v) {
  return String(v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
}

function isSignificantTitle(v) {
  if (!isNonEmptyString(v)) return false;
  const n = normalize(v);
  return n.length >= 3 && !GENERIC_TITLES.includes(n);
}

function isSpecificValue(v, min = 8) {
  if (!isNonEmptyString(v)) return false;
  const n = normalize(v);
  return n.length >= min && !GENERIC_VALUES.includes(n);
}

// ───────────────────────────── validación estructural (JSON Schema real) ─────────────────────────────

export function structuralProblems(kind, obj) {
  const validateFn = kind === "user_story" ? schemaValidateStory : schemaValidateTask;
  const valid = !!validateFn(obj ?? {});
  const errors = [];
  const blocks = [];
  if (!valid) {
    for (const e of validateFn.errors || []) {
      const message = `${e.instancePath || "/"} ${e.message}`;
      // Violaciones del discriminador (const) o de vocabulario (enum) → contradicción: bloquean.
      if (e.keyword === "const" || e.keyword === "enum") blocks.push({ rule: e.keyword, message });
      else errors.push({ rule: e.keyword, message });
    }
  }
  return { valid, errors, blocks };
}

// ───────────────────────────── reglas de calidad ─────────────────────────────

function rule(id, dimension, weight, mandatory, check, evidence = "") {
  return { id, dimension, weight, mandatory, check, evidence };
}

const HU_RULES = [
  // Completitud (20)
  rule("hu_complete_business_value", "completitud", 4, true, o => isNonEmptyString(o.business_value), "business_value explícito"),
  rule("hu_complete_user_story", "completitud", 4, true,
    o => o?.user_story && isNonEmptyString(o.user_story.role) && isNonEmptyString(o.user_story.action) && isNonEmptyString(o.user_story.benefit),
    "user_story con role/action/benefit"),
  rule("hu_complete_scope", "completitud", 4, true,
    o => o?.scope && Array.isArray(o.scope.included) && Array.isArray(o.scope.excluded), "scope con included y excluded"),
  rule("hu_complete_acceptance", "completitud", 4, true, o => isNonEmptyArray(o.acceptance_criteria), "criterios de aceptación presentes"),
  rule("hu_complete_flow", "completitud", 4, true,
    o => isNonEmptyArray(o.main_flow) || isNonEmptyString(o.description), "flujo principal o descripción"),

  // Consistencia (15)
  rule("hu_consistent_ca_ids", "consistencia", 5, true,
    o => Array.isArray(o.acceptance_criteria) && o.acceptance_criteria.every(ca => isNonEmptyString(ca?.id)), "cada criterio tiene id no vacío"),
  rule("hu_consistent_req_unique", "consistencia", 5, true,
    o => !Array.isArray(o.requirement_ids) || new Set(o.requirement_ids).size === o.requirement_ids.length, "requirement_ids sin duplicados"),
  rule("hu_consistent_dep_unique", "consistencia", 5, true,
    o => !Array.isArray(o.dependencies) || new Set(o.dependencies).size === o.dependencies.length, "dependencies sin duplicados"),

  // Trazabilidad (20)
  rule("hu_trace_origin", "trazabilidad", 12, true,
    o => isNonEmptyString(o.epic) || isNonEmptyString(o.epic_id) || isNonEmptyArray(o.requirement_ids),
    "origen presente (epic, epic_id o requirement_ids)"),
  rule("hu_trace_req_ids", "trazabilidad", 8, true,
    o => !Array.isArray(o.requirement_ids) || o.requirement_ids.every(isId), "requirement_ids con formato de id válido"),

  // Testabilidad (20)
  rule("hu_test_observable", "testabilidad", 12, true,
    o => isNonEmptyArray(o.acceptance_criteria) && o.acceptance_criteria.every(ca => isNonEmptyString(ca?.scenario) || isNonEmptyString(ca?.then)),
    "cada criterio con resultado observable"),
  rule("hu_test_negative", "testabilidad", 8, true,
    o => (!isNonEmptyArray(o.exceptions) && !isNonEmptyArray(o.alternative_flows)) ||
         (Array.isArray(o.acceptance_criteria) && o.acceptance_criteria.some(ca => ca?.negative === true)),
    "escenario negativo cuando hay excepciones o flujos alternativos"),

  // Implementabilidad (15) — Specter no estima Story Points: emite complejidad orientativa.
  rule("hu_impl_complexity", "implementabilidad", 8, true,
    o => CONTRACTS.user_story.enums.functional_complexity.includes(o?.functional_complexity),
    "functional_complexity orientativa (baja/media/alta)"),
  rule("hu_impl_priority", "implementabilidad", 7, false,
    o => o?.priority === undefined || CONTRACTS.user_story.enums.priority.includes(o.priority), "priority presente y válida"),

  // Claridad (10)
  rule("hu_claridad_title", "claridad", 5, true, o => isSignificantTitle(o.title), "title significativo (no genérico)"),
  rule("hu_claridad_business_value", "claridad", 5, true, o => isSpecificValue(o.business_value, 8), "business_value específico (no genérico)"),
];

const TT_RULES = [
  // Completitud (20)
  rule("tt_complete_objective", "completitud", 4, true, o => isNonEmptyString(o.technical_objective), "technical_objective explícito"),
  rule("tt_complete_steps", "completitud", 4, true, o => isNonEmptyArray(o.implementation_steps), "implementation_steps presentes"),
  rule("tt_complete_dod", "completitud", 4, true, o => isNonEmptyArray(o.definition_of_done), "definition_of_done presente"),
  rule("tt_complete_test_strategy", "completitud", 4, true, o => isNonEmptyString(o.test_strategy), "test_strategy presente"),
  rule("tt_complete_scope", "completitud", 4, true, o => isNonEmptyString(o.implementation_scope), "implementation_scope acotado"),

  // Consistencia (15)
  rule("tt_consistent_dod_items", "consistencia", 5, true,
    o => Array.isArray(o.definition_of_done) && o.definition_of_done.every(isNonEmptyString), "cada item de DoD no vacío"),
  rule("tt_consistent_dep_unique", "consistencia", 5, true,
    o => !Array.isArray(o.dependencies) || new Set(o.dependencies).size === o.dependencies.length, "dependencies sin duplicados"),
  rule("tt_consistent_evidence", "consistencia", 5, true,
    o => isNonEmptyArray(o.evidence_requirements) && o.evidence_requirements.every(isNonEmptyString), "evidence_requirements presentes y no vacíos"),

  // Trazabilidad (20)
  rule("tt_trace_parent", "trazabilidad", 12, true,
    o => isNonEmptyString(o.parent_hu_id) || isNonEmptyString(o.epic) || isNonEmptyString(o.epic_id),
    "anclaje presente (parent_hu_id, epic o epic_id)"),
  rule("tt_trace_dep_ids", "trazabilidad", 8, true,
    o => !Array.isArray(o.dependencies) || o.dependencies.every(isId), "dependencies con formato de id válido"),

  // Testabilidad (20)
  rule("tt_test_dod_verifiable", "testabilidad", 10, true,
    o => Array.isArray(o.definition_of_done) && o.definition_of_done.every(d => {
      const t = String(d).trim();
      return t.length >= 8 && !/^(funciona|ok|listo|bien|terminado|completo|hecho)$/i.test(t);
    }), "definition_of_done verificable (sin frases genéricas)"),
  rule("tt_test_evidence", "testabilidad", 10, true,
    o => isNonEmptyArray(o.evidence_requirements), "evidence_requirements requeridos"),

  // Implementabilidad (15)
  rule("tt_impl_component", "implementabilidad", 8, true,
    o => isNonEmptyString(o.component) || PENDING_MARKERS.includes(String(o.component ?? "").toLowerCase()),
    "componente identificado o marcado pendiente"),
  rule("tt_impl_layer", "implementabilidad", 7, false,
    o => isNonEmptyString(o.architecture_layer) || PENDING_MARKERS.includes(String(o.architecture_layer ?? "").toLowerCase()),
    "architecture_layer identificado o marcado pendiente"),

  // Claridad (10)
  rule("tt_claridad_title", "claridad", 5, true, o => isSignificantTitle(o.title), "title significativo (no genérico)"),
  rule("tt_claridad_objective", "claridad", 5, true, o => isSpecificValue(o.technical_objective, 8), "technical_objective específico (no genérico)"),
];

// ───────────────────────────── reglas bloqueantes (independientes del score) ─────────────────────────────

function blockingRules(kind, obj) {
  const blocks = [];
  const id = obj?.id ?? "(sin id)";
  if (kind === "user_story" && Array.isArray(obj.acceptance_criteria)) {
    const ids = obj.acceptance_criteria.map(ca => ca?.id).filter(Boolean);
    if (new Set(ids).size !== ids.length) {
      blocks.push({ rule: "block_duplicate_ca", message: "ids de criterios de aceptación duplicados" });
    }
  }
  if (Array.isArray(obj.dependencies) && obj.dependencies.includes(id)) {
    blocks.push({ rule: "block_self_dependency", message: `dependencia hacia sí mismo (${id})` });
  }
  if (kind === "technical_task" && !isNonEmptyString(obj.parent_hu_id) && !isNonEmptyString(obj.epic) && !isNonEmptyString(obj.epic_id)) {
    blocks.push({ rule: "block_no_anchor", message: "TT sin anclaje: parent_hu_id, epic y epic_id ausentes" });
  }
  if (kind === "technical_task" && !isNonEmptyString(obj.parent_hu_id) && !isNonEmptyString(obj.parent_exception_reason)) {
    blocks.push({ rule: "block_unjustified_parentless", message: "TT sin HU padre requiere parent_exception_reason (y epic/epic_id)" });
  }
  return blocks;
}

// ───────────────────────────── validación agregada ─────────────────────────────

export function validate(kind, obj, options = {}) {
  const rules = kind === "user_story" ? HU_RULES : TT_RULES;
  const structural = structuralProblems(kind, obj);
  const qualityBlocks = blockingRules(kind, obj);
  const blocks = [...structural.blocks, ...qualityBlocks];

  const results = rules.map(r => {
    let passed = false;
    try {
      passed = !!r.check(obj ?? {});
    } catch {
      passed = false;
    }
    return {
      id: r.id,
      dimension: r.dimension,
      weight: r.weight,
      mandatory: r.mandatory,
      passed,
      evidence: passed ? r.evidence : `falló: ${r.evidence}`,
    };
  });

  const passed = results.filter(r => r.passed);
  const failed = results.filter(r => !r.passed);
  const score = Math.round(passed.reduce((sum, r) => sum + r.weight, 0) * 100) / 100;
  const mandatoryPassed = results.filter(r => r.mandatory).every(r => r.passed);

  // Precedencia estricta: BLOCKED > NEEDS_REFINEMENT > READY. Ningún artefacto con error de
  // JSON Schema alcanza READY.
  let state;
  if (blocks.length) state = "BLOCKED";
  else if (!structural.valid || structural.errors.length || !mandatoryPassed) state = "NEEDS_REFINEMENT";
  else state = "READY";

  const warnings = failed.filter(r => !r.mandatory).map(r => ({ id: r.id, evidence: r.evidence }));
  const evidence = [
    ...blocks.map(b => b.message),
    ...structural.errors.map(e => e.message),
    ...failed.map(r => r.evidence),
  ];
  const recommendations = [
    ...blocks.map(b => `Resuelve: ${b.message}`),
    ...failed.map(r => `Corrige [${r.dimension}]: ${r.evidence}`),
  ];
  let severity = "none";
  if (blocks.length) severity = "critical";
  else if (structural.errors.length) severity = "high";
  else if (failed.some(r => r.mandatory)) severity = "medium";
  else if (failed.length) severity = "low";

  return {
    kind,
    id: obj?.id ?? "(sin id)",
    artifact_id: obj?.id ?? "(sin id)",
    artifact_type: kind === "user_story" ? "HU" : "TT",
    schema_version: obj?.schema_version ?? null,
    schema_valid: structural.valid,
    status: state,
    state,
    score,
    severity,
    errors: structural.errors.map(e => e.message),
    warnings,
    blocking_issues: blocks.map(b => ({ rule: b.rule, message: b.message })),
    passed_rules: passed.map(r => r.id),
    rules_passed: passed.map(r => r.id),
    failed_rules: failed.map(r => r.id),
    rules_failed: failed.map(r => r.id),
    evidence,
    recommendations,
    evaluated_at: options.evaluatedAt ?? null,
    structuralErrors: structural.errors,
    rules: results,
    blocks,
  };
}

export function summarizeDimensions(results) {
  const dims = {};
  for (const r of results) {
    dims[r.dimension] = dims[r.dimension] || { total: 0, passed: 0, mandatory: 0, mandatoryPassed: 0 };
    dims[r.dimension].total += r.weight;
    dims[r.dimension].passed += r.passed ? r.weight : 0;
    if (r.mandatory) {
      dims[r.dimension].mandatory += r.weight;
      if (r.passed) dims[r.dimension].mandatoryPassed += r.weight;
    }
  }
  return dims;
}
