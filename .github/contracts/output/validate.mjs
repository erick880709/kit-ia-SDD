import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { resultSchema } from "./schemas/result.validate.mjs";
import { diagnostic } from "./schema-errors.mjs";
import {
  require,
  readJSON,
  equal,
  resolveReal,
  within,
  isFile,
  isDirectory,
  isMain,
  parseArgs,
} from "./rules.mjs";
export { ContractError, readJSON } from "./rules.mjs";
export const ROOT = fileURLToPath(new URL("./", import.meta.url));
export const SCHEMA = readJSON(
  new URL("./schemas/result.schema.json", import.meta.url),
);
export const validationScope =
  "Estructura, reglas de cierre, aritmética, existencia y digest de archivos locales, y datos leídos de los reportes de máquina declarados. No ejecuta herramientas, verifica recursos remotos ni certifica la veracidad de evidencias o aprobaciones.";
export async function domainValidator(capability, outputRoot = ROOT) {
  const registry = readJSON(path.join(outputRoot, "validators.json"));
  require(Object.hasOwn(
    registry,
    capability,
  ), `Capacidad no registrada: ${capability}`);
  const packageRoot = resolveReal(path.resolve(outputRoot, "../.."));
  const modulePath = resolveReal(
    path.resolve(packageRoot, registry[capability]),
  );
  require(within(modulePath, packageRoot) &&
    isFile(modulePath), "Validador fuera del paquete o inexistente");
  const module = await import(pathToFileURL(modulePath).href);
  return module.validateInvocation;
}
export function validateArtifacts(items, projectRoot) {
  const artifacts = new Map();
  for (const item of items) {
    require(!artifacts.has(item.id), "artifact.id duplicado");
    if (Object.hasOwn(item, "path")) {
      const relative = item.path;
      require(!relative.includes("\\") &&
        !relative.startsWith("/") &&
        !/^[A-Za-z]:/.test(relative) &&
        !relative
          .split("/")
          .includes(
            "..",
          ), "artifact.path debe ser relativo al proyecto y usar /, sin ..");
      const file = resolveReal(path.resolve(projectRoot, relative));
      require(within(file, projectRoot) &&
        isFile(
          file,
        ), `Artefacto inexistente o fuera del proyecto: ${relative}`);
      if (item.digest)
        require(createHash("sha256").update(fs.readFileSync(file)).digest("hex") ===
          item.digest.sha256, `El digest no coincide con el contenido: ${relative}`);
    } else
      require(!item.digest || Object.hasOwn(item, "uri"), "digest requiere path o uri");
    artifacts.set(item.id, item);
  }
  return artifacts;
}
export function checkRunFileName(file, value) {
  const match = path.basename(file).match(/^(.+)-[1-9][0-9]*\.json$/);
  require(match !==
    null, "El resultado de una corrida debe llamarse <capabilityId>-<n>.json");
  require(match[1] ===
    value.capabilityId, "El nombre del archivo no coincide con su capabilityId");
}
export async function validateResult(value, opts = {}) {
  const {
    projectRoot,
    expectedCapabilityId = null,
    expectedEvidencePolicy = null,
    expectedTask = null,
    expectedDeliverables = null,
    expectedScope = null,
    outputRoot = ROOT,
  } = opts;
  require(resultSchema(value), diagnostic(SCHEMA, value) ||
    "Resultado inválido según el schema");
  if (expectedCapabilityId !== null)
    require(value.capabilityId ===
      expectedCapabilityId, "capabilityId no coincide con la invocación del host");
  const finite = (v) => {
    if (typeof v === "number") {
      require(Number.isFinite(
        v,
      ), "Out of range float values are not JSON compliant");
      require(!Number.isInteger(v) || Number.isSafeInteger(v), 'Número fuera del rango entero seguro de Node');
    }
    else if (v && typeof v === "object") Object.values(v).forEach(finite);
  };
  finite(value);
  const root = resolveReal(projectRoot);
  require(isDirectory(root), "Raíz del proyecto inexistente");
  const artifacts = validateArtifacts(value.artifacts, root),
    checks = new Map(value.checks.map((c) => [c.id, c]));
  require(checks.size === value.checks.length, "Comprobaciones duplicadas");
  if (value.status === "completed")
    require(value.data !== null, "completed requiere datos de dominio");
  else
    require(value.pending.length, "La entrega incompleta debe identificar qué falta y quién lo resuelve en pending");
  const validator = await domainValidator(value.capabilityId, outputRoot);
  const metrics = await validator(value, artifacts, checks, {
    projectRoot: root,
    expectedEvidencePolicy,
    expectedTask,
    expectedDeliverables,
    expectedScope,
  });
  require(!Object.hasOwn(value, "metrics") ||
    equal(
      value.metrics,
      metrics,
    ), "metrics no coincide con los datos y las reglas de la capacidad");
  const result = structuredClone(value);
  result.metrics = metrics;
  require(resultSchema(result), diagnostic(SCHEMA, result, false) ||
    "Resultado inválido según el schema");
  return { valid: true, result, validationScope };
}
export async function main(argv = process.argv.slice(2)) {
  try {
    const args = parseArgs(argv, {
      positional: "result",
      values: [
        "project-root",
        "expected-capability-id",
        "expected-evidence-policy",
        "expected-task",
        "expected-scope",
      ],
      booleans: ["run-result"],
      multi: ["expected-deliverables"],
      required: ["project-root"],
    });
    if (args.help) {
      console.log(
        "node validate.mjs <result> --project-root <path> [--run-result] [--expected-capability-id <id>] [--expected-evidence-policy <json>] [--expected-task <task>] [--expected-scope <json>] [--expected-deliverables <id> ...]",
      );
      return 0;
    }
    const value = readJSON(args.result);
    if (args["run-result"]) checkRunFileName(args.result, value);
    const outcome = await validateResult(value, {
      projectRoot: args["project-root"],
      expectedCapabilityId: args["expected-capability-id"],
      expectedEvidencePolicy: args["expected-evidence-policy"]
        ? readJSON(args["expected-evidence-policy"])
        : null,
      expectedTask: args["expected-task"],
      expectedScope: args["expected-scope"] ? readJSON(args["expected-scope"]) : null,
      expectedDeliverables: args["expected-deliverables"],
    });
    console.log(JSON.stringify(outcome, null, 2));
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
