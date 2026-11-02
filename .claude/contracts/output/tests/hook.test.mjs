import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { evaluateStop } from "../hooks/stop.mjs";
import { example } from "./contract-tests.mjs";
const kit = fileURLToPath(new URL("../../../../", import.meta.url));
const hook = fileURLToPath(new URL("../hooks/stop.mjs", import.meta.url));

function project(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "qa-hook-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const contract = path.join(root, ".claude/skills/qa-ranger-playwright/contracts/output-contract.json");
  fs.mkdirSync(path.dirname(contract), { recursive: true });
  fs.copyFileSync(path.join(kit, ".claude/skills/qa-ranger-playwright/contracts/output-contract.json"), contract);
  return root;
}
function writeResult(root, value, name = "qa-ranger-playwright-1.json") {
  const file = path.join(root, "resources/qa/contracts/run-1", name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value));
  return file;
}
const state = (root) => JSON.parse(fs.readFileSync(path.join(root, ".claude/.validacion-hook"), "utf8"));
const design = () => example("qa-ranger-playwright", (v) => v.data?.task === "design");

test("Hook: sin skills ni resultados deja terminar", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "qa-hook-empty-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  assert.equal(await evaluateStop({ cwd: root }), null);
  assert.equal(await evaluateStop({ cwd: project(t) }), null);
});

test("Hook: bloquea con los errores hasta tres veces por sesión", async (t) => {
  const root = project(t), value = design();
  value.agentId = "ranger";
  value.status = "terminado";
  writeResult(root, value);
  const first = await evaluateStop({ cwd: root, session_id: "s-1" });
  assert.equal(first.decision, "block");
  assert.match(first.reason, /aviso 1 de 3/);
  assert.match(first.reason, /qa-ranger-playwright-1\.json/);
  assert.match(first.reason, /agentId/);
  assert.match(first.reason, /status/);
  assert.match((await evaluateStop({ cwd: root, session_id: "s-1", stop_hook_active: true })).reason, /aviso 2 de 3/);
  assert.match((await evaluateStop({ cwd: root, session_id: "s-1", stop_hook_active: true })).reason, /aviso 3 de 3/);
  assert.equal(await evaluateStop({ cwd: root, session_id: "s-1", stop_hook_active: true }), null);
  assert.match((await evaluateStop({ cwd: root, session_id: "s-2" })).reason, /aviso 1 de 3/);
});

test("Hook: recuerda los resultados válidos, revalida si cambian y reinicia los avisos", async (t) => {
  const root = project(t), file = writeResult(root, design());
  assert.equal(await evaluateStop({ cwd: root, session_id: "s-1" }), null);
  assert.deepEqual(Object.keys(state(root).valid), ["resources/qa/contracts/run-1/qa-ranger-playwright-1.json"]);
  const broken = design();
  broken.summary = "";
  fs.writeFileSync(file, JSON.stringify(broken, null, 2));
  assert.equal((await evaluateStop({ cwd: root, session_id: "s-1" })).decision, "block");
  assert.equal(state(root).blocks["s-1"], 1);
  fs.writeFileSync(file, JSON.stringify(design()));
  assert.equal(await evaluateStop({ cwd: root, session_id: "s-1" }), null);
  assert.deepEqual(state(root).blocks, {});
});

test("Hook: el nombre del archivo debe corresponder a la skill", async (t) => {
  const root = project(t);
  writeResult(root, design(), "ranger-1.json");
  assert.match((await evaluateStop({ cwd: root })).reason, /nombre del archivo|llamarse/);
});

test("Hook: la CLI lee el evento por stdin y responde con JSON de bloqueo", (t) => {
  const root = project(t), value = design();
  value.summary = "";
  writeResult(root, value);
  const run = (input) => spawnSync(process.execPath, [hook], { input, encoding: "utf8", cwd: root });
  const blocked = run(JSON.stringify({ cwd: root, session_id: "cli", hook_event_name: "Stop" }));
  assert.equal(blocked.status, 0, blocked.stderr);
  assert.equal(JSON.parse(blocked.stdout).decision, "block");
  const garbage = run("no es json");
  assert.equal(garbage.status, 0);
  assert.equal(JSON.parse(garbage.stdout).decision, "block");
});
