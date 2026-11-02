# Proceso y artefactos para definir, diseñar, construir y documentar Skills y Agentes

> Propuesta de un ciclo de vida (SDLC) para las capacidades de IA del kit — skills y agentes —
> portable entre **Claude Code**, **GitHub Copilot**, **AWS Kiro** y cualquier runtime que
> siga el estándar abierto de _Agent Skills_ (`agentskills.io`).
>
> Estado: propuesta · Autor: equipo de plataforma IA · Fecha: 2026-09-02

> **Alcance:** este documento propone cómo crear y gobernar skills y agentes del kit. No es el contrato
> operativo de la skill Takumi. Consulte la [portada de Takumi](./README.md) y su
> [`SKILL.md`](../../skills/takumi/SKILL.md) para documentar procesos de negocio.

---

## 1. Por qué este proceso

Hoy el repo ya tiene un ecosistema maduro (`.claude/skills/*`, `.claude/agents/*`,
`.claude/instructions/*`). El router general `orquestador.agent.md` está retirado del working
tree; las menciones a “orquestador” en esta propuesta representan una responsabilidad de gobierno
o una capacidad futura, no un agente actualmente disponible. Lo que falta es un **método repetible**
para crear y evolucionar esas capacidades con la misma disciplina que aplicamos a una HU:
definición → producto → diseño → implementación → validación → gobierno, con artefactos
trazables en cada paso.

Objetivos:

- Que cada skill/agente nazca de un **gap real y medido**, no de una intuición.
- Que el **contrato** de la capacidad (cuándo dispara, qué produce, qué NO hace) esté escrito antes del `SKILL.md`.
- Que exista **evidencia de evaluación** (evals) antes de dar por buena una capacidad.
- Que una misma definición se **materialice en varias plataformas** sin reescribir el diseño.
- Que el catálogo y, cuando exista, el router general se actualicen de forma controlada (anti-deriva).

---

## 2. Síntesis de buenas prácticas (investigación)

### 2.1 Skills (Anthropic — _Skill authoring best practices_)

| Principio | Regla operativa |
|---|---|
| **El contexto es un bien común** | Solo mece-loaded `name` + `description`; el `SKILL.md` se lee al activarse. Cuerpo **< 500 líneas**; si crece, partir en `references/`. |
| **Claude ya es inteligente** | Incluir solo lo que el modelo NO sabe: convenciones internas, defaults no obvios, quirks de versión, workflows del dominio. Nada que esté en la primera página de la doc oficial. |
| **La `description` es un disparador, no un resumen** | Tercera persona ("Extrae…", "Procesa…"), con **qué hace + cuándo usarla + keywords** que el usuario teclearía. La frase "Usar cuando el usuario quiere…" es la más importante. |
| **Grados de libertad según fragilidad** | Alta libertad → instrucciones en prosa (varias rutas válidas). Baja libertad → script exacto, "no cambies el comando" (operaciones frágiles/secuenciales). |
| **Divulgación progresiva, 1 salto** | Todo `reference/*.md` enlazado **directamente** desde `SKILL.md` (nunca anidado). Archivos de referencia > 100 líneas llevan tabla de contenidos. |
| **Workflows con checklist** | Para tareas multi-paso, dar una checklist que el agente copia y va marcando; incluir bucles _validar → corregir → repetir_. |
| **Nada sensible al tiempo** | Sin "antes de agosto 2025…"; usar sección "patrones antiguos" en `<details>`. |
| **Terminología consistente** | Un solo término por concepto en toda la skill. |
| **Scripts que resuelven, no delegan** | Manejar errores dentro del script; nada de "voodoo constants" sin justificar. Preferir script pre-hecho a código generado cuando importa el determinismo. |
| **Evals primero** | Crear **≥ 3 escenarios de evaluación ANTES** de escribir documentación extensa; medir baseline sin skill; escribir lo mínimo para pasar; iterar. |
| **Desarrollo Claude A / Claude B** | Claude A ayuda a redactar/refinar la skill; Claude B (sesión limpia) la usa en tareas reales; se observa dónde falla y se vuelve a A. |
| **Probar con todos los modelos objetivo** | Lo que sirve para Opus puede necesitar más detalle para Haiku. |

### 2.2 Subagentes (Claude Code / Copilot)

