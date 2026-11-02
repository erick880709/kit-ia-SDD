# Contrato común de salida — 0.1.0

Define el resultado que la sesión produce **al aplicar cada skill**. El agente
ejecuta o coordina el trabajo y el host lee los resultados por capacidad. Una
skill contiene instrucciones y recursos. No crea un proceso independiente.

## Términos para leer esta documentación

- **Host:** programa que inicia la sesión del agente y le comunica el encargo.
  Puede ser una aplicación o un script. Para comprobar las entregas, registra qué
  trabajos espera recibir y proporciona sus identificadores. PAP es una integración
  prevista. Los tests de este paquete simulan ese papel con archivos locales.
- **Agente:** sesión que ejecuta el trabajo usando las instrucciones de las skills.
  Puede coordinar otras sesiones cuando el host lo permita.
- **Skill o capacidad:** conjunto de instrucciones y recursos para una tarea.
  `capabilityId` identifica la skill aplicada.
- **Invocación:** un trabajo concreto encargado a una skill. Aplicarla dos veces
  produce dos invocaciones, aunque su `capabilityId` sea el mismo.
- **Corrida:** conjunto de invocaciones que el host agrupa para un encargo.
  `runId` nombra su carpeta de resultados. `invocationId` identifica un trabajo dentro
  de ella y el host le asigna el archivo de resultado (`resultFile`).
- **Contrato de salida:** reglas que debe cumplir el JSON de una entrega:
  campos, identidad, estado, datos y referencias a lo producido.
- **Artefacto:** archivo, texto o recurso producido o utilizado en la entrega.
  Un plan es un artefacto. Una captura puede ser un artefacto de evidencia.
- **Manifiesto del host:** archivo JSON con la lista de invocaciones esperadas.
  Permite detectar que falta una entrega o que se recibió dos veces.
- **Normalización:** cálculo de las métricas del resultado a partir de sus datos.
  El validador devuelve una copia con `metrics`. No modifica el archivo de entrada.
- **Prueba de regresión:** test que comprueba que un comportamiento del código
  siga funcionando después de cambios. Un *fixture* es un archivo o dato preparado
  para ese test. No demuestra que ocurrió una ejecución real.
- **Evaluación de una skill:** encargo usado para observar cómo trabaja un agente
  aplicando esa skill. Se distingue de los tests del código del validador.

## Quién recibe y quién entrega

| Rol | Qué es | Recibe | Entrega |
|---|---|---|---|
| **Host** | La aplicación que lanza al agente: PAP (o un script) | — | Al agente: el encargo y la ruta exacta de cada archivo de resultado |
| **Agente** | Ejecuta o coordina el encargo y decide qué skills aplicar. Claude Code o GitHub Copilot CLI | Del host: el encargo y las rutas | Un resultado por skill aplicada, en el archivo indicado |
| **Skill** | Define instrucciones y recursos para el trabajo concreto. Se identifica con `capabilityId` (p. ej. `qa-ranger-plan-pruebas`) | Del agente: su parte del encargo y la carpeta | La sesión produce sus artefactos y un JSON `<capabilityId>-<n>.json` al aplicarla |

```text
host ──encargo + carpeta──▶ agente ──encargo + carpeta──▶ skill
                                                           │
host ◀──lee y valida cada JSON de la carpeta───────────────┘
```

- Un resultado = una invocación de una skill. Si el agente aplica tres skills,
  quedan tres JSON. Si aplica dos veces la misma, quedan dos.
- Sin carpeta de resultados (uso conversacional en el CLI o VS Code), la skill
  entrega sus artefactos y no escribe JSON.
- El formato de entrada (cómo el host le pasa el encargo al agente) todavía no
  está definido. Hoy va en el prompt.

El [esquema](schemas/result.schema.json) define los campos compartidos.
El [validador](validate.mjs) aplica además las reglas de cada skill registrada.
El validador encuentra esas reglas mediante el [registro de validadores](validators.json). El resultado normalizado
conserva ese mismo esquema. PAP todavía usa su formato propio (`[SKILL_STATUS]`).

