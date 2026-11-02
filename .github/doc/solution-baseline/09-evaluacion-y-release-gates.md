# Evaluación y release gates

## Resultado de la evaluación

La implementación quedó alineada con el patrón recomendado de skill progresivo: metadata breve para routing, `SKILL.md` como router, referencias bajo demanda, scripts deterministas y agentes con responsabilidades estrechas. La fuente del proyecto sigue siendo canónica; un proceso de build verificable produce un plugin portable y adaptadores para Claude Code/Codex.

Referencias de producto consultadas:

- [OpenAI — Build skills](https://learn.chatgpt.com/docs/build-skills)
- [OpenAI — Subagents and custom agents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Claude Code — Extend Claude with skills](https://code.claude.com/docs/en/skills)
- [Claude Code — Create custom subagents](https://code.claude.com/docs/en/sub-agents)

## Recomendaciones aplicadas

| Hallazgo | Ajuste aplicado | Evidencia |
|---|---|---|
| Metadata demasiado amplia | Descripción enfocada en arquitectura → baseline y exclusiones | `SKILL.md` y evaluación de routing |
| Resolver confiaba en digest declarado | `verify-source` recalcula material local y el resolver vincula ID, source y digest | schemas de atestación y pruebas de ausencia/tampering |
| Versiones resueltas aceptaban rangos | Validación exacta y schemes SemVer/npm, PEP 440, Maven y NuGet | pruebas de blueprint y constraints multi-ecosistema |
| Run manifest decía DAG sin contrato | Nodos, dependencias, barreras, ciclos y estado final modelados y validados | schema de run y pruebas semánticas |
| Scope audit incompleto | Política versionada y detección case-insensitive en rutas raíz, anidadas, absolutas y traversal | `scope-boundaries.yaml` y pruebas ampliadas |
| Leases con carrera y borrado riesgoso | `filelock`, validación estructural y ubicación obligatoria bajo `leases/` | pruebas de owner, ruta y documento malformado |
| Resultados y manifest demasiado abiertos | Objetos tipados para artifacts, decisions, warnings, evidence, resoluciones, builds, instancias y blockers | JSON Schemas |
| Handoff a arquitectura informal | Contrato `architecture-gap`, plantilla, referencia y bloqueo por componente | schema, CLI `--kind gap` y prueba de run completado |
| Agentes extensos y aislamiento implícito | Specs reducidos y `verify-workspace` comprueba que cada rol mutable opere en un worktree enlazado distinto del checkout principal | agentes Claude/Codex, CLI y pruebas Git |
| Ausencia de instalación verificable de agentes | `agents install/check` materializa cinco adaptadores por runtime, verifica hashes y no sobrescribe conflictos | CLI, receipt local y pruebas de instalación/drift |
| Concurrencia sin límites ejecutables | Política versionada, contrato de assignments y límite Codex de cuatro subagentes | `concurrency-limits.yaml`, `.codex/config.toml` y `check-concurrency` |
| Routing evals meramente declarativos | Contrato de observaciones y comparador con fallos por ausencia/divergencia | `evaluate-routing` y pruebas |
| Plugin dependía del layout del proyecto | Comandos relativos a `<skill-root>` y plugin construido desde la fuente canónica con chequeo de 66 archivos | `plugins/solution-baseline`, prueba de portabilidad y `sync_plugin.py` |

## Límite de responsabilidad con `archi`

`solution-baseline` devuelve control a `archi` solamente cuando falta una decisión que cambia el estado deseado: topología, límites, ownership, contratos, seguridad, estilo o stack. El handoff debe ser un `architecture-gap` trazable.

La ausencia de un arquetipo publicado no devuelve control a `archi`. En ese caso la arquitectura ya define el qué y `solution-baseline` resuelve el cómo reusable:

1. reutilizar una familia compatible;
2. componer capabilities u overlays;
3. crear, validar y publicar un candidato reusable;
4. materializar una baseline específica no promovida.

## Estado honesto de madurez

Los contratos, controles locales y agentes están implementados, pero todavía no existe evidencia para declarar una plataforma de generación lista para producción en todos los stacks. Faltan arquetipos ejecutables publicados y pruebas end-to-end sobre proyectos reales.

| Nivel | Estado | Qué demuestra |
|---|---|---|
| Contratos y políticas | Listo para piloto | Schemas, DAG, atestación, política de alcance, routing y handoffs |
| CLI de control | Listo para piloto | Inspección, validación, diff, drift, verificación/resolver, leases y registro idempotente |
| Agentes | Listo para piloto controlado | Roles instalables, hashes, worktrees y concurrencia verificables; no calidad del código generado |
| Distribución | Lista para piloto | Plugin local portable y validable; publicación/marketplace no realizados |
| Arquetipos | Pendiente | No hay familias publicadas con digest y golden projects |
| Baseline end-to-end | Pendiente | Falta crear/actualizar, compilar, probar y ejecutar soluciones reales |
| Escala multi-equipo | Pendiente | Falta adopción, telemetría, catálogo gobernado y evidencia de upgrades |

## Release gates

### Gate A — aceptar un arquetipo

- descriptor y catálogo válidos en modo estricto;
- fuente local atestada, licencia, owner, versión exacta y digest inmutable;
- dos golden projects con parámetros distintos;
- install, lint/typecheck, build, tests y smoke;
- render determinista;
- pruebas negativas de parámetros, permisos y hooks;
- ausencia de DevOps/IaC y datos del proyecto origen;
- migración probada desde cada versión declarada.

### Gate B — aceptar una baseline de repositorio

- blueprint y contratos congelados;
- cero `architecture-gap` abierto para el componente;
- arquetipo publicado o estrategia project-specific aprobada;
- dry-run, scope audit y diff revisado;
- ownership brownfield respetado;
- gates del stack y vertical slice observables;
- receipt y handoff Vulcano válidos.

### Gate C — aceptar una solución multi-repositorio

- Gate B por repositorio;
- productores y consumidores usan contratos con el mismo hash;
- DAG válido, acíclico y con barreras satisfechas;
- ningún ownership tiene writers simultáneos;
- fallos parciales y resume probados;
- validación integrada cross-repo;
- handoffs a Builder, Ranger, Vulcano y `archi` completos.

### Gate D — retirar Genesis

- matriz contractual válida;
- arquetipos requeridos publicados;
- al menos dos proyectos o equipos completados con evidencia;
- ningún flujo activo depende de políticas exclusivas de Genesis.

Hasta superar estos gates, la documentación debe usar “contrato implementado” o “listo para piloto”, no “generador completo en producción”. La evaluación de routing actual prueba el harness con observaciones sintéticas; ejecutar casos contra modelos/agentes reales y conservar esas observaciones sigue pendiente.