- **Especialistas, no generalistas**: un agente = un objetivo, una entrada, una salida, una regla de _handoff_.
- El **system prompt es el manual**: identidad + rol, pasos numerados, reglas, ejemplos de qué hacer y qué evitar.
- **Acceso a herramientas mínimo**: auditor read-only (`Read/Grep/Glob`); fixer (`Read/Edit/Bash`). Menos herramientas = más foco y menos daño.
- **Contexto aislado**: el subagente investiga en su propia ventana y devuelve un resumen → no ensucia la conversación principal.
- **Paso adversarial**: antes de dar por cerrado, un subagente en contexto fresco revisa el _diff_ contra el plan y reporta brechas (no estilo).
- **Patrón inicial recomendado**: PM (escribe spec) → Arquitecto (valida diseño + ADR) → Implementador (construye + prueba).

### 2.3 GitHub Copilot — customización en capas

| Mecanismo | Cuándo | Ubicación |
|---|---|---|
| **Custom instructions** | Reglas simples que aplican a casi todo (estándares de código) | `.github/copilot-instructions.md`, `*.instructions.md` con `applyTo:` glob |
| **Agent skills** | Instrucciones detalladas que solo se cargan cuando son relevantes; pueden traer scripts/recursos | `.github/skills/<n>/SKILL.md` (también `.claude/skills`, `.agents/skills`) |
| **Custom agents** | Persona enfocada + acceso a herramientas + modelo + guardarraíles | `.github/agents/<n>.agent.md` (frontmatter: `description`, `name`, `tools`, `model`, `target`, `handoffs`) |
| **Prompt files** | Flujo reutilizable disparado a mano | `.github/prompts/*.prompt.md` |
| **Handoffs** (VS Code) | Workflows guiados secuenciales entre agentes | campo `handoffs:` en el `.agent.md` |

Mismo estándar de `SKILL.md` que Anthropic: carga progresiva en 3 niveles (discovery → instrucciones → recursos), cuerpo < 500 líneas, `## Gotchas` es la sección de mayor señal.

### 2.4 AWS Kiro — _spec-driven development_

- La **unidad de trabajo es la spec**, no el prompt. Estructura: `requirements.md` → `design.md` → `tasks.md` → implementación.
- **requirements.md**: historias de usuario + criterios de aceptación en **notación EARS**.
- **design.md**: arquitectura técnica, decisiones, diagramas.
- **tasks.md**: plan de implementación en tareas discretas y verificables (grafo de dependencias → ejecución concurrente).
- **Steering** (`.kiro/steering/*.md`): contexto persistente de arquitectura/convenciones/estándares. Modos: _always_, _conditional_ (por glob), _manual_. Se versiona y se revisa como código; **nunca** secretos.
- **Agent Hooks**: automatización dirigida por eventos (al guardar/crear/borrar archivo, al abrir commit) → generar tests, actualizar docs, checar calidad.
- **Vibe vs Spec**: _vibe_ para explorar rápido; _spec_ cuando se necesita control, trazabilidad y alineación con RNF (seguridad, fiabilidad, costo).

### 2.5 EARS (Easy Approach to Requirements Syntax)

Cinco patrones de frase para criterios inequívocos y testeables (usados por casi todas las herramientas SDD):

| Patrón | Plantilla |
|---|---|
| Ubiquitous | `El <sistema> DEBERÁ <comportamiento>.` |
| Event-driven | `CUANDO <disparador>, el <sistema> DEBERÁ <comportamiento>.` |
| State-driven | `MIENTRAS <estado>, el <sistema> DEBERÁ <comportamiento>.` |
| Unwanted behavior | `SI <condición no deseada>, ENTONCES el <sistema> DEBERÁ <respuesta>.` |
| Optional feature | `DONDE <característica presente>, el <sistema> DEBERÁ <comportamiento>.` |

Una frase EARS bien formada **ya es** un criterio de aceptación verificable.

### 2.6 Claude Code — flujo de trabajo base

- **Explorar → Planear → Implementar → Commitear** (plan mode separa investigación de ejecución).
- **CLAUDE.md corto**: solo lo que, si se quita, provoca errores. Conocimiento de dominio ocasional → skill, no CLAUDE.md.
- **Dale a Claude cómo verificarse**: tests, build, screenshot, script que compara contra fixture. "Parece hecho" no es señal.
- **Spec autocontenida**: nombra archivos e interfaces, dice qué queda fuera de alcance, termina con verificación end-to-end.
- **Hooks** para lo que debe pasar siempre, sin excepción (es determinista; CLAUDE.md es solo consejo).
- **Gestión de contexto**: `/clear` entre tareas; tras 2 correcciones fallidas, reiniciar con mejor prompt.

