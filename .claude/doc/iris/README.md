# Iris — documentación funcional y técnica

> Skill documentada: `iris`. Fuente de verdad: `.claude/skills/iris/`.
> Plan de construcción original (histórico, arquitectura descartada — no es fuente de verdad
> del comportamiento actual): [historico-plan-descartado.md](historico-plan-descartado.md).

## ¿Para qué es?

`iris` convierte requerimientos, historias de usuario, criterios de aceptación, procesos de
negocio, artefactos de Event Storming, entidades, APIs, pantallas existentes, sistemas de
diseño, capturas de pantalla, arquitecturas de agentes, documentación o código en una
**arquitectura de UX completa, documentada, trazable y validada**. Actúa como Principal UX,
Senior Product Designer, Interaction Designer, Conversational UX Designer, Design Systems
Architect, UX Researcher y UX Engineer — transforma evidencia del sistema en arquitectura de
UX; no empieza dibujando pantallas.

Principios centrales de la skill actual:

- **Iris diseña UI/UX; no re-documenta el dominio.** Si actores, entidades, comandos o eventos
  ya están descritos en Event Storming, un modelo de datos, o cualquier otra fuente del
  repositorio, los referencia por `Source ID` en lugar de reescribirlos.
- **Markdown es la única fuente de verdad editable por humanos.** Usa Mermaid, tablas y YAML
  frontmatter opcional solo cuando aporte; nunca exige un modelo de diseño paralelo en JSON
  (a diferencia de la arquitectura Node/JSON que tenía la skill antes del commit `874e89a`).
- Separa explícitamente Business Process, User Flow, Interaction Flow, Conversation Flow, UI
  State Flow y System/Agent Flow.
- Da a cada artefacto importante un ID canónico estable con trazabilidad bidireccional,
  incluida pantalla ↔ entidad de datos y pantalla ↔ evento.
- No declara completitud solo porque existen documentos: ejecuta los gates y el validador
  determinista antes de afirmar un estado.

## ¿Cuándo usarla?

Usar `iris` para: arquitectura de UX, diseño de producto e interacción, UX conversacional o de
IA, user flows, edge cases, arquitectura de información, inventarios y especificaciones de
pantallas, wireframes de baja fidelidad, mapeo de sistemas de diseño, UX review, cobertura de
diseño, trazabilidad de requerimientos a UI, y prototipos funcionales de UX.

`SKILL.md` fija un límite explícito de responsabilidad: **Iris diseña UI/UX; no re-documenta el
dominio** — si el dominio (actores, entidades, comandos, eventos) ya está descrito en Event
Storming o en un modelo de datos, Iris cita esa fuente y agrega solo el delta de UX, en vez de
generar una segunda copia narrativa. La skill no declara de forma explícita una lista de "no
usar para X"; el propio contenido de `SKILL.md` y de `references/` no menciona límites
funcionales adicionales fuera de ese principio de no-duplicación.

Selecciona uno de cuatro modos de operación (ver [workflow.md](../../skills/iris/references/workflow.md)):

- **Modo Arquitectura** (por defecto para solicitudes de análisis/inventario): casos de uso,
  user flows, rutas, edge cases, estrategias de interacción, inventarios, trazabilidad, reporte
  de brechas y validación de cobertura.
- **Modo Diseño** (por defecto para solicitudes de diseño de UX): todo lo anterior más
  requerimientos de información, especificaciones de pantalla, wireframes de baja fidelidad,
  UX reviews por etapa y mapeo de sistema de diseño.
- **Modo Build** (cuando la UX va a construirse): entrega del sistema de diseño como contrato —
  tokens W3C (`03-design-system/tokens/*.tokens.json`), manifiesto de assets de marca,
  `### Implementation` por componente, plantillas de página y reporte de deriva contra el
  código; habilita el estado `READY FOR BUILD`. Disponible también vía el agente `iris`.
