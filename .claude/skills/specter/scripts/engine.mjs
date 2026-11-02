// engine.mjs — Motor determinista de validación y Quality Gate de Specter 2.0.
//
// Sin dependencias nuevas: usa solo el paquete `yaml` ya presente en el kit. Valida la forma
// estructural (espejo de contracts/*.schema.json) y aplica reglas de calidad ponderadas en cinco
// dimensiones (completitud, consistencia, trazabilidad, testabilidad, implementabilidad).
// El resultado distingue READY / NEEDS_REFINEMENT / BLOCKED con reglas bloqueantes independientes
// de la puntuación. Determinista: mismos artefactos → mismos resultados.
import fs from "node:fs";
import { parse as parseYaml } from "yaml";

// ───────────────────────────── contratos (espejo de los schemas) ─────────────────────────────

export const CONTRACTS = {
  user_story: {
    required: ["id", "type", "title", "status", "schema_version", "artifact_version", "created_at", "updated_at"],
    discriminator: "historia_usuario",
    enums: {
      status: ["draft", "ready", "needs_refinement", "blocked"],
      priority: ["alta", "media", "baja"],
      points: [1, 2, 3, 5, 8, 13],
    },
  },
  technical_task: {
    required: ["id", "type", "title", "parent_hu_id", "status", "schema_version", "artifact_version", "created_at", "updated_at"],
    discriminator: "tarea_tecnica",
    enums: {
      status: ["draft", "ready", "needs_refinement", "blocked"],
      priority: ["alta", "media", "baja"],
      points: [1, 2, 3, 5, 8, 13],
    },
  },
};

const PENDING_MARKERS = ["pendiente", "no_especificado", "no especificado", "por_definir", "por definir"];

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

// ───────────────────────────── validación estructural ─────────────────────────────

export function structuralProblems(kind, obj) {
  const c = CONTRACTS[kind];
  const errors = [];
  const blocks = [];
  for (const field of c.required) {
    const v = obj?.[field];
    if (v === undefined || v === null || (typeof v === "string" && v.trim() === "")) {
      errors.push({ rule: "required", field, message: `falta el campo obligatorio ${field}` });
    }
  }
  if (obj?.type !== undefined && obj.type !== c.discriminator) {
    blocks.push({ rule: "discriminator", message: `type debe ser "${c.discriminator}" (recibido: ${JSON.stringify(obj.type)})` });
  }
  for (const [field, values] of Object.entries(c.enums)) {
    if (obj?.[field] !== undefined && !values.includes(obj[field])) {
      blocks.push({ rule: "enum", field, message: `${field} inválido: ${JSON.stringify(obj[field])} (esperado: ${values.join(", ")})` });
    }
  }
  if (kind === "user_story" && Array.isArray(obj?.acceptance_criteria)) {
    for (const ca of obj.acceptance_criteria) {
      if (!isNonEmptyString(ca?.id) || !(isNonEmptyString(ca?.scenario) || isNonEmptyString(ca?.then))) {
        blocks.push({ rule: "criterion", message: "criterio de aceptación sin id o sin resultado observable (scenario/then)" });
      }
    }
  }
  return { errors, blocks };
}

// ───────────────────────────── reglas de calidad ─────────────────────────────

function rule(id, dimension, weight, mandatory, check, evidence = "") {
  return { id, dimension, weight, mandatory, check, evidence };
}

const HU_RULES = [
  // Completitud (25)
  rule("hu_complete_business_value", "completitud", 5, true,
    o => isNonEmptyString(o.business_value), "business_value explícito"),
  rule("hu_complete_user_story", "completitud", 5, true,
    o => o?.user_story && isNonEmptyString(o.user_story.role) && isNonEmptyString(o.user_story.action) && isNonEmptyString(o.user_story.benefit),
    "user_story con role/action/benefit"),
  rule("hu_complete_scope", "completitud", 5, true,
    o => o?.scope && Array.isArray(o.scope.included) && Array.isArray(o.scope.excluded),
    "scope con included y excluded"),
  rule("hu_complete_acceptance", "completitud", 5, true,
    o => isNonEmptyArray(o.acceptance_criteria), "criterios de aceptación presentes"),
  rule("hu_complete_flow", "completitud", 5, true,
    o => isNonEmptyArray(o.main_flow) || isNonEmptyString(o.description), "flujo principal o descripción"),

  // Consistencia (20)
  rule("hu_consistent_ca_ids", "consistencia", 8, true,
    o => Array.isArray(o.acceptance_criteria) && o.acceptance_criteria.every(ca => isNonEmptyString(ca?.id)),
    "cada criterio tiene id no vacío"),
  rule("hu_consistent_req_unique", "consistencia", 6, true,
    o => !Array.isArray(o.requirement_ids) || new Set(o.requirement_ids).size === o.requirement_ids.length,
    "requirement_ids sin duplicados"),
  rule("hu_consistent_dep_unique", "consistencia", 6, true,
    o => !Array.isArray(o.dependencies) || new Set(o.dependencies).size === o.dependencies.length,
    "dependencies sin duplicados"),

  // Trazabilidad (20)
  rule("hu_trace_origin", "trazabilidad", 12, true,
    o => isNonEmptyString(o.epic_id) || isNonEmptyArray(o.requirement_ids),
    "origen presente (epic_id o requirement_ids)"),
  rule("hu_trace_req_ids", "trazabilidad", 8, true,
    o => !Array.isArray(o.requirement_ids) || o.requirement_ids.every(isId),
    "requirement_ids con formato de id válido"),

  // Testabilidad (20)
  rule("hu_test_observable", "testabilidad", 12, true,
    o => isNonEmptyArray(o.acceptance_criteria) && o.acceptance_criteria.every(ca => isNonEmptyString(ca?.scenario) || isNonEmptyString(ca?.then)),
    "cada criterio con resultado observable"),
  rule("hu_test_negative", "testabilidad", 8, true,
    o => (!isNonEmptyArray(o.exceptions) && !isNonEmptyArray(o.alternative_flows)) ||
         (Array.isArray(o.acceptance_criteria) && o.acceptance_criteria.some(ca => ca?.negative === true)),
    "escenario negativo cuando hay excepciones o flujos alternativos"),

  // Implementabilidad (15)
  rule("hu_impl_size", "implementabilidad", 8, true,
    o => Number.isInteger(o?.points) && [1, 2, 3, 5, 8].includes(o.points),
    "points estimado y ≤ 8 (INVEST small)"),
  rule("hu_impl_priority", "implementabilidad", 7, false,
    o => o?.priority === undefined || CONTRACTS.user_story.enums.priority.includes(o.priority),
    "priority presente y válida"),
];