---

## 3. Modelo conceptual: qué estamos construyendo

```
Necesidad de capacidad
   │
   ▼
┌──────────────┐   define el   ┌───────────────────┐
│  CAPABILITY  │──────────────▶│  Contrato (PRD)   │  qué hace / cuándo dispara / NO-goals / métricas
│  (agnóstica) │               └───────────────────┘
└──────┬───────┘
       │ se diseña como
       ▼
┌──────────────────────────────────────────────┐
│  DISEÑO (agnóstico de plataforma)            │
│  · tipo: skill | agente | instrucción | hook │
│  · mapa de divulgación progresiva            │
│  · grados de libertad por paso               │
│  · tool allowlist                            │
│  · contrato de entrada/salida                │
│  · interacción con orquestador/otras skills  │
└──────┬───────────────────────────────────────┘
       │ se materializa (adapters)
       ├─────────────▶ Claude Code   (.claude/skills, .claude/agents, hooks)
       ├─────────────▶ GitHub Copilot(.github/skills, .github/agents, *.instructions.md)
       ├─────────────▶ Kiro          (.kiro/steering, specs, hooks)
       └─────────────▶ Genérico      (AGENTS.md + SKILL.md estándar)
```

**Regla de oro**: el *diseño* es único y agnóstico; solo el **paquete de plataforma** cambia.

### 3.1 Árbol de decisión: ¿skill, agente, instrucción o hook?

| Si… | Entonces |
|---|---|
| Es una **regla corta que aplica a casi toda tarea** (estilo, naming, commits) | **Instrucción** (`CLAUDE.md` / `*.instructions.md` / steering _always_) |
| Es **conocimiento o workflow de dominio** que solo aplica a veces, con recursos/plantillas/scripts | **Skill** |
| Necesita **persona propia, contexto aislado y un subconjunto de herramientas** para una fase (revisar, planear, implementar) | **Agente / subagente** |
| Debe ejecutarse **siempre, de forma determinista** ante un evento (post-edit lint, bloquear ruta) | **Hook** |
| Es una **secuencia guiada a mano** con parámetros | **Prompt file** / skill con `disable-model-invocation` |

---

## 4. El ciclo de vida (6 fases + 2 gates)

```
F0 Descubrimiento ─▶ F1 Definición/Producto ─▶ [GATE A] ─▶ F2 Diseño ─▶ F3 Evals
        ─▶ F4 Construcción ─▶ F5 Validación ─▶ [GATE B] ─▶ F6 Publicación y Gobierno
                                   ▲                               │
                                   └──────── iteración ────────────┘
```

| Fase | Propósito | Artefacto(s) que produce | Responsable |
|---|---|---|---|
| **F0 Descubrimiento** | Confirmar que hay un gap real y medible | `capability-brief.md` | Solicitante + Plataforma IA |
| **F1 Definición / Producto** | Contrato de la capacidad: alcance, disparadores, no-goals, métricas | `capability-prd.md` | Product owner de plataforma |
| **GATE A — Revisión de producto** | ¿Vale la pena? ¿No se solapa con una skill existente? | Acta corta en el PRD | Comité kit-IA |
| **F2 Diseño** | Arquitectura agnóstica de la capacidad | `capability-design.md` | Diseñador de skills/agentes |
| **F3 Evals** | Escenarios de evaluación + baseline sin la capacidad | `evals/*.json` + `evals/README.md` | Diseñador + QA |
| **F4 Construcción** | Paquete(s) por plataforma | `SKILL.md` (+ `references/`, `scripts/`, `assets/`, `templates/`) y/o `*.agent.md`, hooks | Constructor |
| **F5 Validación** | Ejecutar evals (Claude B), probar en tareas reales, revisión adversarial | `evals/run-YYYYMMDD.md` (resultados) | QA + revisor fresco |
| **GATE B — Release readiness** | ¿Pasa evals? ¿Docs completas? ¿Catálogo/orquestador actualizados? | Checklist de release firmada | Comité kit-IA |
| **F6 Publicación y Gobierno** | Registrar en catálogo, enrutar en `orquestador`, versionar, changelog | `.claude/doc/<capability>.md`, entrada de catálogo, `CHANGELOG` de la skill | Plataforma IA |

