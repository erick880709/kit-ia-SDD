# Inventario de implementación

Este inventario describe la implementación real de la skill `storming`. No existen schemas, plantillas ejecutables, scripts, evaluaciones automáticas ni registro de adaptadores.

## Skill y metadata de interfaz

| Archivo | Propósito |
|---|---|
| [SKILL.md](../../skills/storming/SKILL.md) | Límites, selección de formato, workflow, convenciones, gates y handoffs |
| [agents/openai.yaml](../../skills/storming/agents/openai.yaml) | Metadata de interfaz y prompt de invocación; no es un agente coordinador de `.claude/agents/` |

## Referencias

| Archivo | Contenido |
|---|---|
| [format-profiles.md](../../skills/storming/references/format-profiles.md) | Decisión de formato, mecánica mínima, extensiones y encadenamiento |
| [artifact-contract.md](../../skills/storming/references/artifact-contract.md) | Perfiles de harvesting, catálogo `ES-001`–`ES-016`, identificadores y checklist |
| [facilitation-guide.md](../../skills/storming/references/facilitation-guide.md) | Preparación, facilitación, desacuerdos, validación y cierre |

## Capacidades que no existen en esta skill

| Categoría | Estado |
|---|---:|
| Schemas o plantillas ejecutables | No existen |
| Scripts, CLI o validador automático | No existen |
| Evaluaciones de routing | No existen |
| Registro de adaptadores | No existe |
| Derivación contractual de Historias de Usuario | No existe |
| Agente dedicado en `.claude/agents/` | [`storming.agent.md`](../../agents/storming.agent.md) |

## Enrutamiento externo

No existe un router general instalado. La skill se invoca mediante el agente top-level `storming` o directamente como `$storming`; los handoffs se aplican según su contrato y la [matriz documental](../matriz-enrutamiento-y-handoffs.md).

## Salidas contractuales

| Ruta | Contenido |
|---|---|
| `resources/functional/eventstorming/` | Artefactos Markdown `ES-001`–`ES-016` aplicables al perfil seleccionado |

Los archivos adicionales encontrados en esa carpeta y `resources/functional/HUs/` son artefactos del proyecto, no salidas garantizadas por el contrato vigente.

## Conteo resumido

| Grupo | Cantidad |
|---|---:|
| Skill principal y metadata | 2 |
| Referencias | 3 |
| Schemas, plantillas, scripts, evaluaciones y adaptadores | 0 |
| Agentes dedicados top-level | 1 |
| Total de archivos dentro de `.claude/skills/storming/` | 5 |
