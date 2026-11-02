# Specter 2.0 — Informe ejecutivo

> Rama: `feature/specter-2.0` · Fecha: 2026-11-02 · Entregado en etapas A–G.

## 1. Estado inicial

Specter 1.0 era una skill monolítica de instrucciones (SKILL.md + una guía), sin contratos
formales, sin validación determinista, sin trazabilidad estructurada y sin evaluación. Ver
[ASSESSMENT.md](ASSESSMENT.md) para el diagnóstico completo (10 problemas, 6 de severidad alta).

## 2. Arquitectura implementada

Skill modular con cinco fases (Discovery & Context → Requirement Analysis con EARS → Story
Decomposition con INVEST → Technical Decomposition → Traceability & Quality Gate), contratos JSON
Schema 2020-12 autocontenidos y validadores deterministas en Node (sin dependencias nuevas).
Detalle: [ARCHITECTURE.md](ARCHITECTURE.md).

## 3. Diferencias Specter 1.0 vs 2.0

| Aspecto | 1.0 | 2.0 |
|---|---|---|
| Contrato HU/TT | Frontmatter de 5 campos | JSON Schema 2020-12 + frontmatter YAML completo |
| Trazabilidad | Implícita | `epic_id`, `requirement_ids`, `parent_hu_id`, `source_artifact_ids`, `traceability.mjs` |
| Validación | Prosa (LLM) | Quality Gate determinista (5 dimensiones, 0-100, READY/NEEDS_REFINEMENT/BLOCKED) |
| Evaluación | Inexistente | Harness con 10 escenarios dorados y 10 métricas |
| Requisitos | Texto libre | Notación EARS |
| Preservación | — | 1.0 archivada en `SKILL-v1.0.md` |

## 4. Contratos HU y TT

- [user-story.schema.json](../.claude/skills/specter/contracts/user-story.schema.json)
- [technical-task.schema.json](../.claude/skills/specter/contracts/technical-task.schema.json)
- Documentación: [HU-CONTRACT.md](HU-CONTRACT.md) y [TT-CONTRACT.md](TT-CONTRACT.md).

## 5. Reglas del Quality Gate

Cinco dimensiones ponderadas (Completitud 25, Consistencia 20, Trazabilidad 20, Testabilidad 20,
Implementabilidad 15) más reglas bloqueantes independientes de la puntuación. Estados
`READY`/`NEEDS_REFINEMENT`/`BLOCKED`. Catálogo completo en [QUALITY-GATE.md](QUALITY-GATE.md) y
`references/quality-gate-rules.md`.

## 6. Resultados del Evaluation Harness

10 escenarios dorados, 13 artefactos. Métricas 2.0 medidas:

| Métrica | Valor |
|---|---|
| Requirement Coverage | 1.000 |
| Story Readiness | 0.556 |
| Traceability Coverage | 1.000 |
| Acceptance Criteria Testability | 1.000 |
| Duplicate Detection Rate | 1.000 |
| Ambiguity Detection Rate | 1.000 |
| Technical Task Completeness | 0.980 |
| First Pass Quality Gate Rate | 0.615 |
| False Acceptance Rate | 0.000 |
| False Rejection Rate | 0.000 |

Detalle: [EVALUATION.md](EVALUATION.md) y reporte generado [EVALUATION-REPORT.md](EVALUATION-REPORT.md).
Comparación 1.0 vs 2.0 en `evaluations/baseline-v1.json` (1.0 no medía estas métricas).

## 7. Cobertura de pruebas

- Specter: 22 pruebas (`tests/` + `evaluations/evaluate.test.mjs`), agregadas a la suite del kit.
- Suite completa del kit: **359/359** sin regresiones.
- Catálogo de skills: 32/32 válidas.

## 8. Compatibilidad con el ecosistema

- `builder` y `ranger` siguen leyendo los archivos Markdown; el frontmatter 2.0 es aditivo.
- Se conservan `priority`/`points` y la sección "Recurso de datos involucrado".
- El gate es **opt-in**: no bloquea la lectura de artefactos 1.0.
- El hook de Stop QA no se altera (Specter usa su propio CLI, no run-folders).

## 9. Deuda técnica pendiente

- El gate valida la forma y reglas de calidad, pero la **generación** del desglose sigue
  dependiendo del LLM; el harness evalúa artefactos ya producidos, no el proceso de generación.
- El detector de ambigüedad es estructural (ids en `open_questions`/`assumptions`); no hay análisis
  semántico de la épica.
- `scripts/quality_gate.mjs` no está integrado al hook de Stop (decisión deliberada: modelo de
  artefactos distinto). Podría añadirse un hook propio en el futuro.
- Los validadores son espejo manual de los schemas (verificado por meta-test); si se añade ajv
  como dependencia de build, se podría generar el validador estructural desde los schemas.

## 10. Recomendaciones de evolución

1. Integrar el gate como paso de CI en el proyecto destino (workflow que ejecute `quality_gate.mjs`).
2. Añadir un hook de Stop propio de Specter que valide los HU/TT recién escritos.
3. Ampliar el dataset dorado con casos de integración `archi`/`builder` reales.
4. Generar el validador estructural desde los schemas para eliminar el espejo manual.
