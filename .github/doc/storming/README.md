# Event Storming — documentación

Esta documentación explica la capacidad `storming` implementada en OCTO-HR: qué resuelve, cómo se opera, cuáles son sus contratos de artefactos y qué mecanismos reales de verificación tiene. “Event Storming” es el nombre de la técnica; el identificador técnico de la skill y su carpeta son `storming`.

## Objetivo

`storming` descubre, valida y documenta dominios de negocio mediante los tres formatos canónicos de EventStorming — Big Picture, Process Modelling y Software Design —, seleccionados o encadenados según el objetivo real de la sesión, nunca ejecutados los tres por rutina. Produce un modelo trazable y versionable bajo `resources/functional/eventstorming/` sin confundir análisis documental con validación real de expertos de dominio.

No selecciona arquitectura, nube, framework ni patrón de persistencia (eso es `archi`), no genera backlog completo ni issues de Jira (eso es `specter`) y no diseña pantallas ni asigna IDs `SCR`/`UC`/`UF` (eso es `iris`).

## Estado actual

| Capacidad | Estado |
|---|---|
| `SKILL.md` como router y receta de facilitación | Implementado |
| Tres formatos (Big Picture, Process Modelling, Software Design) y encadenamiento (`cadena`) | Implementados |
| Contrato de artefactos `ES-001`–`ES-016`, perfiles mínimos por formato y checklist de cierre | Implementado |
| Extensiones opcionales (análisis TO-BE y escenarios de aceptación) | Implementadas cuando aportan valor y existe base suficiente |
| Adaptador de interfaz `agents/openai.yaml` | Implementado |
| Agente top-level [`storming.agent.md`](../../agents/storming.agent.md) | Implementado; entrada directa sin subagentes |
| Gates de facilitación A–D y regla de `validado-dominio` con confirmación de expertos | Implementados como mecanismo manual |
| Validador automatizado de artefactos (script, CLI) | No existe |
| Roadmap o lista de brechas declarada por la skill | No existe |

## Navegación

- [01 — Arquitectura y responsabilidades](./01-arquitectura-y-responsabilidades.md): qué es la skill, los tres formatos y cuándo usar cada uno, encadenamiento entre formatos y relación con otras skills.
- [02 — Guía de uso](./02-guia-de-uso.md): prerrequisitos, entradas, parámetros de sesión (modo/objetivo/formato) y proceso de facilitación por etapas.
- [03 — Contratos y artefactos](./03-contratos-y-artefactos.md): catálogo `ES-001`–`ES-016`, perfiles mínimos por formato, identificadores, ruta real de salida y artefactos adicionales del proyecto que no pertenecen al contrato actual.
- [06 — Extensión y gobierno](./06-extension-y-gobierno.md): cómo crece el modelo dentro del catálogo existente (IDs, reconciliación, extensiones opcionales) y qué no está gobernado.
- [07 — Validación y estado](./07-validacion-y-estado.md): gates de facilitación A–D, checklist de cierre, regla de `validado-dominio` y por qué no existe un validador automatizado.
- [08 — Inventario de implementación](./08-inventario-de-implementacion.md): inventario literal de `SKILL.md`, el adaptador de interfaz y las tres referencias.
- [09 — Evaluación y release gates](./09-evaluacion-y-release-gates.md): estado de madurez honesto de la skill, sin brechas declaradas explícitamente a la fecha.

Dos capítulos del patrón de referencia no aplican a esta skill y se omiten deliberadamente:

- **`04-agentes-y-paralelismo.md`**: se omite porque [`storming.agent.md`](../../agents/storming.agent.md) es una entrada directa sin subagentes ni paralelismo; su contrato se resume en el capítulo 01.
- **`05-cli-y-operacion.md`**: la skill no tiene `scripts/`, CLI ni dependencias ejecutables (confirmado por inventario del directorio de la skill). Toda la operación es conversacional y manual.

## Inicio rápido

Se invoca mediante el agente `storming` o con `$storming` en el chat. Antes de modelar, la skill resuelve en lenguaje natural tres dimensiones: **modo** (`taller`, `documental` o `reconciliacion`), **objetivo** (`AS-IS`, `TO-BE` o `AS-IS+TO-BE`) y **formato** (`big-picture`, `process-modelling`, `software-design` o `cadena`). Si no pueden inferirse, formula una sola pregunta breve.

No hay una única forma correcta de empezar: se elige el formato más pequeño que resuelva el objetivo real de la sesión, según la matriz de `references/format-profiles.md`. Si todavía no se sabe qué proceso profundizar dentro de una línea de negocio amplia, se empieza por `big-picture`; si el proceso ya está delimitado, se puede iniciar directamente en `process-modelling` o `software-design` sin pasar por Big Picture.

## Fuentes de verdad

La fuente operativa principal es el [SKILL.md](../../skills/storming/SKILL.md). Las tres referencias profundizan aspectos específicos y deben leerse bajo demanda, no de memoria:

1. [format-profiles.md](../../skills/storming/references/format-profiles.md) — matriz de decisión de formato y protocolo de cadena.
2. [artifact-contract.md](../../skills/storming/references/artifact-contract.md) — catálogo, identificadores y checklist de cierre.
3. [facilitation-guide.md](../../skills/storming/references/facilitation-guide.md) — guion de facilitación, desacuerdos y validación de modelos documentales.
