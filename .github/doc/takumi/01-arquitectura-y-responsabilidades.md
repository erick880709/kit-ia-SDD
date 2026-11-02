# 01 — Arquitectura y responsabilidades

Takumi transforma fuentes de negocio en documentación de procesos trazable. El contrato canónico está en [SKILL.md](../../skills/takumi/SKILL.md); el [agente](../../agents/takumi.agent.md) aporta la entrada especializada y los límites de herramientas. Las plantillas y scripts implementan el contrato; esta documentación lo explica.

## Componentes

| Componente | Responsabilidad |
|---|---|
| Agente `takumi` | Conducir la sesión, distinguir hechos y propuestas, reportar resultados y handoffs |
| Skill `takumi` | Protocolo, exhaustividad, numeración, hotspots y control documental |
| `references/` | Campos y criterios de los tipos documentales |
| `templates/` de la skill | Esqueletos Markdown genéricos |
| `resources/procesos/templates/` del proyecto | Plantillas oficiales del cliente e índice de sus campos |
| `scripts/` | Parsear Markdown y producir derivados Word, Excel y BPMN bajo pedido |
| Dueño del proceso | Resolver vacíos y contradicciones y validar el contenido operativo |

## Flujo y propiedad

Las fuentes de `Meetings/`, documentos previos y entrevistas alimentan el Markdown. El documento del proceso conserva actividades, fuentes, controles, mejoras y hotspots; los inventarios mantienen su estado y los listados maestros mantienen el control documental. Las exportaciones se regeneran desde Markdown.

El agente no dispone de la herramienta `Agent`. Aunque la skill menciona delegar la lectura de fuentes extensas, la entrada instalada no implementa una célula de especialistas: la lectura debe completarse por pasadas con sus herramientas disponibles. No existe un contrato de escritura concurrente sobre inventarios o documentos compartidos.

## Límites y handoffs

| Destino | Cuándo proponer el handoff | Información que debe acompañarlo |
|---|---|---|
| `epicureo` | Propósito, valor o alcance ambiguos | Fuentes, preguntas y decisiones pendientes |
| `storming` | Se necesita descubrir el dominio de software | Proceso, actividades, reglas, actores y excepciones sustentadas |
| `archi` | Se requieren decisiones de sistema | Proceso documentado, necesidades, restricciones y dudas abiertas |

Takumi reporta estos handoffs; no ejecuta automáticamente otros agentes ni convierte una mejora propuesta en arquitectura, backlog o automatización implementada.

[Volver al índice](README.md).
