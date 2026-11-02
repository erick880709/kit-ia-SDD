# Specter 2.1 — Evaluación

`evaluations/run.mjs` (harness determinista, offline) + `evaluations/cases/*.json` (dataset dorado
generado por `generate-cases.mjs`) + `evaluations/metrics.mjs`.

## Separación generación / evaluación

La generación con LLM queda fuera del harness. El harness valida artefactos ya producidos con el
Quality Gate determinista. La evaluación de generación real es **opcional** y, si requiere
credenciales, se identifica como no ejecutada.

## Escenarios (15 en el harness + 4 cubiertos por tests)

1. Épica completa · 2. Épica ambigua · 3. Requisitos contradictorios · 4. Sin RNF · 5. CRUD ·
6. Integración API externa · 7. HU demasiado grande (points deprecado) · 8. HU duplicadas ·
9. Historia sin valor · 10. Cambio sobre sistema existente · 11. TT sin padre justificada ·
12. Requisito sin trazabilidad · 13. CA no verificables · 14. HU válida con warnings ·
15. Historias similares pero diferentes.

Adicionalmente, cubiertos por `tests/hardening.test.mjs` y `tests/traceability.test.mjs`:
frontmatter corrupto, dependencia circular, HU estructuralmente inválida y TT sin padre injustificada.

## Métricas (deterministas)

Requirement Coverage · Story Readiness · Traceability Coverage · Acceptance Criteria Testability ·
Duplicate Detection · Ambiguity Detection · Technical Task Completeness · First Pass Quality Gate
Rate · False Acceptance Rate · False Rejection Rate. Fórmulas y denominadores en `metrics.mjs`.

## Resultado 2.1 (medido)

- Requirement Coverage 1.000 · Traceability Coverage 0.947 · AC Testability 0.933
- Duplicate/Ambiguity Detection 1.000 · TT Completeness 0.984
- **False Acceptance Rate 0.000 · False Rejection Rate 0.000**
