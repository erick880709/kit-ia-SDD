# Specter 2.1 — Release checklist

- [x] Ningún artefacto estructuralmente inválido alcanza READY (`schema_valid` + precedencia).
- [x] Ningún error bloqueante alcanza READY.
- [x] Duplicados exactos y normalizados detectados (`scripts/duplicates.mjs` + gate de conjunto).
- [x] Falsos positivos de duplicidad documentados (solo coincidencias de título normalizado, sin LLM).
- [x] Cupido conserva la responsabilidad de Story Points (`points` opcional/deprecado).
- [x] HU y TT con contratos independientes.
- [x] TT sin padre con justificación formal (`parent_exception_reason` + `epic_id`).
- [x] Criterios de aceptación verificables (`type`, `scenario`/`then`).
- [x] Trazabilidad detecta referencias rotas, ciclos e IDs duplicados.
- [x] Archivos corruptos nunca se omiten silenciosamente (exit 3).
- [x] Quality Gate individual y de conjunto.
- [x] 15 escenarios de evaluación + 4 cubiertos por tests (19 totales).
- [x] Evaluación de generación reproducible (determinista; LLM opcional y no simulado).
- [x] Builder y Ranger consumen las HU/TT (compatibilidad preservada).
- [x] Pruebas de regresión pasan.
- [x] Sin dependencias críticas vulnerables nuevas (solo `yaml` + ajv/esbuild de build, ya declaradas).
- [x] Documentación coincide con la implementación.

## Validación ejecutada

- `node --test`: 379/379.
- `node test/validate-skill-catalog.mjs`: 32/32.
- `node .claude/skills/specter/evaluations/run.mjs`: FAR=0, FRR=0.
- `node test/validate-github-agents-sync.mjs`: 16 agentes sincronizados.
