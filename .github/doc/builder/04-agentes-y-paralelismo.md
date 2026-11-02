# Agente y paralelismo

## Topología

| Agente | Escritura | Fuente de verdad |
|---|---|---|
| [`builder`](../../agents/builder.agent.md) | Código y artefactos dentro del alcance autorizado | [`builder/SKILL.md`](../../skills/builder/SKILL.md) |

No existe una célula Builder ni un orquestador propio. El agente carga el skill y sus referencias; no copia el proceso.

## Adaptadores

| Runtime | Archivo | Estado en este repositorio |
|---|---|---|
| Claude Code | `.claude/agents/builder.agent.md` | Presente |
| Codex | `.codex/agents/builder.toml` | No presente; se generaba con `sync_agent_adapters.py` (ver [carpetas por proveedor](../carpetas-por-proveedor.md)) |
| GitHub Copilot | `.github/agents/builder.agent.md` | No presente; Copilot puede descubrir la skill desde `.claude/skills/` |
| Kiro | `.kiro/agents/builder.json` | Fuera de alcance; no presente |

`plugins/builder/` tampoco está en este repositorio. Para llevar Builder a otro proyecto use
`scripts/install_builder.py` (ver [distribución](../../skills/builder/references/distribution.md)).

## Paralelismo

Builder trabaja secuencialmente por defecto. Puede delegar cuando las unidades son independientes, cada writer tiene ownership exclusivo, no hay contrato mutable compartido, el runtime lo permite y el costo de coordinación resulta justificado.

Los cambios sobre el mismo módulo, lockfile, contrato o migración permanecen secuenciales. Una asignación transmite objetivo, criterios, rutas autorizadas, estado inicial, restricciones y formato de resultado. Consulte [reanudación y coordinación](../../skills/builder/references/resume-and-coordination.md).

## Revisión independiente

La revisión propia es necesaria, pero no independiente. Cuando el riesgo o gobierno exijan independencia, otro contexto o responsable revisa aceptación, calidad y evidencia sin recibir la solución esperada.
