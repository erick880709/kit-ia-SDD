// duplicates.mjs — Detección determinista de duplicados entre historias (exactos y normalizados).
// La detección semántica con LLM es opcional y queda fuera de este módulo determinista.
//
// Uso: node duplicates.mjs --root <dir> [--json]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseFrontmatter } from "./engine.mjs";

function normalizeTitle(v) {
  return String(v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function findDuplicates(hus) {
  const findings = [];
  for (let i = 0; i < hus.length; i++) {
    for (let j = i + 1; j < hus.length; j++) {
      const a = hus[i];
      const b = hus[j];
      if (a.id && a.id === b.id) {
        findings.push({ a: a.id, b: b.id, type: "exacto", reason: "mismo id", confidence: 1, recommendation: "Unificar o renumerar uno de los dos." });
        continue;
      }
      const ta = normalizeTitle(a.title);
      const tb = normalizeTitle(b.title);
      if (ta && tb && ta === tb) {
        findings.push({ a: a.id, b: b.id, type: "normalizado", reason: `títulos equivalentes ("${a.title}" ≈ "${b.title}")`, confidence: 0.8, recommendation: "Revisar si son la misma historia; si son distintas, diferenciar el título." });
      }
    }
  }
  return findings;
}

function main() {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const rootIdx = args.indexOf("--root");
  const root = rootIdx !== -1 ? path.resolve(args[rootIdx + 1]) : process.cwd();
  const dir = path.join(root, "resources", "functional", "hu");
  if (!fs.existsSync(dir)) {
    console.error("No existe resources/functional/hu/.");
    return 2;
  }
  const hus = [];
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    if (!name.startsWith("hu-") || !name.endsWith(".md")) continue;
    try {
      const obj = parseFrontmatter(file);
      if (obj.id) hus.push(obj);
    } catch {
      /* archivos corruptos los reporta traceability.mjs */
    }
  }
  const findings = findDuplicates(hus);
  if (json) {
    console.log(JSON.stringify({ duplicates: findings }, null, 2));
  } else {
    console.log(`Duplicados: ${findings.length}.`);
    for (const f of findings) {
      console.log(`  [${f.type}] ${f.a} ≈ ${f.b} — ${f.reason} (confianza ${f.confidence})`);
    }
  }
  return 0;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) process.exitCode = main();
export { findDuplicates, normalizeTitle, main };
