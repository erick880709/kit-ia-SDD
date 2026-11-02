# Inventario de implementación

Este inventario permite localizar cada pieza generada y su responsabilidad.

## Skill principal

| Archivo | Propósito |
|---|---|
| [SKILL.md](../../skills/solution-baseline/SKILL.md) | Router, invariantes, modos, flujo y referencias |
| [agents/openai.yaml](../../skills/solution-baseline/agents/openai.yaml) | Nombre, descripción corta y prompt predeterminado de interfaz |

## Referencias operativas

| Archivo | Contenido |
|---|---|
| [boundaries.md](../../skills/solution-baseline/references/boundaries.md) | Responsabilidades, artefactos permitidos y autoridad |
| [modes.md](../../skills/solution-baseline/references/modes.md) | Modos, estados y reanudación |
| [architecture-discovery.md](../../skills/solution-baseline/references/architecture-discovery.md) | Orden de evidencia y modelo normalizado |
| [architecture-handoff.md](../../skills/solution-baseline/references/architecture-handoff.md) | Brechas que devuelven decisiones materiales a `archi` |
| [artifact-contracts.md](../../skills/solution-baseline/references/artifact-contracts.md) | Blueprint, manifest, receipt y generator result |
| [archetype-selection.md](../../skills/solution-baseline/references/archetype-selection.md) | Gates, puntuación y resolución de versiones |
| [archetype-lifecycle.md](../../skills/solution-baseline/references/archetype-lifecycle.md) | Creación, versionamiento y publicación |
| [capabilities-and-overlays.md](../../skills/solution-baseline/references/capabilities-and-overlays.md) | Composición y control de variantes |
| [generator-protocol.md](../../skills/solution-baseline/references/generator-protocol.md) | Operaciones y flujo seguro de generadores |
| [greenfield.md](../../skills/solution-baseline/references/greenfield.md) | Procedimiento de creación y topología |
| [greenfield-stack-bootstrap.md](../../skills/solution-baseline/references/greenfield-stack-bootstrap.md) | Motores/comandos parametrizados por ecosistema |
| [greenfield-conventions.md](../../skills/solution-baseline/references/greenfield-conventions.md) | Defaults trazables y decisiones no inferibles |
| [application-plumbing.md](../../skills/solution-baseline/references/application-plumbing.md) | Plomería transversal por workload/patrón |
| [brownfield.md](../../skills/solution-baseline/references/brownfield.md) | Ownership y reconciliación segura |
| [migrations-and-drift.md](../../skills/solution-baseline/references/migrations-and-drift.md) | Drift, upgrades, transformaciones y rollback |
| [multi-repository.md](../../skills/solution-baseline/references/multi-repository.md) | DAG, paralelismo, leases y saga |
| [agent-operations.md](../../skills/solution-baseline/references/agent-operations.md) | Instalación portable, aislamiento y concurrencia ejecutable |
| [security-and-trust.md](../../skills/solution-baseline/references/security-and-trust.md) | Fuentes, permisos, secretos y supply chain |
| [stack-adapters.md](../../skills/solution-baseline/references/stack-adapters.md) | Selección, mínimos por workload y extensión |
| [quality-gates-and-handoff.md](../../skills/solution-baseline/references/quality-gates-and-handoff.md) | Gates, evaluaciones y entregables |

## Schemas

Directorio: [assets/schemas](../../skills/solution-baseline/assets/schemas/)

```text
adapter-registry.schema.json
agent-assignment.schema.json
agent-installation.schema.json
architecture-gap.schema.json
archetype-requirement.schema.json
catalog.schema.json
concurrency-policy.schema.json
generator-result.schema.json
receipt.schema.json
routing-observations.schema.json
run-manifest.schema.json
scope-policy.schema.json
solution-blueprint.schema.json
source-verification.schema.json
skill-evaluation.schema.json
vulcano-handoff.schema.json
```

## Plantillas

Directorio: [assets/templates](../../skills/solution-baseline/assets/templates/)

```text
archetype-requirement.template.yaml
agent-assignments.template.yaml
architecture-gap.template.yaml
catalog.template.yaml
generator-result.template.yaml
receipt.template.yaml
run-manifest.template.yaml
solution-blueprint.template.yaml
source-verification.template.yaml
vulcano-handoff.template.yaml
```

Las plantillas contienen placeholders. Algunas son válidas estructuralmente pero deben completarse antes de superar validación estricta.

## Evaluaciones

