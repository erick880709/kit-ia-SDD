import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocument, isMap, isScalar } from "yaml";

const defaultRoot = fileURLToPath(new URL("../.claude/skills/", import.meta.url));

function skillFiles(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return skillFiles(path);
    return entry.isFile() && entry.name === "SKILL.md" ? [path] : [];
  });
}

export function validateCatalog(root = defaultRoot) {
  const paths = skillFiles(root).sort();
  if (!paths.length) throw new Error(`${root}: no se encontraron skills`);
  return paths.map(path => {
    const text = readFileSync(path, "utf8").replace(/^\uFEFF/, "");
    const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
    if (!match) throw new Error(`${path}: falta el frontmatter YAML`);
    const header = match[1];
    const document = parseDocument(header);
    if (document.errors.length) {
      throw new Error(`${path}: YAML inválido: ${document.errors[0].message}`);
    }
    const metadata = isMap(document.contents) ? document.get("metadata", true) : undefined;
    if (!isMap(metadata)) throw new Error(`${path}: metadata debe ser un mapa YAML`);
    const values = ["capability", "capability-summary"].map(key => {
      const node = metadata.get(key, true);
      const value = isScalar(node) ? node.value : undefined;
      if (typeof value !== "string" || !value.trim()) {
        throw new Error(`${path}: metadata.${key} debe ser texto no vacío`);
      }
      if (/[\r\n]/.test(value) || /[\r\n]/.test(header.slice(node.range[0], node.range[1]))) {
        throw new Error(`${path}: metadata.${key} debe ocupar una sola línea`);
      }
      const offset = node.range?.[0];
      const lineStart = header.lastIndexOf("\n", offset - 1) + 1;
      if (node.type !== "QUOTE_DOUBLE" || header.slice(lineStart, offset) !== `  ${key}: `) {
        throw new Error(`${path}: ${key} requiere comillas dobles e indentación de 2 espacios`);
      }
      return value;
    });
    if ([...values[1]].length > 100) {
      throw new Error(`${path}: capability-summary supera 100 caracteres`);
    }
    return [relative(root, dirname(path)).replaceAll("\\", "/"), ...values];
  });
}

export function main(args = process.argv.slice(2)) {
  const roots = args.filter(arg => arg !== "--table");
  if (roots.length > 1 || roots.some(arg => arg.startsWith("-"))) {
    console.error("Uso: node test/validate-skill-catalog.mjs [directorio] [--table]");
    return 1;
  }
  try {
    const rows = validateCatalog(roots[0] ? resolve(roots[0]) : defaultRoot);
    if (args.includes("--table")) {
      console.log("| skill | capability | capability-summary |\n|---|---|---|");
      for (const row of rows) {
        console.log(`| ${row.map(value => value.replaceAll("|", "\\|")).join(" | ")} |`);
      }
    } else {
      console.log(`${rows.length} skills: YAML válido y capacidades completas.`);
    }
    return 0;
  } catch (error) {
    console.error(error.message);
    return 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
