import { test } from "node:test";
import assert from "node:assert/strict";
import { validate } from "../scripts/engine.mjs";

function readyHu(overrides = {}) {
  return {
    id: "HU-01",
    type: "historia_usuario",
    title: "Iniciar sesión",
    status: "ready",
    schema_version: "0.1.0",
    artifact_version: "1",
    created_at: "2026-11-02T15:00:00Z",
    updated_at: "2026-11-02T15:00:00Z",
    business_value: "Acceso seguro a la plataforma.",
    user_story: { role: "usuario registrado", action: "iniciar sesión", benefit: "acceder a sus datos" },
    scope: { included: ["login con usuario y contraseña"], excluded: ["login social"] },
    acceptance_criteria: [
      { id: "CA1", scenario: "Dado un usuario registrado, cuando ingresa credenciales válidas, entonces accede.", negative: false, requirement_ids: ["RF-001"] },
      { id: "CA2", scenario: "Dado credenciales inválidas, cuando intenta entrar, entonces ve un error.", negative: true },
    ],
    main_flow: ["El usuario ingresa credenciales", "El sistema valida"],
    alternative_flows: ["Credenciales inválidas"],
    exceptions: ["Cuenta bloqueada"],
    requirement_ids: ["RF-001"],
    dependencies: [],
    priority: "alta",
    points: 5,
    ...overrides,
  };
}

function readyTt(overrides = {}) {
  return {
    id: "TT-01",
    type: "tarea_tecnica",
    title: "Migrar esquema de usuarios",
    parent_hu_id: "HU-01",
    status: "ready",
    schema_version: "0.1.0",
    artifact_version: "1",
    created_at: "2026-11-02T15:00:00Z",
    updated_at: "2026-11-02T15:00:00Z",
    technical_objective: "Crear la tabla users con las columnas mínimas para el login.",
    implementation_steps: ["Escribir la migración", "Aplicar en non-prod"],
    definition_of_done: ["La migración aplica y revierte sin errores"],
    test_strategy: "Prueba de idempotencia y rollback.",
    evidence_requirements: ["Resultado de la migración en non-prod"],
    component: "backend",
    architecture_layer: "persistencia",
    dependencies: [],
    ...overrides,
  };
}

test("HU completa → READY con score 100", () => {
  const r = validate("user_story", readyHu());
  assert.equal(r.state, "READY");
  assert.equal(r.score, 100);
  assert.equal(r.blocks.length, 0);
});

test("HU sin business_value → NEEDS_REFINEMENT (no bloqueada)", () => {
  const r = validate("user_story", readyHu({ business_value: undefined }));
  assert.equal(r.state, "NEEDS_REFINEMENT");
  assert.equal(r.blocks.length, 0);
});

test("HU con ids de criterios duplicados → BLOCKED", () => {
  const r = validate("user_story", readyHu({
    acceptance_criteria: [
      { id: "CA1", scenario: "Dado X, cuando Y, entonces Z." },
      { id: "CA1", scenario: "Dado A, cuando B, entonces C." },
    ],
  }));
  assert.equal(r.state, "BLOCKED");
  assert.ok(r.blocks.some(b => b.rule === "block_duplicate_ca"));
});

test("HU sin origen → NEEDS_REFINEMENT (regla de trazabilidad)", () => {
  const r = validate("user_story", readyHu({ epic_id: undefined, requirement_ids: [] }));
  assert.equal(r.state, "NEEDS_REFINEMENT");
  assert.ok(r.rules.find(x => x.id === "hu_trace_origin" && !x.passed));
});

test("TT completa → READY con score 100", () => {
  const r = validate("technical_task", readyTt());
  assert.equal(r.state, "READY");
  assert.equal(r.score, 100);
});

test("TT sin anclaje (parent_hu_id null y sin epic_id) → BLOCKED", () => {
  const r = validate("technical_task", readyTt({ parent_hu_id: null, epic_id: undefined }));
  assert.equal(r.state, "BLOCKED");
  assert.ok(r.blocks.some(b => b.rule === "block_no_anchor"));
});

test("TT con component pendiente pasa la regla de implementabilidad", () => {
  const r = validate("technical_task", readyTt({ component: "pendiente" }));
  assert.equal(r.state, "READY");
});

test("TT sin component → NEEDS_REFINEMENT", () => {
  const r = validate("technical_task", readyTt({ component: null }));
  assert.equal(r.state, "NEEDS_REFINEMENT");
  assert.ok(r.rules.find(x => x.id === "tt_impl_component" && !x.passed));
});

test("determinismo: mismos artefactos producen el mismo resultado", () => {
  const a = validate("user_story", readyHu());
  const b = validate("user_story", readyHu());
  assert.deepEqual(a, b);
});