### 4.1 Definición de "listo" por gate

**GATE A pasa si:**
- El brief tiene evidencia de fallo reproducible (transcripción/enlace).
- No existe skill/agente que ya cubra el caso (se buscó en catálogo + `orquestador`).
- El PRD tiene ≥ 1 métrica de éxito y ≥ 3 no-goals explícitos.

**GATE B pasa si:**
- ≥ 3 evals ejecutadas; capacidad supera el baseline en todas.
- `description` valida: tercera persona, disparadores explícitos, keywords, ≤ 1024 chars.
- `SKILL.md` ≤ 500 líneas; referencias a 1 salto; sin info sensible al tiempo; sin paths Windows.
- `tools`/allowlist mínimo justificado.
- Doc de implementación (`.claude/doc/<capability>.md`) creada.
- Catálogo y matriz del `orquestador` actualizados (o "N/A" justificado).
- Probada con todos los modelos objetivo declarados.

---

## 5. Artefactos (plantillas listas para copiar)

Ubicación propuesta durante el desarrollo:
`resources/ai-capabilities/<capability-id>/` (brief, prd, design, evals).
Al publicar, el `SKILL.md`/`*.agent.md` van a su carpeta de plataforma y la doc viva a `.claude/doc/<capability>.md`.

### 5.1 `capability-brief.md` — F0 Descubrimiento

```markdown
# Capability Brief — <nombre corto>

- **ID**: CAP-XXX
- **Fecha / solicitante**:
- **Tipo tentativo**: skill | agente | instrucción | hook  (ver §3.1)
- **Plataformas objetivo**: Claude Code | GitHub Copilot | Kiro | genérico

## Problema / gap
Qué intenta hacer hoy el agente y en qué falla. Sé concreto.

## Evidencia (obligatoria)
- Transcripción / enlace a sesión donde falló: …
- Frecuencia estimada del caso: …
- Costo del fallo (retrabajo, error a producción, tiempo): …

## Resultado deseado
Cómo se vería "bien" en una frase.

## Frases disparadoras candidatas
Lo que un usuario teclearía y debería activar esta capacidad:
- "…"
- "…"

## Capacidades relacionadas / posible solape
- Revisado catálogo: sí/no — hallazgos: …
- Revisada matriz `orquestador`: sí/no — hallazgos: …
```

### 5.2 `capability-prd.md` — F1 Definición / Producto

```markdown
# PRD — <nombre> (CAP-XXX)

## 1. Resumen
Una frase: "<capability> permite a <agente> <hacer X> cuando <contexto Y>."

## 2. Usuarios y contexto de uso
- Persona primaria (p. ej. dev backend, arquitecto, PO no técnico):
- Momento del ciclo en que se usa:
- Superficie (IDE, CLI, cloud agent, code review):

## 3. Alcance
### En alcance (capabilities)
- …
### Fuera de alcance (NO-goals — mínimo 3)
- NO …
- NO …
- NO …

## 4. Comportamiento esperado (EARS)
- El sistema DEBERÁ …
- CUANDO <disparador>, el sistema DEBERÁ …
- SI <entrada inválida>, ENTONCES el sistema DEBERÁ …

## 5. Contrato de disparo
- Debe activarse cuando: …
- NO debe activarse cuando: …  (falsos positivos conocidos)

## 6. Entradas / Salidas
- Entradas: (archivos, IDs Jira, selección, parámetros)
- Salida / entregable: (archivos generados y rutas, formato, checklist de cierre)

## 7. Métricas de éxito (mínimo 1, medibles)
| Métrica | Baseline (sin capability) | Objetivo |
|---|---|---|
| p. ej. % de tareas que pasan sin corrección humana | | |
| tokens medios por tarea | | |

## 8. Dependencias y riesgos
- Herramientas / MCP requeridos:
- Otras skills/agentes de los que depende o con los que se encadena:
- Riesgos (acciones destructivas, datos sensibles, deriva):

## 9. Modelos objetivo
Haiku | Sonnet | Opus | GPT-5 (copilot) | otro — y por qué.

## 10. Acta GATE A
- Fecha / asistentes:
- Decisión: aprobado | aprobado con cambios | rechazado
- Comentarios:
```

### 5.3 `capability-design.md` — F2 Diseño (agnóstico de plataforma)

