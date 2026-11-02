# Specter 2.0 — Fuentes de referencia

Patrones tomados de los repositorios de referencia y por qué. No se copió código ni plantillas;
solo se adoptaron patrones, verificando que no introdujeran dependencias ni rompieran la identidad
del kit.

| Fuente | Patrón adoptado | Dónde se refleja |
|---|---|---|
| `github/spec-kit` (Spec Kit) | Quality gates, validación antes de implementar, consistencia entre artefactos | `scripts/quality_gate.mjs`, reglas bloqueantes independientes de la puntuación |
| `Fission-AI/OpenSpec` | Especificación como fuente de verdad, cambios incrementales, trazabilidad propuesta→tareas | `contracts/*.schema.json`, `source_artifact_ids`, `traceability.mjs` |
| `gotalab/cc-sdd` | EARS para requisitos, descomposición técnica, límites de implementación, dependencias entre tareas | `references/ears.md`, `technical-task.schema.json` (`file_boundaries`, `implementation_steps`, `dependencies`) |
| `obra/superpowers` | Separación diseño/implementación, TDD, revisión independiente | Fases 3/4 separadas en `SKILL.md`; `test_strategy` y `evidence_requirements` en TT |
| Marco de contratos del propio kit (familia QA) | `output-contract.json`, validadores deterministas, JSON Schema 2020-12 | `contracts/`, `scripts/engine.mjs`, patrón de tests |

## Por qué NO se adoptaron

- **Bases de datos/embeddings** (Memoria, Basic Memory): el kit ya es Markdown-first y determinista;
  Specter no necesita almacenamiento extra.
- **Agentes en background** (claude-memory-skill): fuera del alcance de una skill de desglose.
- **CLIs externos o MCP obligatorios:** se conserva el MCP de Jira como entrada opcional, sin
  dependencia dura; la validación es 100% local.

## Verificación de licencias

Ningún fragmento de código, plantilla o texto fue copiado de los repositorios de referencia; solo
se adoptaron patrones conceptuales (no sujetos a licencia). El código de Specter 2.0 es original
del kit-ia-SDD.
