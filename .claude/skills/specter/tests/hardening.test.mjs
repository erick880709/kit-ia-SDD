import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { validate } from "../scripts/engine.mjs";
import { findDuplicates, normalizeTitle } from "../scripts/duplicates.mjs";
import { detectCycles } from "../scripts/traceability.mjs";

// ── P0-1: un artefacto con error estructural no puede alcanzar READY ──
test("HU sin title (error estructural) no alcanza READY", () => {
  const r = validate("user_story", {
    id: "HU-01", type: "Historia de Usuario", status: "ready",
    schema_version: "0.1.0", artifact_version: "1",
    created_at: "2026-11-02T15:00:00Z", updated_at: "2026-11-02T15:00:00Z",
    business_value: "Acceso seguro a la plataforma.", user_story: { role: "u", action: "a", benefit: "b" },
    scope: { included: ["x"], excluded: [] },
    acceptance_criteria: [{ id: "CA1", scenario: "Dado X, cuando Y, entonces Z." }],
    main_flow: ["Paso"], requirement_ids: ["RF-001"], functional_complexity: "media",
  });
  assert.equal(r.schema_valid, false);
  assert.equal(r.state, "NEEDS_REFINEMENT");
});

// ── FASE 3: duplicados ──
test("duplicado normalizado (mayúsculas/acentos) se detecta", () => {
  const hus = [
    { id: "HU-1", title: "Consultar movimientos" },
    { id: "HU-2", title: "Consultar Movimientos" },
  ];
  const d = findDuplicates(hus);
  assert.equal(d.length, 1);
  assert.equal(d[0].type, "normalizado");
});

test("historias similares pero legítimamente distintas no son duplicadas", () => {
  const hus = [
    { id: "HU-1", title: "Consultar movimientos" },
    { id: "HU-2", title: "Exportar movimientos" },
  ];
  assert.equal(findDuplicates(hus).length, 0);
});

test("normalización elimina acentos y puntuación", () => {
  assert.equal(normalizeTitle("Título, con Ácentos!"), normalizeTitle("titulo con acentos"));
});

// ── FASE 5: TT sin HU padre justificada / injustificada ──
function parentlessTt(over = {}) {
  return {
    id: "TT-99", type: "Tarea Técnica", title: "Habilitar observabilidad base",
    parent_hu_id: null, epic: "PROJ-42", epic_id: "PROJ-42", status: "ready",
    schema_version: "0.1.0", artifact_version: "1",
    created_at: "2026-11-02T15:00:00Z", updated_at: "2026-11-02T15:00:00Z",
    technical_objective: "Configurar la infraestructura de observabilidad base.",
    implementation_scope: "Configurar métricas y logs base.",
    implementation_steps: ["Configurar métricas"],
    definition_of_done: ["Las métricas base se publican correctamente"],
    test_strategy: "Verificación manual del endpoint de métricas.",
    evidence_requirements: ["Captura del endpoint de métricas"],
    component: "backend", architecture_layer: "plataforma",
    parent_exception_reason: "Habilitador transversal de la épica.",
    ...over,
  };
}

test("TT sin HU padre con epic y parent_exception_reason → READY", () => {
  const r = validate("technical_task", parentlessTt());
  assert.equal(r.state, "READY");
});

test("TT sin HU padre sin parent_exception_reason → BLOCKED", () => {
  const r = validate("technical_task", parentlessTt({ parent_exception_reason: undefined }));
  assert.equal(r.state, "BLOCKED");
  assert.ok(r.blocks.some(b => b.rule === "block_unjustified_parentless"));
});

// ── FASE 7: ciclos y corrupción ──
test("dependencia circular se detecta", () => {
  const hus = [{ id: "HU-A", dependencies: ["HU-B"] }, { id: "HU-B", dependencies: ["HU-A"] }];
  const cycles = detectCycles(hus, []);
  assert.ok(cycles.some(c => c.kind === "dependencia circular" && c.severity === "critical"));
});

test("archivo corrupto produce exit 3 en trazabilidad", () => {
  const root = mkdtempSync(join(tmpdir(), "specter-corrupt-"));
  try {
    mkdirSync(join(root, "resources", "functional", "hu"), { recursive: true });
    writeFileSync(join(root, "resources", "functional", "hu", "hu-01.md"), "# sin frontmatter\n");
    const cli = fileURLToPath(new URL("../scripts/traceability.mjs", import.meta.url));
    const r = spawnSync(process.execPath, [cli, "--root", root, "--json"], { encoding: "utf8" });
    assert.equal(r.status, 3, r.stdout + r.stderr);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
