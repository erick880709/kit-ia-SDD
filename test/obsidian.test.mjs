import test from "node:test";
import assert from "node:assert";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("../.claude/skills/obsidian/scripts/obsidian.mjs", import.meta.url));

function run(args, opts = {}) {
  const result = spawnSync(process.execPath, [script, ...args], {
    encoding: "utf8",
    ...opts,
  });
  return result;
}

function runOk(args) {
  const result = run(args);
  assert.equal(result.status, 0, `status ${result.status}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
  return result;
}

function tmpdir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "obsidian-test-"));
}

function writeGraph(root, graph) {
  fs.mkdirSync(path.join(root, ".memoria"), { recursive: true });
  fs.writeFileSync(path.join(root, ".memoria", "graph.json"), JSON.stringify(graph), "utf8");
}

const fixture = {
  schema: "memoria/v1",
  nodes: [
    {
      id: "mem-001-specter-hu-01",
      type: "decision",
      skill: "archi",
      title: "Persistencia en PostgreSQL",
      summary: "Se elige PostgreSQL por transacciones y reportes.",
      status: "completado",
      files: ["docs/arq.md"],
      links: ["mem-002-builder-login"],
      createdAt: "2026-11-02T15:00:00.000Z",
    },
    {
      id: "mem-002-builder-login",
      type: "avance",
      skill: "builder",
      title: "Implementar login",
      summary: "Flujo de login con JWT.",
      status: "activo",
      createdAt: "2026-11-02T15:05:00.000Z",
    },
  ],
  edges: [{ from: "mem-001-specter-hu-01", to: "mem-002-builder-login", type: "relacionado" }],
};

test("export proyecta el grafo a un vault y a un canvas válido", () => {
  const root = tmpdir();
  writeGraph(root, fixture);
  const out = runOk(["export", "--root", root]).stdout;
  assert.match(out, /export: 2 nodos, 1 arista/);

  const vault = path.join(root, "obsidian");
  assert.ok(fs.existsSync(path.join(vault, "Inicio.md")));
  const note = fs.readFileSync(path.join(vault, "notas", "mem-001-specter-hu-01.md"), "utf8");
  assert.match(note, /# Persistencia en PostgreSQL/);
  assert.match(note, /\[\[mem-002-builder-login\]\]/);
  assert.match(note, /type: decision/);
  assert.match(note, /`docs\/arq\.md`/);

  const canvas = JSON.parse(fs.readFileSync(path.join(vault, "Memoria.canvas"), "utf8"));
  assert.equal(canvas.nodes.length, 2);
  assert.equal(canvas.edges.length, 1);
  assert.equal(canvas.nodes[0].type, "file");
  assert.equal(canvas.nodes[0].file, "notas/mem-001-specter-hu-01.md");
  assert.equal(canvas.nodes[0].color, "6"); // decision
  assert.equal(canvas.nodes[1].color, "5"); // avance
  assert.equal(canvas.edges[0].toEnd, "arrow");

  const validation = run(["validate-canvas", path.join(vault, "Memoria.canvas")]);
  assert.equal(validation.status, 0, validation.stderr);
});

test("export deriva aristas desde links cuando no hay edges", () => {
  const root = tmpdir();
  writeGraph(root, {
    schema: "memoria/v1",
    nodes: [
      { id: "a", type: "avance", skill: "builder", title: "A", summary: "a", links: ["b"] },
      { id: "b", type: "avance", skill: "builder", title: "B", summary: "b" },
    ],
  });
  runOk(["export", "--root", root]);
  const canvas = JSON.parse(fs.readFileSync(path.join(root, "obsidian", "Memoria.canvas"), "utf8"));
  assert.equal(canvas.edges.length, 1);
  assert.equal(canvas.edges[0].label, "relacionado");
});

test("export sin .memoria/graph.json falla con código 2", () => {
  const root = tmpdir();
  const result = run(["export", "--root", root]);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /graph\.json/);
});

test("validate-canvas detecta aristas colgantes e ids duplicados", () => {
  const root = tmpdir();
  const dangling = path.join(root, "dangling.canvas");
  fs.writeFileSync(
    dangling,
    JSON.stringify({
      nodes: [{ id: "a", type: "text", x: 0, y: 0, width: 100, height: 100, text: "x" }],
      edges: [{ id: "e1", fromNode: "a", toNode: "no-existe" }],
    }),
    "utf8"
  );
  const result = run(["validate-canvas", dangling]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /no resuelve/);

  const dup = path.join(root, "dup.canvas");
  fs.writeFileSync(
    dup,
    JSON.stringify({
      nodes: [
        { id: "a", type: "text", x: 0, y: 0, width: 100, height: 100, text: "x" },
        { id: "a", type: "text", x: 100, y: 0, width: 100, height: 100, text: "y" },
      ],
      edges: [],
    }),
    "utf8"
  );
  const resultDup = run(["validate-canvas", dup]);
  assert.equal(resultDup.status, 1);
  assert.match(resultDup.stderr, /duplicado/);
});

test("validate-canvas acepta un canvas vacío válido", () => {
  const root = tmpdir();
  const file = path.join(root, "empty.canvas");
  fs.writeFileSync(file, JSON.stringify({ nodes: [], edges: [] }), "utf8");
  const result = run(["validate-canvas", file]);
  assert.equal(result.status, 0, result.stderr);
});
