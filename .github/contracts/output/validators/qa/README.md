# Validadores QA

Reglas que usa el consumidor para aceptar las entregas de las siete skills QA
(`ranger` y las `qa-ranger-*`). Leen resultados que ya existen; no ejecutan pruebas.

| Archivo | Para qué sirve | Quién lo ejecuta |
|---|---|---|
| [qa.mjs](qa.mjs) | Reglas de aceptación QA: datos por tarea, cierre, alcance, evidencia y métricas derivadas. Expone `validateInvocation`. | `validate.mjs` y `validate-run.mjs`, mediante [validators.json](../../validators.json). Por esa vía también el hook `Stop` y el host |
| [ctrf.mjs](ctrf.mjs) | Lee un CTRF y lo convierte en la corrida que evalúan las reglas: casos, estados, reintentos y adjuntos. | `qa.mjs` y el generador del reporte de ejecución |
| [coverage.mjs](coverage.mjs) | Lee cobertura unitaria nativa (LCOV, Istanbul, Cobertura, JaCoCo) y calcula conteos. | `qa.mjs` |
| [qa-policy.json](qa-policy.json) | Política QA compartida: tipos de artefacto, evidencia predeterminada y meta de cobertura. | `qa.mjs`, al cargar el contrato de cada skill |

Cada skill conserva su `contracts/output-contract.json`. Ese archivo apunta a esta
política con su campo `policy`, y `qa.mjs` lo lee como configuración.

Los datos que entrega cada skill y sus reglas de cierre están documentados en
[datos y cierre QA](../../../../skills/ranger/references/qa-output.md).
Las herramientas que ejecutan pruebas o preparan entornos viven en cada skill.
