#!/usr/bin/env node
// traceability.mjs — Motor de trazabilidad de Specter 2.1. Verifica la cadena
// RFP → RF/RNF/RT → EPIC → HU → TT → TC → Evidence. No omite archivos corruptos: cada archivo
// inválido produce un hallazgo identificable.
//
// Uso: node traceability.mjs --root <dir> [--req-ids ...] [--tc-ids ...] [--json]
// Códigos de salida: 0 éxito · 1 errores de calidad · 2 error de configuración/ejecución ·
//                     3 entrada inválida o estructura imposible de procesar.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseFrontmatter } from "./engine.mjs";

function loadArtifacts(root) {
  const dir = path.join(root, "resources", "functional", "hu");
  if (!fs.existsSync(dir)) return { hus: [], tts: [], unparseable: [] };
  const hus = [];
  const tts = [];
  const unparseable = [];
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    if (!name.endsWith(".md")) continue;
    try {
      const obj = parseFrontmatter(file);
      if (obj.type === "Tarea Técnica" || name.startsWith("tt-")) tts.push({ ...obj, _file: file });
      else if (obj.type === "Historia de Usuario" || name.startsWith("hu-")) hus.push({ ...obj, _file: file });
      else unparseable.push({ file, reason: "tipo de artefacto no reconocido" });
    } catch (e) {
      unparseable.push({ file, reason: e.message });
    }
  }
  return { hus, tts, unparseable };
}

function detectCycles(hus, tts) {
  const ids = new Map();
  for (const h of hus) ids.set(h.id, h);
  for (const t of tts) ids.set(t.id, t);
  const findings = [];
  const visiting = new Set();
  const visited = new Set();
  function visit(id, trail) {
    if (!ids.has(id)) return;
    if (visiting.has(id)) {
      const cycleStart = trail.indexOf(id);
      findings.push({ severity: "critical", kind: "dependencia circular", id, ref: trail.slice(cycleStart).concat(id).join(" → ") });
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dep of ids.get(id).dependencies || []) visit(dep, trail.concat(id));
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of ids.keys()) visit(id, []);
  return findings;
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

  if (!fs.existsSync(path.join(root, "resources", "functional", "hu"))) {
    console.error("No existe resources/functional/hu/ (nada que validar).");
    return 2;
  }

  const { hus, tts, unparseable } = loadArtifacts(root);
  const huIds = new Set(hus.map(h => h.id));
  const ttIds = new Set(tts.map(t => t.id));
  const allIds = [...hus.map(h => h.id), ...tts.map(t => t.id)];
  const findings = [];

  for (const u of unparseable) {
    findings.push({ severity: "critical", kind: "archivo corrupto o no parseable", file: path.relative(root, u.file), reason: u.reason });
  }

  const seen = new Set();
  for (const id of allIds) {
    if (seen.has(id)) findings.push({ severity: "critical", kind: "id duplicado", id });
    seen.add(id);
  }

  for (const h of hus) {
    if (!h.epic && !h.epic_id && !(Array.isArray(h.requirement_ids) && h.requirement_ids.length)) {
      findings.push({ severity: "high", kind: "HU sin origen", id: h.id, file: path.relative(root, h._file) });
    }
    for (const dep of h.dependencies || []) {
      if (!huIds.has(dep) && !ttIds.has(dep)) {
        findings.push({ severity: "high", kind: "referencia rota en dependencies", id: h.id, ref: dep });
      }
    }
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
    } else if (!t.parent_exception_reason) {
      findings.push({ severity: "critical", kind: "TT sin HU padre sin parent_exception_reason", id: t.id });
    }
    for (const dep of t.dependencies || []) {
      if (!huIds.has(dep) && !ttIds.has(dep)) {
        findings.push({ severity: "high", kind: "referencia rota en dependencies", id: t.id, ref: dep });
      }
    }
    if (!Array.isArray(t.evidence_requirements) || !t.evidence_requirements.length) {
      findings.push({ severity: "high", kind: "evidencias faltantes", id: t.id });
    }
  }

  const ttParents = new Set(tts.map(t => t.parent_hu_id).filter(Boolean));
  for (const h of hus) {
    if (!ttParents.has(h.id)) {
      findings.push({ severity: "info", kind: "HU sin TT (puede no requerir implementación)", id: h.id });
    }
  }
  for (const req of reqIds) {
    if (!hus.some(h => (h.requirement_ids || []).includes(req))) {
      findings.push({ severity: "high", kind: "requisito sin HU", id: req });
    }
  }
  const allTestRefs = new Set([...hus.flatMap(h => h.test_references || []), ...tts.flatMap(t => t.test_references || [])]);
  for (const tc of tcIds) {
    if (!allTestRefs.has(tc)) findings.push({ severity: "high", kind: "caso de prueba sin HU/TT asociada", id: tc });
  }

  findings.push(...detectCycles(hus, tts));

  const critical = findings.filter(f => f.severity === "critical");
  const high = findings.filter(f => f.severity === "high");
  const info = findings.filter(f => f.severity === "info");
  const summary = { hu: hus.length, tt: tts.length, unparseable: unparseable.length, critical: critical.length, high: high.length, info: info.length };

  if (json) {
    console.log(JSON.stringify({ summary, findings }, null, 2));
  } else {
    console.log(`Trazabilidad: ${hus.length} HU, ${tts.length} TT, ${unparseable.length} corruptos. ${critical.length} críticos, ${high.length} altos, ${info.length} informativos.`);
    for (const f of [...critical, ...high, ...info]) {
      console.log(`  [${f.severity}] ${f.kind}: ${f.id}${f.ref ? ` → ${f.ref}` : ""}${f.file ? ` (${f.file})` : ""}${f.reason ? ` — ${f.reason}` : ""}`);
    }
  }

  if (unparseable.length) return 3;
  if (critical.length || high.length) return 1;
  return 0;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) process.exitCode = main();
export { loadArtifacts, detectCycles, main };
