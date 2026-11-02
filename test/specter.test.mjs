// Agregador de pruebas de la skill specter. `node --test` no recorre carpetas ocultas
// (.claude/), así que este archivo raíz importa los tests de la skill para que corran en la
// suite del kit (mismo patrón que test/qa-output.test.mjs para la familia QA).
import "../.claude/skills/specter/tests/schema.test.mjs";
import "../.claude/skills/specter/tests/quality-gate.test.mjs";
import "../.claude/skills/specter/tests/traceability.test.mjs";
import "../.claude/skills/specter/evaluations/evaluate.test.mjs";