- **Modo Prototipo** (solo cuando el usuario lo pide explícitamente y los gates pasan): todo lo
  anterior más un prototipo funcional, estados de interacción, datos simulados y validación de
  prototipo.

## Prerrequisitos

### Funcionales

- Evidencia de origen sobre la que trabajar (requerimientos, HU, Event Storming, modelo de
  datos, pantallas existentes, código, etc.); Iris no fabrica requerimientos, problemas,
  branding ni superficies CRUD sin evidencia.
- Inspección previa del repositorio: `AGENTS.md`, skills existentes, requerimientos, Event
  Storming, plantillas reutilizables, convenciones de Markdown, scripts, sistema de diseño,
  frontend y pruebas — paso obligatorio antes de escribir cualquier artefacto.
- Selección (explícita o inferida) del modo de operación: Arquitectura, Diseño o Prototipo.
- Un nombre de proyecto/iniciativa para nombrar el subdirectorio de salida
  (`resources/design/ux/<proyecto>/`).

### Técnicos

- Python 3 para ejecutar `scripts/validate_ux_docs.py`. El script solo usa librería estándar
  (`argparse`, `re`, `dataclasses`, `pathlib`, `typing`, `urllib.parse`) — no declara ni
  requiere dependencias externas, y se confirmó ejecutable localmente
  (`python .claude/skills/iris/scripts/validate_ux_docs.py --help` responde con las opciones
  documentadas abajo).
- No requiere Node.js, JSON Schema, ni ninguna herramienta de compilación adicional — a
  diferencia de la arquitectura anterior (`validate-iris.mjs`), que sí dependía de Node.js.
- No hay dependencia de red, MCP ni conector remoto para el flujo base.

## Entradas

| Entrada | Uso |
|---|---|
| Requerimientos, HU, criterios de aceptación, procesos de negocio | Evidencia base a transformar en casos de uso, user flows y pantallas. |
| Artefactos de Event Storming (`ES-*`, `OP-0XX`) | Fuente principal de actores, entidades, comandos, eventos y problemas/oportunidades; se cita por `Source ID`, nunca se reescribe. |
| Modelo de datos físico (DDL, diccionario de datos) | Se reconcilia contra las entidades de Event Storming como una suma: toda entidad encuentra su tabla y viceversa. |
| APIs, pantallas existentes, sistemas de diseño, capturas de pantalla | Evidencia de UI/contrato ya implementada, referenciada en vez de inferida. |
| Arquitecturas de agentes, documentación o código | Evidencia para Modo Arquitectura/Prototipo sobre sistemas ya construidos. |
| Documentos Iris ya generados (`resources/design/ux/<proyecto>/`) | Reconciliación: Iris relee directamente el árbol Markdown existente; no existe un manifiesto de estado separado (ver "Capacidades pendientes"). |

En el único proyecto real que ya usó Iris en este repositorio (`resources/design/ux/octo-hr/`),
las entradas reales documentadas en su `README.md` fueron: los 25 requerimientos funcionales de
`resources/functional/requests/RF-0XX-*.md` (salida de `janus`), el Event Storming de
`resources/functional/eventstorming/` (`ES-002`, `ES-009`, `ES-015`, etc.), los modelos de
diseño de `resources/design/models/RD-0XX-*.md` (salida de `janus`), y el modelo de datos
físico de `resources/architecture/16.02-Modelo-de-Datos_CT-02_Backend-API.md` +
`16.02.1-Schema_DATA-001-013_CT-02.sql` (salida de `archi`).

## Parámetros

### De la sesión

`SKILL.md` no define una tabla formal de parámetros configurables (a diferencia de la skill
anterior, que exponía `modo`, `perfil de entrega` y `output root` como parámetros explícitos).
Los únicos parámetros de sesión observables en la fuente de verdad actual son:

