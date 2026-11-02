import { test } from "node:test";
import assert from "node:assert";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("../.claude/skills/memoria/scripts/memoria.mjs", import.meta.url));

function run(args, opts = {}) {
  return execFileSync(process.execPath, [script, ...args], {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
    ...opts,
  });
}

function runJson(args) {
  return JSON.parse(run(args));
}

function tmpdir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "memoria-test-"));
}

function readGraph(root) {
  return JSON.parse(fs.readFileSync(path.join(root, ".memoria", "graph.json"), "utf8"));
}

test("init crea la estructura y el hook de Stop", () => {
  const root = tmpdir();
  const out = run(["init", "--root", root]);
  assert.match(out, /Memoria inicializada/);
  assert.ok(fs.existsSync(path.join(root, ".memoria", "graph.json")));
  assert.ok(fs.existsSync(path.join(root, ".memoria", "index.md")));
  assert.ok(fs.existsSync(path.join(root, ".memoria", "config.json")));
  assert.ok(fs.existsSync(path.join(root, ".memoria", "pending")));
  const settings = JSON.parse(fs.readFileSync(path.join(root, ".claude", "settings.json"), "utf8"));
  const commands = settings.hooks.Stop.flatMap(g => g.hooks.map(h => h.command));
  assert.ok(commands.includes("node .claude/skills/memoria/scripts/memoria.mjs hook-stop"));
});

test("init es idempotente y no pisa hooks existentes", () => {
  const root = tmpdir();
  run(["init", "--root", root]);
  // Añade un hook ajeno y vuelve a inicializar.
  const settingsPath = path.join(root, ".claude", "settings.json");
  const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  settings.hooks.Stop.push({ hooks: [{ type: "command", command: "node otra-cosa.mjs" }] });
  fs.writeFileSync(settingsPath, JSON.stringify(settings));
  run(["init", "--root", root]);
  const after = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  const commands = after.hooks.Stop.flatMap(g => g.hooks.map(h => h.command));
  assert.equal(commands.filter(c => c === "node .claude/skills/memoria/scripts/memoria.mjs hook-stop").length, 1);
  assert.ok(commands.includes("node otra-cosa.mjs"));
});

test("record crea y actualiza por skill+title sin duplicar", () => {
  const root = tmpdir();
  run(["init", "--root", root]);
  run(["record", "--root", root, "--skill", "builder", "--type", "avance",
    "--title", "Implementar login", "--summary", "v1", "--status", "completado"]);
  run(["record", "--root", root, "--skill", "builder", "--type", "avance",
    "--title", "Implementar login", "--summary", "v2 con refresh token"]);
  const graph = readGraph(root);
  assert.equal(graph.nodes.length, 1);
  assert.equal(graph.nodes[0].summary, "v2 con refresh token");
  assert.equal(graph.nodes[0].type, "avance");
});

test("record --new fuerza un nodo nuevo y crea enlaces", () => {
  const root = tmpdir();
  run(["init", "--root", root]);
  const out = run(["record", "--root", root, "--skill", "builder", "--type", "avance",
    "--title", "Login", "--summary", "a", "--status", "completado"]);
  const firstId = out.trim().replace(/^creado /, "");
  run(["record", "--root", root, "--skill", "builder", "--type", "avance",
    "--title", "Login", "--summary", "b", "--new"]);
  const graph = readGraph(root);
  assert.equal(graph.nodes.length, 2);

  run(["record", "--root", root, "--skill", "code-review", "--type", "decision",
    "--title", "Aprobar login", "--summary", "ok", "--link", firstId]);
  const after = readGraph(root);
  assert.equal(after.edges.length, 1);
  assert.equal(after.edges[0].from, after.nodes.find(n => n.skill === "code-review").id);
  assert.equal(after.edges[0].to, firstId);
});

test("hook-stop consolida pendientes (incluso con BOM) y regenera el índice", () => {
  const root = tmpdir();
  run(["init", "--root", root]);
  const pending = path.join(root, ".memoria", "pending");
  const payload = JSON.stringify({
    skill: "archi", type: "hito", title: "Arquitectura aprobada",
    summary: "Documento aprobado por el comité", status: "completado",
  });
  fs.writeFileSync(path.join(pending, "1.json"), "\uFEFF" + payload, "utf8");
  run(["hook-stop", "--root", root]);
  const graph = readGraph(root);
  assert.equal(graph.nodes.length, 1);
  assert.equal(graph.nodes[0].skill, "archi");
  assert.equal(fs.readdirSync(pending).length, 0);
  assert.ok(fs.existsSync(path.join(root, ".memoria", "index.md")));
});

