> **Aviso de archivo histórico.** Este documento describe el diseño original de Iris, basado en
> un validador Node.js (`validate-iris.mjs`), un manifiesto `iris-project.json` y JSON Schemas
> como fuente estructurada. El commit `874e89a` ("refactor: actualizar skill iris",
> 2026-08-12) reemplazó por completo esa arquitectura por la actual, basada en Python y
> Markdown/YAML. Se conserva únicamente como referencia histórica de decisiones descartadas —
> nada de rutas, nombres de archivo o comandos de aquí describe el comportamiento vigente de la
> skill. El documento vigente es [README.md](README.md) en esta misma carpeta.

# Plan de implementación — Iris, AI Conversation & Agent UX Architect

**Estado:** Plan propuesto; la implementación de la skill aún no ha comenzado.  
**Ubicación objetivo:** `.claude/skills/iris/`  
**Fecha:** 2026-08-10  
**Decisión principal:** construir una sola skill reutilizable, con plantillas cohesivas, un manifiesto de estado y un validador determinista. No crear una arquitectura multiagente de ejecución en el MVP.

## 1. Executive Summary

Iris será una skill de Codex/Claude orientada a convertir información parcial —ideas, requisitos, documentación, diagramas, screenshots, prompts, código o sistemas existentes— en una especificación trazable de la experiencia conversacional y del sistema de agentes que la soporta.

Resolverá un problema frecuente: UX, Product, AI Engineering, Arquitectura, Desarrollo y QA suelen describir el mismo sistema con modelos distintos y terminan mezclando la experiencia del usuario con el enrutamiento interno, los tools, los handoffs y los estados de UI. Iris impondrá cinco capas separadas pero conectadas:

1. User Flow.
2. Conversation Flow.
3. Agent Flow.
4. Tool/System Flow.
5. UI State Flow.

Iris no se limitará a producir wireframes ni diagramas. Guiará discovery, modelado de casos de uso, límites y ownership, arquitectura de agentes, conversación, estados, fallos, recuperación, human-in-the-loop, pruebas, evaluación y métricas. Cada afirmación inferida quedará marcada como supuesto; cada elemento importante tendrá un ID estable; cada gate comprobará consistencia con los artefactos anteriores.

### Hallazgos de la inspección del repositorio

- `.claude/skills/iris/` existe y está vacío; es seguro usarlo sin sobrescribir trabajo previo.
- No existe un `AGENTS.md` ni un `CLAUDE.md` en el repositorio.
- El repositorio ya usa skills con `SKILL.md`, `references/`, `scripts/`, `assets/` y `agents/openai.yaml`.
- `storming` aporta patrones reutilizables de IDs estables, perfiles mínimos de artefactos, estados de validación, reconciliación y gates.
- `vulcano` aporta un patrón reutilizable de manifiesto persistente, validación estática, pruebas del validador y cierre por fases.
- `archi` aporta separación de responsabilidades arquitectónicas y documentación técnica; Iris deberá complementarla, no duplicarla.
- `ranger` aporta patrones de estrategia de pruebas, pero su alcance actual es QA de aplicaciones React/Next.js; Iris no debe depender de ella para evaluar conversaciones.
- `.claude/instructions/agent-skills.instructions.md` exige descripción de activación precisa, carga progresiva, recursos relativos y skills mantenibles.
- `.claude/skills/file-organization-standards/SKILL.md` favorece agrupaciones cohesivas y evita tanto la fragmentación como los archivos monolíticos.
- El repositorio tiene cambios locales ajenos en `resources/architecture/`; la implementación de Iris no deberá modificarlos.

**Recommended:** construir Iris como una skill única, con validación por manifiesto y un conjunto pequeño de documentos consolidados por proyecto.  
**Why:** el flujo comparte contexto, IDs y gates; dividirlo prematuramente aumentaría handoffs, pérdida de contexto y mantenimiento.  
**Alternative:** crear cuatro skills —Discovery, Agent Architecture, Conversation Design y Evaluation— coordinadas por un agente.  
**Tradeoff:** la alternativa reduce el contexto cargado por tarea, pero introduce contratos entre skills, routing adicional y más riesgo de resultados inconsistentes. Solo se reconsiderará si las pruebas muestran que `SKILL.md` y sus referencias exceden el presupuesto de contexto o que los dominios evolucionan de forma independiente.

## 2. Recommended Architecture

### 2.1 Arquitectura propuesta

```text
Usuario
  └── Codex/Claude
      └── Skill iris
          ├── Workflow y reglas de decisión (SKILL.md)
          ├── Referencias cargadas bajo demanda
          ├── Plantillas editables de artefactos
          ├── Manifiesto persistente por proyecto
          └── Validador estático + pruebas
```

La arquitectura tendrá dos planos:

- **Plano de ejecución normal:** una instancia de Codex/Claude usa Iris y mantiene el contexto del proyecto.
- **Plano de evaluación:** casos de prueba aislados y, cuando esté autorizado, subagentes con contexto mínimo prueban si la skill generaliza. Los subagentes no forman parte del diseño que experimenta el usuario.

### 2.2 Decisiones

**Recommended:** una sola skill llamada `iris`.  
**Why:** conserva el nombre solicitado y crea un punto único de activación. La descripción del frontmatter incluirá términos de descubrimiento como conversational UX, agent architecture, handoff, tool flow, UI state, failure matrix, Wizard of Oz y agent evaluation.  
**Alternative:** usar el nombre `design-agent-ux`.  
**Tradeoff:** mejora la activación semántica por nombre, pero pierde la identidad Iris. Una descripción fuerte compensa esa pérdida de discoverability.

