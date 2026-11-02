import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { validateResult } from "../validate.mjs";
import { validateRun } from "../validate-run.mjs";
test("Registry extends to non-QA capabilities and rejects code outside its package", async (t) => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "qa-registry-"));
  t.after(() => fs.rmSync(projectRoot, { recursive: true, force: true }));
  const outputRoot = path.join(projectRoot, ".claude/contracts/output");
  fs.mkdirSync(outputRoot, { recursive: true });
  const registry = path.join(outputRoot, "validators.json");
  const script = path.join(
    projectRoot,
    ".claude/skills/example/scripts/validate.mjs",
  );
  fs.mkdirSync(path.dirname(script), { recursive: true });
  fs.writeFileSync(
    script,
    "export function validateInvocation(v, a, c, opts) { if (v.data.answer !== 42 || opts.expectedTask !== 'compose') throw new Error('Aceptación específica incumplida'); return []; }",
  );
  const value = {
    contractVersion: "0.1.0",
    capabilityId: "example-capability",
    status: "completed",
    summary: "Entrega de prueba",
    checks: [],
    artifacts: [],
    pending: [],
    data: { answer: 42 },
  };
  fs.writeFileSync(
    registry,
    JSON.stringify({
      "example-capability": "skills/example/scripts/validate.mjs",
    }),
  );
  assert.equal(
    (
      await validateResult(value, {
        projectRoot,
        outputRoot,
        expectedTask: "compose",
      })
    ).valid,
    true,
  );
  const folder = path.join(projectRoot, "results");
  fs.mkdirSync(folder);
  fs.writeFileSync(
    path.join(folder, "example-capability-1.json"),
    JSON.stringify(value),
  );
  assert.equal(
    (
      await validateRun(
        folder,
        {
          invocations: [
            {
              invocationId: "invoke-1",
              capabilityId: value.capabilityId,
              resultFile: "example-capability-1.json",
              task: "compose",
            },
          ],
        },
        projectRoot,
        { outputRoot },
      )
    ).valid,
    true,
  );
  value.data.answer = 0;
  await assert.rejects(
    validateResult(value, { projectRoot, outputRoot, expectedTask: "compose" }),
    /específica/,
  );
  fs.writeFileSync(registry, "{}");
  await assert.rejects(
    validateResult(value, { projectRoot, outputRoot }),
    /no registrada/,
  );
  fs.writeFileSync(
    path.join(projectRoot, "outside.mjs"),
    "throw new Error('No debe ejecutarse')",
  );
  fs.writeFileSync(
    registry,
    JSON.stringify({ "example-capability": "../outside.mjs" }),
  );
  await assert.rejects(
    validateResult(value, { projectRoot, outputRoot }),
    /fuera del paquete/,
  );
});