```markdown
# Diseño — <nombre> (CAP-XXX)

## 1. Tipo y forma
- Tipo definitivo: skill | agente | instrucción | hook
- Si agente: identidad, rol, límite (qué NO hace), regla de handoff.
- Si hook: evento disparador y acción determinista.

## 2. `name` y `description` (borrador final)
- name: <kebab-case, gerundio preferido, ≤64, sin "claude"/"anthropic">
- description (3ª persona, qué + cuándo + keywords, ≤1024):
  "…"

## 3. Mapa de divulgación progresiva
| Nivel | Contenido | Archivo | ¿Cuándo se carga? |
|---|---|---|---|
| 1 | metadata | frontmatter | siempre |
| 2 | overview + workflow | `SKILL.md` (<500 líneas) | al activarse |
| 3 | detalle A | `references/a.md` | cuando la tarea lo pide |
| 3 | script X | `scripts/x.py` | se ejecuta, no se lee |
| 3 | plantilla | `templates/…` | el agente la modifica |
| 3 | asset | `assets/…` | se usa tal cual |

## 4. Grados de libertad por paso
| Paso del workflow | Libertad | Forma (prosa / pseudocódigo / script exacto) | Por qué |
|---|---|---|---|

## 5. Workflow (checklist que el agente copiará)
```
- [ ] Paso 1 …
- [ ] Paso 2 … (validar → corregir → repetir)
- [ ] Paso N: verificación final
```

## 6. Herramientas / permisos (allowlist mínimo)
- Claude Code `tools:` …
- Copilot `tools:` …
- Justificación de cada una.

## 7. Contrato con el ecosistema
- ¿La invoca el `orquestador`? Fila(s) nueva(s) de la matriz de enrutamiento:
- ¿Se encadena con otras skills? (antes / después)
- Contrato de salida mínimo (qué valida quien la llama):

## 8. Manejo de errores y casos límite
- Entradas inválidas: …
- Estados no soportados: …
- Acciones irreversibles: confirmación previa / prohibidas.

## 9. Seguridad / datos
- ¿Toca secretos, PII, infra? Mitigación.
- Scripts: sin credenciales, `--force` solo para destructivo con aviso.

## 10. Estrategia de verificación
Qué "check" puede correr la capacidad para saber que salió bien
(tests, validador, diff contra fixture, screenshot).
```

### 5.4 `evals/` — F3 Evaluación

```
resources/ai-capabilities/CAP-XXX/evals/
├── README.md          # cómo se corren, rúbrica, baseline registrado
├── 01-caso-feliz.json
├── 02-caso-limite.json
├── 03-no-debe-disparar.json   # negativo: la capability NO debe activarse
└── run-YYYYMMDD.md    # resultados de cada ejecución
```

`NN-caso.json` (rúbrica simple, inspirada en el formato de Anthropic):

```json
{
  "capability": "CAP-XXX",
  "skills": ["<name>"],
  "query": "instrucción realista del usuario",
  "files": ["fixtures/entrada.ext"],
  "expected_behavior": [
    "Dispara la skill correcta y NO otra",
    "Produce <artefacto> en <ruta> con <estructura>",
    "Respeta el no-goal: no toca <X>",
    "Termina con verificación end-to-end"
  ],
  "must_not": [
    "Modificar archivos fuera de alcance",
    "Pedir datos ya presentes en el prompt"
  ]
}
```

`evals/README.md` mínimo:
- Baseline: resultado de correr los mismos `query` **sin** la capability (fecha + resumen).
- Rúbrica: pass = cumple todos los `expected_behavior` y ningún `must_not`.
- Modelos con los que se corrió.

### 5.5 Paquete de implementación — F4

- **Claude Code / Copilot / genérico**: `SKILL.md` + (`references/`, `scripts/`, `assets/`, `templates/`, `LICENSE.txt`).
- **Agente**: `<name>.agent.md` con frontmatter (`description`, `name`, `tools`, `model`, opcional `handoffs`, `user-invocable`, `disable-model-invocation`).
- **Hook**: entrada en `.claude/settings.json` / Kiro Agent Hook + script.

### 5.6 `.claude/doc/<capability>.md` — F6 Documentación de implementación (doc viva)