const TT_RULES = [
  // Completitud (25)
  rule("tt_complete_objective", "completitud", 6, true,
    o => isNonEmptyString(o.technical_objective), "technical_objective explícito"),
  rule("tt_complete_steps", "completitud", 6, true,
    o => isNonEmptyArray(o.implementation_steps), "implementation_steps presentes"),
  rule("tt_complete_dod", "completitud", 7, true,
    o => isNonEmptyArray(o.definition_of_done), "definition_of_done presente"),
  rule("tt_complete_test_strategy", "completitud", 6, true,
    o => isNonEmptyString(o.test_strategy), "test_strategy presente"),

  // Consistencia (20)
  rule("tt_consistent_dod_items", "consistencia", 7, true,
    o => Array.isArray(o.definition_of_done) && o.definition_of_done.every(isNonEmptyString),
    "cada item de DoD no vacío"),
  rule("tt_consistent_dep_unique", "consistencia", 7, true,
    o => !Array.isArray(o.dependencies) || new Set(o.dependencies).size === o.dependencies.length,
    "dependencies sin duplicados"),
  rule("tt_consistent_evidence", "consistencia", 6, true,
    o => isNonEmptyArray(o.evidence_requirements) && o.evidence_requirements.every(isNonEmptyString),
    "evidence_requirements presentes y no vacíos"),

  // Trazabilidad (20)
  rule("tt_trace_parent", "trazabilidad", 14, true,
    o => isNonEmptyString(o.parent_hu_id) || isNonEmptyString(o.epic_id),
    "anclaje presente (parent_hu_id o epic_id)"),
  rule("tt_trace_dep_ids", "trazabilidad", 6, true,
    o => !Array.isArray(o.dependencies) || o.dependencies.every(isId),
    "dependencies con formato de id válido"),

  // Testabilidad (20)
  rule("tt_test_dod_verifiable", "testabilidad", 10, true,
    o => Array.isArray(o.definition_of_done) && o.definition_of_done.every(d => {
      const t = String(d).trim();
      return t.length >= 8 && !/^(funciona|ok|listo|bien|terminado|completo|hecho)$/i.test(t);
    }),
    "definition_of_done verificable (sin frases genéricas)"),
  rule("tt_test_evidence", "testabilidad", 10, true,
    o => isNonEmptyArray(o.evidence_requirements), "evidence_requirements requeridos"),

  // Implementabilidad (15)
  rule("tt_impl_component", "implementabilidad", 8, true,
    o => isNonEmptyString(o.component) || PENDING_MARKERS.includes(String(o.component ?? "").toLowerCase()),
    "componente identificado o marcado pendiente"),
  rule("tt_impl_layer", "implementabilidad", 7, false,
    o => isNonEmptyString(o.architecture_layer) || PENDING_MARKERS.includes(String(o.architecture_layer ?? "").toLowerCase()),
    "architecture_layer identificado o marcado pendiente"),
];

// ───────────────────────────── reglas bloqueantes ─────────────────────────────

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
  if (kind === "technical_task" && !isNonEmptyString(obj.parent_hu_id) && !isNonEmptyString(obj.epic_id)) {
    blocks.push({ rule: "block_no_anchor", message: "TT sin anclaje: parent_hu_id y epic_id ausentes" });
  }
  return blocks;
}

// ───────────────────────────── validación agregada ─────────────────────────────

export function validate(kind, obj) {
  const rules = kind === "user_story" ? HU_RULES : TT_RULES;
  const { errors, blocks: structuralBlocks } = structuralProblems(kind, obj);
  const qualityBlocks = blockingRules(kind, obj);
  const blocks = [...structuralBlocks, ...qualityBlocks];

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

  const score = Math.round(results.filter(r => r.passed).reduce((sum, r) => sum + r.weight, 0) * 100) / 100;
  const mandatoryPassed = results.filter(r => r.mandatory).every(r => r.passed);
  let state;
  if (blocks.length) state = "BLOCKED";
  else if (mandatoryPassed) state = "READY";
  else state = "NEEDS_REFINEMENT";

  return {
    kind,
    id: obj?.id ?? "(sin id)",
    score,
    state,
    structuralErrors: errors,
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
