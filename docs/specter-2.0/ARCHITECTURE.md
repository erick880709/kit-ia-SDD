# Specter 2.0 — Arquitectura objetivo (ETAPA B)

> Rama: `feature/specter-2.0` · Estado: diseño (sin modificar Specter 1.0).

Este documento describe la arquitectura objetivo de Specter 2.0. Es el resultado de la ETAPA B
y la base para las etapas de implementación (C–G). Los archivos de Specter 1.0
(`SKILL.md`, `references/breakdown-guide.md`) permanecen intactos en esta fase.

---

## 1. Principios de diseño

1. **Una responsabilidad:** descomponer y trazar. Specter no decide arquitectura (`archi`), no
   implementa (`builder`) y no prueba (`ranger`).
2. **Contratos antes que prosa:** cada HU y TT tiene una forma formal verificable (JSON Schema
   2020-12) y una representación Markdown legible derivada de la misma.
3. **Validación determinista:** la calidad la mide un Quality Gate ejecutable, no un LLM.
4. **Compatibilidad hacia atrás:** los artefactos que hoy consume `builder`/`ranger` siguen
   existiendo; el contrato nuevo extiende, no rompe.
5. **Sin dependencias nuevas:** solo Node.js (ya exigido por el kit) y el paquete `yaml` ya
   presente.

---

## 2. Componentes

```
.claude/skills/specter/
├── SKILL.md                              # (ETAPA C) orquestación de 5 fases
├── references/
│   ├── breakdown-guide.md                # (conservado, revisado en ETAPA C)
│   ├── ears.md                           # (ETAPA C) notación EARS para requisitos
│   └── quality-gate-rules.md             # (ETAPA D) catálogo de reglas del gate
├── contracts/
│   ├── output-contract.json              # ✔ creado: contrato de salida
│   ├── user-story.schema.json            # ✔ creado: esquema HU
│   └── technical-task.schema.json        # ✔ creado: esquema TT
├── scripts/
│   ├── validate_hu.mjs                   # (ETAPA D) validador HU determinista
│   ├── validate_tt.mjs                   # (ETAPA D) validador TT determinista
│   ├── traceability.mjs                  # (ETAPA D) motor de trazabilidad
│   └── quality_gate.mjs                  # (ETAPA D) gate agregado
├── tests/
│   ├── schema.test.mjs                   # (ETAPA D) pruebas de esquemas
│   ├── quality-gate.test.mjs             # (ETAPA D) pruebas del gate
│   └── traceability.test.mjs             # (ETAPA D) pruebas de trazabilidad
└── evaluations/
    ├── cases/*.json                      # (ETAPA E) dataset dorado
    ├── run.mjs                           # (ETAPA E) harness determinista
    ├── metrics.mjs                       # (ETAPA E) métricas
    └── baseline-v1.json                  # (ETAPA E) línea base Specter 1.0
```

## 3. Fases de orquestación (SKILL.md 2.0)

| Fase | Responsabilidad | Entrada | Salida |
|---|---|---|---|
| 1. Discovery & Context | Identificar épica/requisitos, consumir RF/RNF/RT, leer bounded contexts de `storming`, arquitectura existente y restricciones | Jira o `resources/functional/reqs/*.md`; artefactos de `storming`/`archi` | Contexto estructurado (sin decisiones inventadas) |
| 2. Requirement Analysis | Detectar ambigüedad, contradicciones, duplicidad, reglas, restricciones e incompletitud; clasificar confirmado/inferido/asumido/pendiente; formular preguntas | Contexto de la fase 1 | Lista de hallazgos y preguntas (máx. 5 por ronda) |
| 3. Story Decomposition | Aplicar INVEST, valor de negocio, CA con Gherkin, flujos alternativos y excepciones | Requisitos analizados | HU (objetos `user_story` válidos) |
| 4. Technical Decomposition | Descomponer cada HU en TT con componente, contratos, datos, seguridad, pasos, pruebas y DoD | HU de la fase 3 | TT (objetos `technical_task` válidos) |
| 5. Traceability & Gate | Construir la cadena RFP→RF/RNF/RT→HU→TT→TC→evidencia, detectar huecos y ejecutar el gate | HU + TT | Artefactos + reporte del gate |

