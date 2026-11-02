import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";

export class ContractError extends Error {}
export function require(condition, message) {
  if (!condition) throw new ContractError(message);
}
export const equal = isDeepStrictEqual;
// Clase Unicode de espacios del contrato, independiente de trim y del motor regex.
export const unicodeNonspace =
  "[^\\u0009-\\u000d\\u001c-\\u0020\\u0085\\u00a0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]";
const numberTokens = new WeakMap();
export function isInteger(value, container, key) {
  return (
    Number.isInteger(value) &&
    !/[.eE]/.test(numberTokens.get(container)?.get(String(key)) ?? "")
  );
}
export function copyNumberToken(source, key, target) {
  const token = numberTokens.get(source)?.get(String(key));
  if (token !== undefined) {
    if (!numberTokens.has(target)) numberTokens.set(target, new Map());
    numberTokens.get(target).set(String(key), token);
  }
}
export const isObject = (v) =>
  v !== null && typeof v === "object" && !Array.isArray(v);
export const formatList = (values) =>
  `[${[...values].map((v) => repr(v)).join(", ")}]`;
export function repr(v) {
  if (v === null) return "None";
  if (v === true) return "True";
  if (v === false) return "False";
  if (typeof v === "string") {
    const quote = v.includes("'") && !v.includes('"') ? '"' : "'";
    const escaped = v
      .replaceAll("\\", "\\\\")
      .replaceAll(quote, `\\${quote}`)
      .replaceAll("\n", "\\n")
      .replaceAll("\r", "\\r")
      .replaceAll("\t", "\\t")
      .replace(
        /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/g,
        (c) => `\\x${c.charCodeAt(0).toString(16).padStart(2, "0")}`,
      );
    return quote + escaped + quote;
  }
  if (Array.isArray(v)) return formatList(v);
  if (isObject(v))
    return `{${Object.entries(v)
      .map(([k, val]) => `${repr(k)}: ${repr(val)}`)
      .join(", ")}}`;
  return String(v);
}
export function parseJSON(text) {
  text = text.replace(/^\uFEFF/, "");
  let i = 0;
  let numericToken = "";
  const remember = (container, key, item) => {
    if (typeof item !== "number") return;
    if (!numberTokens.has(container)) numberTokens.set(container, new Map());
    numberTokens.get(container).set(String(key), numericToken);
  };
  const ws = () => {
    while (/[\x20\t\n\r]/.test(text[i] ?? "") && i < text.length) i++;
  };
  const string = () => {
    const start = i++;
    while (i < text.length) {
      if (text[i] === "\\") {
        i += 2;
        continue;
      }
      if (text[i++] === '"') return JSON.parse(text.slice(start, i));
    }
    throw new ContractError("JSON inválido: cadena sin cerrar");
  };
  const value = () => {
    ws();
    if (text[i] === '"') return string();
    if (text[i] === "{") {
      i++;
      ws();
      const result = {};
      const seen = new Set();
      if (text[i] === "}") {
        i++;
        return result;
      }
      while (i < text.length) {
        require(text[i] === '"', "JSON inválido: se esperaba una clave");
        const key = string();
        ws();
        require(text[i++] === ":", "JSON inválido: se esperaba :");
        const item = value();
        require(!seen.has(key), `Clave JSON duplicada: ${key}`);
        seen.add(key);
        Object.defineProperty(result, key, {
          value: item,
          enumerable: true,
          writable: true,
          configurable: true,
        });
        remember(result, key, item);
        ws();
        if (text[i] === "}") {
          i++;
          return result;
        }
        require(text[i++] === ",", "JSON inválido: se esperaba ,");
        ws();
      }
    } else if (text[i] === "[") {
      i++;
      ws();
      const result = [];
      if (text[i] === "]") {
        i++;
        return result;
      }
      while (i < text.length) {
        const item = value();
        remember(result, result.length, item);
        result.push(item);
        ws();
        if (text[i] === "]") {
          i++;
          return result;
        }
        require(text[i++] === ",", "JSON inválido: se esperaba ,");
      }
    } else {
      const token = text
        .slice(i)
        .match(
          /^(?:-Infinity|Infinity|NaN|true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/,
        )?.[0];
      require(token !== undefined, "JSON inválido");
      i += token.length;
      require(!["NaN", "Infinity", "-Infinity"].includes(
        token,
      ), `Constante JSON no admitida: ${token}`);
      const item = JSON.parse(token);
      require(!Number.isInteger(item) || Number.isSafeInteger(item), `Número JSON fuera del rango entero seguro de Node: ${token}`);
      if (typeof item === "number") numericToken = token;
      return item;
    }
    throw new ContractError("JSON inválido: estructura sin cerrar");
  };
  const result = value();
  ws();
  require(i === text.length, "JSON inválido: contenido adicional");
  return result;
}
export const readJSON = (file) => parseJSON(fs.readFileSync(file, "utf8"));
export function objectFields(value, required, optional = [], label = "objeto") {
  require(isObject(value), `${label}: se esperaba un objeto`);
  const keys = Object.keys(value);
  const missing = required.filter((k) => !Object.hasOwn(value, k)).sort();
  require(!missing.length, `${label}: faltan campos ${formatList(missing)}`);
  const extra = keys
    .filter((k) => !required.includes(k) && !optional.includes(k))
    .sort();
  require(!extra.length, `${label}: campos no admitidos ${formatList(extra)}`);
}
export function nonempty(value, label) {
  require(typeof value === "string" &&
    new RegExp(unicodeNonspace, "u").test(
      value,
    ), `${label}: texto vacío o inválido`);
}
export function integer(value, label, container, key) {
  require(!Number.isInteger(value) || Number.isSafeInteger(value), `${label}: entero fuera del rango seguro de Node`);
  require(isInteger(value, container, key) &&
    value >= 0, `${label}: se requiere entero no negativo`);
}
export function sequence(value, label) {
  require(Array.isArray(value), `${label}: se esperaba una lista`);
}
export function uniqueStrings(values, label) {
  sequence(values, label);
  values.forEach((v) => nonempty(v, label));
  const result = new Set(values);
  require(result.size ===
    values.length, `${label}: identificadores duplicados`);
  return result;
}
export const subset = (a, b) => [...a].every((v) => b.has(v));
export const percentage = (a, b) => (b ? (100 * a) / b : null);
export function observation(id, value, unit, result, evidence = [], opts = {}) {
  const { source = "declared_data", scope = null, ...counts } = opts;
  return {
    id,
    value,
    unit,
    source,
    scope: scope || result.capabilityId,
    evidenceRefs: [...evidence],
    ...counts,
  };
}
export function resolveReal(file) {
  const absolute = path.resolve(file);
  // native expande nombres cortos 8.3 de Windows (DAFIGU~1) para comparar rutas del mismo archivo.
  if (fs.existsSync(absolute)) return fs.realpathSync.native(absolute);
  const parent = path.dirname(absolute);
  return parent === absolute
    ? absolute
    : path.join(resolveReal(parent), path.basename(absolute));
}
export function within(file, root) {
  const relative = path.relative(root, file);
  return (
    !path.isAbsolute(relative) &&
    relative !== ".." &&
    !relative.startsWith(`..${path.sep}`)
  );
}
export function isFile(file) {
  try {
    return fs.statSync(file).isFile();
  } catch {
    return false;
  }
}
export function isDirectory(file) {
  try {
    return fs.statSync(file).isDirectory();
  } catch {
    return false;
  }
}
export const isMain = (url) =>
  !!process.argv[1] &&
  url === pathToFileURL(path.resolve(process.argv[1])).href;
// CLI syntax errors keep argparse's exit code 2; validation failures use code 1.
export function parseArgs(
  argv,
  {
    positional = null,
    values = [],
    booleans = [],
    multi = [],
    required = [],
  } = {},
) {
  const out = {};
  const fail = (msg) => {
    const error = new ContractError(msg);
    error.exitCode = 2;
    throw error;
  };
  const looksOption = value => value.startsWith('-') && value !== '-' && !/^-\d+(?:\.\d+)?$/.test(value);
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--') {
      for (const value of argv.slice(i + 1)) {
        if (!positional || Object.hasOwn(out, positional)) fail(`Argumento no reconocido: ${value}`);
        out[positional] = value;
      }
      break;
    }
    if (arg === "--help" || arg === "-h") {
      out.help = true;
      return out;
    }
    if (!arg.startsWith("--")) {
      if (looksOption(arg)) fail(`Argumento no reconocido: ${arg}`);
      if (!positional || Object.hasOwn(out, positional))
        fail(`Argumento no reconocido: ${arg}`);
      out[positional] = arg;
      continue;
    }
    let [flag, inline] = arg.slice(2).split(/=(.*)/s);
    const known = [...values, ...booleans, ...multi, 'help'];
    if (!known.includes(flag)) {
      const candidates = known.filter(name => name.startsWith(flag));
      if (candidates.length !== 1) fail(`Argumento ${candidates.length ? 'ambiguo' : 'no reconocido'}: ${arg}`);
      flag = candidates[0];
    }
    if (flag === 'help') { out.help = true; return out; }
    if (booleans.includes(flag)) {
      if (inline !== undefined) fail(`Argumento inválido: ${arg}`);
      out[flag] = true;
    } else if (values.includes(flag)) {
      const v = inline ?? argv[++i];
      if (v === undefined || (inline === undefined && looksOption(v))) fail(`Falta valor: --${flag}`);
      out[flag] = v;
    } else if (multi.includes(flag)) {
      const items = inline === undefined ? [] : [inline];
      while (i + 1 < argv.length && !looksOption(argv[i + 1]))
        items.push(argv[++i]);
      if (!items.length) fail(`Falta valor: --${flag}`);
      out[flag] = items;
    } else fail(`Argumento no reconocido: ${arg}`);
  }
  for (const flag of [positional, ...required].filter(Boolean))
    if (!Object.hasOwn(out, flag)) fail(`Falta argumento: ${flag}`);
  return out;
}