## Ejemplo de un encargo y su comprobación

El host solicita un plan de pruebas. Registra la invocación `plan-01` de la capacidad
`qa-ranger-plan-pruebas` en la corrida `corrida-01` y le asigna el archivo
`qa-ranger-plan-pruebas-1.json`. La sesión aplica esa skill, produce el documento y
escribe el resultado en `resources/qa/contracts/corrida-01/qa-ranger-plan-pruebas-1.json`.
El JSON no repite identificadores: la identidad es la ruta que asignó el host.

`validate.mjs` comprueba esa entrega. `validate-run.mjs` la compara además con la
lista del manifiesto: si falta un archivo o aparece uno que el host no asignó,
rechaza la corrida. Los tests de `host.test.mjs` simulan
estas situaciones. No necesitan lanzar un agente real para probar el validador.

## Qué hace cada archivo de este directorio

| Archivo | Para qué sirve |
|---|---|
| [schemas/result.schema.json](schemas/result.schema.json) | Define campos, tipos y estados del resultado común. |
| [validate.mjs](validate.mjs) | Comprueba un resultado y llama a las reglas de su capacidad. |
| [validate-run.mjs](validate-run.mjs) | Compara todos los resultados recibidos con las invocaciones esperadas. |
| [hooks/stop.mjs](hooks/stop.mjs) | Hook `Stop` de Claude Code y Copilot CLI: valida los resultados nuevos y le devuelve los errores al agente. |
| [validators.json](validators.json) | Asocia cada capacidad registrada con su script de validación. |
| [validators/qa/](validators/qa/README.md) | Reglas de aceptación QA, lectores de CTRF y cobertura y política QA. No ejecutan pruebas. |
| [generate-execution-report.mjs](generate-execution-report.mjs) | Genera el reporte de ejecución QA y su veredicto desde un CTRF o un resultado. Con `--fail-on-no-go` sale con código 2 ante NO-GO; lo usa el CI. |
| [render-report.mjs](render-report.mjs) | Calcula el veredicto con las reglas QA y escribe el Markdown que usa el generador. |
| [rules.mjs](rules.mjs) | Comparte comprobaciones básicas de JSON, tipos y cálculo de observaciones. |
| [tests/](tests/) | Comprueba el código de esta infraestructura usando datos locales. |
| [schemas/result.validate.mjs](schemas/result.validate.mjs) | Validador standalone generado desde el schema; no requiere paquetes al validar. |

## Campos

| Campo | Uso |
|---|---|
| `contractVersion` | Versión exacta: `0.1.0` |
| `capabilityId` | La skill aplicada para producir este resultado (`ranger`, `qa-ranger-plan-pruebas`…) |
| `status` | `completed`, `partial`, `input_required` o `failed`, respecto del encargo |
| `summary` | Qué se produjo y cuál fue el resultado |
| `checks` | `{id, passed, evidence}`: comprobación, si se cumplió y la evidencia concreta |
| `artifacts` | `{id, kind}`, exactamente uno de `path`, `content` o `uri`, y opcionalmente `mediaType` y `digest: {sha256}` |
| `pending` | `{description, owner}`: lo que falta y quién lo resuelve |
| `data` | Datos mínimos de la skill; sus validadores rechazan campos desconocidos |
| `metrics` | Lo agrega el validador. El agente lo omite; si lo incluye, debe coincidir |

El agente no escribe identidad, tiempos ni costos: el host conoce la invocación por
la ruta del archivo y la sesión informa uso y costo.

Los estados usan el vocabulario de A2A (`completed`, `input_required`, `failed`)
y agregan `partial`: trabajo entregado con pendientes. `completed` exige datos de
dominio; cualquier otro estado exige al menos un pendiente con responsable. Una
revisión terminada puede encontrar defectos. Su estado de entrega y su dictamen
son diferentes.

