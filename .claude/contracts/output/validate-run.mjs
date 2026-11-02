import fs from "node:fs";
import path from "node:path";
import { validateResult, checkRunFileName } from "./validate.mjs";
import {
  require,
  objectFields,
  sequence,
  readJSON,
  resolveReal,
  isDirectory,
  isMain,
  parseArgs,
  formatList,
} from "./rules.mjs";
const ID = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
// El host asigna la identidad: cada invocación declara el archivo que debe escribir el agente.
// Así la correlación no depende de que el modelo copie IDs dentro del JSON.
export async function validateRun(folder, manifest, projectRoot, opts = {}) {
  objectFields(manifest, ["invocations"], [], "manifiesto del host");
  sequence(manifest.invocations, "invocations");
  require(manifest.invocations
    .length, "El host debe declarar al menos una invocación");
  const expected = new Map(), ids = new Set();
  for (const item of manifest.invocations) {
    objectFields(
      item,
      ["invocationId", "capabilityId", "task", "resultFile"],
      ["evidencePolicy", "deliverables", "expected"],
      "invocación del host",
    );
    require(typeof item.invocationId === "string" && ID.test(item.invocationId) &&
      !ids.has(item.invocationId), "invocationId del host ausente, inválido o duplicado");
    ids.add(item.invocationId);
    require(typeof item.capabilityId === "string" && ID.test(item.capabilityId), "capabilityId del host inválido");
    require(typeof item.task === "string" && item.task.trim(), "task del host inválida");
    require(typeof item.resultFile === "string" && path.basename(item.resultFile) === item.resultFile,
      "resultFile debe ser un nombre de archivo dentro de la carpeta de resultados");
    checkRunFileName(item.resultFile, { capabilityId: item.capabilityId });
    require(!expected.has(item.resultFile), `resultFile duplicado: ${item.resultFile}`);
    expected.set(item.resultFile, item);
  }
  folder = resolveReal(folder);
  require(isDirectory(folder), "Carpeta de resultados inexistente");
  const present = fs.readdirSync(folder).filter((f) => f.endsWith(".json")).sort();
  const unexpected = present.filter((f) => !expected.has(f));
  require(!unexpected.length, `Resultados no esperados: ${formatList(unexpected)}`);
  const missing = [...expected.keys()].filter((f) => !present.includes(f)).sort();
  require(!missing.length, `Faltan resultados: ${formatList(missing)}`);
  const results = [];
  for (const [name, item] of expected) {
    const value = readJSON(path.join(folder, name));
    const { result } = await validateResult(value, {
      ...opts,
      projectRoot,
      expectedCapabilityId: item.capabilityId,
      expectedTask: item.task,
      expectedEvidencePolicy: item.evidencePolicy,
      expectedDeliverables: item.deliverables,
      expectedScope: item.expected ?? null,
    });
    results.push({ invocationId: item.invocationId, resultFile: name, result });
  }
  return { valid: true, results };
}
export async function main(argv = process.argv.slice(2)) {
  try {
    const args = parseArgs(argv, {
      positional: "folder",
      values: ["manifest", "project-root"],
      required: ["manifest", "project-root"],
    });
    if (args.help) {
      console.log(
        "node validate-run.mjs <folder> --manifest <json> --project-root <path>",
      );
      return 0;
    }
    console.log(
      JSON.stringify(
        await validateRun(
          args.folder,
          readJSON(args.manifest),
          args["project-root"],
        ),
        null,
        2,
      ),
    );
    return 0;
  } catch (error) {
    if (error.exitCode === 2) {
      console.error(error.message);
      return 2;
    }
    console.log(JSON.stringify({ valid: false, errors: [error.message] }));
    return 1;
  }
}
if (isMain(import.meta.url)) process.exitCode = await main();
