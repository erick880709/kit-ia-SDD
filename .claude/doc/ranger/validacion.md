# Validación de Ranger y las skills QA

El contrato común, las reglas QA, el renderer y la herramienta compartida de evaluación
funcionan en Node 22 o posterior. El schema de resultado sigue en 0.1.0 y es la única
fuente para generar el validador standalone de Ajv.

## Pruebas del contrato y la evaluación

Desde la raíz del kit:

```powershell
npm ci
node --test
node .claude/skills/ranger/scripts/evaluate.mjs prepare qa-ranger-plan-pruebas 1 <directorio-nuevo>
# El agente trabaja en <directorio-nuevo>/workspace siguiendo encargo.md.
node .claude/skills/ranger/scripts/evaluate.mjs check <directorio-nuevo>
```

El test del catálogo (`test/skill-catalog.test.mjs`) valida el frontmatter YAML y exige
`metadata.capability` y `metadata.capability-summary` en todos los `SKILL.md`, incluidos
los que se agreguen al catálogo. Usa el parser JavaScript `yaml`, instalado con `npm ci`.
Los textos deben ocupar una línea,
usar comillas dobles y tener dos espacios de indentación; el resumen admite hasta 100 caracteres.
Los nombres de capacidad tienen de una a tres palabras, salvo los nombres fijados por el host.

Para validar solo el catálogo o imprimir su tabla de capacidades:

```powershell
node test/validate-skill-catalog.mjs
node test/validate-skill-catalog.mjs --table
```

Las pruebas Node verifican los ejemplos válidos e inválidos de las ocho skills,
la correlación del host por archivo asignado, cierre de entregas, trazabilidad, conteos,
evidencias leídas del CTRF, veredictos, reportes Markdown y el hook `Stop`. Los casos adicionales se construyen en los tests;
no dependen de snapshots externos. Solo el test del catálogo requiere el parser `yaml`.

Comprobación del 6 de octubre de 2026 con el contrato simplificado y CTRF: `node --test`
pasó 273 pruebas sin fallos. Una suite Playwright real (banca-demo, 3 casos, uno fallido a
propósito) se ejecutó con Claude Code 2.1.292 y con GitHub Copilot CLI 1.0.92 en modo `-p`.
Ambos declararon el CTRF como `test_results` sin transcribir casos, el hook `Stop` validó sus
resultados y el host los aceptó con veredicto GO with known risks. Copilot omitió `expected` y
`exitCriteria`, por lo que el porcentaje de ejecución quedó desconocido; en esa versión el host todavía no
exigía el alcance acordado. La versión vigente exige declarar `expected` con CTRF
y permite al host fijarlo en su manifiesto; también corrobora las prioridades.

Comprobación del 6 de octubre de 2026 tras restaurar la implementación original de
Selenium y JMeter: `node --test` pasó 251 pruebas sin fallos.
La prueba headless de Claude Code generó para Selenium y JMeter un diseño completado
y una ejecución bloqueada por falta de entorno; las cuatro entregas pasaron el host
Node en `<resultsRoot>/<runId>/`. Esa prueba verifica integración contractual,
sin atribuir ejecución de suites a los casos bloqueados.

Comprobación del 27 de octubre de 2026 tras registrar `qa-ranger-robotframework` en el
contrato común (`validators.json`, `CAPABILITIES` de `qa.mjs` y sus pruebas en
`test/qa-output.test.mjs`): `node --test` pasó 325 pruebas sin fallos, incluidos los
ejemplos válidos e inválidos de Robot Framework. No se ejecutaron suites Robot reales
ni pruebas headless con agentes.

| Prueba | Qué verifica |
|---|---|
| [interface.test.mjs](../../contracts/output/tests/interface.test.mjs) | CLI, schema generado vigente, lectura estricta JSON y rutas locales. |
| [host.test.mjs](../../contracts/output/tests/host.test.mjs) | Un archivo asignado por invocación, tarea, faltantes, archivos no asignados e importación desde un host externo. |
| [hook.test.mjs](../../contracts/output/tests/hook.test.mjs) | Hook `Stop`: bloquea con los errores hasta 3 veces por sesión, recuerda los válidos y reinicia los avisos. |
| [registry.test.mjs](../../contracts/output/tests/registry.test.mjs) | Registro de capacidades y carga de validadores dentro del paquete. |
| [examples.test.mjs](../../contracts/output/tests/examples.test.mjs) | Todos los ejemplos de las ocho skills y estabilidad de normalización. |
| [contract-tests.mjs](../../contracts/output/tests/contract-tests.mjs) | Casos compartidos de aceptación ejecutados por cada skill, sin duplicar reglas. |
| [results-root.test.mjs](../../contracts/output/tests/results-root.test.mjs) | Campo obligatorio, carpeta por corrida y rechazo de rutas fuera del proyecto. |
| [report.test.mjs](../../contracts/output/tests/report.test.mjs) | GO, GO with known risks, NO-GO, Markdown, lectura de CTRF y distribución del renderer. |
| [evaluations.test.mjs](../../skills/ranger/tests/evaluations.test.mjs) | Preparación de los treinta escenarios, fuentes protegidas y rechazo de entregas inventadas. |
| [coverage.test.mjs](../../contracts/output/tests/coverage.test.mjs) | Cobertura nativa, filtros, enteros seguros, reportes truncados y meta sin redondear. |
| [attach-evidence.test.mjs](../../skills/ranger/tests/attach-evidence.test.mjs) | Adjuntos existentes, IDs ambiguos, conservación de evidencia y conteos sin setup/teardown. |
| [evidence-pipeline.test.mjs](../../skills/qa-ranger-playwright/tests/evidence-pipeline.test.mjs) | CTRF de Playwright: navegadores, reintentos, adjuntos y casos duplicados. |
| [native-ctrf.mjs](../../skills/qa-ranger-playwright/tests/native-ctrf.mjs) | Ejecución real de la plantilla Playwright, a mano y con dependencias instaladas: CTRF nativo, evidencia por caso e intento, sobrescritura, enlaces y unión de shards. |

