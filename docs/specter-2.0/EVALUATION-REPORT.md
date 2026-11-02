# Specter 2.0 — Reporte del Evaluation Harness

> Generado por `evaluations/run.mjs` (determinista, sin LLM). No declarar mejora sin métricas.

## Métricas (Specter 2.0 medido)

| Métrica | Valor | Fórmula |
|---|---|---|
| requirement_coverage | 1 | requisitos cubiertos / requisitos totales |,| story_readiness | 0.643 | HU READY / HU totales |,| traceability_coverage | 0.947 | (HU con origen + TT ancladas) / (HU + TT) |,| acceptance_criteria_testability | 0.933 | CA observables / CA totales |,| duplicate_detection | 1 | duplicados detectados / duplicados inyectados |,| ambiguity_detection | 1 | ambigüedades detectadas / ambigüedades inyectadas |,| technical_task_completeness | 0.984 | media del score de TT / 100 |,| first_pass_quality_gate_rate | 0.684 | artefactos READY / artefactos totales |,| false_acceptance_rate | 0 | READY no esperados / total READY |,| false_rejection_rate | 0 | no-READY esperados READY / total no-READY |

## Resultados por caso

| Caso | Nombre | Artefactos (estado) |
|---|---|---|
| ca-no-verificable | Criterios de aceptación no verificables | HU-13:NEEDS_REFINEMENT |,| cambio-sistema-existente | Cambio sobre sistema existente | TT-09:READY |,| crud | Funcionalidad CRUD | HU-05:READY, TT-05:READY |,| epic-ambigua | Épica ambigua | HU-02:NEEDS_REFINEMENT |,| epic-completa | Épica completa | HU-01:READY, TT-01:READY |,| historia-sin-valor | Historia sin valor de negocio | HU-10:NEEDS_REFINEMENT |,| historias-similares-distintas | Historias similares pero diferentes | HU-15a:READY, HU-15b:READY |,| hu-demasiado-grande | HU demasiado grande | HU-07:READY |,| hu-duplicadas | HU duplicadas | HU-08a:READY, HU-08b:READY |,| hu-sin-trazabilidad | Requisito sin trazabilidad | HU-12:NEEDS_REFINEMENT |,| hu-valida-warnings | HU válida con warnings | HU-14:READY |,| integracion-api-externa | Integración con API externa | TT-06:NEEDS_REFINEMENT |,| requisitos-contradictorios | Requerimientos contradictorios | HU-03:BLOCKED |,| requisitos-sin-rnf | Requerimientos sin RNF | HU-04:READY |,| tt-sin-padre-justificada | TT sin HU padre justificada | TT-11:READY |

## Comparación 1.0 vs 2.0

Specter 1.0 no tenía Quality Gate determinista, contratos ni trazabilidad estructurada. Los
valores de referencia están en `evaluations/baseline-v1.json`; las métricas que 1.0 no medía se
marcan como N/A. La mejora solo se declara donde 2.0 mide un valor y 1.0 no lo hacía.