**Recommended:** no crear custom agents ni subagentes de runtime en las fases 1–4.  
**Why:** las responsabilidades están altamente acopladas por trazabilidad y no requieren aislamiento de permisos o herramientas.  
**Alternative:** un orquestador con especialistas de Discovery, Architecture, Conversation y Evaluation.  
**Tradeoff:** permitiría prompts especializados, pero exigiría contratos de contexto, reconciliación y resolución de contradicciones que no aportan valor demostrado en el MVP.

**Recommended:** mantener un manifiesto JSON por proyecto y Markdown como formato humano principal.  
**Why:** Markdown permite revisión multidisciplinaria; JSON permite validación determinista con Node.js estándar, sin añadir una dependencia de parser YAML que el repositorio no tiene.  
**Alternative:** usar solo Markdown o usar YAML para el manifiesto.  
**Tradeoff:** solo Markdown dificulta validación confiable; YAML es más amable para edición manual, pero introduce una dependencia adicional. El manifiesto será pequeño y normalmente lo administrará Iris, por lo que la confiabilidad de JSON pesa más.

**Recommended:** incrustar Mermaid en los documentos y conservar tablas como fuente de detalle.  
**Why:** los diagramas explican relaciones; las tablas son más fáciles de revisar, versionar y validar.  
**Alternative:** generar archivos `.mmd` separados.  
**Tradeoff:** los archivos separados facilitan compilación, pero multiplican artefactos. Se habilitarán solo si el proyecto necesita exportar SVG/PNG.

### 2.3 Relación con skills existentes

- Iris puede consumir salidas de `janus`, `epicureo` y `storming` como fuentes.
- Iris puede entregar límites, agentes, tools, estados y riesgos a `archi`; no decide infraestructura, nube ni topología de despliegue.
- Iris puede entregar escenarios y criterios a `ranger` u otro sistema de QA; Iris conserva ownership sobre UX testing y agent evaluation.
- Iris no invocará otras skills por rutina. Cada handoff será opcional y explícito.

## 3. Agent Responsibilities

### 3.1 Lo que hará Iris

- Inventariar fuentes existentes antes de preguntar.
- Identificar información faltante y clasificarla como crítica o no crítica.
- Preguntar solo lo crítico y continuar con supuestos marcados para lo demás.
- Definir contexto, goals, actores, jobs, restricciones, supuestos y preguntas abiertas.
- Construir y reconciliar use cases con happy path, alternativas y fallos.
- Separar experiencia visible, conversación, agentes, tools/sistemas y UI states.
- Definir ownership, límites, inputs, outputs, guardrails, memoria y observabilidad por agente.
- Detectar responsabilidades solapadas, ownership ambiguo, agentes innecesarios y responsabilidades ausentes.
- Documentar handoffs con contrato de contexto, timeout, retry, fallback y retorno.
- Diseñar conversation flows y blueprints completos, incluidos correcciones, interrupciones y cambios de objetivo.
- Modelar estados conversacionales y de UI con condiciones de entrada y salida.
- Crear failure matrices con detección, recuperación, severidad, observabilidad y criterios de aceptación.
- Definir Chat UX/UI como comportamiento de componentes, no solo como apariencia.
- Preparar Wizard of Oz testing, casos de prueba, agent evaluation y métricas justificadas.
- Mantener trazabilidad, IDs estables, fuentes, supuestos, decisiones y estado de aprobación.
- Validar coherencia estructural y señalar qué necesita juicio humano.
- Reconciliar artefactos existentes preservando IDs y ediciones manuales.

### 3.2 Lo que Iris no hará

- No expondrá chain-of-thought, conversaciones privadas entre agentes ni prompts internos.
- No presentará arquitectura interna como parte de la UI salvo que aporte valor comprobado al usuario.
- No saltará directamente a high-fidelity UI.
- No implementará agentes, tools, UI, APIs ni infraestructura salvo solicitud posterior y explícita.
- No decidirá que multiagente es mejor sin evidencia de separación real de responsabilidades.
- No tratará un diagrama como sustituto de contratos y tablas verificables.
- No marcará artefactos como aprobados; solo personas autorizadas pueden hacerlo.
- No inventará evidencia, métricas baseline, resultados de research ni validación con usuarios.
- No hará investigación web silenciosa cuando las fuentes del proyecto sean suficientes; cuando investigue, distinguirá fuente, principio aplicado e implicación de diseño.
- No modificará documentos ajenos al output root acordado sin autorización.
- No creará decenas de archivos vacíos o de bajo valor.

## 4. Workflow

### 4.1 Flujo completo por proyecto

