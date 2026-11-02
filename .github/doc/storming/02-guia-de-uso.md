# Guía de uso

## Prerrequisitos

### Funcionales

- Determinar tres dimensiones antes de modelar: **modo** (`taller`, `documental` o `reconciliacion`), **objetivo** (`AS-IS`, `TO-BE` o `AS-IS+TO-BE`) y **formato** (`big-picture`, `process-modelling`, `software-design` o `cadena`). Si no pueden inferirse, formular una sola pregunta breve.
- Para `taller`: expertos de dominio con autoridad para confirmar reglas, un facilitador y un responsable de registrar hotspots.
- Para `process-modelling`/`software-design`: confirmar punto inicial y punto final del proceso; para `big-picture`: confirmar la línea de negocio sin reducirla prematuramente a un único proceso.
- Declarar inclusiones, exclusiones y fuentes desde el encuadre inicial (`ES-001`).
- Para `reconciliacion`: deben existir ya archivos `ES-*.md` que se leen antes de proponer cambios, preservando IDs estables y ediciones manuales.

### Técnicos

- Ninguna dependencia de scripts, Node.js, Python, red, MCP o conector remoto: la skill no incluye un validador propio ni herramientas ejecutables (el directorio de la skill solo contiene `SKILL.md`, `agents/openai.yaml` y tres archivos en `references/`).
- Mermaid embebido en Markdown para líneas de tiempo y mapas cuando aporte claridad, sin pipeline de compilación asociado; las tablas siguen siendo la fuente versionable de detalle.
- Sistema de archivos y búsqueda de contenido sobre `resources/` para localizar fuentes y, en modo `reconciliacion`, los `ES-*.md` existentes.

## Entradas

| Entrada | Uso |
|---|---|
| Texto libre en el chat | Descripción directa del proceso o dominio a modelar. |
| Rutas explícitas o IDs de requerimiento | `CTX`, `RF`, `RNF`, `RT`, `RD` a trazar desde el modelo. |
| `resources/functional/context/` | Contexto de negocio previo. |
| `resources/functional/requests/` | Requerimientos funcionales (típicamente de `janus`). |
| `resources/functional/reqs/` | Requerimientos adicionales del repositorio. |
| `resources/architecture/definitions/` | Requisitos no funcionales/técnicos (`janus`). |
| `resources/design/models/` | Modelos de diseño existentes. |
| `resources/summary/` | Resúmenes previos del dominio o del proyecto. |
| `resources/functional/eventstorming/` | Artefactos `ES-*.md` ya existentes; su presencia activa el modo `reconciliacion`. |
| Valor `todos` | Instrucción de leer el corpus relevante completo en vez de una fuente puntual. |

## Parámetros de sesión

Se resuelven en lenguaje natural al invocar `$storming`, antes de planificar la sesión.

### Modo

| Modo | Cuándo aplicarlo | Estado máximo permitido |
|---|---|---|
| `taller` | Participan expertos de dominio y pueden confirmar/corregir el modelo | `validado-dominio` |
| `documental` | Solo hay documentos, código, transcripciones o descripciones | `borrador-documental` |
| `reconciliacion` | Ya existen archivos `ES-*.md` y deben continuarse o actualizarse | Conservar o degradar el estado según la evidencia |

Comportamiento predeterminado: `reconciliacion` si ya existen `ES-*.md`; si no, `documental` cuando solo hay fuentes escritas y `taller` cuando hay expertos disponibles para confirmar/corregir en vivo.

### Objetivo

- `AS-IS`: describir lo que ocurre hoy.
- `TO-BE`: diseñar cambios futuros sobre un AS-IS validado o explícitamente aceptado como base.
- `AS-IS+TO-BE`: se completa y valida primero el AS-IS; el TO-BE se modela después, sin mezclar eventos.

### Formato

| Formato | Valores | Comportamiento predeterminado |
|---|---|---|
| `big-picture`, `process-modelling`, `software-design`, `cadena` | — | Se elige el más pequeño que resuelva el objetivo según la matriz de `references/format-profiles.md`; no se ejecutan los tres formatos por defecto. |

No existe una subsección "Del validador": la skill no incluye un script de validación automatizada (ver [07 — Validación y estado](./07-validacion-y-estado.md)).

## Proceso de facilitación

1. **Etapa 0 — Encuadrar la sesión.** Confirmar propósito, resultado esperado, formato, AS-IS/TO-BE, participantes, inclusiones/exclusiones y fuentes; crear o reconciliar `ES-001`. **Gate A:** no continuar si el propósito o el formato no están claros.
2. **Receta según formato seleccionado** (solo la o las que apliquen):
   - **Big Picture:** eventos caóticos en pasado → línea de tiempo con pivotes → personas y sistemas externos → walkthrough narrado. **Gate B:** línea de tiempo, pivotes y eventos faltantes confirmados.
   - **Process Modelling:** camino base a estado estable → comando/actor por evento → consultas/read models → políticas (`cuando evento → si condición → entonces comando`) → rutas alternativas, excepciones y compensaciones. **Gate C:** cada camino termina en estado estable, la gramática se respeta, las excepciones tienen resultado y los stakeholders quedan satisfechos.
   - **Software Design:** partir de un proceso crítico ya comprendido → mover límites → agregados por comportamiento/invariantes/ciclo de vida → read models → lenguaje ubicuo → bounded contexts → entidades solo si aclaran comportamiento. **Gate D:** un bounded context no se trata como servicio desplegable.
3. **Etapa transversal — Consolidar hotspots** en `ES-013`, clasificando impacto, prioridad, responsable, evidencia y si bloquea dominio, arquitectura, backlog o implementación.
4. **Extensiones opcionales** (cuando el objetivo las requiera y hay base suficiente):
   - Modelar mejoras y TO-BE (`ES-014`, `ES-015`).
   - Extraer pruebas de aceptación Dado/Cuando/Entonces trazadas a IDs reales (`ES-016`).
5. **Etapa final — Harvesting, validación y cierre.** Aplicar solo el perfil mínimo de `references/artifact-contract.md` para el formato ejecutado y registrar uno de los estados `borrador-documental`, `validacion-parcial`, `validado-dominio` o `bloqueado-por-hotspots`, junto con fuentes, participantes, conteos por tipo de elemento, hotspots bloqueantes y siguiente handoff recomendado.

Los gates A–D y el checklist de cierre completo están detallados en [07 — Validación y estado](./07-validacion-y-estado.md).

## Rondas de preguntas

En modo documental o conversación asíncrona, usar máximo 5 preguntas por ronda y priorizar hotspots bloqueantes. En taller, permitir preguntas emergentes y usar hotspots para proteger el foco. Si se continúa con riesgo aceptado, documentar quién lo aceptó y qué etapa/formato queda condicionado.