| Parámetro | Valores | Comportamiento |
|---|---|---|
| Modo de operación | Arquitectura, Diseño, Prototipo | Diseño por defecto para solicitudes de diseño de UX; Arquitectura por defecto para análisis/inventario; Prototipo solo si se solicita explícitamente y los gates pasan. |
| Directorio de salida | `resources/design/ux/<proyecto>/` | Fijo por convención del repositorio; `SKILL.md` indica explícitamente no usar `docs/` en la raíz. No se documenta una ruta alternativa configurable. |

### Del validador

```powershell
python .claude/skills/iris/scripts/validate_ux_docs.py <ux_root> [--mode {architecture,design,prototype}] [--report REPORT] [--strict-warnings]
```

| Opción | Descripción |
|---|---|
| `ux_root` (posicional, requerido) | Ruta a la raíz de la arquitectura de UX a validar, p. ej. `resources/design/ux/<proyecto>`. |
| `--mode {architecture,design,prototype}` | Selecciona qué artefactos y reglas son obligatorios; por defecto `design`. |
| `--report REPORT` | Escribe los hallazgos como un reporte Markdown de brechas en la ruta indicada. **Advertencia operativa (ver nota interna del equipo):** nunca apuntar esta ruta al `05-validation/gaps.md` real de un proyecto — el script sobrescribe completamente el archivo destino y `gaps.md` normalmente contiene contenido redactado a mano que esa sobrescritura destruiría. |
| `--strict-warnings` | Hace que el proceso retorne código de salida distinto de cero también cuando solo hay warnings (por defecto solo los `Error` afectan el exit code). |
| `-h`, `--help` | Muestra la ayuda del CLI. |

El validador no modifica los artefactos que valida (solo escribe el archivo de `--report` si se
indica), no requiere red, y su exit code es `1` si hay errores (o si hay warnings y se pasó
`--strict-warnings`), `0` en caso contrario.

## Proceso que aplica

Iris ejecuta una secuencia obligatoria de 30 pasos documentada íntegramente en
[workflow.md](../../skills/iris/references/workflow.md). En resumen:

1. **Descubrimiento y contexto** — entender requerimientos, inventariar evidencia existente,
   identificar actores, normalizar requerimientos, identificar entidades/relaciones de datos, y
   mapear comandos/eventos/agregados/políticas/hotspots de Event Storming.
2. **Casos de uso y flujos** — definir casos de uso, generar user flows end-to-end, rutas
   felices por caso de uso prioritario, rutas alternativas, edge cases, rutas de falla y
   recuperación.
3. **Estrategia e información** — definir y justificar la estrategia de interacción
   (Conversacional / Estructurada / Híbrida) por caso de uso y pantalla, y los requerimientos de
   información (fuente, destino, validación, editabilidad, asistencia de IA).
4. **Inventario y pantallas** — generar el inventario ligero de pantallas/superficies, crear un
   archivo fuente único por pantalla en `02-ui-architecture/screens/`, validar cobertura y
   ausencia de duplicados, y completar la especificación de cada pantalla.
5. **Mapeo y wireframes** — mapear acción de usuario → comando → agregado → evento →
   feedback/estado de UI, y generar wireframes de baja fidelidad.
6. **Revisión** — ejecutar UX review, resolver hallazgos Critical/High o justificarlos, y
   definir/mapear fundamentos, componentes y patrones del sistema de diseño.
7. **Trazabilidad y cierre** — actualizar la trazabilidad bidireccional (incluida la matriz Caso
   de Uso × Evento), ejecutar el Design Coverage Gate, generar el prototipo solo si se solicitó
   y pasó el gate, ejecutar el Final UX Review, re-ejecutar validación de trazabilidad y
   cobertura, reportar solo las brechas no resueltas, y generar el resumen final de validación.

Para un encargo nuevo o incierto, Iris implementa primero una **rebanada vertical** (un
Requerimiento → Caso de Uso → User Flow → Ruta Feliz → Edge Cases → Estrategia de Interacción →
Inventario de Pantallas → una Especificación de Pantalla → Wireframe → UX Review →
Trazabilidad → Cobertura de Diseño) antes de expandir a todas las pantallas; el proyecto
`octo-hr` documenta exactamente este patrón como "Modo Diseño parcial por rebanada vertical".