| Archivo | Propósito |
|---|---|
| [genesis-greenfield-equivalence.yaml](../../skills/solution-baseline/assets/evaluations/genesis-greenfield-equivalence.yaml) | Cobertura contractual Web/API/Worker/Agent y gate de retiro |
| [skill-routing.yaml](../../skills/solution-baseline/assets/evaluations/skill-routing.yaml) | Casos positivos y negativos de activación y modo esperado |

## Scripts

| Archivo | Propósito |
|---|---|
| [solution_baseline.py](../../skills/solution-baseline/scripts/solution_baseline.py) | CLI determinista |
| [test_solution_baseline.py](../../skills/solution-baseline/scripts/test_solution_baseline.py) | 31 pruebas automatizadas, incluidas rutas adversariales, portabilidad, agentes, worktrees y concurrencia |
| [sync_plugin.py](../../skills/solution-baseline/scripts/sync_plugin.py) | Construcción y comprobación del plugin desde la fuente canónica |
| [requirements.txt](../../skills/solution-baseline/scripts/requirements.txt) | Dependencias Python fijadas |

## Adaptadores

| Archivo | Propósito |
|---|---|
| [registry.json](../../skills/solution-baseline/adapters/registry.json) | Ocho adaptadores con detección, motores y validaciones |

## Agentes

| Archivo | Propósito |
|---|---|
| [solution-baseline-orchestrator.agent.md](../../agents/solution-baseline-orchestrator.agent.md) | Coordinación invocable por usuario |
| [architecture-mapper.agent.md](../../agents/architecture-mapper.agent.md) | Discovery de solo lectura |
| [archetype-curator.agent.md](../../agents/archetype-curator.agent.md) | Construcción gobernada de arquetipos |
| [repository-baseline-worker.agent.md](../../agents/repository-baseline-worker.agent.md) | Escritura acotada por repositorio |
| [baseline-validator.agent.md](../../agents/baseline-validator.agent.md) | Veredicto independiente |
| `orquestador.agent.md` general | Retirado del working tree; no forma parte de la operación vigente |

Los cinco roles tienen además adaptadores Codex en `.codex/agents/*.toml`. Codex descubre el skill mediante `.agents/skills/solution-baseline/SKILL.md`, que delega en la implementación canónica sin duplicarla.

Los agentes Claude usan `permissionMode: plan` para discovery o `isolation: worktree` para trabajo con escrituras. Los adaptadores Codex declaran sandbox `read-only` o `workspace-write` y exigen worktree para los roles mutables.

El proyecto fija `agents.max_concurrent_threads_per_session = 4` en `.codex/config.toml`. La política funcional adicional vive en `assets/policies/concurrency-limits.yaml` y limita writers globales, por repositorio y de catálogo.

## Distribución portable

| Ruta | Propósito |
|---|---|
| `plugins/solution-baseline/.codex-plugin/plugin.json` | Manifest local del plugin, versión `0.2.0` |
| `plugins/solution-baseline/skills/solution-baseline/` | Copia construida de la fuente canónica |
| `plugins/solution-baseline/agents/` | Specs Claude; conserva los enlaces relativos del skill |
| `plugins/solution-baseline/assets/agent-adapters/codex/` | Adaptadores Codex portables sin rutas de proyecto |

No se creó marketplace. `sync_plugin.py --check` detecta cualquier divergencia entre la fuente canónica y el paquete.

## Compatibilidad con Genesis

| Archivo | Estado |
|---|---|
| `genesis/SKILL.md` | Retirado en el commit `93e9800`; era un alias hacia `solution-baseline --mode create` |
| `genesis/references/comandos-init-por-stack.md` | Retirado junto con el alias |
| `genesis/references/convenciones-default.md` | Retirado junto con el alias |
| `genesis/references/plomeria-base.md` | Retirado junto con el alias |

## Diseño arquitectónico

| Archivo | Propósito |
|---|---|
| `resources/architecture/27-Plan-y-Diseno-Solution-Baseline.md` | Concepción, benchmark, arquitectura, roadmap y criterios de aceptación; artefacto del proyecto de origen, no incluido en este kit |

## Conteo resumido

| Grupo | Cantidad |
|---|---:|
| Referencias del skill | 20 |
| Schemas JSON | 16 |
| Plantillas YAML | 10 |
| Evaluaciones | 2 |
| Scripts/requisitos | 4 |
| Registros de adaptadores | 1 archivo, 8 adaptadores |
| Agentes especializados | 5 roles × 2 runtimes (Claude Code y Codex) |
| Alias/redirecciones Genesis | 4 |
| Documentos de esta guía | 10 (índice más 9 capítulos) |
