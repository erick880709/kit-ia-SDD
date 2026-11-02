# Specter 2.0 — Auditoría y diagnóstico (ETAPA A)

> Fecha: 2026-11-02 · Rama de trabajo: `feature/specter-2.0` · Estado: solo lectura, sin modificaciones de código.

Este documento es el entregable de la **Fase 0 / ETAPA A**. Presenta el diagnóstico del estado
actual de la skill `specter`, los problemas e inconsistencias detectados, las dependencias reales
con el ecosistema y la propuesta de arquitectura objetivo. No modifica ningún archivo del kit.

---

## 1. Arquitectura actual de Specter

Specter es hoy una skill **monolítica de instrucciones**, sin código, sin contratos formales y sin
validadores:

```
.claude/skills/specter/
├── SKILL.md                      (13.9 KB — todo el comportamiento)
└── references/breakdown-guide.md (6.3 KB — heurísticas de descomposición)
```

- **Entrada:** épica de Jira (vía MCP) o archivo Markdown en `resources/functional/reqs/`.
- **Proceso:** 6 pasos lineales en `SKILL.md`:
  1. Pedir la fuente de entrada (Jira o Markdown).
  2. Verificar ambigüedades (versiones de tecnología, métricas, seguridad, integraciones, roles).
  3. Analizar alcance (valor de negocio, actores, entidades de datos, dependencias).
  4. Generar el desglose (HU, TT, subtareas) con plantillas Markdown.
  5. Elegir destino (Jira, Markdown `resources/functional/hu/`, o ambos).
  6. Persistir: subir a Jira o crear `hu-XX-*.md` / `tt-XX-*.md`.
- **Salida:** archivos Markdown con frontmatter mínimo o issues de Jira.

### Frontmatter actual de salida (Markdown)

```yaml
---
id: HU-01
type: Historia de Usuario | Tarea Técnica
epic: CLAVE-ÉPICA
priority: Alta | Media | Baja
points: 1|2|3|5|8|13
---
```

Es **informal**: sin esquema, sin validación, sin versionado y sin trazabilidad estructurada hacia
requisitos de origen.

---

## 2. Ecosistema y dependencias reales

### 2.1 Productores de insumos de Specter

| Skill | Entrega | Consumo de Specter |
|---|---|---|
| `janus` | RF/RNF/RT en `resources/functional/requests/`, `resources/architecture/definitions/`, `resources/design/models/` | Indirecto: las épicas suelen derivar de estos requisitos |
| `epicureo` | Especificación refinada en `resources/functional/reqs/NNN-slug.md` | Directo: fuente Markdown declarada en el Paso 0 |
| `storming` | Modelo de dominio y oportunidades en `resources/functional/eventstorming/` | Directo: contexto de bounded contexts y trazabilidad; documenta handoff a `specter` |

### 2.2 Consumidores de los resultados de Specter

| Skill | Consume | Requisito de compatibilidad |
|---|---|---|
| `builder` | HU/TT en `resources/functional/hu/*.md` o issues de Jira | Necesita criterios de aceptación verificables y, si aplica, "Recurso de datos involucrado" para el scaffold |
| `ranger` | Criterios de aceptación y evidencia | Necesita CA comprobables (Gherkin o checklist) para derivar casos de prueba |
| `effort-estimator` (`cupido`) | Backlog desglosado | Necesita estimaciones y prioridades consistentes |
| `archi` | No consume directamente; sí lee HU previas para el Modelo de Datos (Paso 0.6) | Necesita la sección "Recurso de datos involucrado" cuando exista |

### 2.3 Contratos y validación existentes en el kit

El kit ya tiene un **marco de contratos de salida** que Specter no usa:

```
.claude/contracts/output/
├── validators.json              # capabilityId → script validador
├── validate.mjs / rules.mjs     # motor determinista de validación
├── schemas/result.schema.json   # JSON Schema de resultados (Draft 2020-12)
└── validators/qa/qa.mjs + qa-policy.json   # validador de la familia QA
```

Patrón por skill QA (reutilizable por Specter):

```
.claude/skills/<skill>/
├── SKILL.md
├── contracts/output-contract.json   # contractVersion, capabilityId, resultsRoot, policy, semanticPostconditions
└── tests/contracts.test.mjs         # pruebas del contrato
```

