# Takumi — documentación de procesos de negocio

Takumi caracteriza, documenta y mejora procesos de negocio a partir de reuniones, entrevistas y
fuentes documentales. Su fuente de verdad es [`SKILL.md`](../../skills/takumi/SKILL.md) y su entrada
especializada es el agente [`takumi`](../../agents/takumi.agent.md).

## Implementación vigente

| Componente | Responsabilidad | Estado |
|---|---|---|
| Skill `takumi` | Protocolo completo, fuentes, artefactos, trazabilidad, hotspots y exportaciones | Implementada |
| Agente `takumi` | Identidad, herramientas y límites de la sesión | Implementado |
| `resources/procesos/` | Raíz contractual de inventarios, documentos, actas y control documental | Se crea o reconcilia al usar la skill |
| Exportación Word, Excel o BPMN | Derivación desde Markdown mediante scripts de la skill | Solo bajo pedido explícito |

El agente es deliberadamente único: los documentos de un proceso comparten fuentes, actividades,
responsables, controles e inventarios. No existe todavía un contrato de ownership que permita dividir
su escritura de forma segura. El agente no tiene la herramienta `Agent` y reporta los handoffs sin
ejecutarlos.

## Límites y handoffs

- Takumi trabaja sobre procesos organizacionales y control documental; no modela automáticamente el
  dominio de software.
- `storming` recibe un handoff cuando se necesita descubrir eventos, comandos, reglas, agregados o
  bounded contexts.
- `archi` recibe un handoff cuando el proceso ya sustentado exige decisiones de sistema.
- `epicureo` recibe ambigüedades de propósito, alcance o valor que deben refinarse antes de continuar.
- Ningún hallazgo o propuesta se presenta como hecho operativo sin fuente o confirmación humana.

## Uso

Seleccione el agente `takumi` o invoque la skill por su nombre canónico. En cada sesión se revisan
primero `Meetings/`, el índice de reuniones procesadas y los inventarios existentes. Markdown permanece
como fuente de verdad incluso después de una exportación oficial.

## Índice de documentación

| Capítulo | Contenido |
|---|---|
| [01 — Arquitectura y responsabilidades](01-arquitectura-y-responsabilidades.md) | Componentes, fuentes de verdad y handoffs |
| [02 — Guía de uso](02-guia-de-uso.md) | Entradas, protocolo de sesión y salidas |
| [03 — Contratos y artefactos](03-contratos-y-artefactos.md) | Descripción archivo por archivo, condiciones y exportaciones |
| [05 — CLI y operación](05-cli-y-operacion.md) | Comandos, dependencias y restricciones de exportación |
| [06 — Extensión y gobierno](06-extension-y-gobierno.md) | Adaptación a clientes, cambios y aprobación |
| [07 — Validación y estado](07-validacion-y-estado.md) | Evidencia disponible, limitaciones y pendientes |
| [08 — Inventario de implementación](08-inventario-de-implementacion.md) | Skill, agente, referencias, plantillas y scripts |
| [09 — Evaluación y release gates](09-evaluacion-y-release-gates.md) | Casos y criterios para verificar cambios |

Se conserva la numeración compartida con Archi; no se crea un capítulo `04` sin equivalente en esa estructura. Esta documentación describe la implementación inspeccionada el 2026-09-14; la presencia de un script no acredita una exportación validada.

## Documento complementario

[Proceso y artefactos para definir skills y agentes](./proceso-skills-agentes.md) es una propuesta de
ciclo de vida para capacidades de IA del kit. No sustituye el contrato operativo de Takumi ni describe
un proceso de negocio administrado por esta skill.