`path` usa `/`, es relativo al proyecto y debe existir dentro de él. Si se declara
`digest`, el validador recalcula el SHA-256 del archivo. `content` entrega texto en
conversación. `uri` referencia un recurso remoto: el validador comprueba su formato,
pero no accede a él ni demuestra que se publicó.

Cada observación contiene `id`, `value`, `unit`, `source`, `scope` y `evidenceRefs`.
Las razones añaden numerador y denominador. Un denominador vacío produce `null`.
Los porcentajes conservan precisión: redondear solo al mostrar. Los estados y
decisiones, como `qa.recommendation`, son categorías y no se promedian.
`machine_report` identifica cálculos sobre un reporte de máquina, como el CTRF
del runner. `declared_data` identifica cálculos sobre datos declarados por el agente.
`model_evaluation` queda reservado para evaluaciones del modelo. Ninguna etiqueta certifica la veracidad del insumo.
Para estadísticas, conservar versión, skill y alcance. No sumar observaciones
de distintas skills ni tratar cada actualización como una ejecución nueva.

## Reglas por skill

Cada skill mantiene su contrato en `skills/<capabilityId>/contracts/output-contract.json`.
El registro `validators.json` asocia capacidades con scripts del paquete. Sus rutas
son relativas a `.claude/`. El host valida primero los campos comunes y luego
llama a `validateInvocation` del script registrado, que comprueba datos, encargo,
reglas de cierre y deriva métricas. Una capacidad no registrada se rechaza:
validar el esquema por sí solo no acredita la aceptación de una entrega.

Las reglas de aceptación QA, sus lectores de CTRF y cobertura y la
[política QA](validators/qa/qa-policy.json) viven en `validators/qa/`: el host las
usa para aceptar entregas y no ejecutan pruebas. La documentación de los datos QA
sigue en [datos y cierre QA](../../skills/ranger/references/qa-output.md), y las
herramientas operativas compartidas, en [Ranger](../../skills/ranger/SKILL.md).
Los escenarios de evaluación viven en cada skill. El
[evaluador compartido](../../skills/ranger/references/evaluations.md) y sus pruebas
pertenecen a Ranger. Este directorio conserva el esquema, validadores comunes y QA,
registro, generador del reporte de ejecución, helpers genéricos y sus pruebas.

Las skills `builder`, `archi` y `epicureo` aún no emiten este formato. El
[diseño y sus casos de aceptación](diseno-contratos.md) describe las reglas previstas.
La validación de JSON no reemplaza la revisión semántica ni la aprobación humana.

## Uso local

Validar y generar reportes requiere Node 22 o posterior, sin `npm install`.

Desde la raíz del kit:

`node .claude/contracts/output/validate.mjs .claude/skills/qa-ranger-plan-pruebas/contracts/examples/qa-ranger-plan-pruebas-completo.json --project-root .`

La salida contiene `{valid, result, validationScope}` si es válida. En caso contrario,
`{valid: false, errors}`. El exit code 0 expresa validez del contrato, no aprobación
de una entrega o de un release. La skill omite `metrics`. El host conserva el
`result` normalizado. Sin ejecución del validador, nadie lo presenta como verificado.

El host lee el campo obligatorio `resultsRoot` de `contracts/output-contract.json`
de la skill. Una skill sin ese campo no declara un contrato consumible por el host.
Las siete skills QA declaran `"resultsRoot": "resources/qa/contracts"`, relativo al
proyecto. El host crea `<resultsRoot>/<runId>/` y le indica al agente el archivo
exacto de cada invocación; `reports/` conserva los reportes humanos y de los runners.
Los archivos se nombran `<capabilityId>-<n>.json`. Sin host, el agente continúa
desde el `n` más alto de esa skill en la carpeta. Para validar un archivo suelto,
`--run-result` exige que el nombre coincida con el `capabilityId` del contenido:

