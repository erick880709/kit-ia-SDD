# Evaluación y release gates

## Estado de madurez

`storming` tiene un contrato de facilitación y harvesting definido, pero la calidad se verifica manualmente. Sus límites —no diseñar arquitectura, no producir un backlog completo, no diseñar pantallas y no declarar `validado-dominio` sin expertos— son decisiones de responsabilidad, no funcionalidades pendientes.

| Área | Estado | Evidencia |
|---|---|---|
| Formatos y gates | Implementado | `SKILL.md` cubre Big Picture, Process Modelling, Software Design y `cadena`, con gates A–D |
| Contrato de artefactos | Implementado | `artifact-contract.md` define `ES-001`–`ES-016`, IDs, perfiles mínimos y cierre |
| Extensiones opcionales | Implementadas | TO-BE y escenarios de aceptación; no existe extensión contractual de HUs |
| Facilitación | Implementada | `facilitation-guide.md` cubre preparación, desacuerdos, validación y cierre |
| Validación automatizada | No implementada | No hay `scripts/`, schemas ni tests |
| Agente dedicado | Implementado | `storming.agent.md` expone la skill sin subagentes ni automatización del handoff |
| Evidencia de uso | Parcial y no atribuible por completo | OCTO-HR conserva artefactos adicionales que exceden el contrato actual |

## Release gates

La skill no define release gates organizacionales ni publicación versionada. Los gates A–D son su mecanismo de control: determinan si una sesión puede cerrarse en uno de los estados documentados en [07 — Validación y estado](./07-validacion-y-estado.md).

Una evolución futura que agregue schemas, validadores o publicación de artefactos debería definir gates adicionales y evidencia reproducible; no deben documentarse como disponibles antes de existir.

## Límites y handoffs

`storming` entrega:

- decisiones y límites de dominio a `archi`;
- ambigüedades de necesidad a `epicureo`;
- insumos de desglose a `specter`;
- necesidades de interacción a `iris`;
- escenarios o riesgos de calidad a `ranger`.

No tiene un mecanismo formal equivalente a `architecture-gap` de `solution-baseline`. Las decisiones pendientes se expresan como hotspots consolidados en `ES-013`, con responsable y efecto.

## Conclusión

La descripción correcta es: **contrato de facilitación y harvesting implementado, con verificación manual y agente de entrada directa**. No debe presentarse como plataforma validada automáticamente, orquestador multiagente ni generador de Historias de Usuario.