Las revisiones se ejecutan de forma incremental (`User Flow → Flow Review`,
`Especificación de Pantalla → Screen Review`, `Wireframe → Wireframe Review`,
`Prototipo → Final UX Review`), y el gate de prototipo exige que user flows, estrategias de
interacción, inventario/especificaciones de pantalla, wireframes, UX review y mapeo de sistema
de diseño estén aprobados antes de generar cualquier prototipo (ver
[validation-gates.md](../../skills/iris/references/validation-gates.md)).

## Capacidades cubiertas

### Provides incluidos

| Recurso | Propósito |
|---|---|
| `SKILL.md` | Persona, principios innegociables, flujo de trabajo y reglas de la skill. |
| `agents/openai.yaml` | Metadata de interfaz (`display_name`, `short_description`, `default_prompt`) para invocación vía agente. |
| `references/workflow.md` | Capas de diseño, modos de operación, secuencia obligatoria de 30 pasos, rebanada vertical, reviews/gate de prototipo, estrategia de interacción, búsqueda sistemática de edge cases y anti-patrones. |
| `references/artifact-conventions.md` | Convenciones de Markdown, reglas de no-duplicación de evidencia de dominio, árbol de directorios recomendado, IDs estables, encabezados canónicos, links/navegación y trazabilidad pantalla↔dato/evento. |
| `references/templates.md` | Plantillas Markdown canónicas de cada artefacto: actor/entidad/requerimiento de referencia, caso de uso, user flow, edge case, estrategia de interacción, inventarios, especificación de pantalla, conversation flow, componente, hallazgo de UX, matrices de trazabilidad y cobertura, brecha, y resumen de validación. |
| `references/validation-gates.md` | UX review por dimensión, Design Coverage Gate, gate de prototipo, reglas de estado (`INCOMPLETE`/`NEEDS REVIEW`/`READY FOR PROTOTYPE`/`UX COMPLETE`) y Definition of Done. |
| `scripts/validate_ux_docs.py` | Validador determinista en Python (sin dependencias externas) de IDs duplicados/huérfanos, encabezados canónicos, links relativos rotos, numeración de secciones de pantalla, y cobertura de comandos/eventos. |

No existen actualmente `assets/`, `templates/` (directorio de esqueletos listos para copiar) ni
archivos de prueba automatizada dentro de `.claude/skills/iris/` — las plantillas viven
únicamente como fragmentos Markdown embebidos en `references/templates.md`.

### Tools utilizados

- Sistema de archivos y búsqueda de contenido del repositorio (para el inventario de evidencia
  previo a cualquier escritura).
- Python 3 (solo librería estándar) para ejecutar `validate_ux_docs.py`.
- Markdown y diagramas Mermaid como único mecanismo de representación; no se requiere un motor
  de renderizado ni herramienta de compilación adicional.
- No se requiere ningún MCP, conector remoto o servicio externo para el flujo base.

## Capacidades pendientes por construir

No existe un roadmap versionado dentro de la skill. Los siguientes vacíos son observables
directamente en el contenido actual de `.claude/skills/iris/` y en cómo el resto del repositorio
la referencia:

| Prioridad | Capacidad | Estado actual |
|---:|---|---|
| Alta | Enrutamiento general | `orquestador.agent.md` está retirado del working tree. No existe una regla automática global hacia Iris; su invocación depende de que el usuario o la sesión llamadora la seleccione directamente. |
| Media | Manifiesto de estado persistente | A diferencia de la arquitectura anterior (`iris-project.json`) o de otras skills del repositorio (p. ej. `resources/.vulcano/manifest.yaml` de `vulcano`), Iris no mantiene un manifiesto de sesión separado; la reconciliación entre corridas depende de releer directamente el árbol Markdown ya generado bajo `resources/design/ux/<proyecto>/`. |
| Media | Pruebas automatizadas del validador | `scripts/` solo contiene `validate_ux_docs.py` (y su caché de bytecode); no hay un archivo de pruebas de regresión equivalente al `test-validate-iris.mjs` de la arquitectura anterior. |
| Baja | Salida estructurada del validador | `validate_ux_docs.py` solo soporta salida de texto por stdout y un reporte Markdown opcional vía `--report`; no ofrece un modo `--json` para integraciones automatizadas. |
| Baja | Esqueletos de plantilla listos para copiar | Las plantillas de `references/templates.md` son fragmentos de referencia dentro de un documento; no existe un directorio `templates/` con archivos `.md` individuales para instanciar directamente. |

## Salidas / outputs

Iris genera todos los artefactos bajo `resources/design/ux/<proyecto>/` en la raíz del
repositorio (nunca bajo `docs/`), con esta numeración secuencial (`06-prototype/` solo se crea
en Modo Prototipo):

```text
resources/design/ux/<proyecto>/
├── README.md
├── 01-context/
│   ├── actors.md
│   ├── entities.md
│   └── assumptions.md
├── 02-ui-architecture/
│   ├── screen-inventory.md
│   └── screens/
│       └── SCR-001-<slug>.md
├── 03-design-system/
│   ├── foundations.md
│   ├── components.md
│   ├── patterns.md
│   ├── ai-components.md
│   ├── tokens/                  # Modo Build: valores W3C Design Tokens
│   │   └── <paquete>.tokens.json
│   └── brand/                   # Modo Build: manifiesto de assets de marca
│       └── assets.md
├── 04-ux-review/
│   ├── ux-findings.md
│   └── final-review.md
├── 05-validation/
│   ├── traceability-matrix.md
│   ├── design-coverage.md
│   ├── gaps.md
│   └── validation-summary.md
└── 06-prototype/
    └── prototype-notes.md
```

`use-cases.md` y `requirements.md` en `01-context/` son condicionales: `artifact-conventions.md`
indica crearlos solo cuando la fuente de requerimientos no traiga ya prioridad/actor/
trazabilidad, o cuando la relación requerimiento↔caso de uso no sea 1:1; en caso contrario, ese
contenido mínimo se coloca dentro de `05-validation/traceability-matrix.md`.

### Ejemplo real generado en este repositorio

Existe un proyecto real que ya usó Iris: `resources/design/ux/octo-hr/` (38 archivos Markdown).
Su estructura confirma y extiende la convención canónica:

- Sigue exactamente el árbol `01-context/` → `02-ui-architecture/` → `03-design-system/` →
  `04-ux-review/` → `05-validation/`; no llegó a crear `06-prototype/` porque el proyecto está en
  "Modo Diseño parcial por rebanada vertical", no en Modo Prototipo.
- No tiene `use-cases.md` ni `requirements.md` separados: los 24 `RF-0XX` fuente ya declaran
  prioridad/actor/trazabilidad, así que el bloque mínimo de casos de uso (`UC-001` a `UC-024`)
  vive dentro de `05-validation/traceability-matrix.md`, tal como prescribe
  `artifact-conventions.md`.
- Tiene 27 archivos `SCR-XXX-<slug>.md` bajo `02-ui-architecture/screens/` (numerados hasta
  `SCR-038`, con huecos por pantallas retiradas del inventario) más un
  `screens/architecture-backlog.md` transitorio para las pantallas aún no separadas en su propio
  archivo — uso explícitamente permitido por `SKILL.md` durante una migración.
- Agrega `05-validation/test-scenarios.md`, un archivo no listado en el árbol canónico de
  `artifact-conventions.md`, como extensión real del proyecto para los 53 `TST-0XX`.
- `05-validation/validation-summary.md` declara el `Final Status` como `INCOMPLETE` (no
  `UX COMPLETE` ni `READY FOR PROTOTYPE`), con brechas High abiertas documentadas en `gaps.md`
  (hasta `GAP-065` a la fecha de esta revisión).