```powershell
node .claude/contracts/output/validate.mjs resources/qa/contracts/<runId>/qa-ranger-plan-pruebas-1.json --project-root . --run-result --expected-capability-id qa-ranger-plan-pruebas
```

`--expected-capability-id` rechaza un resultado válido de otra skill.
`--expected-deliverables test_plan` conserva un encargo de solo plan.
`--expected-task` corrobora la tarea
encargada: una ejecución no puede cerrarse cambiándola por un reporte.
Para una corrida, `--expected-evidence-policy <politica.json>` corrobora que
`data.evidencePolicy` coincida con la política que el host pasó a la skill.
El archivo contiene `{level, required, override}`. Véase [delegación y evidencia](../../skills/ranger/references/qa-output.md#política-de-evidencia-y-delegación).

En el plan, si no hay requisitos disponibles, la salida conserva las preguntas
en `pending`, con `data: null` y `artifacts: []`. El validador rechaza entregables
en ese estado aunque el JSON no declare casos.

Ejemplos ficticios ejecutables:
[`ranger-unitarias`](../../skills/ranger/contracts/examples/ranger-unitarias.json),
[`ranger-ejecucion`](../../skills/ranger/contracts/examples/ranger-ejecucion.json),
[`qa-ranger-plan-pruebas-completo`](../../skills/qa-ranger-plan-pruebas/contracts/examples/qa-ranger-plan-pruebas-completo.json) y
[`qa-ranger-plan-pruebas-sin-requisitos`](../../skills/qa-ranger-plan-pruebas/contracts/examples/qa-ranger-plan-pruebas-sin-requisitos.json).
Cada ejemplo se nombra `<capabilityId>-<caso>.json`, con la skill que lo produce.

Comprobaciones:

```powershell
node --test
```

## Distribución y adaptación

Distribuir este paquete junto con las skills QA y sus contratos. Para integrar otra
skill, definir su contrato y un script con `validateInvocation(value, artifacts,
checks, {projectRoot, expectedEvidencePolicy, expectedTask, expectedDeliverables, expectedScope})` que devuelve las observaciones de métricas. Registrar
la ruta del script bajo su `capabilityId` en `validators.json` y agregar casos de
aceptación. El registro es configuración mantenida del paquete: nunca se toma
una ruta de código del JSON entregado por la skill. El host corrobora la identidad y
conserva un resultado por invocación de skill, aunque se repita la misma skill.

Las reglas QA y el generador del reporte se movieron de `skills/ranger/scripts/` a este
paquete. Una copia anterior de `generate-execution-report.mjs` fuera del kit falla al
no encontrar el renderer: invoca `.claude/contracts/output/generate-execution-report.mjs`.

La versión 0.1.0 está en desarrollo. La integración con PAP requiere un
adaptador que reciba, valide y almacene estos resultados.

Para comprobar todas las invocaciones del host, ejecuta `validate-run.mjs` con
un manifiesto externo a la carpeta de resultados. Véase [correlación del host](../../skills/ranger/references/qa-output.md#correlación-del-host).
Esta comprobación detecta resultados faltantes y archivos que el host no asignó.

## Autocorrección con el hook Stop

[`hooks/stop.mjs`](hooks/stop.mjs) se declara en `.claude/settings.json` del proyecto.
Claude Code y GitHub Copilot CLI leen ese mismo archivo; se verificó en vivo con
Claude Code 2.1.292 y Copilot CLI 1.0.92, ambos en modo `-p`.

- Al terminar cada turno valida los JSON nuevos o modificados de las carpetas
  `resultsRoot` de las skills instaladas. Recuerda los válidos en
  `.claude/.validacion-hook` (archivo local, ignorado por git).
- Si alguno es inválido, bloquea el cierre con la lista de errores y el agente sigue
  con ese mensaje. Avisa hasta 3 veces por sesión y luego deja terminar, para no
  entrar en un bucle (Copilot CLI corta solo a los 8 bloqueos; Claude Code no tiene tope).
- Sin resultados nuevos no hace nada. Un error propio del hook nunca interrumpe la sesión.
- El host sigue siendo quien acepta la entrega. VS Code con Copilot solo lee
  `.claude/settings.json` si se activa `chat.useClaudeHooks`.
- El hook no es un gate de CI. Comprueba que la entrega sea válida, no que las pruebas
  hayan pasado: una entrega válida puede recomendar `NO-GO`. Que el hook deje terminar
  el turno, también tras agotar los avisos, no acredita que la entrega esté aceptada.
  En CI, el pipeline falla por el runner o por `--fail-on-no-go` del generador del reporte.

Los errores de estructura llegan juntos (hasta 20); las reglas de dominio informan el
primero que encuentran.

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
`validateResult(json, {projectRoot, expectedCapabilityId, expectedTask,
expectedEvidencePolicy, expectedDeliverables, expectedScope})`
desde `validate.mjs`. `projectRoot` identifica el proyecto y sus artefactos.

## Regeneración del validador standalone

`schemas/result.schema.json` es la única fuente del schema. Ajv standalone compila
el resultado.
El generado se empaqueta como ESM y se versiona sin importaciones externas.
Ajv, ajv-formats y esbuild son dependencias de desarrollo, solo para regenerar:

```powershell
cd .claude/contracts/output
npm ci --ignore-scripts
npm run generate
```

`node --test` comprueba el SHA-256 del schema contra el generado y falla si quedó
viejo. Al modificar el schema, regenera y versiona ambos archivos. No se necesita
instalar estas dependencias para validar ni para ejecutar los tests de contrato.

Los plugins de validación exportan `validateInvocation(value, artifacts, checks, opts)`:
`artifacts` y `checks` son `Map` indexados por ID; `opts.projectRoot` permite leer
reportes de máquina del proyecto. La función puede ser asíncrona.

## Pruebas y representación de datos

Las pruebas `node:test` usan los ejemplos de cada skill y casos construidos en los
tests para verificar cierre, correlación del host, evidencia, métricas y reportes.
No requieren snapshots externos. Los códigos CLI son 0 para validación satisfactoria,
1 para entrada inválida y 2 para uso incorrecto. `contractVersion` sigue en `0.1.0`.

El host debe considerar estas reglas de representación:

- Node rechaza valores enteros fuera de ±9.007.199.254.740.991, tanto al leer JSON
  como al validar objetos. Se
  rechazan explícitamente para evitar que `covered > total` quede oculto por
  redondeo. Es una limitación de representación del runtime; no se modificó el schema.
- Los mensajes de errores de lectura, sintaxis JSON y uso incorrecto de la CLI
  provienen del runtime Node o del parser contractual;
  conservan la forma JSON y el código de salida correspondientes a la validación.
  Los errores de uso CLI siguen escribiéndose en stderr con código 2.
- Un objeto creado con `JSON.parse` ya perdió la distinción entre tokens `1`,
  `1.0` y `1e0`. Para conservar la distinción entre enteros y floats en conteos, usa
  `readJSON(file)` o `parseJSON(text)` de `rules.mjs` y pasa el objeto directamente
  a `validateResult`. La CLI y `validateRun` ya usan esa lectura estricta.

El reporte usa los saltos de línea de la plataforma:
CRLF al guardar en Windows y LF en otras plataformas. La función `render` devuelve LF.

`schemas/result.validate.mjs` incluye en un comentario los avisos de licencia de
las herramientas y helpers utilizados. No instala ni carga paquetes al validar.

El manifiesto admite `expected: [{id, project, priority}]` para fijar el alcance
acordado de la corrida. `validateResult` recibe esa lista como `expectedScope`,
y la CLI como `--expected-scope <casos.json>`. El resultado debe conservar los
casos, proyectos y prioridades; no puede reducir el alcance para completar.
