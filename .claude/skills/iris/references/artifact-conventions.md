# Convenciones de artefactos y Markdown

## Contenido

- [Fuente de verdad](#fuente-de-verdad)
- [No dupliques evidencia de dominio](#no-dupliques-evidencia-de-dominio)
- [Tabla de contenido en cada artefacto](#tabla-de-contenido-en-cada-artefacto)
- [Árbol recomendado](#árbol-recomendado)
- [Pantallas como fuente única](#pantallas-como-fuente-única)
- [Numeración, prioridad y extensión](#numeración-prioridad-y-extensión)
- [IDs estables](#ids-estables)
- [Encabezados canónicos](#encabezados-canónicos)
- [Links y navegación](#links-y-navegación)
- [Inventarios y sistema de diseño](#inventarios-y-sistema-de-diseño)

## Fuente de verdad

Mantén el contenido de diseño en Markdown. Usa encabezados predecibles, tablas
de Markdown, y links relativos. Permite salida interna en JSON solo como dato
de validación efímero; nunca exijas un modelo de diseño paralelo en JSON. La
única excepción persistente son los valores de tokens de diseño en
`03-design-system/tokens/*.tokens.json` (W3C Design Tokens): son datos que
consume el código; las decisiones y su justificación viven en `foundations.md`.

Conserva los IDs fuente (por ejemplo `RF-001`, `CM01`, o `EV01`) en una tabla de
mapeo cuando el repositorio ya los use. Asigna IDs canónicos de Iris a los
artefactos de UX y registra `Source IDs` en vez de renombrar silenciosamente la
evidencia externa.

## No dupliques evidencia de dominio

Iris es la capa de UI/UX, no una segunda copia del modelo de dominio. Antes de
escribir `01-context/actors.md` o `01-context/entities.md`, verifica si esa
evidencia ya vive en Event Storming o en un modelo de datos:

- **Actores ya documentados** → referencia el `Source ID` y agrega solo el
  delta de UX (qué pantalla los usa, qué visibilidad o permiso aplica, qué
  acción dispara). No repitas la descripción de rol que ya está en la fuente
  — usa una tabla compacta (`ID | Source ID | Name | Role (1 línea) | UX
  Notes`), no una sección narrativa por actor. Reserva la sección narrativa
  completa únicamente para actores que la UX introduce y que no existen en
  ninguna fuente de dominio. No agregues una columna de "Related
  Requirements/Use Cases" — esa relación ya vive en el bloque `Actor` de
  cada `UC-0XX` (en `01-context/use-cases.md` si el proyecto necesita uno
  separado, o en `05-validation/traceability-matrix.md` si no); repetirla en ambos
  archivos es la misma duplicación que esta sección busca evitar.
- **Entidades ya documentadas** → mismo principio, con dos columnas
  adicionales que si aportan valor real de UX: `Screen (View)` y `Screen
  (Admin)` — qué pantalla la muestra y cuál la edita/crea. Si el proyecto ya
  tiene un modelo de datos físico implementado (DDL, diccionario de datos),
  **reconcíialo contra las entidades de Event Storming como una suma**: toda
  entidad debe encontrar su tabla, y toda tabla con relevancia de negocio
  debe encontrar su entidad. Si un lado no tiene contraparte, no la omitas —
  conserva la fila, marca `N/A — No aplica: <motivo>`, y evalúa explícitamente
  si falta una pantalla (regístralo como brecha si sí). Este cruce suele
  resolver preguntas abiertas que la sola evidencia funcional no podía
  cerrar (fuente de verdad de una entidad, roles que en el dominio parecían
  distintos y en el físico resultan ser el mismo) — actualízalas cuando lo
  haga.
- **Requerimientos** → antes de crear `01-context/requirements.md`, evalúa si
  hace falta. Si cada caso de uso ya es 1:1 con un requerimiento fuente y ya
  declara prioridad, actor y entidades relacionadas, un `requirements.md`
  aparte solo repetiría esa tabla con otro nombre — no lo crees. Créalo
  únicamente cuando la relación requerimiento↔caso de uso no sea 1:1 (varios
  requerimientos por caso de uso, o viceversa) y esa tabla de mapeo no tenga
  otro lugar natural.
- **Casos de uso** → antes de crear `01-context/use-cases.md` como archivo
  separado, evalúa si el documento de requerimiento fuente (`RF-0XX` o
  equivalente) ya declara `Prioridad`, `Actores involucrados`, `Descripción`
  y `Trazabilidad` (UC/UF/SCR). Si es así, un `use-cases.md` narrativo
  completo (con `Goal`, `Source Requirement`, `Related Entities` en prosa)
  solo repite esa fuente con otro formato. En ese caso, reduce cada caso de
  uso al bloque mínimo que el validador determinista exige y que ningún
  otro archivo declara — `Priority`, `Actor` (como ID canónico `ACT-0XX`,
  no como nombre), `Interaction Strategy`, `Related User Flows`, `Related
  Tests` — y colócalo como una sección `## Use Cases` al inicio de
  `05-validation/traceability-matrix.md`, justo antes de la tabla
  `Requirement × Use Case × Screen × Test` que ya cubre `Screen`, `Command`,
  `Event` y `Edge Case` por caso de uso. Crea `use-cases.md` como archivo
  aparte solo cuando el RF fuente no traiga esa prioridad/actor/trazabilidad
  ya declarada, o cuando el proyecto tenga tantos casos de uso que fusionarlos
  en la matriz la vuelva impráctica de navegar.
- **Comandos y eventos** → cítalos por su ID fuente (`CM01`, `EV01`) dentro de
  casos de uso, user flows y pantallas. No crees un catálogo paralelo de
  comandos/eventos con IDs `CMD-XXX`/`EVT-XXX` a menos que el repositorio no
  tenga ya un Event Storming — en ese caso sí usa los prefijos canónicos
  `CMD`/`EVT` de la tabla de IDs.

La señal de que algo se está duplicando: si una sección de un artefacto de
Iris se puede borrar sin perder ninguna decisión ni matiz de UX porque todo su
contenido ya aparece, con las mismas palabras, en el documento fuente — o en
otro artefacto de Iris.

## Tabla de contenido en cada artefacto

Todo artefacto Markdown de Iris con más de tres secciones de nivel 2 (`##`)
abre, justo después del título, con una sección `## Contenido` que enlaza cada
sección/ID principal del documento (mismo patrón que usan estos archivos de
referencia). Actualiza la tabla de contenido cuando agregues o quites
secciones — no dejes que quede desincronizada.

## Árbol recomendado

Genera todo bajo `resources/design/ux/<proyecto>/` en la raíz del
repositorio — nunca bajo `docs/` en la raíz, porque ese directorio ya se usa en
este repositorio para material fuente crudo (RFP, transcripciones, actas) ajeno
a Iris. Crea solo los directorios que necesite el modo seleccionado.

**Consolida por archivo de pantalla, nunca en un documento multipantalla.** User
flows, estrategias, edge cases, información, estados y wireframe viven en el
archivo dueño `02-ui-architecture/screens/SCR-XXX-<slug>.md`. Las pantallas
secundarias enlazan al archivo dueño del flujo sin copiarlo. No crees
`screen-detail.md`.

El bloque mínimo de cada caso de uso vive en
`05-validation/traceability-matrix.md` (ver "Casos de uso" arriba) salvo que el
RF fuente no traiga prioridad/actor/trazabilidad; solo entonces crea un archivo
de casos de uso dentro de `01-context/` o justifica otra ubicación sin introducir
un número intermedio vacío.

```text
resources/design/ux/<proyecto>/
├── README.md
├── 01-context/
│   ├── actors.md
│   ├── entities.md
│   └── assumptions.md
├── 02-ui-architecture/
│   ├── screen-inventory.md
│   └── screens/
│       └── SCR-001-<slug>.md
├── 03-design-system/
│   ├── foundations.md
│   ├── components.md
│   ├── patterns.md
│   ├── ai-components.md
│   ├── tokens/
│   │   └── <paquete>.tokens.json
│   └── brand/
│       └── assets.md
├── 04-ux-review/
│   ├── ux-findings.md
│   └── final-review.md
├── 05-validation/
│   ├── traceability-matrix.md
│   ├── design-coverage.md
│   ├── gaps.md
│   └── validation-summary.md
└── 06-prototype/
    └── prototype-notes.md
```

Usa `README.md` como mapa que enlaza Contexto, User Flows, Arquitectura de
UI, Inventario de Pantallas, Pantallas, Sistema de Diseño, UX Review,
Trazabilidad (que incluye Casos de Uso cuando no tienen archivo propio),
Cobertura de Diseño, y Brechas Abiertas.

## Pantallas como fuente única

- Define cada `SCR-*` exactamente una vez, en un archivo cuyo nombre empiece por
  el mismo ID dentro de `02-ui-architecture/screens/`.
- El inventario contiene solo identificación, actor, caso de uso, flujo, entidad,
  interacción, prioridad y estado; no contiene Purpose, flujos, estados ni edge
  cases narrativos.
- La matriz, README, findings y gaps enlazan al archivo de pantalla; no copian su
  contenido.
- Un `UF-*` o `EC-*` que pertenece principalmente a una pantalla se define en ese
  archivo. Las demás pantallas solo lo referencian.
- Durante una migración, un archivo transitorio dentro de `screens/` puede
  conservar pantallas aún no separadas, pero no puede repetir una pantalla que ya
  tenga `SCR-XXX-*.md`; regístralo como deuda y elimínalo al tocar cada pantalla.

## Numeración, prioridad y extensión

Numera las secciones de pantalla con enteros consecutivos. Usa este orden:

0. Contenido.
1. Status.
2. Purpose and Scope.
3. Priority Actions.
4. Information Requirements.
5. User Flows and Navigation.
6. Interaction Strategy.
7. States.
8. Edge Cases and Recovery.
9. Permissions and Accessibility.
10. Components.
11. Event Storming Mapping.
12. Wireframe.
13. Decisions and Gaps.
14. Related Tests.
15. Problems and Opportunities.
16. Open Questions.

`Problems and Opportunities` cita, por fila, el problema/oportunidad de origen
que la pantalla resuelve (su `Source ID`, p. ej. `OP-0XX` de un Event Storming
de Análisis de Mejoras, o `N/A` cuando la evidencia no tiene ese ID todavía) y
el mecanismo concreto con el que esta pantalla lo resuelve — no repite la
narrativa completa de la oportunidad fuente, solo el delta de UX. Cita también
la fila correspondiente de `Decisions and Gaps` en vez de repetir su
rationale, y no introduce problemas nuevos que esa sección no respalde.
Registra en `05-validation/traceability-matrix.md` (matriz `Problem/Opportunity
× Screen Coverage`) toda oportunidad de la fuente, incluidas las que ninguna
pantalla resuelve todavía.

El orden dentro de `Priority Actions` es `P0 bloqueante`, `P1 primaria`, `P2
secundaria`, `P3 recuperación`. Prefiere tablas para listas con dos o más
atributos. Objetivo: 250–400 líneas por pantalla; si supera 450, elimina
duplicación, fusiona `N/A`, y convierte comparaciones a tablas antes de añadir un
archivo auxiliar.

## IDs estables

Usa IDs canónicos de tres dígitos:

| Prefijo | Artefacto |
|---|---|
| `REQ` | Requerimiento |
| `ACT` | Actor |
| `UC` | Caso de Uso |
| `UF` | User Flow |
| `EC` | Edge Case |
| `IS` | Estrategia de Interacción |
| `IR` | Requerimiento de Información |
| `SCR` | Pantalla |
| `UIS` | Superficie de UI |
| `CF` | Conversation Flow |
| `ST` | Estado de UI |
| `CMD` | Comando |
| `EVT` | Evento |
| `CMP` | Componente |
| `UXF` | Hallazgo de UX |
| `TST` | Escenario de UX/Prueba |

Define un ID en exactamente un encabezado de artefacto (`#` o `##`).
Referéncialo libremente en el resto. No asignes IDs a prosa incidental.

## Encabezados canónicos

Usa estos nombres exactamente, en inglés, siempre que exista la relación — el
validador determinista de Iris (`scripts/validate_ux_docs.py`) compara estas
cadenas literalmente, así que no las traduzcas dentro de los documentos
generados, aunque el resto de la prosa del artefacto esté en español:

```text
Actor
Actors
Purpose
Related Requirements
Related Use Cases
Related User Flows
Related Screens
Related Commands
Related Events
Related Entities
Related Components
Related Tests
Entry Point
Entry Points
Exit States
Exit Points
Happy Path
Alternative Paths
Edge Cases
Failure Paths
Recovery Paths
Interaction Strategy
Information Requirements
States
Wireframe
Open Questions
```

Bajo cada `## States` de una pantalla, evalúa `### Default`, `### Loading`,
`### Empty`, `### Error`, `### Success`, `### Disabled`, y `### Unauthorized`
(estos siete nombres tampoco se traducen — el validador los busca literalmente).
Agrega working, offline, timeout, partial result, o confirmation cuando sea
relevante. Si un estado no puede ocurrir, escribe
`N/A — No aplica: <motivo breve>` en esa sección.

## Links y navegación

Usa links relativos de Markdown cuando el documento destino ya se conozca:

```markdown
[SCR-002 — Formulario de Creación](../02-ui-architecture/screens/SCR-002-formulario-pedido.md)
```

Mantén el ID canónico visible en la etiqueta del link. Actualiza los links
cuando los archivos se muevan. No uses wiki links como único mecanismo de
navegación en las salidas de Iris, porque el validador verifica links relativos
estándar de Markdown.

## Inventarios y sistema de diseño

Distingue las superficies de UI (`Page`, `Screen`, `Modal`, `Drawer`, `Panel`,
`Card`, `Form`, `Table`, `Popover`, `Confirmation`, `Empty State`, `Error
State`, `Success State`, `AI Surface`) de las páginas/pantallas reales.
Distingue pantallas de proceso de pantallas de administración. Exige un actor,
caso de uso, o requerimiento antes de agregar List, Search, View, Create, Edit,
Delete, Archive, Activate/Deactivate, Relationships, History, Audit, o
Permissions para una entidad.

Documenta fundamentos solo cuando exista evidencia: tipografía, espaciado,
color, bordes, radio, elevación, grid, breakpoints, y motion. Mapea los
componentes principales relevantes como Button, Input, Select, Checkbox,
Radio, Textarea, Card, Table, Modal, Drawer, Tabs, Breadcrumb, Alert, Toast,
Pagination, Navigation, DatePicker, FileUpload, Search, Filter, Dropdown,
Tooltip, Badge, Stepper, y Accordion.

Para casos de uso de IA, considera Composer, Assistant/User Message, AI Working
State, Progress Indicator, Suggestion Card, Recommendation, Editable AI Draft,
Confirmation Card, Sources, Tool Status, Clarification UI, y Human Handoff. Cada
definición de componente debe listar las pantallas que lo usan; cada pantalla
debe listar sus componentes.

Todo componente se define en `components.md` o `ai-components.md`, nunca solo en
la tabla `Components` de una pantalla, y declara `### Implementation` (estado,
evidencia de código, base del UI kit, capa, tokens y props). Un mismo patrón
visual con vocabularios distintos es un componente con variantes.

Cuando la UX vaya a construirse, exporta los fundamentos aprobados a
`03-design-system/tokens/*.tokens.json` con su estado de evidencia; lo que no
tiene evidencia queda como pregunta abierta, no como token. Inventaría logos,
favicon, imágenes, íconos y tipografías en `03-design-system/brand/assets.md`
con origen, licencia y estado; nunca presentes como marca un placeholder ni un
dibujo aproximado.

## Trazabilidad de pantalla a datos y eventos

La matriz de trazabilidad (`05-validation/traceability-matrix.md`) no se
limita a la cadena Requirement→UseCase→Screen→Test. Agrega, como tablas
adicionales dentro del mismo archivo:

- **Screen × Data Model** — qué entidad(es) de dominio lee, crea o edita cada
  pantalla, citando el `Source ID` de la entidad (`ES-009`/modelo de datos) en
  vez de repetir sus atributos. Sirve para detectar pantallas sin respaldo de
  datos y entidades sin ninguna superficie que las exponga.
- **Screen × Event** — qué evento(s) de dominio dispara o refleja cada
  pantalla, citando el `Source ID` del evento (`EV01`, `EV-NEW01`, etc.). Sirve
  para detectar eventos de negocio invisibles en la UX.

Al cerrar los casos de uso (dentro de `traceability-matrix.md` o en un
`use-cases.md` separado, según aplique), agrega también una matriz **Caso
de Uso × Evento** (evento por fila, casos de uso relacionados, y si está
representado en la UX o `N/A — No aplica: <motivo>` cuando el evento
pertenece a un contexto fuera de alcance). Esta matriz es el mecanismo para
verificar de un vistazo que ningún evento relevante del dominio quedó sin
representación en la arquitectura de UX — vuelve a generarla cada vez que
cambien los casos de uso o el Event Storming fuente.
