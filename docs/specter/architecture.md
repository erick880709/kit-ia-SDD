# Specter 2.1 — Arquitectura

> Rama: `feature/specter-2.1` · Estado: producción hardening sobre Specter 2.0 (PR #1, mergeada).

## Componentes

```
.claude/skills/specter/
├── SKILL.md                    # Orquestación: discovery → análisis → stories → técnicas → trazabilidad → gate
├── references/                 # breakdown-guide, ears, mcp-boards, quality-gate-rules
├── contracts/                  # user-story.schema.json, technical-task.schema.json, output-contract.json,
│                               # specter-schemas.validate.mjs (validador ajv standalone generado)
├── scripts/
│   ├── engine.mjs              # motor determinista (estados, score, reglas)
│   ├── validate_hu.mjs / validate_tt.mjs   # CLIs individuales
│   ├── quality_gate.mjs        # gate individual + gate de conjunto
│   ├── traceability.mjs        # matriz de trazabilidad end-to-end
│   └── duplicates.mjs          # detección de duplicados exactos/normalizados
├── templates/                  # hu.md, tt.md (plantillas Markdown separadas)
├── tests/                      # schema, quality-gate, traceability, compat, hardening
└── evaluations/                # run.mjs, metrics.mjs, generate-cases.mjs, cases/, baseline-v1.json
```

## Responsabilidades

Specter **descompone y traza**. No estima Story Points (Cupido), no decide arquitectura (Archi),
no implementa (Builder) y no valida funcionalmente (Ranger). Emite complejidad orientativa
(`functional_complexity`, `technical_complexity`), `risk_factors`, `dependencies` y `uncertainties`.

## Flujo

1. **Discovery & Context** — fuente (Jira/Azure DevOps/Markdown), requisitos de origen, bounded contexts.
2. **Requirement Analysis** — ambigüedad, contradicciones, EARS, clasificación confirmado/inferido/asumido/pendiente.
3. **Story Decomposition** — HU con INVEST y criterios Gherkin.
4. **Technical Decomposition** — TT ejecutables con contratos, DoD y evidencias.
5. **Traceability & Quality Gate** — matriz RFP→RF/RNF/RT→EPIC→HU→TT→TC→Evidence; gate individual + conjunto.

## Artefacto

Markdown con frontmatter YAML conforme a los JSON Schema. `builder` y `ranger` leen el cuerpo;
`cupido` lee `epic`, `priority`, `type` y `points` (deprecado). Ver [contracts.md](contracts.md).
