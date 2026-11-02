#!/usr/bin/env node
// validate-github-agents-sync.mjs — Verifica que el espejo delgado de Custom Agents
// de GitHub Copilot (.github/agents/) no se desincronice de la fuente canónica
// (.claude/agents/).
//
// Regla de sincronía (según .claude/doc/carpetas-por-proveedor.md):
//   - Todo agente de .claude/agents/ que declara `github` en `providers:` debe existir
//     en .github/agents/ con el mismo nombre y contenido idéntico.
//   - .github/agents/ no debe contener agentes que no existan en .claude/agents/ o cuyo
//     `providers:` no incluya `github`.
//
// Uso: node test/validate-github-agents-sync.mjs [raíz-del-repo]
// Salida: exit 0 si la sincronía es correcta; exit 1 con la lista de diferencias si no.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

function hash(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function providersOf(text) {
  const match = /^providers:\s*\[([^\]]*)\]/m.exec(text);
  if (!match) return [];
  return match[1]
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s.replace(/^['"]|['"]$/g, ""));
}

function listAgents(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith(".agent.md")).sort();
}

export function validateSync(root = path.resolve(scriptDir, "..")) {
  const claudeAgents = path.join(root, ".claude", "agents");
  const githubAgents = path.join(root, ".github", "agents");
  const claudeFiles = listAgents(claudeAgents);
  const githubFiles = listAgents(githubAgents);
  const errors = [];

  const claudeWithGithub = new Set(claudeFiles.filter(f => {
    try {
      return providersOf(fs.readFileSync(path.join(claudeAgents, f), "utf8")).includes("github");
    } catch {
      return false;
    }
  }));

  // 1) Todo agente .claude que declare github debe estar en .github con contenido idéntico.
  for (const file of claudeWithGithub) {
    const src = path.join(claudeAgents, file);
    const dst = path.join(githubAgents, file);
    if (!fs.existsSync(dst)) {
      errors.push(`falta en .github/agents/: ${file}`);
      continue;
    }
    if (hash(src) !== hash(dst)) {
      errors.push(`contenido distinto: .github/agents/${file}`);
    }
  }

  // 2) .github no debe tener agentes de más, ni agentes cuyo .claude no declare github.
  for (const file of githubFiles) {
    const src = path.join(claudeAgents, file);
    if (!fs.existsSync(src)) {
      errors.push(`sobra en .github/agents/: ${file} (no existe en .claude/agents/)`);
      continue;
    }
    const providers = providersOf(fs.readFileSync(src, "utf8"));
    if (!providers.includes("github")) {
      errors.push(`sobra en .github/agents/: ${file} (providers sin github: [${providers.join(", ")}])`);
    }
  }

  return { errors, count: claudeWithGithub.size };
}

export function main(args = process.argv.slice(2)) {
  const extra = args.filter(arg => !arg.startsWith("-"));
  if (extra.length > 1) {
    console.error("Uso: node test/validate-github-agents-sync.mjs [raíz-del-repo]");
    return 1;
  }
  const root = extra[0] ? path.resolve(extra[0]) : path.resolve(scriptDir, "..");
  const { errors, count } = validateSync(root);
  if (errors.length) {
    for (const e of errors) console.error(`- ${e}`);
    console.error(`${errors.length} desincronización(es) entre .claude/agents/ y .github/agents/`);
    return 1;
  }
  console.log(`Custom agents de Copilot sincronizados: ${count} agentes idénticos.`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
