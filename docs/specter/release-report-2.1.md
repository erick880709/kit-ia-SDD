# Specter 2.1 — Informe de release

> Rama: `feature/specter-2.1` · Fecha: 2026-11-02 · Veredicto: **READY WITH ACCEPTED LIMITATIONS**

## 1. Resumen ejecutivo

Hardening de producción sobre Specter 2.0 (PR #1). Se corrigieron los dos bloqueantes P0 (falsos
READY con error de JSON Schema; estimación de Story Points en Specter) y los riesgos altos
(trazabilidad con omisión silenciosa, TT sin padre sin justificación, duplicados transversales,
gate de conjunto, códigos de salida).

## 2. Hallazgos corregidos

- **P0-1**: precedencia BLOCKED > NEEDS_REFINEMENT > READY; `schema_valid`; ningún error de esquema
  alcanza READY.
- **P0-2**: `points` opcional/deprecado; complejidad orientativa; Cupido estima Story Points.
- **P1-1**: archivos corruptos reportados (exit 3), nunca omitidos.
- **P1-2**: `parent_exception_reason` + `if/then` para TT habilitadora de épica.
- **P1-3/P1-4**: gate de conjunto + `scripts/duplicates.mjs` (exacto/normalizado).
- **P1-5**: códigos de salida 0/1/2/3 documentados.
- **P2-1**: modelo de resultado ampliado (`errors`, `warnings`, `blocking_issues`, `passed_rules`,
  `failed_rules`, `evaluated_at`, `artifact_type`).
- **P2-2**: criterios con `type`, `description` y validación de resultado observable.
- **P2-4/P2-5**: documentación `docs/specter/` y pesos con "claridad" (20/20/20/15/15/10).

## 3. Resultados

| Suite | Resultado |
|---|---|
| `node --test` | 379/379 |
| Catálogo de skills | 32/32 |
| Harness (15 casos, 19 artefactos) | FAR=0, FRR=0 |
| Sincronización de agentes | 16/16 |

## 4. Limitaciones conocidas

1. La detección semántica de duplicados con LLM es opcional y no está integrada (el gate es
   determinista y solo detecta exactos/normalizados).
2. La evaluación de generación con LLM real no se ejecutó (requiere credenciales); la evaluación
   determinista de contratos sí se ejecuta y es reproducible.
3. El harness cubre 15 escenarios por objeto; los 4 restantes del requisito (corrupto, ciclo,
   estructural inválido, TT sin padre injustificada) se cubren con tests de trazabilidad/hardening.
4. `points` queda deprecado pero presente por compatibilidad con cupido; no hay migración forzada
   de artefactos históricos.

## 5. Veredicto

**READY WITH ACCEPTED LIMITATIONS**: los P0 están cerrados, las condiciones críticas de aceptación
se demuestran con pruebas, y las limitaciones restantes son semánticas/opcionales y están
documentadas. No se declara `PRODUCTION READY` absoluto porque la evaluación de generación con LLM
real no se ejecutó (se reporta como no ejecutada, no como aprobada).
