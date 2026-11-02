# Pruebas del mecanismo de contratos

Estas pruebas comprueban el código de `contracts/output/` con datos locales y ficticios.
No prueban la aplicación del usuario ni el desempeño de un agente al aplicar una skill.

| Archivo | Qué comprueba |
|---|---|
| [interface.test.mjs](interface.test.mjs) | Esquema común, validador generado, lectura estricta de JSON, CLI, artefactos y límites numéricos |
| [hook.test.mjs](hook.test.mjs) | Hook `Stop`: bloqueo con errores, tope de 3 avisos, memoria de resultados válidos y nombre del archivo |
| [host.test.mjs](host.test.mjs) | API del host: asignación de archivos, tarea, completitud e importación desde un proyecto externo |
| [registry.test.mjs](registry.test.mjs) | Registro `validators.json`: capacidades no QA y rechazo de código fuera del paquete |
| [unregistered.test.mjs](unregistered.test.mjs) | Rechazo de capacidades no registradas |
| [results-root.test.mjs](results-root.test.mjs) | Declaración y resolución de `resultsRoot` |
| [examples.test.mjs](examples.test.mjs) | Los ejemplos de cada skill QA validan y pertenecen a su skill |
| [report.test.mjs](report.test.mjs) | Generador del reporte: veredicto igual al del contrato, Markdown, CLI y `--fail-on-no-go` con solo el paquete copiado |
| [coverage.test.mjs](coverage.test.mjs) | Lector de cobertura de `validators/qa/` y meta del 95% |
| [contract-tests.mjs](contract-tests.mjs) | Casos comunes de aceptación QA que importan los `tests/contracts.test.mjs` de cada skill |

Ejecuta desde `.claude/contracts/output/`:

```bash
npm test
```

Otras pruebas viven en otro lugar:

- Las pruebas de herramientas operativas, como `attach-evidence.mjs`, viven junto a
  su herramienta.
- Las evaluaciones de skills (`evals/evals.json`, `ranger/scripts/evaluate.mjs` y
  `ranger/scripts/smoke-claude.mjs`) miden el trabajo de un agente con una skill.
  Están descritas en el [harness QA](../../../skills/ranger/references/evaluations.md).