El evaluador prepara y revisa archivos; no inicia agentes ni demuestra por sí solo
la calidad del razonamiento. Los oráculos y manifiestos quedan fuera del workspace,
y las fuentes se verifican con SHA-256. Un fallo invalida el recibo anterior.

## Integración con hosts

El host lee `resultsRoot` de `contracts/output-contract.json` de la capacidad,
crea `<resultsRoot>/<runId>/` y conserva el manifiesto fuera de esa carpeta.
Las ocho skills QA declaran `resources/qa/contracts`; los reportes humanos y de
los runners continúan bajo sus carpetas `reports/`.

```js
import { readFile } from 'node:fs/promises';
import { validateRun } from './.claude/contracts/output/validate-run.mjs';
import { resolveResultsFolder } from './.claude/contracts/output/results-root.mjs';

const runId = 'corrida-01';
const manifest = JSON.parse(await readFile('host-manifest.json', 'utf8'));
const invocation = manifest.invocations[0]; // {invocationId, capabilityId, task, resultFile}
const contract = JSON.parse(await readFile(
  `.claude/skills/${invocation.capabilityId}/contracts/output-contract.json`, 'utf8'));
const folder = resolveResultsFolder(contract, runId, process.cwd());
const outcome = await validateRun(folder, manifest, process.cwd());
// Conservar outcome.results; una entrada inválida lanza ContractError.
```

Para validar no se instala Ajv. El archivo generado se distribuye con el paquete.
Regenerarlo usa las dependencias de desarrollo en `.claude/contracts/output/`:
`npm ci` y `npm run generate`. Los tests verifican su hash contra el schema.
`result.validate.mjs` conserva en un comentario los avisos de licencia del código distribuido.

## Herramientas de ejecución

Generación de proyectos, lint, exploración, trazabilidad y conversión de reportes
unitarios conservan sus scripts propios. Sus requisitos de Python, Java, Maven,
navegadores o JMeter pertenecen a la ejecución de pruebas; no al host contractual.

Prueba de Karate con API demo local:

```powershell
python .claude/skills/qa-ranger-karate/tests/integration.py
```

Selenium y JMeter conservan los scripts Python, plantillas, demos y carpetas
originales. La integración contractual añade instrucciones, contratos, ejemplos
y pruebas del resultado JSON; no modifica los runners ni añade grabadores.

Para verificar la ejecución, sigue el flujo original de cada especialista:

- [Selenium](../../skills/qa-ranger-selenium/SKILL.md): scaffold, exploración,
  lint Python y ejecución Java/pytest con los reportes del runner.
- [JMeter](../../skills/qa-ranger-jmeter/SKILL.md): scaffold, lint Python,
  prueba de un usuario y análisis JTL/SLA en Python.

Validar el JSON no acredita que se haya ejecutado una suite. Si la infraestructura
no produce la evidencia que exige el contrato, conserva la entrega incompleta
o aplica una excepción explícita del encargo; no inventes archivos ni resultados.

La ejecución de contrato se lee desde CTRF para todas las capacidades QA.
La cobertura se calcula desde LCOV, Istanbul json-summary, Cobertura XML o JaCoCo XML.
Selenium y JMeter conservan sus herramientas Python y sus plantillas originales.
La conversión del reporte y el enlace de adjuntos pertenecen a la entrega contractual;
no sustituyen la ejecución del runner ni añaden capturas.

Intento headless del 6 de octubre de 2026: Claude devolvió `usage_limit_reached`
antes de trabajar. No se emitió un recibo válido ni se acredita ejecución real.

Comprobación final del 6 de octubre de 2026: `node --test` pasó 289 pruebas,
sin fallos ni omitidos. Incluye lectura nativa de cobertura, todos los ejemplos
CTRF, alcance y prioridades del host, adjuntos y paridad del reporte Markdown.
