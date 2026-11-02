import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { validateResult, checkRunFileName, SCHEMA } from "../validate.mjs";
import { readJSON, parseJSON, ContractError, parseArgs } from "../rules.mjs";
import { schemaSha256 } from "../schemas/result.validate.mjs";
import { example, seedProject } from "./contract-tests.mjs";
import { readCoverage } from "../validators/qa/coverage.mjs";
const kit = fileURLToPath(new URL("../../../../", import.meta.url));
const validator = fileURLToPath(new URL("../validate.mjs", import.meta.url));

test('CLI: separator, abbreviations and option values', () => {
  const spec = { positional: 'result', values: ['project-root'], multi: ['expected-deliverables'], required: ['project-root'] };
  assert.deepEqual(parseArgs(['--project-r', '.', '--', '-result.json'], spec), { 'project-root': '.', result: '-result.json' });
  assert.throws(() => parseArgs(['result.json', '--project-root', '-h'], spec), e => e.exitCode === 2);
  assert.equal(parseArgs(['--help'], spec).help, true);
  assert.equal(parseArgs(['result.json', '--project-root=.', '--expected-deliverables', 'test_plan', 'test_runbook'], spec)['expected-deliverables'].length, 2);
});

test('Unsafe integers cannot be silently rounded in JSON or host objects', async () => {
  assert.throws(() => parseJSON('{"covered":9007199254740993,"total":9007199254740992}'), /rango entero seguro/);
  assert.equal(parseJSON('{"covered":9007199254740991}').covered, Number.MAX_SAFE_INTEGER);
  const value = readJSON(path.join(kit, '.claude/skills/ranger/contracts/examples/ranger-unitarias.json'));
  value.data.targetOverride = { value: 2 ** 53, reason: 'Valor fuera de rango.' };
  await assert.rejects(validateResult(value, { projectRoot: kit }), /rango entero seguro/);
});

test('Contrato: conteos decimales explícitos del reporte de cobertura se rechazan', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-decimal-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'coverage-summary.json'), '{"total":{"lines":{"covered":1.0,"total":2}}}');
  assert.throws(() => readCoverage('coverage-summary.json', root), /entero no negativo/);
  fs.writeFileSync(path.join(root, 'coverage-summary.json'), '{"total":{"lines":{"covered":1,"total":2}}}');
  assert.deepEqual(readCoverage('coverage-summary.json', root), { lines: { covered: 1, total: 2 } });
});

test('Contrato: textos Unicode requieren un carácter fuera de la clase de espacios', async () => {
  for (const summary of [' ', '\u0085', '\u001c', '\u00a0']) {
    const value = example('qa-ranger-plan-pruebas'); value.summary = summary;
    await assert.rejects(validateResult(value, { projectRoot: kit }), /summary/);
  }
  const value = example('qa-ranger-plan-pruebas'); value.summary = '\uFEFF';
  assert.equal((await validateResult(value, { projectRoot: kit })).valid, true);
});