```markdown
# <Capability> — doc de implementación

## Qué es y cuándo se usa
(igual que la description, en prosa)

## Decisiones de diseño (ADR-lite)
| # | Decisión | Alternativas | Motivo | Fecha |
|---|---|---|---|---|

## Adaptadores por plataforma
| Plataforma | Ruta del paquete | Diferencias vs. diseño base |
|---|---|---|
| Claude Code | `.claude/skills/<n>/` | — |
| GitHub Copilot | `.github/skills/<n>/` | modelo `GPT-5 (copilot)`, tools renombradas |
| Kiro | `.kiro/steering/<n>.md` + spec | se expresa como steering conditional |

## Contrato de salida (lo que valida el orquestador)
- …

## Evals
Enlace a `resources/ai-capabilities/CAP-XXX/evals/` + último resultado.

## Changelog
| Versión | Fecha | Cambio | Impacto en evals |
|---|---|---|---|
| 1.0.0 | | primera versión | baseline |
```

### 5.7 Entrada de catálogo — F6

Añadir a `resources/ai-capabilities/CATALOG.md` (nuevo índice único):

```markdown
| ID | Nombre | Tipo | Estado | Plataformas | Disparadores | Doc |
|----|--------|------|--------|-------------|--------------|-----|
| CAP-XXX | &lt;name&gt; | skill | activo | CC, Copilot | "…", "…" | `.claude/doc/<n>.md` |
```

---

## 6. Mapa de portabilidad entre plataformas

| Concepto del diseño | Claude Code | GitHub Copilot | AWS Kiro | Genérico |
|---|---|---|---|---|
| **Skill** | `.claude/skills/<n>/SKILL.md` | `.github/skills/<n>/SKILL.md` (o `.claude/skills`, `.agents/skills`) | `.kiro/steering/<n>.md` (conditional) + spec si tiene workflow | `SKILL.md` estándar (`agentskills.io`) |
| **Agente / persona** | `.claude/agents/<n>.md` (`tools`, `model`) | `.github/agents/<n>.agent.md` (`tools`, `model`, `target`, `handoffs`) | "modo" + spec-driven workflow | archivo de system prompt |
| **Reglas siempre-activas** | `CLAUDE.md` | `.github/copilot-instructions.md` + `*.instructions.md` (`applyTo:`) | steering _always_ | `AGENTS.md` |
| **Automatización determinista** | hooks en `.claude/settings.json` | GitHub Actions / pre-commit | Agent Hooks (on save/create/commit) | CI |
| **Invocación manual** | `/<name>`, `$ARGUMENTS` | agent picker, `#skill`, `*.prompt.md` | ejecutar spec / task | — |
| **Invocación por el modelo** | por `description` | por `description` | por steering match | por `description` |
| **Encadenado guiado** | subagentes + prompt | `handoffs:` | spec → design → tasks | — |
| **Discovery externo** | plugins / marketplace | `gh skill`, `github/awesome-copilot` | — | `anthropics/skills` |

**Notas de adaptación**
- El **cuerpo del `SKILL.md` es idéntico** entre Claude Code, Copilot y genérico. Solo cambian frontmatter (`license`, `model`) y nombres de herramientas.
- En Kiro, una skill "advisory" se vuelve **steering conditional** (glob) y una skill con workflow se vuelve **spec** (`requirements/design/tasks`).
- Un agente de Copilot con `handoffs` se representa en Claude Code como una **cadena de subagentes** descrita en el `SKILL.md` del orquestador.
- Mantener **un solo `name`** por capacidad en todas las plataformas para trazabilidad.

---

## 7. Roles

| Rol | Responsabilidad | Fases |
|---|---|---|
| **Solicitante** | Aporta el gap y la evidencia | F0 |
| **Product owner de plataforma IA** | Escribe el PRD, define métricas y no-goals | F1, GATE A |
| **Diseñador de skills/agentes** | `capability-design.md`, mapa de divulgación, allowlist | F2, F3 |
| **Constructor** | Materializa paquetes por plataforma | F4 |
| **QA de IA** | Diseña y corre evals, revisión adversarial | F3, F5 |
| **Comité kit-IA** | Gates A y B, dueño del catálogo y del `orquestador` | GATE A/B, F6 |

En equipos pequeños una persona cubre varios roles, pero **el revisor de F5 nunca es quien construyó** (contexto fresco).

---

## 8. Evolución y mantenimiento