1. **Encuadrar el encargo.** Determinar si es greenfield, sistema existente o reconciliación; identificar objetivo, audiencia y decisión que deben habilitar los entregables.
2. **Resolver el output root.** Usar la convención documentada del repositorio. Si no existe, usar `docs/agent-ux/<project-slug>/`. En OCTO_HR, preferir `resources/design/agent-ux/<initiative-slug>/` porque `resources/` ya es la raíz de artefactos de diseño.
3. **Inventariar evidencia.** Leer primero fuentes proporcionadas, artefactos previos y convenciones. Registrar ruta, tipo, fecha si existe y confiabilidad.
4. **Crear o reconciliar el manifiesto.** Cargar `iris-project.json`; si existe, preservar IDs, estados aprobados y ediciones manuales. Si no existe, inicializarlo desde la plantilla.
5. **Clasificar vacíos.** Marcar cada vacío como `critical`, `important` o `non-critical`. Preguntar en una ronda corta solo lo que bloquee límites, riesgo, acción irreversible o interpretación central.
6. **Declarar supuestos.** Asignar ID `ASM-xxx`, fuente, impacto y método de validación. Continuar con los no críticos.
7. **Definir contexto y use cases.** Crear `RQ-xxx` y `UC-xxx`, priorizar, delimitar outcomes y cubrir caminos alternativos/fallos.
8. **Definir system boundaries.** Separar qué hace el usuario, qué percibe, qué ejecuta el sistema y qué queda fuera.
9. **Diseñar la arquitectura mínima de agentes.** Empezar por responsabilidades; crear agentes solo cuando cambien ownership, contexto, permisos, herramientas, modelo de riesgo o lifecycle.
10. **Definir tools e interacciones.** Crear `TL-xxx` y `HF-xxx`; documentar contratos de contexto, datos, timeout, retry, fallback, idempotencia y retorno.
11. **Diseñar conversación.** Crear `CF-xxx` y el Conversation Blueprint; representar mensajes, acciones, feedback y decisiones sin revelar razonamiento interno.
12. **Diseñar estados de UI.** Crear `ST-xxx`; relacionar visibilidad, acciones permitidas, transición, cancelación, undo y confirmación.
13. **Modelar fallos y recuperación.** Crear `ERR-xxx`; cubrir fallos de intención, routing, contexto, tools, agentes, permisos, resultados y conducta del usuario.
14. **Definir pruebas y evaluación.** Crear `TC-xxx` para comportamiento; separar UX research de evaluación técnica del agente.
15. **Definir métricas e instrumentación.** Crear `MET-xxx`; documentar fórmula, evento, dimensiones, owner y por qué la métrica cambia una decisión.
16. **Ejecutar gates.** Correr validación incremental después de cada bloque y validación estricta al cierre.
17. **Revisar con humanos.** Aplicar rúbrica; registrar observaciones, decisiones y aprobador. Iris puede declarar `review-ready`, nunca `approved`.
18. **Cerrar o iterar.** Actualizar índice de impacto, artefactos modificados, gates, preguntas abiertas y siguiente acción.

### 4.2 Estados del workflow

`not-started → in-progress → blocked-critical-input | review-ready → changes-requested | approved → superseded`

- `approved` requiere nombre/rol del aprobador y fecha.
- Un cambio en un artefacto aprobado lo mueve a `changes-requested` o crea una nueva versión; nunca se sobrescribe silenciosamente.
- Los gates pueden quedar `pass`, `pass-with-warnings`, `fail` o `not-run`.

## 5. Required Deliverables

Iris usará un perfil mínimo de seis documentos consolidados. Solo dividirá un documento cuando exceda un tamaño útil, tenga owners diferentes o necesite aprobación independiente.

| Archivo | Contenido | Consumidores principales |
|---|---|---|
| `00-index-and-traceability.md` | Estado, fuentes, decisiones, supuestos, preguntas, mapa de artefactos, matriz de trazabilidad e impacto de cambios | Todos |
| `01-context-and-use-cases.md` | Problem/business/user goals, personas, JTBD, constraints y catálogo de use cases | Product, UX, QA |
| `02-agent-architecture.md` | System boundary, Agent Map, Agent Cards, Tool Catalog, handoffs y sequence diagrams | AI Engineering, Arquitectura, Desarrollo |
| `03-conversation-design.md` | User Flow, Conversation Flow, Conversation Blueprint, microcopy y reglas de interrupción/corrección | UX, Product, Desarrollo |
| `04-ui-states-and-failures.md` | State model, UI component behavior, failure matrix, recovery y human escalation | UX/UI, Desarrollo, QA |
| `05-testing-and-evaluation.md` | Wizard of Oz plan, test scenarios, UX research, agent evals, métricas e instrumentación | UX Research, QA, AI Engineering, Product |

### Perfiles de entrega

- **Lean discovery:** `00`, `01` y secciones mínimas de `02` para validar alcance.
- **Design handoff:** `00`–`04` completos y `05` con criterios de aceptación.
- **Evaluation-ready:** los seis documentos, dataset/casos, métricas e instrumentación.
- **Reconciliation:** solo actualiza artefactos impactados y su trazabilidad; no regenera todo.

**Recommended:** perfiles de entrega, no una lista rígida de archivos obligatorios.  
**Why:** el valor depende de la madurez y riesgo del proyecto.  
**Alternative:** generar siempre la estructura completa de ocho carpetas del adjunto.  
**Tradeoff:** facilita navegación uniforme, pero produce archivos vacíos y sobre-documentación en iniciativas pequeñas.

## 6. Repository Structure

### 6.1 Estructura de la skill

```text
.claude/skills/iris/
├── AGENT_IMPLEMENTATION_PLAN.md       # Solo durante construcción/revisión inicial
├── SKILL.md                           # Workflow, decisiones, límites y routing de recursos
├── agents/
│   └── openai.yaml                    # Nombre, descripción y prompt de interfaz
├── references/
│   ├── artifact-contracts.md          # Schemas, IDs y mínimos por artefacto
│   ├── workflow-and-gates.md           # Gates, reconciliación y change impact
│   ├── ux-agent-principles.md          # HAI/UX, accesibilidad, transparencia y anti-patterns
│   └── testing-and-evaluation.md       # Wizard of Oz, test design, evals y métricas
├── templates/
│   ├── index-and-traceability.md
│   ├── context-and-use-cases.md
│   ├── agent-architecture.md
│   ├── conversation-design.md
│   ├── ui-states-and-failures.md
│   └── testing-and-evaluation.md
├── assets/
│   ├── iris-project.template.json
│   └── iris-project.schema.json
└── scripts/
    ├── validate-iris.mjs
    ├── test-validate-iris.mjs
    └── fixtures/
        ├── valid-minimal/
        └── invalid-cross-references/
```

