#!/usr/bin/env node
// Genera el reporte de ejecución con las reglas QA del paquete de contratos.
// Uso: --ctrf <ctrf.json> --out <reporte.md> [--project-root <proyecto>] [--expected <casos.json>]
//      [--evidence-policy <politica.json>] [--exit-criteria <criterios.json>]
// Alternativa: --result <resultado-contractual.json> en lugar de --ctrf.
import { fileURLToPath, pathToFileURL } from "node:url";
import fs from "node:fs";
import path from "node:path";
const argv = process.argv.slice(2);
const index = argv.indexOf("--project-root");
const root = index >= 0 ? argv[index + 1] : process.cwd();
const installed = fileURLToPath(
  new URL("./render-report.mjs", import.meta.url),
);
const renderer = fs.existsSync(installed)
  ? installed
  : path.resolve(
      root || process.cwd(),
      ".claude/contracts/output/render-report.mjs",
    );
if (!fs.existsSync(renderer)) {
  console.error(
    "Falta .claude/contracts/output/render-report.mjs; distribuye el paquete de contratos junto con el helper.",
  );
  process.exit(1);
}
const { main } = await import(pathToFileURL(renderer).href);
process.exitCode = await main(argv);
