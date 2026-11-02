import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { loadContract, executionMetrics, compare } from "./validators/qa/qa.mjs";
import { readCtrf, executionFromCtrf } from "./validators/qa/ctrf.mjs";
import { validateResult, SCHEMA } from "./validate.mjs";
import {
  readJSON,
  require,
  resolveReal,
  isMain,
  parseArgs,
} from "./rules.mjs";
export function cell(value) {
  return (
    value == null
      ? "-"
      : value === true
        ? "True"
        : value === false
          ? "False"
          : String(value)
  )
    .replaceAll("|", "\\|")
    .replaceAll("\n", "<br>");
}
/**
 * Evalúa un reporte CTRF con las reglas QA y devuelve [métricas, casos para el reporte].
 * @param {object} report - Reporte CTRF del runner.
 * @param {string} root - Raíz del proyecto; las evidencias deben estar dentro, en resources/qa/.
 * @param {{expected?: object[]|null, evidencePolicy?: object|null, exitCriteria?: object[]}} [opts]
 */
export function fromCtrf(report, root, { expected = null, evidencePolicy = null, exitCriteria = [] } = {}) {
  root = resolveReal(root);
  const policy = evidencePolicy && Object.keys(evidencePolicy).length
    ? evidencePolicy
    : { level: "browser", required: ["video", "trace", "screenshot"], override: null };
  const { execution, artifacts } = executionFromCtrf("ctrf", report, root, { expected, exitCriteria, evidencePolicy: policy });
  // Un CTRF suelto no trae capacidad: el reporte usa la política QA compartida.
  const base = readJSON(new URL("./validators/qa/qa-policy.json", import.meta.url));
  // Las mismas comprobaciones que hace loadContract al cargar la política de una skill.
  require(base.policyId === "qa", "Identidad de política QA inconsistente");
  require(base.contractVersion === SCHEMA.properties.contractVersion.const, "Versión de política QA no compatible");
  const metrics = executionMetrics(execution, new Map([["ctrf", { id: "ctrf", kind: "test_results" }], ...artifacts]), base);
  const cases = execution.cases.map((c) => ({
    ...c,
    evidence: c.evidence.filter((id) => id !== "ctrf").map((id) => path.basename(artifacts.get(id).path)),
  }));
  return [metrics, cases];
}
export function render(metrics, cases) {
  const rows = [
    "| Caso | Proyecto | Prioridad | Estado | Defecto | Evidencia |",
    "|---|---|---|---|---|---|",
  ];
  for (const c of [...cases].sort(
    (a, b) =>
      compare(a.caseId || a.id || "", b.caseId || b.id || "") ||
      compare(a.project ?? "", b.project ?? ""),
  )) {
    const artifactNames = Object.keys(c.artifacts ?? {});
    rows.push(
      "| " +
        [
          c.caseId || c.id,
          c.project ?? "",
          c.priority,
          c.status,
          c.error,
          (artifactNames.length ? artifactNames : (c.evidence ?? [])).join(
            ", ",
          ),
        ]
          .map(cell)
          .join(" | ") +
        " |",
    );
  }
  const counts = metrics.counts;
  const lines = [
    "# Reporte de Ejecución de QA",
    "",
    `- **Veredicto: ${metrics.recommendation}**`,
    `- Casos previstos: ${metrics.plannedCases ?? "desconocido"}`,
    `- Pasaron: ${counts.passed}`,
    `- Fallaron: ${counts.failed}`,
    `- Bloqueados: ${counts.blocked}`,
    `- No ejecutados: ${counts["not-run"]}`,
    `- Casos con reintentos: ${metrics.retriedCases}`,
    `- Casos sin evidencia obligatoria: ${metrics.casesMissingEvidence}`,
    "",
    ...rows,
    "",
    "## Brechas de evidencia",
    "",
  ];
  lines.push(
    ...metrics.evidenceGaps.map(
      (gap) =>
        `- ${cell(gap.id)} / ${cell(gap.project)}: ${gap.missing.join(", ")}`,
    ),
  );
  if (!metrics.evidenceGaps.length)
    lines.push(
      "- Sin tipos de evidencia faltantes entre los casos ejecutados.",
    );
  lines.push(
    "",
    "El veredicto se deriva de qa-policy.json. Validar datos y rutas no certifica",
    "la autenticidad de evidencias ni sustituye la aprobación del release.",
    "",
  );
  return lines.join("\n");
}
export async function main(argv = process.argv.slice(2)) {
  try {
    const args = parseArgs(argv, {
      values: [
        "ctrf",
        "result",
        "out",
        "project-root",
        "expected",
        "evidence-policy",
        "exit-criteria",
      ],
      booleans: ["fail-on-no-go"],
      required: ["out"],
    });
    if (args.help) {
      console.log(
        "node render-report.mjs (--ctrf <ctrf.json> | --result <json>) --out <md> [--project-root <path>] [--expected <casos.json>] [--evidence-policy <json>] [--exit-criteria <json>] [--fail-on-no-go]",
      );
      return 0;
    }
    if (!!args.result === !!args.ctrf) {
      const error = new Error(
        "Selecciona exactamente uno: --result o --ctrf",
      );
      error.exitCode = 2;
      throw error;
    }
    const root = resolveReal(args["project-root"] ?? process.cwd());
    let metrics, cases;
    if (args.result) {
      require(!args.expected && !args["evidence-policy"] &&
        !args[
          "exit-criteria"
        ], "El resultado contractual ya conserva alcance, política y criterios");
      const result = (
        await validateResult(readJSON(args.result), { projectRoot: root })
      ).result;
      const report = result.artifacts.find((a) => a.kind === "test_results");
      require(result.data && (report || Object.hasOwn(result.data, "execution")), "El resultado no contiene ejecución");
      if (report)
        [metrics, cases] = fromCtrf(readCtrf(report.path, root), root, {
          expected: result.data.expected ?? null,
          evidencePolicy: result.data.evidencePolicy,
          exitCriteria: result.data.exitCriteria ?? [],
        });
      else {
        const artifacts = new Map(result.artifacts.map((a) => [a.id, a])),
          [, base] = loadContract(result.capabilityId);
        metrics = executionMetrics(result.data.execution, artifacts, base);
        cases = result.data.execution.cases;
      }
    } else
      [metrics, cases] = fromCtrf(readCtrf(args.ctrf, root), root, {
        expected: args.expected ? readJSON(args.expected) : null,
        evidencePolicy: args["evidence-policy"] ? readJSON(args["evidence-policy"]) : null,
        exitCriteria: args["exit-criteria"] ? readJSON(args["exit-criteria"]) : [],
      });
    fs.mkdirSync(path.dirname(args.out), { recursive: true });
    fs.writeFileSync(
      args.out,
      render(metrics, cases).replaceAll("\n", os.EOL),
      "utf8",
    );
    console.log(`Reporte: ${args.out} (veredicto: ${metrics.recommendation})`);
    return args["fail-on-no-go"] && metrics.recommendation === "NO-GO" ? 2 : 0;
  } catch (error) {
    console.error(error.message);
    return error.exitCode ?? 1;
  }
}
if (isMain(import.meta.url)) process.exitCode = await main();
