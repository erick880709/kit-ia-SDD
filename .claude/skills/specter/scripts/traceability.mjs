#!/usr/bin/env node
// traceability.mjs — Motor de trazabilidad de Specter: verifica la cadena
// requisitos → HU → TT → criterios de aceptación y detecta huecos y referencias rotas.
//
// Uso:
//   node traceability.mjs --root <dir> [--req-ids RF-001,RF-002] [--json]
//
// Detecta: requisito sin HU (si se proveen --req-ids), HU sin origen, HU sin TT, TT sin HU
// padre existente, dependencias/referencias rotas. Exit 1 si hay huecos críticos.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseFrontmatter } from "./engine.mjs";

function loadArtifacts(root) {
  const dir = path.join(root, "resources", "functional", "hu");
  if (!fs.existsSync(dir)) return { hus: [], tts: [] };
  const hus = [];
  const tts = [];
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    if (!name.endsWith(".md")) continue;
    try {
      const obj = parseFrontmatter(file);
      if (obj.type === "Tarea Técnica" || name.startsWith("tt-")) tts.push({ ...obj, _file: file });
      else if (obj.type === "Historia de Usuario" || name.startsWith("hu-")) hus.push({ ...obj, _file: file });
    } catch {
      /* archivo sin frontmatter: se omite */
    }
  }
  return { hus, tts };
}

function main() {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const rootIdx = args.indexOf("--root");
  const root = rootIdx !== -1 ? path.resolve(args[rootIdx + 1]) : process.cwd();
  const reqIdx = args.indexOf("--req-ids");
  const reqIds = reqIdx !== -1 ? args[reqIdx + 1].split(",").map(s => s.trim()).filter(Boolean) : [];
  const tcIdx = args.indexOf("--tc-ids");
  const tcIds = tcIdx !== -1 ? args[tcIdx + 1].split(",").map(s => s.trim()).filter(Boolean) : [];

  const { hus, tts } = loadArtifacts(root);
  const huIds = new Set(hus.map(h => h.id));
  const ttIds = new Set(tts.map(t => t.id));
  const findings = [];

  for (const h of hus) {
    if (!h.epic && !h.epic_id && !(Array.isArray(h.requirement_ids) && h.requirement_ids.length)) {
      findings.push({ severity: "high", kind: "HU sin origen", id: h.id, file: path.relative(root, h._file) });
    }
    for (const dep of h.dependencies || []) {
      if (!huIds.has(dep) && !ttIds.has(dep)) {
        findings.push({ severity: "high", kind: "referencia rota en dependencies", id: h.id, ref: dep });
      }
    }
    // Referencias a casos de prueba que no existen en la lista provista.
    for (const tc of h.test_references || []) {
      if (tcIds.length && !tcIds.includes(tc)) {
        findings.push({ severity: "high", kind: "caso de prueba inexistente", id: h.id, ref: tc });
      }
    }
  }

  for (const t of tts) {
    if (t.parent_hu_id) {
      if (!huIds.has(t.parent_hu_id)) {
        findings.push({ severity: "critical", kind: "TT con HU padre inexistente", id: t.id, ref: t.parent_hu_id, file: path.relative(root, t._file) });
      }
    } else if (!t.epic && !t.epic_id) {
      findings.push({ severity: "critical", kind: "TT sin anclaje (sin parent_hu_id, epic ni epic_id)", id: t.id, file: path.relative(root, t._file) });
    }
    for (const dep of t.dependencies || []) {
      if (!huIds.has(dep) && !ttIds.has(dep)) {
        findings.push({ severity: "high", kind: "referencia rota en dependencies", id: t.id, ref: dep });
      }
    }
  }

  // HU sin TT (requiere implementación → heurística: sin TT hijo y con parent_hu_id referenciándola)
  const ttParents = new Set(tts.map(t => t.parent_hu_id).filter(Boolean));
  for (const h of hus) {
    if (!ttParents.has(h.id)) {
      findings.push({ severity: "info", kind: "HU sin TT (puede no requerir implementación)", id: h.id });
    }
  }

  // Requisitos sin HU
  for (const req of reqIds) {
    const covered = hus.some(h => (h.requirement_ids || []).includes(req));
    if (!covered) findings.push({ severity: "high", kind: "requisito sin HU", id: req });
  }

  const critical = findings.filter(f => f.severity === "critical");
  const high = findings.filter(f => f.severity === "high");
  const info = findings.filter(f => f.severity === "info");

  if (json) {
    console.log(JSON.stringify({ summary: { hu: hus.length, tt: tts.length, critical: critical.length, high: high.length, info: info.length }, findings }, null, 2));
  } else {
    console.log(`Trazabilidad: ${hus.length} HU, ${tts.length} TT. ${critical.length} críticos, ${high.length} altos, ${info.length} informativos.`);
    for (const f of [...critical, ...high, ...info]) {
      console.log(`  [${f.severity}] ${f.kind}: ${f.id}${f.ref ? ` → ${f.ref}` : ""}${f.file ? ` (${f.file})` : ""}`);
    }
  }
  return critical.length ? 1 : 0;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) process.exitCode = main();
export { loadArtifacts, main };
