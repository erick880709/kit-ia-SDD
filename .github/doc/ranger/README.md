# Ranger y skills QA

Las ocho skills se componen según el encargo. Una skill define instrucciones y
recursos. La sesión es quien los ejecuta. Este repositorio no instala un agente
Ranger propio. PAP puede asignar ese rol externo a una sesión. Su adaptador
sigue pendiente de integración.

El **host** es el programa que inicia esa sesión y le entrega el encargo. El
**agente** es la sesión que realiza el trabajo. Una **skill** aporta instrucciones
y recursos. Usar una skill no crea otro agente. Consulta las
[definiciones del contrato común](../../contracts/output/README.md#términos-para-leer-esta-documentación)
para distinguir también corrida, invocación, artefacto y resultado normalizado.

| Skill | Responsabilidad | Entrada y límite |
|---|---|---|
| [ranger](../../skills/ranger/SKILL.md) | Estrategia, selección de herramientas y trabajo QA general | Conservar la herramienta instalada salvo una selección o migración explícita |
| [qa-ranger-plan-pruebas](../../skills/qa-ranger-plan-pruebas/SKILL.md) | Plan, runbook o ambos | Requisitos verificables; entregar únicamente lo solicitado |
| [qa-ranger-playwright](../../skills/qa-ranger-playwright/SKILL.md) | Diseño, implementación, revisión y diagnóstico Playwright | Herramienta seleccionada, aplicación/API y evidencia según la tarea |
| [qa-ranger-karate](../../skills/qa-ranger-karate/SKILL.md) | Trabajo Karate API/aceptación | Identificar v1/v2; evidencia UI necesita integración adicional |
| [qa-ranger-unitarias](../../skills/qa-ranger-unitarias/SKILL.md) | Diseño, implementación, revisión, ejecución y diagnóstico de unitarias | Runner del stack y reportes nativos; meta del 95% por métrica soportada |
| [qa-ranger-selenium](../../skills/qa-ranger-selenium/SKILL.md) | Diseño, implementación, revisión y ejecución Selenium | DOM real y entorno autorizado; política de evidencia browser |
| [qa-ranger-jmeter](../../skills/qa-ranger-jmeter/SKILL.md) | Diseño, implementación, ejecución y reporte de carga | Ambiente autorizado, carga y SLA acordados; política api para escenarios sobre API |
| [qa-ranger-robotframework](../../skills/qa-ranger-robotframework/SKILL.md) | Diseño, implementación, revisión y ejecución Robot Framework de base de datos, API y web | Variables del entorno (por ejemplo, del stage *Acceptance Test* del release en Azure DevOps); `output.xml` convertible a CTRF |

Un **plan de pruebas** describe qué comprobar y con qué criterios. Un **runbook**
es la guía de pasos para ejecutar esas comprobaciones. Una **suite** es un conjunto
de pruebas y el **runner** es el programa que las ejecuta. GO/NO-GO expresa la
recomendación según resultados y evidencia. No equivale al estado de entrega:
un reporte puede estar terminado y recomendar NO-GO.

Aplicar una skill significa seguir sus instrucciones en la sesión actual.
Delegar significa transmitir un encargo a otra sesión permitida por el host,
indicando qué skill debe aplicar. Nombrar una skill no crea procesos ni
permisos. Transmite tarea, alcance, fuentes, IDs, documentos solicitados, política
de evidencia y contexto del host. Cada invocación conserva su `capabilityId`.
Ranger no reemplaza los resultados especializados con uno agregado.

Cada skill contiene `SKILL.md`, `contracts/output-contract.json` y
`evals/evals.json`. Solo incorpora las carpetas que necesita su trabajo. Ranger
mantiene su procedimiento detallado en su propia
[SKILL.md](../../skills/ranger/SKILL.md), organizado por tarea.

## Tablero de trabajo (opcional)

Ranger y cada especialista invocado directamente preguntan **una vez**, antes de
empezar, si el trabajo corresponde a un work item de **Jira** o **Azure DevOps** que
el usuario quiera conectar por MCP. Con tablero, leen las HU, los criterios y los
planes de prueba y, al terminar, comentan lo realizado y cambian el estado según el
veredicto (`automático`, `mostrarme antes` o `no`). Si la respuesta es no, empiezan
el trabajo de inmediato. Cuando Ranger coordina especialistas, solo Ranger escribe
en el tablero, con una actualización consolidada al final. Las sesiones no
interactivas (host, evaluación, pipeline) no escriben en ningún tablero. Las
credenciales van en variables de entorno, nunca en archivos. Guía:
[tablero_de_trabajo_mcp.md](../../skills/ranger/references/tablero_de_trabajo_mcp.md).

## Ubicación de los recursos QA

Ranger conserva estrategia, contrato, trazabilidad y criterios de riesgo. Los ejemplos y la configuración Playwright, Selenium y unitarias viven en los recursos de sus especialistas, incluidos BDD y accesibilidad. Cypress, WebdriverIO, Appium y k6 conservan sus guías en Ranger porque aún no tienen una skill dedicada.

| Ubicación dentro de una skill | Contenido y uso |
|---|---|
| `SKILL.md` | Instrucciones de entrada, responsabilidades y enlaces a los recursos necesarios. |
| `references/` | Guías, reglas y formatos que el agente consulta. Pueden incluir ejemplos explicados. |
| `templates/` | Archivos que se copian o completan para producir un entregable o proyecto. |
| `scripts/` | Herramientas ejecutables para el trabajo de la skill. |
| `contracts/output-contract.json` | Condiciones de aceptación propias de la skill. |
| `contracts/examples/` | Resultados JSON de ejemplo; no son ejecuciones ni entregas reales. |
| `evals/evals.json` | Encargos y expectativas para evaluar el comportamiento de la skill. |
| `evals/files/` | Fuentes y aplicaciones preparadas para esos escenarios. |
| `tests/` | Pruebas automatizadas del código de las herramientas. |

El plan se completa desde
[templates/test_plan_template.md](../../skills/qa-ranger-plan-pruebas/templates/test_plan_template.md).
Ranger conserva las plantillas de
[contexto del proyecto](../../skills/ranger/templates/project_context_template.md) y
[variables de entorno](../../skills/ranger/templates/env.example).
La [guía del runbook](../../skills/ranger/references/markdown_test_runbook.md)
permanece en `references/`: explica su formato y ofrece ejemplos de casos y reportes.
Playwright, Karate, Selenium, Robot Framework y JMeter mantienen sus proyectos generables en `templates/`.
El reproductor de trace permanece en `evals/` porque prepara un escenario de evaluación.

## Pruebas por responsabilidad

Cada especialista conserva sus pruebas específicas en su propia carpeta `tests/`.
El plan comprueba requisitos, trazabilidad y entregables. Playwright comprueba
sus entregas de navegador y la organización de evidencia por proyecto e intento.
Karate comprueba entregas de API y conserva su prueba de integración existente.
Unitarias comprueba sus contratos y la conversión de LCOV, Istanbul, Cobertura,
JaCoCo y JUnit sin estimar conteos ni métricas ausentes.
Selenium conserva sus pruebas de contrato y captura de evidencia por caso;
JMeter conserva las de contrato, planes y resultados de carga; Robot Framework, las de contrato y sus scripts. El smoke
compartido de herramientas genera ambos proyectos y comprueba sus reportes
reales contra el host Node.

Las pruebas de las reglas de aceptación QA y del reporte viven en
`.claude/contracts/output/tests/`; Ranger mantiene las de sus herramientas compartidas
y la preparación de evaluaciones. Las pruebas de aceptación
usan los ejemplos de cada skill y los casos de `contract-tests.mjs`.
El contrato común mantiene sus pruebas de formato, identidad y registro
en `.claude/contracts/output/tests/`. Las pruebas específicas llaman al motor
compartido sin duplicar los casos de aceptación comunes.

## Distribución y ejecución

Copia las ocho skills con sus recursos y `.claude/contracts/output/`. La
[política QA](../../contracts/output/validators/qa/qa-policy.json) vive en ese paquete y se aplica incluso
sin JSON. Los validadores y reportes requieren únicamente Node 22 o posterior;
no necesitan instalar paquetes. La evaluación compartida también usa Node.
Las herramientas de generación, lint, exploración y trazabilidad de las skills
conservan sus runtimes propios; esta regla no las migra. Las reglas de aceptación QA,
la política y el generador del reporte de ejecución viven en `contracts/output/`, con sus
pruebas en `contracts/output/tests/`. Las reglas de datos y cierre se documentan en
`ranger/references/`; el evaluador y las herramientas operativas compartidas viven en
`ranger/scripts/`, con sus pruebas en `ranger/tests/`. Cada skill conserva su contrato
y escenarios propios.

Sin carpeta de resultados solicitada se entregan los artefactos y la respuesta.
Con carpeta, cada invocación escribe `<capabilityId>-<n>.json` allí, en el archivo
que asigna el host. El host conserva un manifiesto de invocaciones esperadas fuera
de esa carpeta. `validate-run.mjs` verifica tarea, política, entregables y
resultados faltantes o no asignados. El hook `Stop` de `.claude/settings.json`
valida cada resultado al terminar el turno, en Claude Code y en Copilot CLI. Consulta el
[contrato común](../../contracts/output/README.md) y los
[datos QA](../../skills/ranger/references/qa-output.md).

El contrato válido comprueba estructura, reglas y archivos locales. No certifica
la exactitud semántica de un plan ni la autenticidad de una prueba. Contrasta el
contenido con las fuentes. `input_required` requiere información nueva antes de
reintentar. Una implementación sin verificar conserva pendientes. Un reporte
terminado puede recomendar `NO-GO`.

## Evidencia y reportes

Todas las capacidades QA entregan su corrida como CTRF; Playwright usa
`reporters/evidence-ctrf.ts`, que delega en `playwright-ctrf-json-reporter`. El reporte queda en
`resources/qa/reports/<runId>/ctrf.json`. La evidencia de Playwright queda en
`resources/qa/<CASE-ID>/<runId>/<proyecto>/attempt-<n>/`; la de otros runners, en
`resources/qa/test-results/<runId>/`. El contrato y el reporte leen casos, estados,
reintentos y adjuntos de ese archivo; el agente no los transcribe. Es distinto del
manifiesto del host: el CTRF registra lo ocurrido en las pruebas, el manifiesto los
trabajos encargados. Los IDs y prioridades deben ser explícitos. Los resultados
`repeat-each` con IDs duplicados se rechazan: usa corridas independientes para tendencias.

El generador de Markdown y el contrato comparten el mismo motor de veredicto.
Una suite vacía, un crítico omitido, evidencia faltante o criterios desconocidos
no acreditan un GO. `--expected` conserva el alcance previsto del plan y
`--exit-criteria` recibe criterios evaluados con evidencia. `--fail-on-no-go`
devuelve 2 después de guardar el reporte.

El organizador incluido lee Playwright. Cypress necesita un adaptador del proyecto
y una política de evidencia resuelta. No incluye trace portable equivalente.
Las [reglas Karate UI](../../skills/qa-ranger-karate/references/13-evidencia-ui.md)
explican qué integración falta para conservar video/trace reales.

## Evaluación

Las ocho skills tienen [casos y harness aislado](../../skills/ranger/references/evaluations.md).
La [guía de validación](validacion.md) distingue pruebas automáticas,
ejecución real de plantillas y evaluaciones con agentes. Los ejemplos contractuales
son ficticios y no cuentan como ejecuciones.

## Integración con hosts

Un host Node puede importar el validador sin lanzar procesos. Las funciones son
asíncronas y devuelven el mismo JSON que la CLI; una entrega inválida lanza
`ContractError`. Los errores de lectura de archivos también se propagan.

```js
import { validateRun } from './.claude/contracts/output/validate-run.mjs';
import { readFile } from 'node:fs/promises';
import { resolveResultsFolder } from './.claude/contracts/output/results-root.mjs';

const runId = 'corrida-01';
const manifest = JSON.parse(await readFile('host-manifest.json', 'utf8'));
const capability = manifest.invocations[0].capabilityId;
const contract = JSON.parse(await readFile(`.claude/skills/${capability}/contracts/output-contract.json`, 'utf8'));
const folder = resolveResultsFolder(contract, runId, process.cwd());
const outcome = await validateRun(folder, manifest, process.cwd());
// outcome.results: [{invocationId, resultFile, result}], un resultado normalizado por invocación.
```

La ruta de importación se resuelve desde el archivo del host. También se exporta
`validateResult(json, {projectRoot, expectedCapabilityId, expectedTask, expectedEvidencePolicy, expectedDeliverables, expectedScope})`
desde `validate.mjs`. `projectRoot` identifica el proyecto y sus artefactos.
