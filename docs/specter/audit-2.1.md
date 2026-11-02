# Specter 2.1 — Auditoría y diagnóstico (FASE 1)

> Rama: `feature/specter-2.1` · Fecha: 2026-11-02 · Estado: solo diagnóstico, sin cambios de código.

Auditoría de la implementación vigente de Specter (mergeada en `main` como PR #1). Los hallazgos
se clasifican P0 (bloquea producción), P1 (riesgo alto), P2 (mejora necesaria) y P3 (opcional).

---

## 1. Alcance inspeccionado

- `.claude/skills/specter/SKILL.md`, `references/` (breakdown-guide, ears, mcp-boards, quality-gate-rules)
- `contracts/` (user-story.schema.json, technical-task.schema.json, output-contract.json, specter-schemas.validate.mjs)
- `scripts/` (engine.mjs, validate_hu.mjs, validate_tt.mjs, quality_gate.mjs, traceability.mjs)
- `templates/` (hu.md, tt.md)
- `evaluations/` (run.mjs, metrics.mjs, generate-cases.mjs, baseline-v1.json, cases/*.json)
- `tests/` (schema, quality-gate, traceability, compat) y `test/specter.test.mjs`
- Consumidores: `cupido` (effort-estimator), `builder`, `ranger`, `archi`
- `resources/functional/hu/` (vacía) y convenciones de `resources/`

---

## 2. Hallazgos

### P0 — bloquea producción

| ID | Hallazgo | Archivo | Corrección | Prueba |
|---|---|---|---|---|
| **P0-1** | Un artefacto con errores de JSON Schema puede alcanzar `READY`: `state` se decide con `blocks` (solo const/enum) y `mandatoryPassed` (reglas de calidad), sin consultar `structuralErrors`. Un HU sin `title` (required) pasaría READY si las reglas de calidad se cumplen. | `scripts/engine.mjs` (líneas 229-233) | Precedencia estricta BLOCKED > NEEDS_REFINEMENT > READY; si `structuralErrors.length > 0` → `NEEDS_REFINEMENT`; `schema_valid` explícito en el resultado. | Test "READY con error estructural" (debe dar NEEDS_REFINEMENT) |
| **P0-2** | `points` es regla obligatoria (`hu_impl_size` exige `points ≤ 8`), con lo que Specter realiza estimación oficial de Story Points, responsabilidad que corresponde a Cupido. Un artefacto sin `points` no alcanza READY. | `scripts/engine.mjs` línea 126-128 | Convertir `points` en campo opcional/deprecado; Specter emite complejidad orientativa (`functional_complexity`, `technical_complexity`, `risk_factors`, `uncertainties`); Cupido estima SP. | Test "HU sin points alcanza READY con complejidad orientativa" |

### P1 — riesgo alto

| ID | Hallazgo | Archivo | Corrección | Prueba |
|---|---|---|---|---|
| **P1-1** | Archivos sin frontmatter se omiten silenciosamente en trazabilidad. | `scripts/traceability.mjs` línea 27-29 | Cada archivo corrupto produce un hallazgo identificable (exit 3 / finding `unparseable`). | Test "archivo corrupto genera hallazgo" |
| **P1-2** | La TT sin HU padre no exige justificación formal: falta `parent_exception_reason` obligatorio y `if/then` (parent_hu_id null ⇒ epic_id + reason). | `contracts/technical-task.schema.json` | Añadir `parent_exception_reason` y condicional JSON Schema. | Tests "TT sin padre justificada" / "injustificada" |
| **P1-3** | Sin Quality Gate de conjunto: no hay validación transversal (IDs únicos, duplicados de título, ciclos, coherencia HU↔TT, cobertura de requisitos). | `scripts/quality_gate.mjs` | Añadir gate de conjunto (`state` agregado + lista de hallazgos). | Tests de conjunto |
| **P1-4** | La detección de duplicados vive solo en el harness, no como validación transversal accesible. | `evaluations/run.mjs` | Extraer a `scripts/duplicates.mjs` con niveles exacto/normalizado (y semántico opcional fuera del gate determinista). | Tests exacto/normalizado/falso positivo |
| **P1-5** | Códigos de salida no documentados ni consistentes (0/1/2 ad hoc). | `scripts/*.mjs` | 0 éxito, 1 errores de calidad, 2 config/ejecución, 3 entrada inválida/imposible de procesar. | Tests de códigos de salida |

### P2 — mejora necesaria

| ID | Hallazgo | Archivo | Corrección | Prueba |
|---|---|---|---|---|
| **P2-1** | El modelo de resultado no distingue `schema_valid`, `errors`, `warnings`, `blocking_issues`, `passed_rules`, `failed_rules`, `evaluated_at`, `artifact_type`. | `scripts/engine.mjs` | Añadir esos campos conservando los actuales (compatibilidad). | Test del contrato de salida |
| **P2-2** | Criterios de aceptación sin `type` (functional/security/performance/...) ni `description`/`expected_result`; no valida Given/When/Then cuando es Gherkin estructurado. | `contracts/user-story.schema.json` | Añadir `type`, `description`, validación de Gherkin equivalente. | Tests de criterios correctos/incorrectos |
| **P2-3** | Sin límites de robustez: tamaño de entrada, manejo de YAML/JSON inválido en el gate, path traversal. | `scripts/*.mjs` | Validar parseo con mensajes claros; limitar tamaño; restringir escritura a `resources/functional/hu/`. | Tests de seguridad |
| **P2-4** | Documentación de Specter vive en `docs/specter-2.0/`; el estándar de esta entrega es `docs/specter/`. | `docs/` | Crear `docs/specter/*.md` (architecture, contracts, quality-gate, traceability, evaluation, integration, migration, audit-2.1, release-checklist). | — |
| **P2-5** | Pesos del score no documentados por dimensión nueva (se pide Completitud 20, Testabilidad 20, Trazabilidad 20, Consistencia 15, Implementabilidad 15, Claridad 10). | `engine.mjs` / `quality-gate-rules.md` | Documentar y probar pesos; añadir dimensión "claridad". | Test de pesos |

### P3 — mejora opcional

| ID | Hallazgo |
|---|---|
| P3-1 | Evaluación de generación con LLM real: debe quedar como prueba opcional, no simulada. |
| P3-2 | Duplicados semánticos con evaluador LLM externo: opcional, fuera del gate determinista. |
| P3-3 | `epic_id` vs `epic`: documentar cuál es canónico y deprecar el alias en una versión futura. |

---

## 3. Veredicto

Specter 2.0 es funcional y está validado (368/368 tests), pero **no es Production Ready**:
- **P0-1** permite artefactos estructuralmente inválidos en `READY` (incumple el criterio de
  aceptación #1 y #2).
- **P0-2** asigna a Specter la estimación oficial de Story Points (incumple la separación con
  Cupido, criterio #6).

Ambos deben corregirse antes de declarar `PRODUCTION READY`. Los P1 (corrupción silenciosa,
justificación de TT sin padre, gate de conjunto, duplicados transversales, códigos de salida)
son necesarios para la trazabilidad y robustez exigidas.

---

## 4. Plan de ejecución propuesto (FASES 2-13)

1. **FASE 2 — Quality Gate:** precedencia de estados, `schema_valid`, campos `errors/warnings/blocking_issues/passed_rules/failed_rules/evaluated_at/artifact_type`, pesos documentados con "claridad".
2. **FASE 3 — Duplicados:** `scripts/duplicates.mjs` (exacto + normalizado) + gate de conjunto.
3. **FASE 4 — Cupido:** `points` opcional/deprecado; complejidad orientativa.
4. **FASE 5 — Contratos:** TT sin padre justificada (`parent_exception_reason` + `if/then`); versionado y migración.
5. **FASE 6 — Gherkin:** `type`, `description`, validación Given/When/Then.
6. **FASE 7 — Trazabilidad:** sin omisión silenciosa, códigos de salida 0/1/2/3, ciclos.
7. **FASE 8 — Gate de conjunto.**
8. **FASE 9 — Harness:** 20 escenarios, métricas de validación/generación/dataset, evaluación de generación reproducible opcional.
9. **FASE 10 — Integración:** pruebas de contrato Specter↔Cupido/Archi/Builder/Ranger.
10. **FASE 11 — Seguridad:** límites y manejo de entradas no confiables.
11. **FASE 12-13 — Documentación y pruebas + release report.**
