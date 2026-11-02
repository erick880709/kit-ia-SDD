#!/usr/bin/env node
// Hook Stop compartido por Claude Code y GitHub Copilot CLI (ambos leen .claude/settings.json).
// Valida los resultados contractuales nuevos o modificados y, si alguno es inválido, bloquea el
// cierre (hasta 3 veces por sesión) con los errores para que el agente los corrija. Nunca rompe la sesión:
// ante un error propio termina sin bloquear, porque el host sigue siendo quien acepta la entrega.
import fs from "node:fs";
import path from "node:path";
import { validateResult, checkRunFileName } from "../validate.mjs";
import { readJSON, isMain } from "../rules.mjs";
import { validateResultsRoot } from "../results-root.mjs";

// Escenario: el hook corre en cada turno, también en sesiones sin skills QA.
// Solo mira las carpetas de resultados declaradas por los contratos de las skills instaladas.
const STATE_FILE = ".validacion-hook";
const MAX_BLOCKS = 3;

function resultsRoots(projectRoot) {
  const skills = path.join(projectRoot, ".claude/skills");
  if (!fs.existsSync(skills)) return [];
  const roots = new Set();
  for (const name of fs.readdirSync(skills)) {
    const file = path.join(skills, name, "contracts/output-contract.json");
    if (!fs.existsSync(file)) continue;
    try {
      roots.add(validateResultsRoot(readJSON(file)));
    } catch {
      // Un contrato ilegible lo detectan los tests del kit; aquí no se bloquea por eso.
    }
  }
  return [...roots];
}

function candidates(projectRoot, resultsRoot) {
  const base = path.join(projectRoot, resultsRoot);
  if (!fs.existsSync(base)) return [];
  const files = [];
  for (const run of fs.readdirSync(base, { withFileTypes: true }))
    if (run.isDirectory())
      for (const name of fs.readdirSync(path.join(base, run.name)))
        if (name.endsWith(".json")) files.push(path.join(base, run.name, name));
  return files;
}

function readState(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return {};
  }
}

function fingerprint(file) {
  const stat = fs.statSync(file);
  return `${stat.size}:${Math.trunc(stat.mtimeMs)}`;
}

/**
 * Valida los resultados pendientes y devuelve la decisión del hook.
 * @param {{cwd?: string, session_id?: string}} input - Entrada del evento Stop (Claude Code o Copilot CLI).
 * @returns {Promise<{decision: "block", reason: string} | null>} Bloqueo o null para dejar terminar.
 */
export async function evaluateStop(input) {
  const projectRoot = path.resolve(input.cwd || process.cwd());
  const roots = resultsRoots(projectRoot);
  if (!roots.length) return null;
  const stateFile = path.join(projectRoot, ".claude", STATE_FILE);
  const state = { valid: {}, blocks: {}, ...readState(stateFile) };
  const failures = [];
  for (const resultsRoot of roots)
    for (const file of candidates(projectRoot, resultsRoot)) {
      const relative = path.relative(projectRoot, file).split(path.sep).join("/");
      const mark = fingerprint(file);
      if (state.valid[relative] === mark) continue;
      try {
        const value = readJSON(file);
        checkRunFileName(file, value);
        await validateResult(value, { projectRoot });
        state.valid[relative] = mark;
      } catch (error) {
        failures.push(`- ${relative}: ${error.message}`);
      }
    }
  // Escenario: las reglas de dominio informan un error a la vez, así que corregir puede
  // requerir varias vueltas. Se bloquea hasta MAX_BLOCKS veces por sesión y luego se deja
  // terminar para evitar un bucle; el host rechazará la entrega si sigue inválida.
  const session = String(input.session_id || "sin-sesion");
  const used = state.blocks[session] || 0;
  let decision = null;
  if (!failures.length) delete state.blocks[session];
  else if (used < MAX_BLOCKS) {
    state.blocks[session] = used + 1;
    decision = {
      decision: "block",
      reason:
        `El resultado contractual no es válido (aviso ${used + 1} de ${MAX_BLOCKS}). ` +
        "Corrige el JSON o lo que falte en el proyecto y vuelve a terminar:\n" +
        failures.join("\n"),
    };
  }
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
  return decision;
}

async function main() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  let input = {};
  try {
    input = raw.trim() ? JSON.parse(raw) : {};
  } catch {
    input = {};
  }
  try {
    const decision = await evaluateStop(input);
    if (decision) process.stdout.write(JSON.stringify(decision));
  } catch (error) {
    process.stderr.write(`Hook de contratos: ${error.message}\n`);
  }
}

if (isMain(import.meta.url)) await main();