**Hallazgo clave:** Specter no tiene `contracts/output-contract.json`, no está registrado en
`validators.json` y no tiene ningún test. Es la única skill productora de backlog sin validación
determinista de sus artefactos.

### 2.4 Convenciones de `resources/`

- **Fuente de entrada de Specter:** `resources/functional/reqs/NNN-slug.md` (de `epicureo`).
- **Salida de Specter:** `resources/functional/hu/` (minúsculas), con `hu-XX-*.md` y `tt-XX-*.md`.
- **Inconsistencia detectada:** la documentación de `storming` y `builder` alterna entre
  `resources/functional/hu/` (minúsculas) y `resources/functional/HUs/` (mayúsculas, citada como
  "artefactos del proyecto"). Solo existe físicamente `resources/functional/hu/`. Esto no es un
  fallo funcional de Specter, pero la trazabilidad documental es ambigua y conviene fijar un único
  canon en la documentación de Specter 2.0.

---

## 3. Problemas e inconsistencias detectados

| # | Problema | Evidencia | Severidad |
|---|---|---|---|
| P1 | **Sin contrato formal HU/TT.** El frontmatter tiene solo 5 campos; no hay esquema JSON ni validación. | [SKILL.md](.claude/skills/specter/SKILL.md) Paso 5b | Alta |
| P2 | **Sin trazabilidad estructurada.** No hay `requirement_ids`, `epic_id` ni enlaces a RF/RNF/RT; el vínculo RFP→HU→TT es implícito. | Sin campos de origen en el frontmatter | Alta |
| P3 | **Sin Quality Gate.** No existe validador que distinga READY / NEEDS_REFINEMENT / BLOCKED; la "Regla de calidad" es prosa sin verificación. | `SKILL.md` "Reglas de calidad" | Alta |
| P4 | **Sin Evaluation Harness.** No hay métricas ni dataset dorado que mida la calidad del desglose. | No existe `test/` de specter | Alta |
| P5 | **No hay agente top-level.** Specter se invoca directo; los handoffs dependen del usuario. Es intencional según `catalogo-agentes.md`, pero dificulta el descubrimiento. | `.claude/agents/` sin `specter.agent.md` | Media |
| P6 | **Deuda de frontmatter.** La clave top-level `compatibility` no la admite el validador `skill-creator`. | `doc/README.md` línea 84; `SKILL.md` frontmatter | Media |
| P7 | **TT sin estructura rigurosa.** Las TT solo tienen descripción y "Criterios de Done"; no hay `component`, `architecture_layer`, `api_contracts`, `data_contracts`, `security_considerations`, `implementation_steps`, `test_strategy`, `definition_of_done` ni `evidence_requirements`. | `SKILL.md` Paso 4 | Alta |
| P8 | **Ambigüedad no clasificada formalmente.** Se pregunta al usuario, pero no se distingue confirmado/inferido/asumido/pendiente de forma persistente y verificable. | `SKILL.md` Paso 2 y "Manejo de épicas incompletas" | Media |
| P9 | **Sin política de versionado/migración.** Si cambia el formato HU/TT, no hay estrategia para no romper `builder` ni `ranger`. | Inexistente | Alta |
| P10 | **Validación no determinista.** Toda la calidad depende del LLM; no hay reglas ejecutables independientes. | Sin scripts en `specter/` | Alta |

---

## 4. Compatibilidad y riesgos de regresión

### 4.1 Compatibilidad a preservar (contratos vivos)

1. **`builder`** consume `resources/functional/hu/*.md`. Cualquier cambio de formato debe mantener
   legibles los archivos actuales o migrarlos. Los campos mínimos hoy usados por `builder`:
   `id`, `type`, `epic`, `priority`, `points`, título `# HU-XX`, secciones `Como/Quiero/Para`,
   `Criterios de Aceptación` y `Recurso de datos involucrado` (opcional).
2. **`ranger`** consume `Criterios de Aceptación` para derivar casos; el formato debe seguir siendo
   derivable a Gherkin o checklist.
3. **`archi` (Paso 0.6)** lee la sección "Recurso de datos involucrado" de las HU; no debe
   desaparecer ni cambiar de significado.
4. **IDs estables:** `HU-XX` / `TT-XX` y los slugs de archivo no deben renumerarse sin estrategia.

### 4.2 Riesgos de regresión

