---
name: specter
metadata:
  display-name: "Planificador de historias"
  capability: "Desglose en historias"
  capability-summary: "Desglosa necesidades en historias de usuario y tareas técnicas trazables, con Quality Gate."
description: >
  Desglosa una épica o un requerimiento en historias de usuario y tareas técnicas completas,
  atómicas, trazables, consistentes, verificables e implementables, con criterios de aceptación
  en Gherkin, contrato formal HU/TT (JSON Schema 2020-12) y Quality Gate determinista. Usa esta
  skill SIEMPRE que el usuario mencione épicas de Jira, work items de Azure DevOps, quiera
  descomponer requerimientos en historias, crear user stories, hacer breakdown de features,
  generar tareas desde una épica, o diga cosas como "desglosa esta épica", "separa en historias",
  "crea las tareas para la épica X", "analiza la épica PROJ-123" o "genera historias de usuario".
  También aplica cuando el usuario mencione claves de Jira (ej. ABC-42) en el contexto de
  planificación o descomposición.
---

# Specter — Desglose de épicas en historias y tareas técnicas

Specter transforma una épica o un requerimiento en un desglose estructurado y **trazable**:
historias de usuario (HU) con criterios de aceptación verificables y tareas técnicas (TT) con su
objetivo, alcance, contratos, pasos y definición de terminado. No decide arquitectura (`archi`),
no implementa (`builder`) y no prueba (`ranger`).

La versión 1.0 de esta skill está preservada en `SKILL-v1.0.md`; esta versión 2.0 añade
contratos formales, trazabilidad y un Quality Gate determinista sin romper el flujo de entrada
(Jira o Markdown) ni la salida que consumen `builder` y `ranger`.

---

## Principio rector: artefacto canónico con contrato

Cada HU y TT se materializa como **Markdown con frontmatter YAML** conforme a su contrato:

- HU → `contracts/user-story.schema.json` (`$id: urn:kit-ia:specter:0.1.0:user-story`)
- TT → `contracts/technical-task.schema.json` (`$id: urn:kit-ia:specter:0.1.0:technical-task`)

El frontmatter es el contrato verificable; el cuerpo Markdown conserva la forma legible que ya
consumen `builder` (Como/Quiero/Para, Criterios de Aceptación, Recurso de datos involucrado) y
`ranger` (criterios derivables a Gherkin/checklist). El Quality Gate valida el frontmatter con
`scripts/quality_gate.mjs` (determinista, sin LLM).

---

## Paso 0 — Solicitar la fuente de entrada

Pregunta siempre al iniciar:

> **¿Cuál es la fuente de la épica a analizar?**
> - **ID de Jira** — ingresa la clave de la épica (ej. `PROJ-123`)
> - **Archivo Markdown** — ingresa el nombre del archivo `.md` (se buscará en `resources/functional/reqs/`)

Si el usuario escribe solo un nombre de archivo, asume `resources/functional/reqs/<nombre>.md`.
Si el usuario ya proporcionó una fuente en su mensaje, úsala sin preguntar.

---

## Fase 1 — Discovery & Context

Obtén la épica (Jira por MCP, o el Markdown) y reconstruye el **contexto** sin inventar nada:

1. **Épica:** título, descripción completa, labels/componentes, issues hijos existentes, campos
   relevantes (Story Points, Team).
2. **Requisitos de origen:** busca en `resources/functional/requests/` los `RF-###`, `RNF-###`,
   `RT-###` citados o relacionados con la épica, y en `resources/functional/reqs/` las specs
   refinadas de `epicureo`. Regístralos como `requirement_ids` / `source_artifact_ids`.
3. **Dominio:** si existe, lee `resources/functional/eventstorming/` para los bounded contexts,
   actores y reglas que `storming` ya validó.
4. **Arquitectura existente:** si el repositorio ya tiene `resources/architecture/` o código, úsalo
   solo como restricción (componentes, stack, contratos). **No decidas arquitectura**: si el
   desglose la exige, déjala señalada como pendiente y derívala a `archi`.
5. **Restricciones y dependencias:** tecnologías, integraciones, seguridad y orden de ejecución
   que la fuente declare.

El resultado de esta fase es un contexto interno; no se escribe a disco salvo que lo pida el
usuario.

---

## Fase 2 — Requirement Analysis

Escanea la fuente y clasifica cada dato en una de estas categorías (persistirlas en
`assumptions`, `open_questions` o el cuerpo según corresponda):