## Evidencia de validación

**Sin evidencia persistida de ejecución contra el proyecto a la fecha (2026-09-10).** No existe ningún
log, artefacto versionado o mensaje de commit que capture una corrida real de
`validate_ux_docs.py` (conteo de errores/warnings, timestamp, modo usado) para `octo-hr` ni para
ningún otro proyecto.

Lo único encontrado es una afirmación en prosa dentro del documento hecho a mano
`resources/design/ux/octo-hr/05-validation/validation-summary.md`: *"La validación
determinista de la versión Iris del repositorio pasa en Modo Diseño con 0 errores (1 warning de
longitud en SCR-002, aceptado explícitamente)."* Esto es una declaración editorial del propio
documento generado por la skill, no una salida capturada y verificable del validador con
timestamp — no debe tratarse como evidencia de ejecución real.

Tampoco existe un reporte Markdown generado por `--report`: el `05-validation/gaps.md` real de
`octo-hr` es evidentemente redactado a mano (encabezados descriptivos como
`## GAP-001 — ~~Fuente de verdad de Banda Salarial no definida~~ (Resuelto)`, con narrativa,
"Evidencia de resolución" y "Required Resolution" por brecha) y no coincide con el formato que
produce `write_report()` en `validate_ux_docs.py` (que emite entradas mecánicas del tipo
`## GAP-{índice} — {código_de_hallazgo}`, p. ej. `GAP-001 — SCREEN_OUTSIDE_SOURCE_DIR`). Esto es
consistente con que el flag `--report` de este validador es destructivo si se apunta al
`gaps.md` real de un proyecto (sobrescribe el archivo completo) y por tanto no debe usarse así
en este repositorio.

Se verificó únicamente que el propio CLI es ejecutable en este entorno:
`python .claude/skills/iris/scripts/validate_ux_docs.py --help` respondió con las opciones
documentadas en la sección "Del validador" arriba, usando solo librería estándar de Python. No
se ejecutó el validador contra `resources/design/ux/octo-hr` como parte de este trabajo de
documentación, precisamente para no arriesgar una escritura accidental sobre contenido
hecho a mano.

## Relación con otras skills

| Skill | Relación confirmada en la fuente de verdad |
|---|---|
| `storming` | Fuente principal de dominio. `SKILL.md` y `references/artifact-conventions.md` instruyen citar por `Source ID` los actores, entidades, comandos, eventos y problemas/oportunidades (`OP-0XX`) ya descubiertos mediante EventStorming, en vez de re-documentarlos. En `octo-hr`, las fuentes reales están en `resources/functional/eventstorming/` (`ES-002`, `ES-009`, `ES-015`, etc.). |
| `janus` | `SKILL.md` cita explícitamente la convención de directorio compartida (`resources/functional/` para `janus`). En la práctica (`octo-hr`), Iris consumió los 25 requerimientos `RF-0XX` de `resources/functional/requests/` y los modelos de diseño `RD-0XX` de `resources/design/models/`, ambas rutas producidas por `janus`. |
| `archi` | `SKILL.md` cita la convención compartida (`resources/architecture/` para `archi`). En la práctica, Iris reconcilió el modelo de datos físico de `archi` (`16.02-Modelo-de-Datos...`) contra las entidades de Event Storming, cerrando preguntas abiertas de origen de datos. |

No se encontró ninguna mención a `epicureo`, `specter` o `ranger` dentro de
`.claude/skills/iris/` (`SKILL.md` ni `references/`) — cualquier relación con esas skills no
está documentada en la fuente de verdad actual y no debe asumirse.

`.claude/agents/orquestador.agent.md` está retirado del working tree: hoy no existe una regla de
enrutamiento automático global hacia Iris. La skill se selecciona directamente y entrega sus
handoffs a la sesión llamadora (ver "Capacidades pendientes por construir").