No crear `README.md`, `QUICK_REFERENCE.md`, changelog ni archivos que repitan `SKILL.md`. Al terminar la implementación y ser aprobado el diseño, decidir si `AGENT_IMPLEMENTATION_PLAN.md` permanece como evidencia de diseño o se mueve fuera de la skill para no cargar documentación de construcción en el paquete distribuible.

### 6.2 Estructura producida por proyecto

```text
<output-root>/
├── iris-project.json
├── 00-index-and-traceability.md
├── 01-context-and-use-cases.md
├── 02-agent-architecture.md
├── 03-conversation-design.md
├── 04-ui-states-and-failures.md
└── 05-testing-and-evaluation.md
```

Para proyectos grandes se permitirá dividir por use case o dominio, pero el índice y el manifiesto seguirán siendo únicos. Los diagramas permanecerán embebidos; exportaciones gráficas serán outputs opcionales, no fuentes de verdad.

## 7. AGENTS.md Strategy

**Recommended:** no crear un `AGENTS.md` para implementar Iris en el MVP.  
**Why:** no existe uno en el repositorio y las reglas de Iris son de dominio, por lo que deben activarse solo cuando la skill sea relevante. Ponerlas a nivel global consumiría contexto y afectaría tareas no relacionadas.  
**Alternative:** crear un `AGENTS.md` raíz que obligue a usar Iris en cualquier trabajo de agentes o conversación.  
**Tradeoff:** mejora enforcement, pero acopla todo el repositorio a una disciplina especializada y puede provocar activaciones innecesarias.

Si en el futuro se crea `AGENTS.md`, solo debe contener invariantes realmente globales:

- idioma y tono del repositorio;
- raíces oficiales de artefactos y reglas para preservar cambios manuales;
- comandos generales de validación;
- política de secretos/PII y acciones destructivas;
- referencia breve a skills disponibles, sin copiar sus workflows.

Debe permanecer dentro de Iris:

- las cinco capas del sistema conversacional;
- discovery y clasificación de vacíos;
- criterios para crear o eliminar agentes;
- schemas de Agent Cards, handoffs, blueprint, estados y fallos;
- IDs, trazabilidad y gates de Iris;
- UX principles, anti-patterns, Wizard of Oz y agent evaluation.

## 8. Skill Design

### `SKILL.md`

- Frontmatter con solo `name` y `description`.
- Descripción breve pero rica en triggers.
- Límites, flujo principal, perfiles de entrega, regla de preguntas críticas y guía para cargar referencias.
- Menos de 500 líneas; objetivo recomendado: 180–250 líneas.
- Instrucciones en imperativo.
- No duplicar schemas ni plantillas.

### `agents/openai.yaml`

- `display_name`: `Iris — Agent UX Architect`.
- `short_description`: describir diseño y validación de sistemas conversacionales.
- `default_prompt`: invocar `$iris` y pedir inventariar fuentes antes de diseñar.
- Generarlo con la herramienta estándar de skill-creator durante la implementación, no escribir campos opcionales sin necesidad.

### `references/artifact-contracts.md`

- Definir campos mínimos, IDs y relaciones permitidas.
- Especificar fuente de verdad de cada concepto para evitar duplicación.
- Incluir contratos de User/Conversation/Agent/Tool/UI layers.
- Incluir tablas de Agent Card, handoff, blueprint, state, error, test y metric.

### `references/workflow-and-gates.md`

- Definir gates incrementales y cierre estricto.
- Describir reconciliación, versionado, retiro de IDs e impacto de cambios.
- Separar error estructural, warning semántico y decisión humana.
- Definir estados y política de aprobación.

### `references/ux-agent-principles.md`

- Visibilidad, control, prevención/recuperación, expectativas, contexto, progressive disclosure, reversibilidad, confirmación, graceful degradation y accesibilidad.
- Transparencia de alto nivel sin chain-of-thought.
- Catálogo de anti-patterns con señales y acciones correctivas.
- Reglas para acciones consecuenciales, PII y human escalation.

### `references/testing-and-evaluation.md`

- Separar UX testing, agent evaluation y validación documental.
- Definir Wizard of Oz, dataset design, evaluaciones humanas/automáticas y métricas.
- Incluir criterios de selección: qué evaluar, por qué, método, muestra, baseline y threshold.

### `templates/*.md`

- Ser esqueletos editables, no documentación explicativa.
- Incluir metadata mínima, tablas y marcadores inequívocos que el validador pueda detectar.
- Permitir declarar `No aplica — razón` para secciones condicionales.
- No duplicar instrucciones extensas; enlazar el contrato correspondiente.

### `assets/iris-project.*`

- La plantilla JSON contiene proyecto, output root, modo, fuentes, supuestos, decisiones, registro de IDs, artefactos, gates y aprobaciones.
- El JSON Schema valida tipos, enumeraciones y campos obligatorios.
- El manifiesto no contiene conversaciones completas, secretos ni PII innecesaria.

### `scripts/validate-iris.mjs`

- CLI cross-platform con `--root`, `--strict`, `--json` y `--help`.
- Salida estable, códigos de proceso claros y cero operaciones destructivas.
- Sin dependencias externas para validación base; Mermaid será una capacidad opcional si `mmdc` está instalado.

## 9. Templates

### 9.1 Contratos mínimos