- **Versionado semántico** de cada capacidad (`MAJOR` = cambia contrato de disparo o de salida; `MINOR` = nuevo caso soportado; `PATCH` = redacción/fix).
- **`## Gotchas` como sección viva**: cada vez que la capacidad produce un resultado malo en uso real → se añade un gotcha. Es el contenido de mayor señal.
- **Revisión trimestral del catálogo**: skills sin uso, descripciones que se solapan, referencias rotas tras refactors.
- **Regresión de evals**: los `*.json` se conservan; cualquier cambio `MAJOR/MINOR` vuelve a correr toda la carpeta `evals/` y registra `run-YYYYMMDD.md`.
- **Deprecación**: marcar en catálogo, mover instrucciones a sección "patrones antiguos" en `<details>`, quitar del `orquestador` en un release aparte.

---

## 9. Checklists rápidas

### 9.1 Antes de escribir el `SKILL.md`
- [ ] `capability-brief.md` con evidencia real
- [ ] `capability-prd.md` con ≥1 métrica y ≥3 no-goals
- [ ] GATE A aprobado
- [ ] `capability-design.md` con mapa de divulgación y allowlist
- [ ] ≥ 3 evals + baseline registrado

### 9.2 Antes del release (GATE B)
- [ ] `description`: 3ª persona · qué + cuándo + keywords · ≤ 1024 chars
- [ ] `SKILL.md` ≤ 500 líneas · referencias a 1 salto · TOC en refs > 100 líneas
- [ ] Sin info sensible al tiempo · terminología consistente · paths con `/`
- [ ] Scripts: manejan errores · sin secretos · sin "voodoo constants" · `--help`
- [ ] `tools`/allowlist mínimo y justificado
- [ ] Evals pasan sobre baseline en todos los modelos objetivo
- [ ] `.claude/doc/<capability>.md` creada (decisiones + adaptadores + changelog)
- [ ] Catálogo actualizado · matriz `orquestador` actualizada (o N/A justificado)
- [ ] Probada por un revisor que NO la construyó

### 9.3 Salud de un agente
- [ ] Un objetivo, una entrada, una salida, una regla de handoff
- [ ] System prompt = manual (identidad, pasos, reglas, ejemplos de qué evitar)
- [ ] Herramientas mínimas para su fase
- [ ] Define su propio "check" de verificación
- [ ] Contexto aislado; devuelve resumen, no volcado de archivos

---

## 10. Cómo arrancar (piloto sugerido)

1. Elegir **una capacidad nueva pequeña** y otra **existente** (p. ej. `cronos`) como piloto.
2. Reconstruir retroactivamente sus artefactos F0–F3 para la existente (brief, prd, design, 3 evals).
3. Crear `resources/ai-capabilities/CATALOG.md` con todas las skills/agentes actuales (solo ID, tipo, disparadores, doc).
4. Aplicar el ciclo completo a la capacidad nueva y medir cuánto tarda cada fase.
5. Ajustar plantillas y gates según fricción observada; recién entonces hacerlo obligatorio.

---

## Fuentes

- [Skill authoring best practices — Claude Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Best practices for Claude Code — Claude Docs](https://code.claude.com/docs/en/best-practices)
- [About agent skills — GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [Adding agent skills for GitHub Copilot — GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills)
- [awesome-copilot — agents.instructions.md](https://github.com/github/awesome-copilot/blob/main/instructions/agents.instructions.md)
- [Custom Agents — awesome-copilot](https://awesome-copilot.github.com/agents/)
- [Best practices — Specs — Kiro Docs](https://kiro.dev/docs/specs/best-practices/)
- [Steering — Kiro Docs](https://kiro.dev/docs/steering/)
- [AWS Kiro: The Agentic IDE That Makes Specs the Unit of Work](https://medium.com/aws-tip/aws-kiro-the-agentic-ide-that-makes-specs-the-unit-of-work-39b8497bbe46)
- [EARS Notation, Explained — braingrid.ai](https://www.braingrid.ai/blog/ears-notation)
- [GitHub Spec Kit — issue #1356 (EARS)](https://github.com/github/spec-kit/issues/1356)
- [Best Practices with Claude Code Subagents (PubNub)](https://www.pubnub.com/blog/best-practices-claude-code-subagents-part-two-from-prompts-to-pipelines/)
- [Claude Code Subagents: A 2026 Practical Guide — Tembo](https://www.tembo.io/blog/claude-code-subagents)
- [Anthropic's 300+ Claude Code Skills: Lessons Learned](https://www.aibuilderclub.com/blog/agent-skills-best-practices-guide)
