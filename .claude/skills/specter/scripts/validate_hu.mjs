#!/usr/bin/env node
// validate_hu.mjs — Valida una historia de usuario de Specter y reporta score/estado/reglas.
// Uso: node validate_hu.mjs <archivo.md> [--json]   o   echo '{...}' | node validate_hu.mjs
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseFrontmatter, validate } from "./engine.mjs";

function readObject(args) {
  const file = args.find(a => !a.startsWith("--"));
  if (file) {
    const obj = parseFrontmatter(file);
    obj._file = file;
    return obj;
  }
  if (!process.stdin.isTTY) {
    return JSON.parse(fs.readFileSync(0, "utf8"));
  }
  console.error("Uso: node validate_hu.mjs <archivo.md> [--json]");
  process.exit(2);
}

function main() {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const obj = readObject(args);
  const report = validate("user_story", obj);
  if (json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`${report.state} ${report.id} score=${report.score}`);
    for (const r of report.rules) {
      if (!r.passed) console.log(`  ✗ [${r.dimension}] ${r.evidence}`);
    }
    for (const b of report.blocks) console.log(`  ⛔ BLOCK: ${b.message}`);
    for (const e of report.structuralErrors) console.log(`  ⚠ ${e.message}`);
  }
  return report.state === "READY" ? 0 : 1;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) process.exitCode = main();
export { readObject, main };