| Template | Secciones obligatorias |
|---|---|
| `index-and-traceability.md` | status, sources, assumptions, decisions, open questions, artifact map, traceability matrix, change-impact log |
| `context-and-use-cases.md` | problem, business/user goals, actors/personas, JTBD, constraints y use cases con primary/alternative/failure flows |
| `agent-architecture.md` | system boundary, Agent Map, Agent Cards, Tool Catalog y Handoff Contracts |
| `conversation-design.md` | separación de capas, flows, blueprint, microcopy, corrección, interrupción, cambio de objetivo y confirmación |
| `ui-states-and-failures.md` | state model, UI component behavior, failure matrix, recovery, escalation y Mermaid state diagram |
| `testing-and-evaluation.md` | Wizard of Oz, test cases, UX study, agent evals, metrics e instrumentation events |

### 9.2 Convención de IDs

| Concepto | Prefijo | Ejemplo |
|---|---|---|
| Requirement/source requirement | `RQ` | `RQ-001` |
| Assumption | `ASM` | `ASM-001` |
| Decision | `DEC` | `DEC-001` |
| Use case | `UC` | `UC-001` |
| Agent | `AG` | `AG-001` |
| Tool/system | `TL` | `TL-001` |
| Handoff | `HF` | `HF-001` |
| Conversation flow | `CF` | `CF-001` |
| State | `ST` | `ST-001` |
| Failure | `ERR` | `ERR-001` |
| Test case | `TC` | `TC-001` |
| Metric | `MET` | `MET-001` |
| Human review finding | `REV` | `REV-001` |

Reglas:

- Usar tres dígitos y no reutilizar IDs retirados.
- Conservar el ID cuando cambie el nombre.
- Marcar elementos eliminados como `retired` con razón e impacto.
- Cada relación referencia IDs existentes, no texto libre como clave.
- Mantener una sola definición canónica; los demás documentos enlazan o referencian.
- La trazabilidad objetivo es `RQ → UC → AG/TL/HF → CF/ST → ERR → TC → MET`.

## 10. Validation Strategy

### 10.1 Gates incrementales

| Gate | Momento | Comprobaciones mínimas | Bloquea si |
|---|---|---|---|
| G0 — Intake | después del inventario | objetivo, scope, fuentes, modo, output root, críticos | el objetivo o límite central no puede determinarse |
| G1 — Context | después de `01` | goals no contradictorios, actores, supuestos y UC prioritarios | no existe outcome observable para un UC prioritario |
| G2 — Architecture | después de `02` | agents/tools únicos, ownership, límites, handoffs válidos | agente sin owner; handoff circular sin condición de salida; acción no autorizada |
| G3 — Conversation | después de `03` | CF ligados a UC, roles y acciones distinguibles, corrección/interrupción | un flujo prioritario solo cubre happy path o expone razonamiento interno |
| G4 — States & Failures | después de `04` | entry/exit, transiciones, recovery, tool failures, human escalation | estado inaccesible/sin salida; error crítico sin recovery |
| G5 — Tests & Metrics | después de `05` | UC prioritarios con tests, errores críticos cubiertos, métricas instrumentables | falta pass criterion o no hay test para riesgo crítico |
| G6 — Closure | cierre | referencias, Mermaid, placeholders, manifest, rubric, aprobación | IDs rotos, gate fallido o documento marcado aprobado sin humano |

### 10.2 Validación automatizable

El script comprobará:

- estructura, nombres y archivos declarados en el manifiesto;
- JSON parseable y consistente con JSON Schema;
- IDs únicos, formato correcto y referencias existentes;
- todo agente del blueprint existe en Agent Map;
- origen/destino de cada handoff existen y no son iguales sin justificación;
- cada tool call importante tiene timeout/failure behavior o `No aplica — razón`;
- cada estado tiene entry, visible UI, acciones, system behavior, exit y next states;
- cada error crítico tiene detection, recovery, escalation y acceptance criteria;
- cada use case prioritario tiene al menos un `TC`;
- Mermaid se compila cuando `mmdc` está disponible;
- no quedan placeholders, enlaces relativos rotos ni posibles secretos;
- el estado `approved` incluye aprobador y fecha.

### 10.3 Validación que requiere juicio humano

- calidad del modelo mental y carga cognitiva;
- si la arquitectura multiagente realmente aporta valor;
- claridad, tono, accesibilidad y confianza del copy;
- severidad de riesgos y adecuación de recovery;
- realismo de tareas Wizard of Oz;
- utilidad de métricas y thresholds;
- aprobación de supuestos, decisiones y outputs.

**Recommended:** fallar en modo `--strict` ante inconsistencias estructurales y riesgos críticos; emitir warnings ante calidad semántica dudosa.  
**Why:** un script no puede certificar calidad UX, pero sí impedir contradicciones verificables.  
**Alternative:** asignar un score automático único.  
**Tradeoff:** parece simple, pero oculta fallos críticos detrás de un promedio y crea falsa precisión.

## 11. Test Strategy

### 11.1 Capas de prueba

1. **Unit tests del validador:** fixtures válidos e inválidos por regla.
2. **Contract tests de plantillas:** cada template contiene campos y IDs esperados.
3. **Golden tests limitados:** snapshots de estructura, no de redacción completa.
4. **End-to-end prompts:** ejecutar Iris desde inputs realistas y revisar outputs con la rúbrica.
5. **Forward tests aislados:** usar subagentes solo para evaluar generalización, sin compartir el diagnóstico ni la respuesta esperada.
6. **Human review:** UX, Product, AI Engineering y QA revisan un proyecto piloto.

### 11.2 Matriz mínima de escenarios

