# Inventario de implementación

Inventario de Builder al 14 de septiembre de 2026, sin caches ni resultados externos de campañas.

## Entradas principales

| Artefacto | Responsabilidad |
|---|---|
| [SKILL.md](../../skills/builder/SKILL.md) | Router, invariantes, flujo y cierre. |
| [builder.agent.md](../../agents/builder.agent.md) | Agente de entrada directa para Claude. |
| `agents/openai.yaml` | Metadata de interfaz; no es agente. |
| `plugins/builder/agents/builder.agent.md` | Contrato portable del agente. |
| `plugins/builder/.codex-plugin/plugin.json` | Manifest del plugin local. |

## Recursos

| Grupo | Cantidad |
|---|---:|
| Referencias | 10 |
| Scripts | 2 |
| Módulos de pruebas | 2 |
| Fixtures | 7 |
| Archivos autocontenidos distribuidos | 39 |

Fixtures: `bugfix`, `resume`, `managed`, `contract`, `missing-db`, `worker` y `openspec-active`.

## Referencias

- [Modos](../../skills/builder/references/implementation-modes.md)
- [Fronteras](../../skills/builder/references/boundaries-and-sources.md)
- [Especificación y evidencia](../../skills/builder/references/spec-and-evidence.md)
- [Interoperabilidad SDD](../../skills/builder/references/sdd-interoperability.md)
- [Contratos](../../skills/builder/references/contracts-and-data.md)
- [Coordinación](../../skills/builder/references/resume-and-coordination.md)
- [Revisión](../../skills/builder/references/review-and-debugging.md)
- [Validación](../../skills/builder/references/validation.md)
- [Distribución](../../skills/builder/references/distribution.md)
- [Evaluación](../../skills/builder/references/behavioral-evaluation.md)

## Adaptadores

| Plataforma | Ruta | Estado en este repositorio |
|---|---|---|
| Claude | `.claude/agents/builder.agent.md` | Presente |
| Codex | `.codex/agents/builder.toml` | No presente |
| GitHub Copilot | `.github/agents/builder.agent.md` | No presente |
| Kiro | `.kiro/agents/builder.json` | Fuera de alcance; no presente |

Esta guía contiene diez documentos: índice más nueve capítulos.
