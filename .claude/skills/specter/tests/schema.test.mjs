import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { CONTRACTS, structuralProblems, validate } from "../scripts/engine.mjs";

const schemaDir = fileURLToPath(new URL("../contracts/", import.meta.url));

function loadSchema(name) {
  return JSON.parse(fs.readFileSync(new URL(`../contracts/${name}`, import.meta.url), "utf8"));
}

test("los campos obligatorios del motor coinciden con los esquemas", () => {
  const hu = loadSchema("user-story.schema.json");
  const tt = loadSchema("technical-task.schema.json");
  assert.deepEqual([...CONTRACTS.user_story.required].sort(), [...hu.required].sort());
  assert.deepEqual([...CONTRACTS.technical_task.required].sort(), [...tt.required].sort());
});

test("los enums del motor coinciden con los esquemas", () => {
  const hu = loadSchema("user-story.schema.json");
  assert.deepEqual(CONTRACTS.user_story.enums.status, hu.$defs.status.enum);
  assert.deepEqual(CONTRACTS.user_story.enums.priority, hu.$defs.priority.enum);
  assert.deepEqual(CONTRACTS.user_story.enums.points, hu.$defs.points.enum);
  assert.equal(CONTRACTS.user_story.discriminator, "historia_usuario");
  assert.equal(CONTRACTS.technical_task.discriminator, "tarea_tecnica");
});

test("objeto vacío produce errores estructurales pero no bloqueos", () => {
  const { errors, blocks } = structuralProblems("user_story", {});
  assert.ok(errors.length >= 7);
  assert.equal(blocks.length, 0);
});

test("tipo incorrecto y enum inválido bloquean", () => {
  const { blocks } = structuralProblems("user_story", { type: "tarea_tecnica", status: "raro" });
  assert.ok(blocks.some(b => b.rule === "discriminator"));
  assert.ok(blocks.some(b => b.rule === "enum"));
});

test("criterio sin resultado observable bloquea", () => {
  const { blocks } = structuralProblems("user_story", {
    acceptance_criteria: [{ id: "CA1" }],
  });
  assert.ok(blocks.some(b => b.rule === "criterion"));
});