| Caso | Entrada | Riesgo que tensiona | Evidencia de éxito |
|---|---|---|---|
| Happy path | brief claro con usuarios, APIs y outcome | cobertura básica | perfil correcto, seis capas relacionadas y gates pass |
| Incomplete input | objetivo parcial y sin tools confirmadas | exceso de preguntas/invención | pregunta solo críticos; supuestos `ASM` visibles |
| Existing system | docs, diagramas y artefactos previos | sobrescritura y pérdida de IDs | reconciliación preserva cambios e identifica impacto |
| Single-agent system | tarea cohesiva con pocos tools | sobre-arquitectura | recomienda un agente y justifica no dividir |
| Multi-agent system | permisos/ownership realmente distintos | boundaries y handoffs | contratos completos, sin loops ni ownership ambiguo |
| Tool-heavy system | varias APIs con timeouts/permisos | errores duplicados e idempotencia | tool catalog, retry/fallback y UI feedback trazables |
| Ambiguous architecture | se propone “un agente por función” | agent sprawl | cuestiona la separación y propone arquitectura mínima |
| Broken conversation | solo existe happy path | recuperación ausente | agrega corrección, interrupción, no result, timeout y escalation |
| Missing failure handling | tool calls sin error model | falsa finalización | G4 falla hasta definir detection/recovery/acceptance |

### 11.3 Reglas de forward-testing

- Ejecutar en conversaciones nuevas o subagentes sin conclusiones previas.
- Pasar la skill y el brief crudo, no el resultado esperado.
- Usar un output temporal aislado por caso.
- Comparar contra gates y rúbrica, no contra estilo literal.
- No probar sobre producción ni enviar información externa.
- Pedir autorización antes de una batería costosa, de larga duración o que use servicios remotos.

## 12. Evaluation Rubric

### 12.1 Escala común 0–5

| Score | Interpretación |
|---|---|
| 0 | ausente o contradice el objetivo; no utilizable |
| 1 | mención superficial; faltan elementos críticos |
| 2 | parcialmente útil, pero tiene vacíos importantes o no es verificable |
| 3 | suficiente para revisión; cubre lo esencial con problemas menores |
| 4 | sólido, consistente y accionable; solo requiere ajustes puntuales |
| 5 | excelente, completo para el alcance, sustentado, trazable y listo para handoff |

### 12.2 Criterios por dimensión

| Dimensión | Un 3 exige | Un 5 exige |
|---|---|---|
| Completeness | cubre entregables aplicables y declara `No aplica` | cubre caminos prioritarios, variantes, riesgos y decisiones sin relleno innecesario |
| Consistency | no hay contradicciones bloqueantes entre documentos | todas las relaciones y términos son canónicos; gates pasan sin warnings relevantes |
| UX quality | feedback, control, corrección y recovery básicos | minimiza carga, preserva contexto, permite reversibilidad y valida copy/expectativas |
| Agent architecture quality | ownership y límites entendibles | arquitectura mínima justificada, permisos/contexto/tools coherentes y sin agent sprawl |
| Failure coverage | errores críticos tienen respuesta y recovery | cobertura sistemática por intención, routing, contexto, agent, tool, UI y usuario |
| Test coverage | UC prioritarios y fallos críticos tienen casos | cubre variaciones, evals automáticas/humanas y criterios observables basados en riesgo |
| Traceability | relaciones principales pueden seguirse por IDs | trazabilidad bidireccional y change-impact completo, sin referencias huérfanas |
| Clarity | lectores entienden scope y decisiones | cada audiencia encuentra lo necesario, con lenguaje preciso y diagramas útiles |
| Actionability | existen criterios de aceptación y siguiente paso | Desarrollo/QA pueden implementar y probar sin reinterpretar decisiones centrales |

### 12.3 Regla de aprobación

**Recommended:** `promedio ≥ 4.0`, ninguna dimensión menor que `3`, G0–G6 en `pass` y cero riesgos críticos abiertos sin aceptación explícita.  
**Why:** evita que un promedio alto oculte una dimensión inviable.  
**Alternative:** promedio simple ≥ 3.5.  
**Tradeoff:** es más fácil de alcanzar, pero puede aprobar un sistema con trazabilidad o recovery deficientes.

La rúbrica no reemplaza research con usuarios ni evals del comportamiento real. Solo evalúa la calidad del paquete producido por Iris.

## 13. Example Project

### Proyecto piloto: “Asistente de seguimiento y reprogramación de entrevistas”

Una persona candidata consulta el estado de su proceso, solicita reprogramar una entrevista y recibe confirmación. El sistema consulta el ATS, valida identidad, revisa calendarios, propone opciones, actualiza la entrevista y escala a un reclutador cuando hay inconsistencias o acciones no soportadas.

Actores y componentes iniciales:

- Candidate.
- Recruiter.
- Conversational entry/orchestrator.
- Scheduling capability; Iris debe decidir si merece agente separado.
- ATS API.
- Calendar API.
- Notification service.
- Human support queue.

Este piloto es pequeño pero tensiona:

- PII y autenticación.
- diferencia entre status visible e internals;
- ambigüedad (“quiero cambiar mi entrevista”);
- tool timeout, conflicting availability y duplicate booking;
- user correction e interruption;
- confirmation antes de modificar calendario;
- rollback/fallback y human escalation;
- métricas UX y routing/tool accuracy.

Resultado esperado: perfil `evaluation-ready`, al menos tres use cases, dos decisiones arquitectónicas comparables, un happy path, rutas de corrección/fallo, Wizard of Oz plan, dataset inicial y trazabilidad completa.

## 14. Implementation Phases

### Phase 1 — Minimum viable agent

**Objective:** lograr que Iris inventaríe evidencia, haga preguntas críticas, separe las cinco capas y produzca un paquete lean consistente.

