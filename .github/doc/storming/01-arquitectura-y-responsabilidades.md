# Arquitectura y responsabilidades

## Qué es

`storming` descubre, valida y documenta dominios de negocio mediante los tres formatos canónicos de EventStorming — Big Picture, Process Modelling y Software Design —, seleccionados o encadenados según el objetivo real de la sesión, nunca ejecutados los tres por rutina. Produce un modelo trazable y versionable bajo `resources/functional/eventstorming/` sin confundir análisis documental con validación real de expertos de dominio: un modelo inferido solo de documentos nunca se marca `validado-dominio`.

El board, la conversación y las decisiones tomadas en vivo son el resultado principal de la skill; los archivos `ES-*.md` son un harvesting posterior para preservar aprendizaje y habilitar handoffs hacia otras skills.

## Qué no hace

- No selecciona arquitectura, nube, framework ni patrón de persistencia (eso es `archi`).
- No genera historias, backlog, tareas técnicas, subtareas, Story Points ni issues de Jira; entrega el modelo a `specter` para ese desglose.
- No diseña pantallas ni asigna IDs de UX; `iris` consume los procesos, actores, estados y escenarios cuando necesita traducirlos a experiencia.
- No declara un modelo `validado-dominio` cuando solo hubo análisis documental.

## Los tres formatos

| Formato | Elegir cuando | Resultado principal |
|---|---|---|
| `big-picture` | Explorar una línea de negocio amplia, alinear perspectivas contradictorias o localizar áreas críticas | Narrativa global, línea de tiempo con pivotes, personas/sistemas externos y hotspots |
| `process-modelling` | Descubrir o diseñar un proceso end-to-end específico con sus variantes | Flujo de baja fidelidad con comandos, eventos, políticas y read models, probado hasta estado estable |
| `software-design` | Diseñar el comportamiento de software de un proceso crítico ya comprendido | Agregados, invariantes, read models, lenguaje ubicuo y bounded contexts |

Se elige el formato más pequeño que resuelva el objetivo, según la matriz de decisión de [format-profiles.md](../../skills/storming/references/format-profiles.md). Big Picture no es un prerrequisito universal: un proceso bien delimitado puede iniciar directamente en Process Modelling o Software Design.

## Encadenamiento entre formatos (`cadena`)

Cuando un formato necesita explícitamente el resultado de otro, se declara una cadena. Las dos combinaciones documentadas son:

- `big-picture → process-modelling`, cuando todavía no se sabe qué proceso merece profundización.
- `process-modelling → software-design`, cuando el proceso ya está comprendido pero falta diseño conductual.

Cada formato se cierra y valida antes de iniciar el siguiente, declarando explícitamente:

```text
Formato actual: <formato>
Entrada heredada: <artefacto o ninguno>
Pregunta que este formato debe resolver: <pregunta>
Criterio de cierre: <resultado observable>
Siguiente formato: <formato o ninguno>
```

No se reutiliza automáticamente el mismo grupo de participantes entre formatos encadenados: el tamaño y la perspectiva se ajustan al objetivo de cada receta.

## Adaptador de interfaz

La skill conserva [`agents/openai.yaml`](../../skills/storming/agents/openai.yaml) como metadata de presentación (`display_name`, descripción corta y prompt de invocación por defecto). El agente top-level ejecutable es [`storming.agent.md`](../../agents/storming.agent.md); no define paralelismo ni subagentes.

## Relación con otras skills

| Skill | Relación |
|---|---|
| `janus` | Fuente previa típica: sus RF/RNF/RT en `resources/functional/requests/` y `resources/architecture/definitions/` alimentan el modelo. |
| `epicureo` | `storming` le devuelve necesidades o hotspots que requieren aclaración formal, métricas de éxito, alcance o decisión de stakeholders; `epicureo` refina la necesidad y `storming` descubre/modela el dominio. |
| `archi` | Recibe al menos `ES-002`, `ES-004`, `ES-010`, `ES-012`, `ES-013` y `ES-015` cuando correspondan al formato, con los hotspots que bloquean decisiones arquitectónicas. `storming` nunca traduce automáticamente `bounded context = microservicio`. |
| `iris` | Puede consumir actores, flujos, estados, comandos, eventos y escenarios de aceptación para diseñar la experiencia; `storming` no asigna IDs ni diseña pantallas. |
| `specter` | Recibe oportunidades/capacidades y trazabilidad del modelo para generar historias y tareas; `storming` no produce ese backlog. |
| `ranger` | Recibe los escenarios de aceptación (`AT`) como base de casos de prueba, cuando se ejecutó esa extensión. |

## Enrutamiento

Existe un agente dedicado `storming`, pero no un router general instalado. La ruta verificable es invocar el agente o `$storming`; en ambos casos la sesión llamadora conserva el control de los handoffs.

La matriz documental conserva un gate específico para historias/requerimientos:

```text
epicureo (clarificación) → storming (solo si el proceso es transversal, con
múltiples actores/estados/reglas/excepciones/integraciones) → specter (desglose y carga a Jira)
```

sin saltar directamente a `specter` cuando el dominio no está resuelto.
