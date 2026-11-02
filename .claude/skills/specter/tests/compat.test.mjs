import { test } from "node:test";
import assert from "node:assert/strict";
import { validate } from "../scripts/engine.mjs";

// Specter 2.0 debe conservar los campos y valores que cupido (effort-estimator) lee del
// frontmatter de Specter 1.0: `epic`, `type` en español y `priority` con mayúscula inicial.

function compatHu(overrides = {}) {
  return {
    id: "HU-01",
    type: "Historia de Usuario",
    epic: "PROJ-42",
    title: "Iniciar sesión",
    status: "ready",
    schema_version: "0.1.0",
    artifact_version: "1",
    created_at: "2026-11-02T15:00:00Z",
    updated_at: "2026-11-02T15:00:00Z",
    business_value: "Acceso seguro.",
    user_story: { role: "usuario", action: "iniciar sesión", benefit: "acceder" },
    scope: { included: ["login"], excluded: [] },
    acceptance_criteria: [{ id: "CA1", scenario: "Dado un usuario, cuando ingresa credenciales válidas, entonces accede.", negative: false }],
    main_flow: ["Ingresa credenciales"],
    requirement_ids: ["RF-001"],
    dependencies: [],
    priority: "Alta",
    points: 5,
    ...overrides,
  };
}

function compatTt(overrides = {}) {
  return {
    id: "TT-01",
    type: "Tarea Técnica",
    parent_hu_id: "HU-01",
    epic: "PROJ-42",
    title: "Migrar users",
    status: "ready",
    schema_version: "0.1.0",
    artifact_version: "1",
    created_at: "2026-11-02T15:00:00Z",
    updated_at: "2026-11-02T15:00:00Z",
    technical_objective: "Crear la tabla users.",
    implementation_steps: ["Migración"],
    definition_of_done: ["La migración aplica y revierte sin errores"],
    test_strategy: "Idempotencia",
    evidence_requirements: ["Resultado"],
    component: "backend",
    architecture_layer: "persistencia",
    dependencies: [],
    priority: "Media",
    points: 3,
    ...overrides,
  };
}

test("una HU con campos cupido-compatibles pasa el gate READY", () => {
  const r = validate("user_story", compatHu());
  assert.equal(r.status, "READY");
  assert.equal(r.score, 100);
});

test("una TT con campos cupido-compatibles pasa el gate READY", () => {
  const r = validate("technical_task", compatTt());
  assert.equal(r.status, "READY");
});

test("priority con mayúscula inicial es aceptada; minúsculas se rechazan", () => {
  const r = validate("user_story", compatHu({ priority: "alta" }));
  assert.equal(r.status, "BLOCKED"); // enum inválido
  assert.ok(r.blocks.some(b => b.rule === "enum"));
});

test("el resultado del gate expone el contrato de salida requerido", () => {
  const r = validate("user_story", compatHu());
  for (const key of ["artifact_id", "schema_version", "status", "score", "rules_passed", "rules_failed", "severity", "evidence", "recommendations"]) {
    assert.ok(key in r, `falta ${key} en el resultado`);
  }
  assert.equal(r.artifact_id, "HU-01");
  assert.equal(r.schema_version, "0.1.0");
});
