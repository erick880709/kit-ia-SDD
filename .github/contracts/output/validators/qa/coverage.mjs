// Lee el reporte de cobertura nativo del runner (LCOV, Istanbul json-summary, Cobertura XML o
// JaCoCo XML) y devuelve los contadores por métrica. Los porcentajes salen del archivo, no del agente.
import fs from "node:fs";
import path from "node:path";
import { require, resolveReal, within, isFile, integer, parseJSON } from "../../rules.mjs";

export const METRICS = ["lines", "branches", "functions", "statements"];
const LCOV = { LF: ["lines", "total"], LH: ["lines", "covered"], BRF: ["branches", "total"], BRH: ["branches", "covered"], FNF: ["functions", "total"], FNH: ["functions", "covered"] };
const JACOCO = { LINE: "lines", BRANCH: "branches", METHOD: "functions" };

function count(value) {
  if (typeof value === "string" && /^[0-9]+$/.test(value)) value = Number(value);
  require(Number.isSafeInteger(value) && value >= 0, `Conteo de cobertura inválido: ${JSON.stringify(value)}`);
  return value;
}
function checked(totals) {
  require(Object.keys(totals).length, "El reporte no contiene métricas de cobertura");
  for (const [metric, counts] of Object.entries(totals)) {
    require(Object.keys(counts).sort().join() === "covered,total", `Contadores incompletos para ${metric}`);
    require(count(counts.covered) <= count(counts.total), `Cobertura de ${metric} mayor al denominador`);
  }
  return totals;
}
function add(totals, record) {
  for (const [metric, counts] of Object.entries(record)) {
    const target = (totals[metric] ??= { covered: 0, total: 0 });
    target.covered += counts.covered;
    target.total += counts.total;
  }
}
// Los filtros admiten * y ?; * también cruza "/".
function matcher(patterns) {
  const regexes = patterns.map((p) => new RegExp(`^${p.replace(/[.+^${}()|[\]\\]/g, "\\$&").replaceAll("*", ".*").replaceAll("?", ".")}$`));
  return (name) => regexes.some((r) => r.test(name));
}
function selected(name, include, exclude) {
  name = name.replaceAll("\\", "/");
  return (!include.length || matcher(include)(name)) && !matcher(exclude)(name);
}

function parseLcov(text, include, exclude) {
  const totals = {}, names = new Set();
  let current = null, files = 0, record = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith("SF:")) {
      require(current === null, "Registro LCOV sin end_of_record");
      const name = line.slice(3).replaceAll("\\", "/");
      require(name && !names.has(name), "Archivo LCOV vacío o duplicado");
      names.add(name);
      current = selected(name, include, exclude);
      files += current ? 1 : 0;
      record = {};
    } else if (line === "end_of_record") {
      if (current) add(totals, checked(record));
      current = null;
    } else if (current && line.includes(":")) {
      const [key, value] = [line.slice(0, line.indexOf(":")), line.slice(line.indexOf(":") + 1)];
      if (!Object.hasOwn(LCOV, key)) continue;
      const [metric, field] = LCOV[key];
      const counts = (record[metric] ??= {});
      require(!Object.hasOwn(counts, field), `Contador LCOV duplicado: ${key}`);
      counts[field] = count(value);
    }
  }
  require(current === null, "Registro LCOV sin end_of_record");
  require(files, "El reporte LCOV no contiene archivos dentro del alcance");
  return checked(totals);
}

function parseIstanbul(data, include, exclude) {
  require(data && typeof data === "object" && !Array.isArray(data), "El resumen Istanbul debe ser un objeto");
  let entries;
  if (include.length || exclude.length) {
    entries = Object.entries(data).filter(([k]) => k !== "total" && selected(k, include, exclude)).map(([, v]) => v);
    require(entries.length, "El resumen Istanbul no contiene archivos dentro del alcance");
  } else {
    require(Object.hasOwn(data, "total"), "El resumen Istanbul no tiene la entrada total");
    entries = [data.total];
  }
  const totals = {};
  for (const entry of entries) {
    require(entry && typeof entry === "object", "Entrada Istanbul inválida");
    const record = {};
    for (const metric of METRICS)
      if (Object.hasOwn(entry, metric)) {
        const counts = entry[metric];
        require(counts && typeof counts === "object", `Métrica Istanbul inválida: ${metric}`);
        // La lectura estricta conserva el token: 1.0 no es un conteo entero.
        for (const field of ["covered", "total"]) integer(counts[field], `${metric}.${field}`, counts, field);
        record[metric] = { covered: counts.covered, total: counts.total };
      }
    add(totals, checked(record));
  }
  return checked(totals);
}

