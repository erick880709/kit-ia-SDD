import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const validator = fileURLToPath(new URL("./validate-skill-catalog.mjs", import.meta.url));

function validate(root) {
  const result = spawnSync(process.execPath, [validator, ...(root ? [root] : [])], {
    encoding: "utf8",
  });
  assert.ifError(result.error);
  return result;
}

test("every catalog skill has valid YAML and user-facing capabilities", () => {
  const result = validate();
  assert.equal(result.status, 0, result.stderr);
});

function fixtureTest(title, content, expectedStatus, expectedMessage) {
  test(title, () => {
    const root = mkdtempSync(join(tmpdir(), "kit-ia-catalog-"));
    try {
      mkdirSync(join(root, "new-skill"));
      writeFileSync(join(root, "new-skill", "SKILL.md"), content);
      const result = validate(root);
      assert.equal(result.status, expectedStatus, result.stderr);
      assert.match(result.stderr + result.stdout, expectedMessage);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
}

const header = "---\nname: new-skill\ndescription: Una descripción.\n";
const fields = '  capability: "Plan de pruebas"\n  capability-summary: "Crea un plan de pruebas."\n';

fixtureTest("accepts existing metadata alongside capability fields",
  `${header}metadata:\n  owner: QA\n${fields}---\n`, 0, /1 skills/);
fixtureTest("rejects a newly added skill without capabilities",
  `${header}---\n`, 1, /metadata/);
fixtureTest("rejects malformed YAML",
  `${header}metadata: [\n---\n`, 1, /YAML inválido/);
fixtureTest("rejects a missing summary",
  `${header}metadata:\n  capability: "Pruebas"\n---\n`, 1, /capability-summary/);
fixtureTest("rejects an empty capability",
  `${header}metadata:\n${fields.replace("Plan de pruebas", " ")}---\n`, 1, /texto no vacío/);
fixtureTest("rejects unquoted UI text",
  `${header}metadata:\n${fields.replace('"Plan de pruebas"', "Plan de pruebas")}---\n`, 1, /comillas dobles/);
fixtureTest("rejects summaries longer than 100 characters",
  `${header}metadata:\n${fields.replace("Crea un plan de pruebas.", "Crea " + "a".repeat(100))}---\n`, 1, /100 caracteres/);
fixtureTest("rejects duplicate YAML keys",
  `${header}metadata:\n${fields}  capability: "Otra capacidad"\n---\n`, 1, /YAML inválido/);
fixtureTest("rejects capability fields outside metadata",
  `${header}metadata:\n  owner: QA\nother:\n${fields}---\n`, 1, /metadata.capability/);
fixtureTest("accepts folded descriptions and existing nested metadata",
  `---\nname: new-skill\ndescription: >\n  Una descripción\n  en varias líneas.\nmetadata:\n  owner:\n    team: QA\n${fields}---\n`, 0, /1 skills/);
fixtureTest("rejects a quoted summary spanning multiple source lines",
  `${header}metadata:\n${fields.replace("Crea un plan de pruebas.", "Crea un plan\n    de pruebas.")}---\n`, 1, /una sola línea/);