| Riesgo | Impacto | Mitigación propuesta |
|---|---|---|
| Romper el frontmatter que `builder` ya lee | `builder` no podría consumir HU/TT | Mantener campos actuales + añadir nuevos; migración documentada |
| Renumerar IDs históricos | Pérdida de trazabilidad | Política "nunca reutilizar ni renumerar; los nuevos continúan la secuencia" |
| Exigir campos que el LLM no puede conocer | Falsos positivos del gate | Usar estados `pending`/`no_specified` en lugar de inventar; reglas bloqueantes solo sobre lo obligatorio |
| Duplicar responsabilidades de `archi`/`builder`/`ranger` | Incoherencia de arquitectura | Specter descompone y traza; **no** decide arquitectura ni implementa ni prueba |

---

## 5. Propuesta de arquitectura objetivo (Specter 2.0)

Estructura modular por fases, alineada con el patrón de contratos del kit:

```
.claude/skills/specter/
├── SKILL.md                         # Orquestación: discovery → analysis → story → technical → traceability → gate
├── references/
│   ├── breakdown-guide.md           # (conservado y revisado)
│   ├── ears.md                      # NEW: requisitos con notación EARS (ref. cc-sdd)
│   └── quality-gate-rules.md        # NEW: catálogo de reglas del gate
├── contracts/
│   ├── output-contract.json         # NEW: contrato de salida de Specter
│   ├── user-story.schema.json       # NEW: JSON Schema Draft 2020-12 para HU
│   └── technical-task.schema.json   # NEW: JSON Schema Draft 2020-12 para TT
├── scripts/
│   ├── validate_hu.mjs              # NEW: validador determinista de HU (0-100 + estados)
│   ├── validate_tt.mjs              # NEW: validador determinista de TT
│   ├── traceability.mjs             # NEW: motor de trazabilidad (requisitos → HU → TT → TC)
│   └── quality_gate.mjs             # NEW: Quality Gate agregado (READY/NEEDS_REFINEMENT/BLOCKED)
├── tests/
│   ├── schema.test.mjs              # NEW: pruebas de esquemas y contratos
│   ├── quality-gate.test.mjs        # NEW: pruebas del gate (casos + y −)
│   └── traceability.test.mjs        # NEW: pruebas de trazabilidad
└── evaluations/
    ├── cases/*.json                 # NEW: 10+ escenarios dorados (entrada, contexto, esperado, fallos a detectar)
    ├── run.mjs                      # NEW: harness determinista (sin LLM, sin red)
    ├── metrics.mjs                  # NEW: fórmulas y denominadores explícitos
    └── baseline-v1.json             # NEW: resultados de referencia de Specter 1.0
```

### 5.1 Modelo de datos objetivo

- **HU** (`user-story.schema.json`): `id`, `epic_id`, `requirement_ids[]`, `title`, `business_value`,
  `user_story` (rol/acción/beneficio), `description`, `scope.included/excluded`, `business_rules[]`,
  `preconditions[]`, `main_flow[]`, `alternative_flows[]`, `exceptions[]`, `acceptance_criteria[]`
  (con `id`, `given/when/then`, `negative`), `dependencies[]`, `nfr_references[]`,
  `test_references[]`, `assumptions[]`, `open_questions[]`, `status`, `quality_score`,
  `schema_version`, `artifact_version`, `created_at`, `updated_at`, `source_artifact_ids[]`.
- **TT** (`technical-task.schema.json`): `id`, `parent_hu_id`, `title`, `technical_objective`,
  `component`, `architecture_layer`, `implementation_scope`, `file_boundaries[]`, `api_contracts[]`,
  `data_contracts[]`, `security_considerations[]`, `dependencies[]`, `implementation_steps[]`,
  `test_strategy`, `definition_of_done[]`, `evidence_requirements[]`, `status`, `quality_score`,
  versionado y `source_artifact_ids[]`.

### 5.2 Quality Gate (5 dimensiones)

1. **Completitud** — campos obligatorios presentes.
2. **Consistencia** — sin contradicciones internas ni duplicados.
3. **Trazabilidad** — requisitos de origen existentes, TT con HU padre, sin referencias rotas.
4. **Testabilidad** — criterios verificables, escenarios negativos cuando apliquen.
5. **Implementabilidad** — TT acotadas, sin decisiones arquitectónicas inventadas.

