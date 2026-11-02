# Specter 2.0 — Evaluation Harness

> Implementación: `.claude/skills/specter/evaluations/` — `cases/*.json` (dataset dorado),
> `metrics.mjs` (fórmulas), `run.mjs` (harness). Reporte generado: `EVALUATION-REPORT.md`.

## Principio

La **generación** (LLM) y la **evaluación** (determinista) están separadas. El harness no invoca
modelos, no usa red y no consume tokens: carga artefactos ya producidos y aplica el Quality Gate
determinista.

## Cómo ejecutar

```bash
node .claude/skills/specter/evaluations/run.mjs [--json]
```

Genera `evaluations/results.json` y `docs/specter-2.0/EVALUATION-REPORT.md`.

## Dataset dorado (10 escenarios)

| # | Caso | Qué verifica |
|---|---|---|
| 1 | Épica completa | HU y TT listas |
| 2 | Épica ambigua | Ambigüedad detectada → refinamiento |
| 3 | Requerimientos contradictorios | Contradicción → bloqueo |
| 4 | Requerimientos sin RNF | No se inventan NFR |
| 5 | CRUD | HU + TT de migración |
| 6 | Integración API externa | Componente no inventado → refinamiento |
| 7 | HU demasiado grande | 13 puntos → refinamiento |
| 8 | HU duplicadas | Duplicidad detectada |
| 9 | Cambio sobre sistema existente | Componente existente identificado |
| 10 | Historia sin valor | Sin business_value → refinamiento |

Cada caso declara: entrada, contexto, requisitos, ambigüedades inyectadas, duplicados inyectados,
artefactos con `expected_state`.

## Métricas

| Métrica | Fórmula |
|---|---|
| Requirement Coverage | requisitos cubiertos / requisitos totales |
| Story Readiness | HU READY / HU totales |
| Traceability Coverage | (HU con origen + TT ancladas) / (HU + TT) |
| Acceptance Criteria Testability | CA observables / CA totales |
| Duplicate Detection Rate | duplicados detectados / inyectados |
| Ambiguity Detection Rate | ambigüedades detectadas / inyectadas |
| Technical Task Completeness | media del score de TT / 100 |
| First Pass Quality Gate Rate | artefactos READY / artefactos totales |
| False Acceptance Rate | READY no esperados / total READY |
| False Rejection Rate | no-READY esperados READY / total no-READY |

## Comparación 1.0 vs 2.0

`baseline-v1.json` conserva la referencia de Specter 1.0: no tenía gate ni trazabilidad
estructurada, por lo que esas métricas son N/A o 0. **No se declara mejora** salvo donde 2.0 mide
un valor y 1.0 no lo hacía; el reporte lo hace explícito.

## Interpretación

- `False Acceptance Rate = 0`: el gate no da READY a artefactos que el golden rechaza.
- `False Rejection Rate = 0`: el gate no rechaza artefactos que el golden acepta.
- `Duplicate/Ambiguity Detection = 1`: el harness detectó todo lo inyectado.
