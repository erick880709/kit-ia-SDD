import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { stringify } from "yaml";

const traceCli = fileURLToPath(new URL("../scripts/traceability.mjs", import.meta.url));

function md(frontmatter) {
  return `---\n${stringify(frontmatter)}---\n\n# cuerpo\n`;
}

function fixtureDir() {
  const root = mkdtempSync(join(tmpdir(), "specter-trace-"));
  mkdirSync(join(root, "resources", "functional", "hu"), { recursive: true });
  return root;
}

function hu(id, reqIds = ["RF-001"], deps = []) {
  return {
    id, type: "Historia de Usuario", title: "HU", status: "ready",
    schema_version: "0.1.0", artifact_version: "1",
    created_at: "2026-11-02T15:00:00Z", updated_at: "2026-11-02T15:00:00Z",
    business_value: "Valor", user_story: { role: "u", action: "a", benefit: "b" },
    scope: { included: ["x"], excluded: [] },
    acceptance_criteria: [{ id: "CA1", scenario: "Dado X, cuando Y, entonces Z." }],
    main_flow: ["Paso 1"], requirement_ids: reqIds, dependencies: deps,
  };
}

function tt(id, parentHuId) {
  return {
    id, type: "Tarea Técnica", title: "TT", parent_hu_id: parentHuId, status: "ready",
    schema_version: "0.1.0", artifact_version: "1",
    created_at: "2026-11-02T15:00:00Z", updated_at: "2026-11-02T15:00:00Z",
    technical_objective: "Objetivo", implementation_steps: ["Paso 1"],
    definition_of_done: ["DoD verificable con detalle"], test_strategy: "Pruebas",
    evidence_requirements: ["Evidencia"], component: "backend", architecture_layer: "api",
    dependencies: [],
  };
}

function run(root, extra = []) {
  return spawnSync(process.execPath, [traceCli, "--root", root, "--json", ...extra], { encoding: "utf8" });
}

test("sin huecos: HU con su TT → exit 0, 0 críticos", () => {
  const root = fixtureDir();
  try {
    writeFileSync(join(root, "resources", "functional", "hu", "hu-01.md"), md(hu("HU-01")));
    writeFileSync(join(root, "resources", "functional", "hu", "tt-01.md"), md(tt("TT-01", "HU-01")));
    const r = run(root);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const out = JSON.parse(r.stdout);
    assert.equal(out.summary.critical, 0);
    assert.equal(out.summary.hu, 1);
    assert.equal(out.summary.tt, 1);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("TT con HU padre inexistente → exit 1, hallazgo crítico", () => {
  const root = fixtureDir();
  try {
    writeFileSync(join(root, "resources", "functional", "hu", "tt-01.md"), md(tt("TT-01", "HU-99")));
    const r = run(root);
    assert.equal(r.status, 1);
    const out = JSON.parse(r.stdout);
    assert.ok(out.findings.some(f => f.severity === "critical" && f.kind === "TT con HU padre inexistente"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("requisito sin HU se detecta con --req-ids", () => {
  const root = fixtureDir();
  try {
    writeFileSync(join(root, "resources", "functional", "hu", "hu-01.md"), md(hu("HU-01", ["RF-001"])));
    const r = run(root, ["--req-ids", "RF-001,RF-002"]);
    assert.equal(r.status, 1); // hallazgo high (requisito sin HU)
    const out = JSON.parse(r.stdout);
    assert.ok(out.findings.some(f => f.severity === "high" && f.kind === "requisito sin HU" && f.id === "RF-002"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("referencia rota en dependencies de HU → hallazgo high", () => {
  const root = fixtureDir();
  try {
    writeFileSync(join(root, "resources", "functional", "hu", "hu-01.md"), md(hu("HU-01", ["RF-001"], ["HU-99"])));
    const r = run(root);
    const out = JSON.parse(r.stdout);
    assert.ok(out.findings.some(f => f.severity === "high" && f.kind === "referencia rota en dependencies"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