// Lector XML mínimo: solo etiquetas y atributos, suficiente para los resúmenes de cobertura.
function elements(text) {
  const out = [];
  const tag = /<(\/?)([A-Za-z_][\w:.-]*)((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>/g;
  const stack = [];
  for (const m of text.replace(/<!--[\s\S]*?-->/g, "").replace(/<\?[\s\S]*?\?>/g, "").replace(/<!DOCTYPE[^>]*>/gi, "").matchAll(tag)) {
    if (m[1]) {
      require(stack.pop() === m[2], "Reporte XML de cobertura con etiquetas desbalanceadas");
      continue;
    }
    const attrs = Object.fromEntries([...m[3].matchAll(/([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map((a) => [a[1], a[2] ?? a[3]]));
    require(stack.length || !out.length, "Reporte XML de cobertura con más de una raíz");
    out.push({ name: m[2], attrs, depth: stack.length });
    if (!m[4]) stack.push(m[2]);
  }
  require(!stack.length, "Reporte XML de cobertura truncado");
  return out;
}
function parseXml(text) {
  const nodes = elements(text);
  const root = nodes[0];
  require(root, "Reporte XML vacío");
  if (root.name === "coverage") {
    // Escenario: coverage.py sin --branch escribe branches-valid="0".
    // El denominador cero queda como métrica desconocida, no como éxito.
    const totals = {};
    for (const metric of ["lines", "branches"])
      if (Object.hasOwn(root.attrs, `${metric}-valid`))
        totals[metric] = { covered: count(root.attrs[`${metric}-covered`]), total: count(root.attrs[`${metric}-valid`]) };
    require(Object.keys(totals).length, "El reporte Cobertura no declara lines-valid ni branches-valid");
    return checked(totals);
  }
  if (root.name === "report") {
    // Solo los contadores directos de <report> resumen todo el reporte.
    const totals = {};
    for (const node of nodes.filter((n) => n.name === "counter" && n.depth === 1)) {
      const metric = JACOCO[node.attrs.type];
      if (!metric) continue;
      require(!Object.hasOwn(totals, metric), `Contador JaCoCo duplicado: ${metric}`);
      const covered = count(node.attrs.covered);
      totals[metric] = { covered, total: covered + count(node.attrs.missed) };
    }
    require(Object.keys(totals).length, "El reporte JaCoCo no tiene contadores de nivel report");
    return checked(totals);
  }
  require(false, `Formato XML de cobertura no reconocido: <${root.name}>`);
}

/**
 * Lee un reporte de cobertura del proyecto.
 * @param {string} file - Ruta relativa al proyecto.
 * @param {string} projectRoot - Raíz del proyecto.
 * @param {{include?: string[], exclude?: string[]}} [scope] - Filtros de archivos (solo LCOV e Istanbul).
 * @returns {Record<string, {covered: number, total: number}>} Contadores por métrica soportada.
 */
export function readCoverage(file, projectRoot, { include = [], exclude = [] } = {}) {
  projectRoot = resolveReal(projectRoot);
  const real = resolveReal(path.resolve(projectRoot, file));
  require(within(real, projectRoot) && isFile(real), `Reporte de cobertura inexistente o fuera del proyecto: ${file}`);
  const text = fs.readFileSync(real, "utf8").replace(/^﻿/, "");
  const start = text.trimStart();
  if (start.startsWith("{")) return parseIstanbul(parseJSON(text), include, exclude);
  if (start.startsWith("<")) {
    require(!include.length && !exclude.length, "include/exclude solo aplican a LCOV e Istanbul; ajusta el alcance en el runner");
    return parseXml(text);
  }
  return parseLcov(text, include, exclude);
}
