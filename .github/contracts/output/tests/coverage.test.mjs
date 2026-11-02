import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { readCoverage } from "../validators/qa/coverage.mjs";
import { coverageFromTotals, loadContract } from "../validators/qa/qa.mjs";

const [, base] = loadContract("qa-ranger-unitarias");
function project(t, files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "qa-coverage-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(root, name), text);
  return root;
}
const LCOV = "TN:\nSF:src/a.js\nFNF:2\nFNH:2\nLF:10\nLH:9\nBRF:4\nBRH:3\nend_of_record\nSF:test/a.test.js\nLF:5\nLH:5\nend_of_record\n";
const ISTANBUL = JSON.stringify({
  total: { lines: { total: 15, covered: 14 }, statements: { total: 16, covered: 15 }, functions: { total: 2, covered: 2 }, branches: { total: 4, covered: 3 } },
  "src/a.js": { lines: { total: 10, covered: 9 }, statements: { total: 11, covered: 10 }, functions: { total: 2, covered: 2 }, branches: { total: 4, covered: 3 } },
});
const COBERTURA = '<?xml version="1.0" ?>\n<coverage lines-valid="20" lines-covered="18" branches-valid="0" branches-covered="0"><packages/></coverage>\n';
const JACOCO = '<?xml version="1.0"?><!DOCTYPE report><report name="x"><package name="p"><counter type="LINE" missed="99" covered="1"/></package><counter type="BRANCH" missed="2" covered="8"/><counter type="LINE" missed="3" covered="27"/><counter type="METHOD" missed="0" covered="6"/></report>';

test("Cobertura: lee los cuatro formatos nativos con los mismos totales que unit_report.py", (t) => {
  const root = project(t, { "lcov.info": LCOV, "summary.json": ISTANBUL, "cobertura.xml": COBERTURA, "jacoco.xml": JACOCO });
  assert.deepEqual(readCoverage("lcov.info", root), { lines: { covered: 14, total: 15 }, functions: { covered: 2, total: 2 }, branches: { covered: 3, total: 4 } });
  assert.deepEqual(readCoverage("summary.json", root).statements, { covered: 15, total: 16 });
  assert.deepEqual(readCoverage("cobertura.xml", root), { lines: { covered: 18, total: 20 }, branches: { covered: 0, total: 0 } });
  assert.deepEqual(readCoverage("jacoco.xml", root), { branches: { covered: 8, total: 10 }, lines: { covered: 27, total: 30 }, functions: { covered: 6, total: 6 } });
});

test("Cobertura: include/exclude filtran LCOV e Istanbul y no aplican a XML", (t) => {
  const root = project(t, { "lcov.info": LCOV, "summary.json": ISTANBUL, "cobertura.xml": COBERTURA });
  assert.deepEqual(readCoverage("lcov.info", root, { exclude: ["test/*"] }).lines, { covered: 9, total: 10 });
  assert.deepEqual(readCoverage("summary.json", root, { include: ["src/*"] }).lines, { covered: 9, total: 10 });
  assert.throws(() => readCoverage("lcov.info", root, { include: ["otro/*"] }), /dentro del alcance/);
  assert.throws(() => readCoverage("cobertura.xml", root, { include: ["src/*"] }), /solo aplican a LCOV e Istanbul/);
});

test("Cobertura: rechaza reportes inconsistentes, ajenos o fuera del proyecto", (t) => {
  const root = project(t, {
    "mayor.info": "SF:a.js\nLF:2\nLH:3\nend_of_record\n",
    "duplicado.info": "SF:a.js\nLF:2\nLH:1\nend_of_record\nSF:a.js\nLF:2\nLH:1\nend_of_record\n",
    "abierto.info": "SF:a.js\nLF:2\nLH:1\n",
    "otro.xml": "<testsuites/>",
    "sin-total.json": "{}",
  });
  assert.throws(() => readCoverage("mayor.info", root), /mayor al denominador/);
  assert.throws(() => readCoverage("duplicado.info", root), /duplicado/);
  assert.throws(() => readCoverage("abierto.info", root), /end_of_record/);
  assert.throws(() => readCoverage("otro.xml", root), /no reconocido/);
  assert.throws(() => readCoverage("sin-total.json", root), /total/);
  assert.throws(() => readCoverage("../fuera.info", root), /fuera del proyecto|inexistente/);
});

test("Cobertura: la meta del 95% se compara sin redondear y los denominadores cero no la acreditan", () => {
  const policy = base.unitCoverage;
  assert.equal(coverageFromTotals({ lines: { covered: 95, total: 100 } }, 95, policy).unitCoverageTargetMet, true);
  assert.equal(coverageFromTotals({ lines: { covered: 949, total: 1000 } }, 95, policy).unitCoverageTargetMet, false);
  assert.equal(coverageFromTotals({ lines: { covered: 0, total: 0 } }, 95, policy).unitCoverageTargetMet, null);
  assert.equal(coverageFromTotals({ lines: { covered: 90, total: 100 } }, 90, policy).unitCoverageTargetMet, true);
  assert.deepEqual(coverageFromTotals({ lines: { covered: 1, total: 2 } }, 95, policy).unitCoverageSupportedMetrics, ["lines"]);
});

test("Cobertura: rechaza conteos que superan el entero seguro y escapa filtros literales", (t) => {
  const root = project(t, {
    'unsafe.info': 'SF:a.js\nLF:9007199254740993\nLH:1\nend_of_record\n',
    'literal.info': 'SF:src/[id].js\nLF:2\nLH:1\nend_of_record\n',
    'truncated.xml': '<coverage lines-valid="2" lines-covered="2"><packages/>',
  });
  assert.throws(() => readCoverage('unsafe.info', root), /Conteo de cobertura inválido/);
  assert.deepEqual(readCoverage('literal.info', root, { include: ['src/[id].js'] }).lines, { covered: 1, total: 2 });
  assert.throws(() => readCoverage('truncated.xml', root), /truncado/);
});