Estados de salida: `READY` / `NEEDS_REFINEMENT` / `BLOCKED`. Reglas bloqueantes independientes de la
puntuación (una falla crítica no se compensa con score alto). Puntuación 0-100 con pesos documentados
y resultados explicables (score, estado, reglas ok/fallidas, severidad, evidencia, recomendación,
responsable sugerido).

### 5.3 Evaluation Harness

- 10+ escenarios dorados (épica completa, ambigua, contradictoria, sin RNF, CRUD, integración API,
  HU gigante, HU duplicadas, cambio sobre sistema existente, sin valor de negocio).
- Métricas con fórmula y denominador explícitos: Requirement Coverage, Story Readiness, Traceability
  Coverage, Acceptance Criteria Testability, Duplicate Detection Rate, Ambiguity Detection Rate,
  Technical Task Completeness, First Pass Quality Gate Rate, False Acceptance Rate, False Rejection
  Rate.
- Ejecución **determinista y offline**: la generación (LLM) queda separada de la evaluación. El
  harness consume artefactos ya generados y solo aplica validadores deterministas.
- Reporte comparativo JSON + Markdown (Specter 1.0 vs 2.0), sin declarar mejora si las métricas no
  lo demuestran.

---

## 6. Archivos que requieren modificación

| Archivo | Cambio |
|---|---|
| `.claude/skills/specter/SKILL.md` | Reescritura modular (fases 6.x del prompt); conserva flujo Jira/Markdown; quitar `compatibility` top-level (mover al cuerpo o `metadata`) |
| `.claude/skills/specter/references/breakdown-guide.md` | Revisión menor (INVEST explícito, límites de tamaño, no-invención) |
| `.claude/doc/catalogo-skills.md` | Actualizar la entrada de Specter con los nuevos artefactos |
| `.claude/doc/matriz-enrutamiento-y-handoffs.md` | Reflejar gate y harness en el handoff a `builder`/`ranger` |
| `.claude/contracts/output/validators.json` | Registrar `specter` → `specter/scripts/quality_gate.mjs` (si se integra al hook) |
| `README.md` | Añadir Specter 2.0 al catálogo y a la sección de validación |
| `CLAUDE.md` | Añadir nota del gate y del harness de Specter |

## 7. Archivos nuevos propuestos

| Archivo | Propósito |
|---|---|
| `docs/specter-2.0/ARCHITECTURE.md` | Arquitectura objetivo detallada |
| `docs/specter-2.0/HU-CONTRACT.md` | Documento del contrato HU |
| `docs/specter-2.0/TT-CONTRACT.md` | Documento del contrato TT |
| `docs/specter-2.0/QUALITY-GATE.md` | Reglas, pesos, estados y evidencia |
| `docs/specter-2.0/EVALUATION.md` | Harness, métricas y dataset dorado |
| `docs/specter-2.0/MIGRATION.md` | Estrategia de migración/versionado HU/TT |
| `docs/specter-2.0/REFERENCE-SOURCES.md` | Patrones tomados de cada repo de referencia y por qué |
| `.claude/skills/specter/contracts/*` | Esquemas y contrato de salida |
| `.claude/skills/specter/scripts/*` | Validadores y Quality Gate |
| `.claude/skills/specter/tests/*` | Pruebas unitarias, de esquema, contrato y trazabilidad |
| `.claude/skills/specter/evaluations/*` | Dataset dorado, harness y métricas |

---

## 8. Veredicto de la auditoría

- Specter 1.0 **funciona** como generador de backlog, pero toda su calidad es informal y depende
  del LLM: no hay contrato, ni validación determinista, ni trazabilidad verificable, ni evaluación.
- La evolución a 2.0 es **viable y compatible** si se respetan los contratos vivos de `builder`
  (campos de frontmatter + "Recurso de datos involucrado") y `ranger` (criterios de aceptación), y
  se reutiliza el marco de contratos/validadores que ya usa la familia QA.
- **No se modifica ningún archivo del kit en esta fase.** La implementación (ETAPAS B–G) queda
  pendiente de autorización.

---

## Siguiente paso (pendiente de decisión)

Presentar este diagnóstico y, con autorización, continuar con **ETAPA B** (diseño de contratos
formales HU/TT y arquitectura objetivo) antes de tocar código.
