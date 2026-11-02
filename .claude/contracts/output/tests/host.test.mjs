import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { validateRun } from "../validate-run.mjs";
import { readJSON } from "../rules.mjs";
import { seedProject } from "./contract-tests.mjs";
const kit = fileURLToPath(new URL("../../../../", import.meta.url));
test("Host assigns each result file and enforces task and completeness", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "qa-host-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  seedProject(root, "qa-ranger-playwright");
  const folder = path.join(root, "results");
  fs.mkdirSync(folder);
  const value = readJSON(
    path.join(
      kit,
      ".claude/skills/qa-ranger-playwright/contracts/examples/qa-ranger-playwright-ejecucion.json",
    ),
  );
  const item = {
      invocationId: "invoke-1",
      capabilityId: value.capabilityId,
      task: "execute",
      resultFile: "qa-ranger-playwright-1.json",
    },
    manifest = { invocations: [item] };
  await assert.rejects(validateRun(folder, manifest, root), {
    message: "Faltan resultados: ['qa-ranger-playwright-1.json']",
  });
  fs.writeFileSync(path.join(folder, item.resultFile), JSON.stringify(value));
  const outcome = await validateRun(folder, manifest, root);
  assert.equal(outcome.valid, true);
  assert.equal(outcome.results[0].invocationId, "invoke-1");
  const expected = structuredClone(value.data.expected);
  assert.equal((await validateRun(folder, { invocations: [{ ...item, expected: [...expected].reverse() }] }, root)).valid, true);
  for (const changed of [[], [{ ...expected[0], priority: 'low' }], [...expected, expected[0]], [{ id: 'TC-extra', project: 'chromium', priority: 'high' }]])
    await assert.rejects(validateRun(folder, { invocations: [{ ...item, expected: changed }] }, root), /alcance|duplicado/);
  const unknown = structuredClone(value);
  unknown.data.expected = null;
  fs.writeFileSync(path.join(folder, item.resultFile), JSON.stringify(unknown));
  await assert.rejects(validateRun(folder, { invocations: [{ ...item, expected }] }, root), /alcance/);
  delete unknown.data.expected;
  fs.writeFileSync(path.join(folder, item.resultFile), JSON.stringify(unknown));
  await assert.rejects(validateRun(folder, manifest, root), /data.expected/);
  fs.writeFileSync(path.join(folder, item.resultFile), JSON.stringify(value));
  for (const field of ["invocationId", "capabilityId", "task", "resultFile"])
    for (const invalid of [null, "", "   ", false, []]) {
      const bad = structuredClone(item);
      bad[field] = invalid;
      await assert.rejects(validateRun(folder, { invocations: [bad] }, root), /inválid|nombre de archivo|llamarse/);
    }
  for (const resultFile of ["../escape-1.json", "ranger-1.json", "qa-ranger-playwright.json"])
    await assert.rejects(validateRun(folder, { invocations: [{ ...item, resultFile }] }, root), /nombre de archivo|llamarse|no coincide/);
  await assert.rejects(validateRun(folder, { invocations: [{ ...item, capabilityId: "qa-ranger-karate", resultFile: "qa-ranger-karate-1.json" }] }, root), /no esperados|Faltan/);
  await assert.rejects(validateRun(folder, { invocations: [{ ...item, task: "design" }] }, root), /tarea no coincide/);
  await assert.rejects(
    validateRun(folder, { invocations: [item, { ...item, invocationId: "invoke-2" }] }, root),
    /resultFile duplicado/,
  );
  await assert.rejects(
    validateRun(folder, { invocations: [item, item] }, root),
    /ausente, inválido o duplicado/,
  );
  fs.writeFileSync(path.join(folder, "qa-ranger-playwright-2.json"), JSON.stringify(value));
  await assert.rejects(validateRun(folder, manifest, root), /Resultados no esperados/);
  fs.unlinkSync(path.join(folder, "qa-ranger-playwright-2.json"));
  for (const invalid of [
    {},
    { invocations: [] },
    { invocations: {}, extra: true },
  ])
    await assert.rejects(validateRun(folder, invalid, root));
});
test("External Node host imports validateRun without processes or dependencies", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "qa-external-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const folder = path.join(root, "results");
  fs.mkdirSync(folder);
  const invocations = [];
  const filter = source => !/(?:^|[\\/])(?:node_modules|tests|evals|__pycache__)(?:[\\/]|$)/.test(source) && !source.endsWith('.py');
  const copiedOutput = path.join(root, '.claude/contracts/output');
  fs.cpSync(path.join(kit, '.claude/contracts/output'), copiedOutput, { recursive: true, filter });
  for (const capability of ['qa-ranger-selenium', 'qa-ranger-jmeter']) fs.cpSync(path.join(kit, '.claude/skills', capability), path.join(root, '.claude/skills', capability), { recursive: true, filter });
  assert.equal(fs.existsSync(path.join(copiedOutput, 'node_modules')), false);
  assert.equal(fs.existsSync(path.join(copiedOutput, 'validate.py')), false);
  for (const capability of ["qa-ranger-selenium", "qa-ranger-jmeter"]) {
    seedProject(root, capability);
    const value = readJSON(
      path.join(
        kit,
        `.claude/skills/${capability}/contracts/examples/${capability}-ejecucion.json`,
      ),
    );
    fs.writeFileSync(
      path.join(folder, `${capability}-1.json`),
      JSON.stringify(value),
    );
    invocations.push({
      invocationId: capability,
      capabilityId: capability,
      resultFile: `${capability}-1.json`,
      task: "execute",
      evidencePolicy: value.data.evidencePolicy,
    });
  }
  const manifest = path.join(root, "manifest.json");
  fs.writeFileSync(manifest, JSON.stringify({ invocations }));
  const host = path.join(root, "host.mjs");
  fs.writeFileSync(
    host,
    `import { validateRun } from ${JSON.stringify(pathToFileURL(path.join(copiedOutput, 'validate-run.mjs')).href)}; import fs from 'node:fs'; console.log(JSON.stringify(await validateRun(process.argv[2], JSON.parse(fs.readFileSync(process.argv[3], 'utf8')), process.argv[4])));`,
  );
  const args = [folder, manifest, root];
  const run = spawnSync(process.execPath, [host, ...args], {
    encoding: "utf8",
    cwd: root,
  });
  assert.equal(run.status, 0, run.stdout + run.stderr);
  assert.equal(JSON.parse(run.stdout).results.length, 2);
  const cli = spawnSync(
    process.execPath,
    [
      path.join(copiedOutput, 'validate-run.mjs'),
      folder,
      "--manifest",
      manifest,
      "--project-root",
      root,
    ],
    { encoding: "utf8", cwd: root },
  );
  assert.equal(cli.status, 0, cli.stdout + cli.stderr);
  assert.deepEqual(JSON.parse(cli.stdout), JSON.parse(run.stdout));
});
