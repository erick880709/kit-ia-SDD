import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const validator = fileURLToPath(new URL("./validate-github-agents-sync.mjs", import.meta.url));

function run(root) {
  return spawnSync(process.execPath, [validator, ...(root ? [root] : [])], { encoding: "utf8" });
}

function makeRoot() {
  const root = mkdtempSync(join(tmpdir(), "kit-agents-sync-"));
  mkdirSync(join(root, ".claude", "agents"), { recursive: true });
  mkdirSync(join(root, ".github", "agents"), { recursive: true });
  return root;
}

const agent = "---\nname: foo\ndescription: Descripción.\nproviders: [codex, github]\n---\n\n# Foo\n";

test("custom agents del kit están sincronizados", () => {
  const result = run();
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
});

test("detecta agente .claude con github que falta en .github", () => {
  const root = makeRoot();
  try {
    writeFileSync(join(root, ".claude", "agents", "foo.agent.md"), agent);
    const result = run(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /falta en \.github\/agents\/: foo\.agent\.md/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("detecta contenido distinto entre .claude y .github", () => {
  const root = makeRoot();
  try {
    writeFileSync(join(root, ".claude", "agents", "foo.agent.md"), agent);
    writeFileSync(join(root, ".github", "agents", "foo.agent.md"), agent + "# cambio\n");
    const result = run(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /contenido distinto: \.github\/agents\/foo\.agent\.md/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("detecta agente de más en .github", () => {
  const root = makeRoot();
  try {
    writeFileSync(join(root, ".github", "agents", "foo.agent.md"), agent);
    const result = run(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /sobra en \.github\/agents\/: foo\.agent\.md/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("ignora agentes de .claude cuyo providers no incluye github", () => {
  const root = makeRoot();
  try {
    const onlyCodex = agent.replace("providers: [codex, github]", "providers: [codex]");
    writeFileSync(join(root, ".claude", "agents", "foo.agent.md"), onlyCodex);
    const result = run(root);
    assert.equal(result.status, 0, result.stderr);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