test("hook-stop pone en cuarentena los pendientes mal formados", () => {
  const root = tmpdir();
  run(["init", "--root", root]);
  const pending = path.join(root, ".memoria", "pending");
  fs.writeFileSync(path.join(pending, "bad.json"), "{esto no es json", "utf8");
  run(["hook-stop", "--root", root]);
  assert.ok(fs.existsSync(path.join(pending, "invalid", "bad.json")));
  assert.equal(fs.readdirSync(pending).filter(f => f.endsWith(".json")).length, 0);
});

test("query filtra por tipo, skill, estado y texto", () => {
  const root = tmpdir();
  run(["init", "--root", root]);
  run(["record", "--root", root, "--skill", "builder", "--type", "avance",
    "--title", "Login", "--summary", "auth", "--status", "completado"]);
  run(["record", "--root", root, "--skill", "archi", "--type", "decision",
    "--title", "Usar PostgreSQL", "--summary", "persistencia", "--status", "activo"]);
  assert.equal(runJson(["query", "--root", root, "--skill", "builder", "--json"]).length, 1);
  assert.equal(runJson(["query", "--root", root, "--type", "decision", "--json"]).length, 1);
  assert.equal(runJson(["query", "--root", root, "--status", "activo", "--json"]).length, 1);
  assert.equal(runJson(["query", "--root", root, "--text", "postgre", "--json"]).length, 1);
});

test("validate rechaza enlaces rotos y tipos inválidos", () => {
  const root = tmpdir();
  run(["init", "--root", root]);
  run(["record", "--root", root, "--skill", "builder", "--type", "avance",
    "--title", "A", "--summary", "s"]);
  const graph = readGraph(root);
  graph.nodes[0].links = ["mem-inexistente"];
  fs.writeFileSync(path.join(root, ".memoria", "graph.json"), JSON.stringify(graph));
  assert.throws(() => run(["validate", "--root", root]), err => err.status === 1);

  const graph2 = readGraph(root);
  graph2.nodes[0].links = [];
  graph2.nodes[0].type = "raro";
  fs.writeFileSync(path.join(root, ".memoria", "graph.json"), JSON.stringify(graph2));
  assert.throws(() => run(["validate", "--root", root]), err => err.status === 1);
});

test("init no duplica el hook si ya está en otro grupo", () => {
  const root = tmpdir();
  // settings.json con dos grupos: el hook de memoria vive en el segundo.
  const settingsPath = path.join(root, ".claude", "settings.json");
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify({
    hooks: { Stop: [
      { hooks: [{ type: "command", command: "node .claude/contracts/output/hooks/stop.mjs" }] },
      { hooks: [{ type: "command", command: "node .claude/skills/memoria/scripts/memoria.mjs hook-stop" }] },
    ] },
  }));
  run(["init", "--root", root]);
  const after = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  const commands = after.hooks.Stop.flatMap(g => g.hooks.map(h => h.command));
  assert.equal(commands.filter(c => c === "node .claude/skills/memoria/scripts/memoria.mjs hook-stop").length, 1);
  assert.equal(commands.length, 2);
});

test("merge archiva completados antiguos y desduplica", () => {
  const root = tmpdir();
  run(["init", "--root", root]);
  run(["record", "--root", root, "--skill", "builder", "--type", "avance",
    "--title", "Login", "--summary", "v1", "--status", "completado"]);
  run(["record", "--root", root, "--skill", "builder", "--type", "avance",
    "--title", "Login", "--summary", "v2", "--status", "completado", "--new"]);
  // Envejece ambos nodos y archiva.
  const graph = readGraph(root);
  const old = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
  for (const n of graph.nodes) { n.createdAt = old; n.updatedAt = old; }
  fs.writeFileSync(path.join(root, ".memoria", "graph.json"), JSON.stringify(graph));
  run(["merge", "--root", root, "--archive-completed"]);
  const after = readGraph(root);
  // Desduplicado a un nodo y archivado.
  assert.equal(after.nodes.length, 1);
  assert.equal(after.nodes[0].status, "archivado");
});