**Tasks:**

1. Ejecutar el inicializador estándar de skill-creator en un directorio temporal de staging y fusionar su scaffold en `iris/`, porque el directorio objetivo ya existe y contiene este plan; no borrar ni sobrescribir el plan.
2. Definir frontmatter, límites, reglas de preguntas y workflow en `SKILL.md`.
3. Crear `agents/openai.yaml` desde metadata derivada de la skill.
4. Crear el contrato mínimo de IDs y artefactos.
5. Crear tres templates iniciales: índice/trazabilidad, contexto/use cases y agent architecture.
6. Ejecutar `quick_validate.py` para estructura y frontmatter.

**Files:** `SKILL.md`, `agents/openai.yaml`, `references/artifact-contracts.md`, tres templates iniciales.

**Dependencies:** aprobación de nombre/alcance; scripts de skill-creator disponibles localmente.

**Acceptance Criteria:**

- la skill activa con prompts de diseño conversacional y no con tareas UX genéricas;
- distingue visible experience de internal execution;
- pregunta únicamente bloqueos críticos;
- produce IDs estables y un paquete lean;
- `SKILL.md` pasa validación y no supera 500 líneas.

### Phase 2 — Templates

**Objective:** completar los artefactos de handoff sin fragmentación excesiva.

**Tasks:**

1. Completar los seis templates.
2. Crear referencias de UX/agent principles y testing/evaluation.
3. Definir perfiles lean, design-handoff y evaluation-ready.
4. Incorporar anti-patterns, human-in-the-loop y políticas de transparencia.
5. Probar el llenado manual del proyecto piloto.

**Files:** `templates/*.md`, `references/ux-agent-principles.md`, `references/testing-and-evaluation.md`.

**Dependencies:** contratos de Phase 1 estables.

**Acceptance Criteria:**

- cada campo solicitado en el adjunto tiene una ubicación canónica;
- no existe información duplicada entre templates;
- cada template puede usarse de forma independiente solo cuando el perfil lo permite;
- el piloto produce máximo seis documentos principales y cubre el flujo end-to-end.

### Phase 3 — Validation

**Objective:** detectar inconsistencias estructurales y de trazabilidad de forma determinista.

**Tasks:**

1. Diseñar `iris-project.template.json` y su JSON Schema.
2. Implementar `validate-iris.mjs` por reglas pequeñas y testeables.
3. Crear fixtures mínimos válidos e inválidos.
4. Implementar G0–G6, niveles error/warning y modo strict.
5. Integrar validación opcional de Mermaid.

**Files:** `assets/iris-project.template.json`, `assets/iris-project.schema.json`, `scripts/validate-iris.mjs`, `scripts/fixtures/*`, `references/workflow-and-gates.md`.

**Dependencies:** templates y IDs congelados para v1.

**Acceptance Criteria:**

- el validador detecta referencias rotas, IDs duplicados, errores críticos sin recovery y UC prioritarios sin test;
- un proyecto mínimo válido termina con exit code 0;
- un fixture inválido por regla produce mensaje accionable y exit code distinto de 0;
- no modifica archivos ni requiere red.

### Phase 4 — Automated testing

**Objective:** demostrar que Iris funciona con entradas variadas y que los gates evitan regresiones.

**Tasks:**

1. Implementar tests unitarios del validador.
2. Crear nueve briefs de la matriz mínima sin incluir respuestas esperadas en el prompt.
3. Ejecutar pruebas end-to-end en workspaces temporales.
4. Aplicar la rúbrica y registrar fallos por categoría.
5. Forward-test con subagentes si está autorizado.
6. Corregir instrucciones o contratos y repetir.

**Files:** `scripts/test-validate-iris.mjs`, fixtures adicionales y casos de evaluación almacenados sin datos sensibles.

**Dependencies:** Phase 3 estable; mecanismo disponible para sesiones aisladas.

**Acceptance Criteria:**

- 100% de tests del validador pasan;
- los nueve escenarios producen el perfil correcto o un bloqueo justificable;
- promedio de rúbrica ≥ 4.0, ninguna dimensión < 3;
- no hay fuga de conclusiones entre forward tests.

### Phase 5 — Advanced capabilities

**Objective:** agregar capacidades solo si evidencia de uso demuestra su valor.

**Tasks potenciales:**

1. Exportar Mermaid a SVG/PNG.
2. Generar datasets JSONL para agent evals.
3. Añadir diff semántico y análisis de impacto entre versiones.
4. Añadir adaptadores de lectura para formatos frecuentes.
5. Integrar fuentes oficiales y registrar citas/principios.
6. Evaluar separación en varias skills o especialistas de runtime.
7. Añadir accesibilidad conversacional y evaluación multilingüe avanzada.

**Files:** solo los recursos justificados por la capacidad aprobada; no reservar carpetas vacías.

**Dependencies:** métricas de uso, fallos recurrentes y decisión humana.

**Acceptance Criteria:**

- cada capacidad resuelve un problema observado;
- mantiene compatibilidad con manifiestos v1 o incluye migración;
- no reduce el score, aumenta preguntas innecesarias ni expone internals;
- una ADR/decisión documenta por qué se añadió.

## 15. Risks