| Categoría | Significado | Tratamiento |
|---|---|---|
| Confirmado | Dicho expresamente en la fuente | Se incorpora tal cual |
| Inferido | Conclusión necesaria pero no textual | Se marca `[INFERIDO]` y se lista en `assumptions` |
| Asumido | Supuesto para avanzar | Se lista en `assumptions` con prefijo `[SUPUESTO]` |
| Pendiente | Falta información | Se registra en `open_questions`; nunca se inventa |

Detecta y presenta (máximo 5 preguntas por ronda):

- **Tecnologías sin versión** (Java, Spring Boot, React, Node, Python, .NET, Angular, motores BD).
- **Rendimiento sin métrica** ("rápido", "baja latencia") → pedir umbral (p. ej. p95 < 300 ms).
- **Escala sin número** ("muchos usuarios") → pedir cifra.
- **Seguridad genérica** ("debe ser seguro") → pedir mecanismo (JWT, OAuth2, SAML…).
- **Integraciones sin endpoint/contrato** → pedir tipo (REST, SOAP, evento) y contrato.
- **Roles sin definir** → ¿el rol ya existe o hay que crearlo?
- **Contradicciones y duplicidades** → señalarlas; no resolverlas en silencio.
- **Requisitos incompletos o sin criterio de éxito** → marcarlos.

Redacta los requisitos clave en **EARS** (ver `references/ears.md`) para que cada requisito tenga
un disparador y una respuesta verificables. Nunca conviertas una inferencia en un requisito
confirmado.

---

## Fase 3 — Story Decomposition (HU)

Genera las HU aplicando **INVEST**:

- **I**ndependiente: se puede desarrollar y probar sin acoplarse a otra HU.
- **N**egociable: el alcance se puede ajustar.
- **V**aluable: tiene valor de negocio explícito (`business_value`).
- **E**stimable: `points` (1,2,3,5,8,13) justificable.
- **S**mall: completable en un sprint; si supera 8–13 puntos, dividirla.
- **T**esteable: criterios de aceptación verificables.

Para cada HU, completa el frontmatter conforme a `contracts/user-story.schema.json` y el cuerpo:

- `id`, `title`, `user_story` (role/action/benefit), `business_value`.
- `scope` (`included`/`excluded`) para delimitar el alcance.
- `business_rules`, `preconditions`, `main_flow`, `alternative_flows`, `exceptions`.
- `acceptance_criteria`: cada criterio con `id` único y `scenario` Gherkin **o** `given/when/then`;
  añade `negative: true` y `requirement_ids` cuando corresponda (ver `references/breakdown-guide.md`).
- `dependencies`, `nfr_references`, `test_references`, `assumptions`, `open_questions`.
- `priority`, `points`, `status` inicial (`draft`).

**Recurso de datos involucrado:** inclúyelo solo si la HU crea, modifica o expone una entidad.
Completa campos, tipos y relaciones **únicamente** con lo que la fuente sustente; si un dato es
necesario pero no está definido, escribe `No especificado en la épica — definir con negocio`.
Esta sección existe para que `builder` genere el scaffold sin re-preguntar.

Evita HU demasiado grandes y duplicidad funcional: si dos HU hacen lo mismo, consolida o
diferencia explícitamente el alcance.

---

## Fase 4 — Technical Decomposition (TT)

Por cada HU que requiera implementación, descompón las TT conforme a
`contracts/technical-task.schema.json`:

- `id`, `parent_hu_id` (obligatorio; solo `null` si es un habilitador de épica, con `epic_id` y
  justificación), `title`.
- `technical_objective`: qué se logra y por qué.
- `component`, `architecture_layer`: solo si la fuente los respalda; si no, `null` (el gate lo
  marcará `needs_refinement`).
- `implementation_scope`, `file_boundaries`, `implementation_steps`.
- `api_contracts`, `data_contracts`: contratos afectados, sin inventarlos.
- `security_considerations`, `dependencies`, `test_strategy`.
- `definition_of_done` y `evidence_requirements`: verificables, no frases genéricas.

Las TT son habilitadores técnicos (migración BD, CI/CD, endpoint base, integración sin UI), **no**
se mezclan con HU. Consulta `references/breakdown-guide.md` → "HU vs TT" y los patrones.

---

## Fase 5 — Traceability & Quality Gate

Antes de dar por terminado el desglose:

1. Construye la cadena: **RFP → RF/RNF/RT → ÉPICA → HU → TT → TC → Evidencia**.
2. Verifica con `scripts/traceability.mjs` que no queden: requisito sin HU, HU sin origen, HU sin
   TT cuando requiere implementación, TT sin HU padre, CA sin escenario, referencias rotas.
3. Ejecuta el gate:

   ```bash
   node .claude/skills/specter/scripts/quality_gate.mjs \
     --root . --hu resources/functional/hu/hu-XX-*.md --tt resources/functional/hu/tt-XX-*.md
   ```