## 4. Representación dual del artefacto

El artefacto canónico es **Markdown con frontmatter YAML** (la convención del kit), y ese
frontmatter es un objeto JSON conforme a los esquemas. El gate lee el YAML, lo convierte a JSON
(paquete `yaml` ya presente) y valida contra `user-story.schema.json` / `technical-task.schema.json`.

```
resources/functional/hu/hu-01-login.md
├── frontmatter YAML  →  objeto JSON conforme a user-story.schema.json
└── cuerpo Markdown   →  renderizado legible (Como/Quiero/Para, CA, recurso de datos)
```

Esto conserva lo que `builder` y `ranger` ya leen (secciones Markdown) y añade una forma
verificable sin cambiar el formato de archivo.

## 5. Modelo de trazabilidad

```
RFP → janus → RF/RNF/RT ──┐
                          ├→ EPIC ─→ HU ─→ TT ─→ TC ─→ Evidencia
epicureo → NNN-slug.md ───┘
storming → bounded contexts ─┘ (contexto, no requisito)
```

- `HU.requirement_ids` y `HU.epic_id` anclan la HU a su origen.
- `TT.parent_hu_id` ancla la TT a su HU (o a la épica de forma excepcional y documentada).
- `acceptance_criteria[].requirement_ids` y `test_references` anclan la prueba al requisito.
- El motor de trazabilidad (ETAPA D) detecta: requisito sin HU, HU sin origen, HU sin TT cuando
  requiere implementación, TT sin HU padre, CA sin escenario, referencia rota.

## 6. Quality Gate (resumen; detalle en QUALITY-GATE.md)

Cinco dimensiones (Completitud, Consistencia, Trazabilidad, Testabilidad, Implementabilidad),
reglas independientes, estados `READY` / `NEEDS_REFINEMENT` / `BLOCKED`, puntuación 0-100 con
pesos documentados y reglas bloqueantes que no se compensan con score.

## 7. Compatibilidad con el ecosistema

| Skill | Cómo se preserva |
|---|---|
| `builder` | Sigue leyendo `resources/functional/hu/*.md`; se conservan `id`, título, `Como/Quiero/Para`, `Criterios de Aceptación` y "Recurso de datos involucrado". El frontmatter nuevo añade campos; los legados `priority`/`points` se conservan. |
| `ranger` | `acceptance_criteria` sigue siendo derivable a Gherkin/checklist; `test_references` facilita la derivación. |
| `archi` | La sección "Recurso de datos involucrado" no desaparece; el nuevo campo `data_contracts` de TT la complementa. |
| `effort-estimator` | `priority` y `points` siguen disponibles para estimación. |
| Hook de Stop | Specter **no** se registra en el hook QA (modelo de artefactos distinto: Markdown vs. run-folders JSON). El gate es un CLI independiente ejecutado por `node --test` o manualmente. |

## 8. Decisiones registradas (ADR breves)

- **D1.** Contrato en JSON Schema 2020-12 autocontenido, `$id` con prefijo `urn:kit-ia:specter:0.1.0:`.
- **D2.** Artefacto canónico en Markdown con frontmatter YAML; no se crean JSON sidecars obligatorios.
- **D3.** `schema_version` fijo `0.1.0` en esta entrega; migración documentada en MIGRATION.md para futuros bumps.
- **D4.** Gate independiente del hook de Stop (no usa run-folders); reutiliza el paquete `yaml` existente.
- **D5.** `type` discriminador: `historia_usuario` / `tarea_tecnica` (migración desde las etiquetas "Historia de Usuario"/"Tarea Técnica").
