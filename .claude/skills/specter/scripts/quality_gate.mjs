#!/usr/bin/env node
// quality_gate.mjs — Quality Gate agregado de Specter: valida todas las HU y TT del proyecto.
//
// Uso:
//   node quality_gate.mjs --root <dir> [--json] [--fail-on-not-ready]
//   node quality_gate.mjs --hu <a.md> --tt <b.md> [--json]
//
// Por defecto escanea <root>/resources/functional/hu/hu-*.md y tt-*.md. Exit 0 si todos los
// artefactos están READY; exit 1 si alguno no lo está o hay errores estructurales/bloqueantes.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseFrontmatter, validate, summarizeDimensions } from "./engine.mjs";

function collectFiles(args, root) {
  const hus = [];
  const tts = [];
  const huFlag = args.findIndex(a => a === "--hu");
  const ttFlag = args.findIndex(a => a === "--tt");
  if (huFlag !== -1) for (const f of args.slice(huFlag + 1)) { if (f === "--tt") break; hus.push(f); }
  if (ttFlag !== -1) for (const f of args.slice(ttFlag + 1)) { if (f === "--hu") break; tts.push(f); }
  if (hus.length || tts.length) return { hus, tts };

  const dir = path.join(root, "resources", "functional", "hu");
  if (fs.existsSync(dir)) {
    for (const name of fs.readdirSync(dir)) {
      if (name.startsWith("hu-") && name.endsWith(".md")) hus.push(path.join(dir, name));
      else if (name.startsWith("tt-") && name.endsWith(".md")) tts.push(path.join(dir, name));
    }
  }
  return { hus: hus.sort(), tts: tts.sort() };
}

function reportFor(kind, file) {
  const obj = parseFrontmatter(file);
  const report = validate(kind, obj);
  report.file = path.relative(process.cwd(), file).split(path.sep).join("/");
  return report;
}

function main() {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const rootIdx = args.indexOf("--root");
  const root = rootIdx !== -1 ? path.resolve(args[rootIdx + 1]) : process.cwd();

  const { hus, tts } = collectFiles(args, root);
  const reports = [
    ...hus.map(f => reportFor("user_story", f)),
    ...tts.map(f => reportFor("technical_task", f)),
  ];
  if (!reports.length) {
    console.error("No se encontraron artefactos HU/TT (hu-*.md / tt-*.md) en resources/functional/hu/.");
    return 2;
  }

  const ready = reports.every(r => r.state === "READY");
  if (json) {
    console.log(JSON.stringify({ ready, artifacts: reports }, null, 2));
  } else {
    for (const r of reports) {
      console.log(`${r.state.padEnd(17)} ${r.file}  score=${r.score}`);
      for (const b of r.blocks) console.log(`    ⛔ ${b.message}`);
      for (const e of r.structuralErrors) console.log(`    ⚠ ${e.message}`);
      for (const rule of r.rules) {
        if (!rule.passed) console.log(`    ✗ [${rule.dimension}] ${rule.evidence}`);
      }
      const dims = summarizeDimensions(r.rules);
      const dimLine = Object.entries(dims).map(([d, v]) => `${d} ${v.passed}/${v.total}`).join(" · ");
      console.log(`    ${dimLine}`);
    }
    console.log(`\n${reports.length} artefacto(s): ${ready ? "todos READY" : "hay NO-READY"}`);
  }
  return ready ? 0 : 1;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) process.exitCode = main();
export { collectFiles, reportFor, main };