4. El gate devuelve por artefacto: `score` (0-100), `status` (`READY` | `NEEDS_REFINEMENT` |
   `BLOCKED`), reglas superadas/fallidas con severidad, evidencia y recomendación. Si un artefacto
   no es `READY`, corrígelo o registra la justificación; **no declares listo lo que el gate
   rechaza**.

---

## Guardar el desglose

Antes de persistir, pregunta **siempre** al usuario el destino (no asumas Markdown):

> **¿Dónde creo las historias y tareas?**
> 1. **Markdown** — un `.md` por artefacto en `resources/functional/hu/`.
> 2. **Jira** — crear los issues en un tablero de Jira.
> 3. **Azure DevOps** — crear los work items en un tablero de Azure DevOps.
> (Puede combinar: Markdown + tablero.)

### Destino Markdown

Crea un `.md` por artefacto en `resources/functional/hu/` (`hu-XX-slug.md`, `tt-XX-slug.md`) con el
frontmatter YAML conforme al contrato + cuerpo. La carpeta se crea si no existe. Al final, lista los
archivos creados y ejecuta el gate.

### Destino Jira

Si elige Jira y el MCP de Jira **no está conectado**, configura el servidor pidiendo **solo** las
credenciales de conexión (no las muestres ni las guardes en el repo): `JIRA_URL`, `JIRA_USERNAME` y
`JIRA_API_TOKEN`. Aplica la configuración (ver `references/mcp-boards.md`) y avisa si el cliente
requiere recargar. Antes de crear issues, confirma proyecto, tipo (Story/Task/Sub-task), assignee y
el vínculo a la épica. Orden: TT de infraestructura/setup → HU por prioridad → subtareas.

### Destino Azure DevOps

Si elige Azure DevOps y el MCP no está conectado, configura el servidor pidiendo **solo** las
credenciales de conexión: organización (`https://dev.azure.com/<organización>`) y un PAT con
permisos de Work Items. Aplica la configuración (ver `references/mcp-boards.md`) y crea los work
items. Antes de crear, confirma proyecto/team, tipo (Story/Task), área, iteración y el vínculo al
parent (épica/feature).

### Reglas de destino

- **No asumas el destino:** pregunta siempre, aunque el usuario haya usado Markdown antes.
- **No expongas secretos:** usa variables de entorno referenciadas como `${...}`; nunca las
  imprimas ni las persistas en el repo.
- **Cae a Markdown sin bloquear** si el MCP no puede configurarse (falta `uvx`/`npx`, el cliente no
  lo recarga, etc.), informando al usuario.
- Reporta los enlaces de cada issue/work item creado.

---

## Reglas de calidad y no-invención

- **No inventar:** requisitos, decisiones arquitectónicas, campos de datos, rutas de archivos ni
  contratos. Usa `null`, listas vacías, `[SUPUESTO]` o `open_questions` para lo no confirmado.
- **No duplicar:** verifica issues hijos y HU existentes antes de proponer nuevos.
- **No renumerar:** los IDs históricos no se reutilizan; los nuevos continúan la secuencia.
- **Idioma:** generar siempre en español, salvo términos técnicos estándar.
- **Trazabilidad ante todo:** toda HU/TT debe tener origen explícito (`epic_id` y/o
  `requirement_ids`).

## Referencias

- `references/breakdown-guide.md` — heurísticas de descomposición (INVEST, HU vs TT, patrones, CA).
- `references/ears.md` — notación EARS para redactar requisitos verificables.
- `references/mcp-boards.md` — configuración del MCP de Jira y Azure DevOps (credenciales mínimas).
- `templates/hu.md` y `templates/tt.md` — plantillas Markdown separadas de HU y TT.
- `contracts/user-story.schema.json` y `contracts/technical-task.schema.json` — contratos formales.
- `docs/specter-2.0/` — arquitectura, contratos, gate y evaluación (documentación del proyecto).

## Registro de avance en memoria

Al terminar tu tarea, deja un nodo de avance en la memoria del proyecto (skill
[`memoria`](../memoria/SKILL.md)) con el payload mínimo
`{ "skill": "specter", "type": "avance", "title": "...", "summary": "..." }`:

    node .claude/skills/memoria/scripts/memoria.mjs record \
      --skill specter --type avance --title "..." --summary "..." \
      --file <ruta del artefacto> [--link <id-del-nodo-previo>]

O escribe ese payload como JSON en `.memoria/pending/<timestamp>.json`: el hook de Stop
lo consolida en `.memoria/graph.json` al cerrar el turno. Si la misma tarea ya tiene nodo
(mismo `skill` + `title`), actualízalo en vez de duplicarlo.
