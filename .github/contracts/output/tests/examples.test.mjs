import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { readJSON } from "../rules.mjs";
import { validateResult } from "../validate.mjs";
import { seedProject } from "./contract-tests.mjs";
import {
  CAPABILITIES,
  SKILLS,
  loadContract,
} from "../validators/qa/qa.mjs";
for (const capability of CAPABILITIES)
  test(`All ${capability} examples and contract belong to their skill`, async (t) => {
    const root = seedProject(fs.mkdtempSync(path.join(os.tmpdir(), "qa-example-")), capability);
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const [contract, base] = loadContract(capability);
    assert.equal(contract.capabilityId, capability);
    assert.equal(contract.contractVersion, base.contractVersion);
    assert.ok(contract.requiredArtifacts.length);
    assert.ok(contract.semanticPostconditions.length);
    const folder = path.join(SKILLS, capability, "contracts/examples");
    for (const name of fs
      .readdirSync(folder)
      .filter((f) => f.endsWith(".json"))) {
      const value = readJSON(path.join(folder, name));
      const normalized = (await validateResult(value, { projectRoot: root }))
        .result;
      assert.deepEqual(
        (await validateResult(normalized, { projectRoot: root })).result,
        normalized,
      );
      assert.equal(normalized.capabilityId, capability);
    }
    for (const name of fs
      .readdirSync(path.join(folder, "invalid"))
      .filter((f) => f.endsWith(".json")))
      await assert.rejects(
        validateResult(readJSON(path.join(folder, "invalid", name)), {
          projectRoot: root,
        }),
        { message: "$.contractVersion: '0.1.0' was expected" },
      );
  });