| Riesgo | Tipo | Impacto | Mitigación |
|---|---|---|---|
| Skill demasiado grande | técnico | carga excesiva de contexto | `SKILL.md` breve, carga progresiva y cuatro referencias cohesivas |
| Sobre-documentación | UX/proceso | baja adopción | perfiles de entrega y máximo seis documentos principales |
| Agent sprawl | arquitectura | handoffs y ownership confusos | regla de arquitectura mínima y gate G2 |
| Falsa validación automática | calidad | confianza injustificada | separar validación estructural de revisión humana |
| Preguntas excesivas | UX | frustración y abandono | clasificar vacíos y preguntar solo críticos por ronda |
| Supuestos invisibles | producto | decisiones erróneas | IDs `ASM`, impacto, fuente y método de validación |
| Pérdida de ediciones manuales | técnico | retrabajo y desconfianza | reconciliación, IDs estables y manifiesto persistente |
| Inconsistencia entre artefactos | entrega | implementación incorrecta | fuente canónica, trazabilidad y gates incrementales |
| Métricas vanidosas | producto | instrumentación sin decisión | exigir fórmula, evento, owner y decisión habilitada |
| Exposición de internals/CoT | seguridad/UX | riesgo y confusión | mensajes de actividad de alto nivel y regla prohibitiva |
| PII en manifiestos/fixtures | seguridad | fuga de datos | minimización, datos sintéticos y detector de posibles secretos |
| Mermaid no disponible | técnico | diagramas no compilados | tablas como fuente de verdad y warning no bloqueante |
| Dependencia de convenciones `.claude` | portabilidad | activación desigual | paths relativos y metadata compatible; probar en plataformas objetivo |
| Solapamiento con `archi`/`ranger` | ownership | trabajo duplicado | límites y contratos de handoff explícitos |
| Subagentes contaminados por contexto | evaluación | resultados falsamente positivos | sesiones aisladas y briefs crudos |

## 16. Open Questions

Estas decisiones requieren confirmación humana, pero no bloquean la redacción inicial de la skill:

1. **Distribución y licencia:** ¿Iris será exclusivamente interna a este repositorio/organización o se publicará/reutilizará externamente? Esto determina licencia, sanitización de ejemplos y compatibilidad que debe garantizarse.
2. **Autoridad de aprobación:** ¿qué rol o roles pueden cambiar un artefacto de `review-ready` a `approved` en proyectos reales: Product, UX Lead, AI Architect, QA o un comité?
3. **Forward-testing:** ¿se autoriza usar subagentes para la batería de Phase 4 y qué límite de costo/tiempo debe respetarse?
4. **Gobierno de datos:** ¿existe una política corporativa de PII, retención y fuentes permitidas que Iris deba incluir como referencia obligatoria?

Defaults hasta recibir respuesta:

- tratar Iris como interna y sin licencia pública;
- permitir aprobación por artefacto con un rol accountable explícito;
- no ejecutar subagentes automáticamente;
- minimizar PII y nunca persistir secretos o conversaciones completas en fixtures.

## 17. Definition of Done

Iris estará lista cuando se cumplan todas estas condiciones:

- [ ] `SKILL.md` tiene frontmatter válido, triggers claros, límites y workflow completo.
- [ ] `SKILL.md` pasa `quick_validate.py`, permanece bajo 500 líneas y usa carga progresiva.
- [ ] `agents/openai.yaml` coincide con el propósito real de la skill.
- [ ] Existen exactamente las referencias, templates, assets y scripts justificados en este plan.
- [ ] Las cinco capas —User, Conversation, Agent, Tool/System y UI State— están separadas y conectadas.
- [ ] Los seis documentos de output cubren todos los entregables requeridos sin duplicación innecesaria.
- [ ] El manifiesto conserva fuentes, supuestos, decisiones, IDs, estados, gates y aprobaciones.
- [ ] La trazabilidad `RQ → UC → AG/TL/HF → CF/ST → ERR → TC → MET` es verificable en ambos sentidos.
- [ ] Todos los agentes y handoffs tienen ownership, límites, failure behavior y return path.
- [ ] Todo UC prioritario tiene pruebas; todo error crítico tiene detection, recovery, escalation y acceptance criteria.
- [ ] La skill separa UX testing, agent evaluation y validación documental.
- [ ] Las métricas propuestas tienen fórmula, fuente/evento, owner y decisión que habilitan.
- [ ] No se expone chain-of-thought ni chatter interno; la actividad visible usa mensajes de alto nivel.
- [ ] El validador funciona offline, no modifica outputs y pasa todas sus pruebas.
- [ ] Los nueve escenarios mínimos se ejecutaron en aislamiento y alcanzaron la regla de aprobación de la rúbrica.
- [ ] El proyecto piloto se completó end-to-end y fue revisado por al menos UX/Product, AI Engineering/Arquitectura y QA.
- [ ] Los riesgos críticos abiertos están resueltos o aceptados explícitamente por una persona identificable.
- [ ] Ningún artefacto aparece como `approved` por decisión autónoma de Iris.
- [ ] Las preguntas humanas de distribución, aprobación, evaluación y datos tienen decisión registrada o default aceptado.
- [ ] La documentación permite que otra instancia de Codex use Iris sin contexto oculto ni instrucciones externas.

### Orden exacto recomendado para la siguiente etapa

1. Revisar y aprobar este plan; resolver solo las preguntas abiertas que cambien el paquete.
2. Implementar Phase 1 y validar activación/alcance.
3. Ejecutar el piloto en perfil lean antes de crear todos los templates.
4. Implementar Phase 2 a partir de lo aprendido en el piloto.
5. Congelar contratos e IDs v1.
6. Implementar Phase 3 y hacer fallar intencionalmente cada regla con fixtures.
7. Ejecutar Phase 4, puntuar con la rúbrica e iterar.
8. Declarar Iris `review-ready` y solicitar aprobación humana.
9. Priorizar capacidades de Phase 5 únicamente con evidencia de uso.