test('Contrato: URI admite esquemas y rechaza sintaxis, escapes o caracteres inválidos', async () => {
  for (const uri of ['custom:', 'custom:?query', 'https://example.invalid/report']) {
    const value = example('qa-ranger-plan-pruebas'); delete value.artifacts[0].content; value.artifacts[0].uri = uri;
    assert.equal((await validateResult(value, { projectRoot: kit })).valid, true);
  }
  for (const uri of ['not-a-uri', 'https://example.invalid/%ZZ', 'http://[invalid]/', 'https://exámple.com', 'https://example.invalid/á']) {
    const value = example('qa-ranger-plan-pruebas'); delete value.artifacts[0].content; value.artifacts[0].uri = uri;
    await assert.rejects(validateResult(value, { projectRoot: kit }), /uri/);
  }
});
test("Generated validator matches the sole source schema and has no runtime imports", () => {
  const bytes = fs.readFileSync(
    new URL("../schemas/result.schema.json", import.meta.url),
  );
  assert.equal(
    createHash("sha256").update(bytes.toString("utf8").replace(/\r\n/g, "\n")).digest("hex"),
    schemaSha256,
    "Regenera con npm run generate",
  );
  const code = fs.readFileSync(
    new URL("../schemas/result.validate.mjs", import.meta.url),
    "utf8",
  );
  assert.equal(/(^|\n)\s*import\s|=\s*require\s*\(/m.test(code), false);
  assert.equal(SCHEMA.properties.contractVersion.const, "0.1.0");
});
test("JSON duplicate keys, constants and BOM", () => {
  for (const [input, error] of [
    ['{"id":1,"id":2}', "Clave JSON duplicada: id"],
    ['{"value":NaN}', "Constante JSON no admitida: NaN"],
    ['{"value":Infinity}', "Constante JSON no admitida: Infinity"],
    ['{"x":{"a":1,"a":2}}', "Clave JSON duplicada: a"],
  ])
    assert.throws(
      () => parseJSON(input),
      (e) => e instanceof ContractError && e.message === error,
    );
  assert.deepEqual(parseJSON('\uFEFF{"ok":true}'), { ok: true });
  assert.equal(
    Object.getPrototypeOf(parseJSON('{"__proto__":42}')),
    Object.prototype,
  );
  assert.equal(parseJSON('{"__proto__":42}').__proto__, 42);
});
test("CLI valid/invalid JSON, every host flag, and run filename", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "qa-cli-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const value = readJSON(
    path.join(
      kit,
      ".claude/skills/qa-ranger-playwright/contracts/examples/qa-ranger-playwright-ejecucion.json",
    ),
  );
  seedProject(root, "qa-ranger-playwright");
  const file = path.join(root, "qa-ranger-playwright-1.json");
  fs.writeFileSync(file, JSON.stringify(value));
  const policy = path.join(root, "policy.json");
  fs.writeFileSync(policy, JSON.stringify(value.data.evidencePolicy));
  const args = [
    file,
    "--project-root",
    root,
    "--run-result",
    "--expected-capability-id",
    value.capabilityId,
    "--expected-evidence-policy",
    policy,
    "--expected-task",
    "execute",
  ];
  let run = spawnSync(process.execPath, [validator, ...args], {
    encoding: "utf8",
  });
  assert.equal(run.status, 0, run.stdout + run.stderr);
  assert.deepEqual(
    JSON.parse(run.stdout),
    await validateResult(value, { projectRoot: root }),
  );
  run = spawnSync(
    process.execPath,
    [validator, ...args, "--expected-capability-id", "ranger"],
    { encoding: "utf8" },
  );
  assert.equal(run.status, 1);
  assert.match(JSON.parse(run.stdout).errors[0], /capabilityId/);
  run = spawnSync(process.execPath, [validator], { encoding: "utf8" });
  assert.equal(run.status, 2);
  run = spawnSync(process.execPath, [validator, "--help"], {
    encoding: "utf8",
  });
  assert.equal(run.status, 0);
  for (const name of [
    "ranger-1.json",
    "qa-ranger-playwright.json",
    "qa-ranger-playwright-0.json",
  ])
    assert.throws(() => checkRunFileName(name, value), ContractError);
  checkRunFileName("qa-ranger-playwright-12.json", value);
});
test("Artifacts and checks cannot be duplicated; links cannot escape the project", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "qa-path-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const validPlan = example('qa-ranger-plan-pruebas');
  for (const field of ["artifacts", "checks"]) {
    const value = structuredClone(validPlan);
    value[field].push(structuredClone(value[field][0]));
    await assert.rejects(
      validateResult(value, { projectRoot: root }),
      /duplicad/,
    );
  }
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), "qa-outside-"));
  t.after(() => fs.rmSync(outside, { recursive: true, force: true }));
  fs.writeFileSync(path.join(outside, "file.md"), "outside");
  fs.mkdirSync(path.join(root, "resources/qa"), { recursive: true });
  fs.symlinkSync(
    outside,
    path.join(root, "resources/qa/link"),
    process.platform === "win32" ? "junction" : "dir",
  );
  const value = structuredClone(validPlan);
  value.artifacts[0] = {
    id: "plan",
    kind: "test_plan",
    path: "resources/qa/link/file.md",
  };
  await assert.rejects(
    validateResult(value, { projectRoot: root }),
    /fuera del proyecto/,
  );
});
