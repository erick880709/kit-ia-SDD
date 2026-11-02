# Arquitectura y responsabilidades

## ¿Para qué es?

`archi` es una skill expuesta también mediante el agente top-level [`archi.agent.md`](../../agents/archi.agent.md), que hace que Claude actúe como **arquitecto de software senior**: prioriza atributos de calidad según contexto, explicita riesgos y trade-offs, evita sobrediseñar y escribe siempre en español con tono profesional.

Según su propio `SKILL.md`, cubre de punta a punta:

- diseño de una arquitectura nueva desde especificaciones (greenfield);
- documentación o auditoría de la arquitectura de un repositorio existente (AS-IS);
- definición de una evolución AS-IS → TO-BE con análisis de brechas y roadmap de migración;
- preparación de una presentación ejecutiva o para Comité de Arquitectura;
- arquetipos de solución y baseline tecnológico por proyecto;
- vistas C4 y microfrontends;
- gobierno, diseño y catálogo de APIs;
- modelos de datos conceptuales/lógicos/físicos y contratos de persistencia;
- secuencias, vista de despliegue, multi-nube, costos y Terraform;
- ADR/decisiones arquitectónicas, atributos de calidad, QAW, PoC;
- patrones arquitectónicos, de diseño, cloud y de IA;
- Clean Code como dimensión arquitectónica;
- modelo de amenazas y requisitos de seguridad arquitectónica (con handoff a Vulcano).

No es una skill para dudas puntuales sobre una función o archivo aislado: trabaja siempre a nivel de sistema.

## ¿Cuándo usarla?

Úsala **siempre** que el usuario:

- pida diseñar la arquitectura de un proyecto nuevo desde especificaciones;
- pida documentar o auditar la arquitectura de un repositorio existente;
- pida definir una evolución AS-IS/TO-BE;
- pida preparar una presentación ejecutiva o para Comité de Arquitectura;
- mencione cualquiera de los temas listados arriba (arquetipos, C4, APIs, datos, seguridad, cloud/costos, patrones, Clean Code, gap analysis, roadmap) en un alcance de sistema, no de archivo aislado.

El propio `SKILL.md` define un **Paso 0** de determinación de escenario con una salida explícita de "no ejecutar":

- **Caso A — Greenfield:** proponer una arquitectura nueva desde requisitos.
- **Caso B — AS-IS:** documentar o auditar una implementación existente sin inventar el estado deseado.
- **Caso C — TO-BE:** partir de un AS-IS y nuevos objetivos para diseñar la evolución y migración.
- **Sin trabajo arquitectónico:** si no hay arquitectura nueva, ajuste, ni solicitud explícita de documentación/auditoría AS-IS, `archi` **termina sin generar artefactos**.

Si el escenario es ambiguo, la skill debe preguntar antes de generar; en Caso C exige primero un AS-IS reciente (generado o confirmado).

## Gate DR-01 de preparación del dominio

En Casos A/C, `archi` debe demostrar preparación del dominio antes de generar `01` o cualquier artefacto de arquitectura objetivo. Para dominios complejos —procesos transversales, múltiples actores/estados, reglas, excepciones, compensaciones, integraciones o límites inciertos— Event Storming es obligatorio. Solo se admite `validado-dominio`, o `validacion-parcial` sin hotspots arquitectónicos bloqueantes. Un `borrador-documental` no equivale a validación.

Para dominios simples se permite evidencia equivalente validada que cubra propósito, actores, comportamiento, reglas, integraciones, lenguaje, límites y hotspots. Un alcance puramente técnico puede declarar `No aplica` con justificación. Caso B permanece exento mientras solo observe el AS-IS; cualquier TO-BE activa Caso C y DR-01.

Si falta claridad sobre propósito, alcance, métricas o decisiones de stakeholders, `archi` devuelve el control a la sesión llamadora con handoff a `epicureo`. Si faltan eventos, reglas, estados, excepciones, lenguaje o límites, devuelve un handoff a `storming`. `archi` no ejecuta esas capacidades internamente. El contrato completo está en [guia-preparacion-dominio.md](../../skills/archi/references/guia-preparacion-dominio.md).

## Ubicación en el enrutamiento general

No existe actualmente un `orquestador.agent.md` general en `.claude/agents/`. La ruta vigente está documentada en la [matriz de enrutamiento y handoffs](../matriz-enrutamiento-y-handoffs.md): `epicureo` aclara, `storming` descubre el dominio cuando aplica, `archi` diseña y `solution-baseline` materializa. La sesión llamadora debe aplicar los gates y conservar los handoffs.

## Relación con otras skills

Basado únicamente en lo que confirman el propio `SKILL.md` de `archi`, `release.md` y los contratos de las skills relacionadas:

- **Event Storming → `archi` (gate e insumo confirmado):** DR-01 lo exige para dominios complejos antes de generar arquitectura objetivo. El Paso 1 lee `resources/functional/eventstorming/` y trata `ES-002`, `ES-004`, `ES-010`, `ES-012`, `ES-013` y `ES-015` como paquete mínimo cuando correspondan al formato ejecutado, sin exigir documentos ajenos a ese formato.
- **`archi` → Vulcano (handoff de seguridad confirmado):** `19.1-Modelo-de-Amenazas-y-Requisitos-de-Seguridad` entrega a Vulcano criterios verificables (`SEC-xxx`) sin prescribir herramientas, scanners, stages, SLA, SBOM, firma/provenance ni policy as code — eso lo posee Vulcano. El mismo patrón de "criterio arquitectónico, no operacionalización" aplica a Clean Code (`CC-011`) y a la capacidad de entrega de Microfrontends.
- **`archi` → `solution-baseline` (consumo confirmado del lado de `solution-baseline`):** el `SKILL.md` de `solution-baseline` declara que descubre y usa `resources/architecture/` como fuente, y que cuando falta una decisión arquitectónica material emite un `architecture-gap`/handoff (`references/architecture-handoff.md`) que **devuelve el control a `archi`** en lugar de decidir por su cuenta.
- **Iris (paquete de diseño UX), relación condicional:** cuando existe una interfaz conversacional/agentic UI con artefactos Iris (`UF/IF/CF/SCR/CMP/ST/ERR/TC` / `SURF/SCR/CMP/ST/ERR/TC`), `archi` los reutiliza como base de PoC y de diseño detallado — es una integración documentada dentro del propio `SKILL.md`, condicionada a que ese insumo exista.
- **`epicureo` como retorno condicionado:** DR-01 solicita ese handoff cuando faltan propósito, alcance, métricas o decisiones de stakeholders; no es prerrequisito universal. **`janus` como origen:** la conexión sigue siendo indirecta por rutas de archivo: escribe en `resources/architecture/definitions/` y `resources/design/models/`, que `archi` consume en su línea base.

## Agente dedicado

[`archi.agent.md`](../../agents/archi.agent.md) es una capa delgada de entrada: carga exclusivamente la skill `archi`, limita las herramientas y hace explícitos DR-01, la aprobación humana y las fronteras con implementación y operación. Toda la ejecución continúa dentro de una única sesión, sin delegación a especialistas ni coordinación de paralelismo. Los handoffs se reportan y devuelven el control al usuario.
