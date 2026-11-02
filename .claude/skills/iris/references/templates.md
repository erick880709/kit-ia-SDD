# Plantillas canónicas de Markdown

## Contenido

- [Tabla de contenido](#tabla-de-contenido)
- [Actor (referencia)](#actor-referencia)
- [Entidad (referencia)](#entidad-referencia)
- [Requerimiento (referencia)](#requerimiento-referencia)
- [Caso de uso](#caso-de-uso)
- [User flow](#user-flow)
- [Edge case](#edge-case)
- [Estrategia de interacción](#estrategia-de-interacción)
- [Inventario de superficies de UI](#inventario-de-superficies-de-ui)
- [Inventario de pantallas](#inventario-de-pantallas)
- [Especificación de pantalla](#especificación-de-pantalla)
- [Conversation flow](#conversation-flow)
- [Componente](#componente)
- [Tokens de diseño](#tokens-de-diseño)
- [Manifiesto de assets de marca](#manifiesto-de-assets-de-marca)
- [Plantilla de página](#plantilla-de-página)
- [Hallazgo de UX](#hallazgo-de-ux)
- [Matriz de trazabilidad](#matriz-de-trazabilidad)
- [Caso de Uso × Evento](#caso-de-uso--evento)
- [Problema/Oportunidad × Pantalla](#problemaoportunidad--pantalla)
- [Cobertura de diseño](#cobertura-de-diseño)
- [Brecha](#brecha)
- [Resumen de validación](#resumen-de-validación)

Usa estos encabezados exactamente — **en inglés, tal como aparecen abajo** — porque
el validador determinista de Iris (`scripts/validate_ux_docs.py`) los compara de
forma literal. Agrega el detalle relevante, links relativos, diagramas Mermaid, y
evidencia sin borrar las secciones requeridas; el contenido de relleno sí va en
español. Marca las secciones no aplicables con `N/A — No aplica: <motivo>`.

## Tabla de contenido

Todo artefacto con más de tres secciones de nivel 2 abre con esto, justo
después del título:

```markdown
# Nombre del Artefacto

## Contenido

- [Sección A](#sección-a)
- [Sección B](#sección-b)
```

## Actor (referencia)

Usa esta forma — una fila por actor — cuando el actor ya está descrito en
Event Storming u otra fuente de dominio. No repitas la narrativa de rol; cita
el `Source ID` y agrega solo lo que es específico de UX. No agregues una
columna de "Related Requirements/Use Cases" — esa relación ya vive en
`use-cases.md` (columna Actor de cada caso de uso).

```markdown
| ID | Source ID | Name | Role (1 línea, citada de la fuente) | UX Notes |
|---|---|---|---|---|
| ACT-001 | AC01 | Solicitante | Crea la solicitud de pedido | No ve el costo interno (PL07) — enforced en SCR-008 |
```

Reserva la sección narrativa completa (`## ACT-001 — Nombre` con
`### Description`) únicamente para actores que la UX introduce y que ninguna
fuente de dominio documenta todavía — deja explícito `**Source ID:** N/A — No
aplica: <por qué es nuevo>`.

## Entidad (referencia)

Mismo principio que Actor (referencia): una fila por entidad ya modelada en
Event Storming o en el modelo de datos, citando su `Source ID` en vez de
repetir su lista de atributos. Agrega `Data Model Table` y las dos columnas
de pantalla en vez de "Related Requirements":

```markdown
| ID | Source ID | Name | Data Model Table | Screen (View) | Screen (Admin) |
|---|---|---|---|---|---|
| ENT-001 | EN01 | Pedido | `app.order` (DATA-001) | SCR-001 | SCR-002 |
```

Si el proyecto tiene un modelo de datos físico, agrega una sección
**"Entidades encontradas solo en el modelo de datos físico"** con la misma
forma de tabla (sin `Source ID` de Event Storming) para las tablas con
relevancia de negocio que Event Storming no modela — la suma debe cerrar en
ambos sentidos: toda entidad encuentra su tabla, toda tabla relevante
encuentra su entidad, y lo que falte se marca `N/A` con motivo en vez de
omitirse. Usa la sección narrativa completa solo para entidades que la UX
necesita y que ninguna fuente modela todavía (deja explícito el `Source ID:
N/A` con el motivo).

## Requerimiento (referencia)

Evalúa primero si hace falta un archivo separado: si cada caso de uso ya es
1:1 con un requerimiento fuente y `use-cases.md` ya declara prioridad, actor
y entidades relacionadas, no crees `requirements.md` — sería la misma tabla
con otro nombre. Créalo únicamente cuando la relación requerimiento↔caso de
uso no sea 1:1. Cuando sí haga falta, es una tabla de trazabilidad, no un
resumen del problema de negocio (eso ya vive en la fuente, `RF-XXX` o
equivalente, y se enlaza por `Source ID`).

```markdown
| ID | Title | Source ID | Priority | Priority Rationale | Actor | Related Use Case | Related Entities |
|---|---|---|---|---|---|---|---|
| REQ-001 | Gestión de Pedidos | RF-001 | High | Primera iteración del plan; bloquea el resto del flujo | ACT-005 | UC-001 | ENT-001 |
```

`Priority Rationale` es la única prosa esperada por fila — una frase, no un
párrafo — porque es la única síntesis que Iris aporta y que la fuente no
tiene (la fuente no prioriza). Si necesitas registrar una pregunta abierta
específica de un requerimiento, enlaza al `assumptions.md` central en vez de
repetirla aquí.

## Caso de uso

Antes de crear `01-context/use-cases.md` como archivo separado, evalúa si
hace falta uno: si el `RF-0XX` fuente ya declara `Prioridad`, `Actores
involucrados`, `Descripción` y `Trazabilidad` (patrón común cuando el
repositorio ya trae requerimientos funcionales bien documentados), un
`use-cases.md` narrativo completo solo repite esa fuente con otro formato.
En ese caso, no crees el archivo: agrega, en su lugar, una sección
`## Use Cases` al inicio de `05-validation/traceability-matrix.md` (antes
de la tabla `Requirement × Use Case × Screen × Test`) con el bloque mínimo
de abajo — nada de `Goal`, `Source Requirement` ni `Related Entities`, que
ya viven en el RF fuente y en `Screen` de la fila de trazabilidad
respectivamente. Crea `use-cases.md` aparte únicamente cuando el RF fuente
no traiga ya esa prioridad/actor/trazabilidad, o cuando el volumen de casos
de uso vuelva impráctico fusionarlos en la matriz.

En cualquiera de los dos casos, no agregues `Related Screens`, `Related
Commands` ni `Related Events` al bloque del caso de uso: esa fila
(`Screen`/`Command`/`Event`/`Test`) ya existe 1:1 por RF en
`05-validation/traceability-matrix.md`, y el detalle de comandos/eventos por
flujo vive en el archivo dueño `02-ui-architecture/screens/SCR-XXX-*.md` — repetir la lista de
IDs aquí no agrega información nueva, solo la desincroniza cuando una de las
dos copias cambie. Tampoco agregues `Trigger`, `Preconditions`, `Primary
Outcome`, `Alternative Scenarios` ni `Failure Scenarios`: son el contenido
del `Happy Path`/`Alternative Paths`/`Failure Paths` del User Flow, no de
este puntero.

Bloque mínimo (dentro de `traceability-matrix.md`, cuando el RF fuente ya
cubre prioridad/actor/trazabilidad — usa `###` si `## Use Cases` es el
único nivel 2 que lo envuelve):

```markdown
### UC-001 — Nombre del Caso de Uso

#### Priority
High

#### Actor
ACT-001, ACT-002

#### Interaction Strategy
Structured | Hybrid | Conversational. Detalle y justificación completa en
SCR-001 (`02-ui-architecture/screens/SCR-001-<slug>.md`).

#### Related User Flows
UF-001

#### Related Tests
TST-001
```

Bloque completo (como archivo `use-cases.md` propio, cuando el RF fuente no
trae ya `Goal`/`Actor`/`Related Entities`):

```markdown
## UC-001 — Nombre del Caso de Uso

### Priority
High

### Actor
- ACT-001 — Nombre del Actor

### Source Requirement
RF-001

### Goal

### Related Entities

### Interaction Strategy
Structured | Hybrid | Conversational. Detalle y justificación completa en
SCR-001 (`02-ui-architecture/screens/SCR-001-<slug>.md`).

### Related User Flows
- UF-001

### Related Tests
- TST-001
```

## User flow

```markdown
# UF-001 — Nombre del User Flow

## Goal

## Actor
- ACT-001

## Related Use Cases
- UC-001

## Entry Point

## Preconditions

## Happy Path
1. Etapa significativa.
2. Etapa significativa.

## Alternative Paths

## Edge Cases
- EC-001

## Failure Paths

## Recovery Paths

## Exit States

## Related Screens
- SCR-001

## Related Commands
- CMD-001

## Related Events
- EVT-001

## Open Questions
```

## Edge case

```markdown
## EC-001 — Nombre del Edge Case

**User Flow relacionado:** UF-001
**Pantalla relacionada:** SCR-001
**Disparador:** Describe el disparador.
**Severity:** Critical | High | Medium | Low | Suggestion

### Expected System Behavior

### User Feedback

### Recovery

### Related States
- SCR-001 / Error

### Related Tests
- TST-001
```

## Estrategia de interacción

```markdown
## IS-001 — Nombre de la Estrategia de Interacción

**Mode:** Conversational | Structured | Hybrid

### Related Use Cases
- UC-001

### Related Screens
- SCR-001

### Why

### Decision Factors

### Patterns

### Risks and Mitigations
```

## Inventario de superficies de UI

```markdown
# UI Surface Inventory

| ID | Surface | Type | Use Case | Flow | Actor | Interaction | Status |
|---|---|---|---|---|---|---|---|
| UIS-001 | Nombre de la Superficie | Page | UC-001 | UF-001 | ACT-001 | Structured | Designed |
```

## Inventario de pantallas

```markdown
# Screen Inventory

| ID | Screen | Type | Actor | Use Case | User Flow | Entity | Interaction | Designed |
|---|---|---|---|---|---|---|---|---|
| SCR-001 | Nombre de la Pantalla | Process | ACT-001 | UC-001 | UF-001 | Entidad | Structured | Yes |
```

## Especificación de pantalla

Esta plantilla es la fuente única de cada pantalla en Arquitectura y Diseño.
Siempre vive en `02-ui-architecture/screens/SCR-XXX-<slug>.md`; Modo Arquitectura
puede dejar celdas de Diseño como `N/A — No aplica: pendiente de Modo Diseño`,
pero no crea `screen-detail.md`. Numera secciones, usa tablas para información
comparable y conserva prosa solo cuando explique una decisión.

```markdown
# SCR-001 — Nombre de la Pantalla

## 0. Contenido

- [1. Status](#1-status)
- [2. Purpose and Scope](#2-purpose-and-scope)
- [3. Priority Actions](#3-priority-actions)
- [4. Information Requirements](#4-information-requirements)
- [5. User Flows and Navigation](#5-user-flows-and-navigation)
- [6. Interaction Strategy](#6-interaction-strategy)
- [7. States](#7-states)
- [8. Edge Cases and Recovery](#8-edge-cases-and-recovery)
- [9. Permissions and Accessibility](#9-permissions-and-accessibility)
- [10. Components](#10-components)
- [11. Event Storming Mapping](#11-event-storming-mapping)
- [12. Wireframe](#12-wireframe)
- [13. Decisions and Gaps](#13-decisions-and-gaps)
- [14. Related Tests](#14-related-tests)
- [15. Problems and Opportunities](#15-problems-and-opportunities)
- [16. Open Questions](#16-open-questions)

## 1. Status

| Field | Value |
|---|---|
| Status | Designed \| Needs Review \| Approved |
| Actors | ACT-001 |
| Requirements | REQ-001 |
| Use Cases | UC-001 |
| User Flows | UF-001 |
| Entry | Punto de entrada |
| Exit | Resultado/destino |
| Entities | ENT-001 |

## 2. Purpose and Scope

| Item | Detail |
|---|---|
| Overview | Una frase de contexto |
| Purpose | Resultado que habilita |
| User Goals | Metas observables, sin repetir Purpose |
| In scope | Responsabilidades de esta pantalla |
| Out of scope | Lo que pertenece a otra pantalla |

## 3. Priority Actions

| Priority | Action | Preconditions | Feedback | Failure / Recovery |
|---|---|---|---|---|
| P0 | Acción bloqueante | Condición | Estado visible | Recuperación |
| P1 | Acción primaria | Condición | Resultado | Recuperación |
| P2 | Acción secundaria | N/A | Resultado | N/A |
| P3 | Recuperar/Reintentar | Error previo | Progreso | Escalamiento |

## 4. Information Requirements

| ID | Information | Source | Destination | Required | Validation | Editable | AI Assist |
|---|---|---|---|---|---|---|---|
| IR-001 | Información | User | CMD-001 | Yes | Required | Yes | N/A |

## 5. User Flows and Navigation

Si la pantalla es dueña del flujo, defínelo una sola vez:

### UF-001 — Nombre del flujo

| Field | Detail |
|---|---|
| Goal | Meta |
| Actor | ACT-001 |
| Related Use Cases | UC-001 |
| Entry Point | Entrada |
| Happy Path | 1. Paso; 2. Paso |
| Alternative Paths | Alternativa |
| Edge Cases | EC-001 |
| Failure Paths | Falla |
| Recovery Paths | Recuperación |
| Exit States | Resultado |
| Related Screens | SCR-001 |
| Related Commands | CMD-001 |
| Related Events | EVT-001 |
| Open Questions | N/A — No aplica: sin preguntas abiertas |

## 6. Interaction Strategy

| Item | Detail |
|---|---|
| Mode | Conversational \| Structured \| Hybrid |
| Rationale | Por qué |
| Patterns | Patrones relevantes |
| Conversation Flow | N/A — No aplica: motivo |

## 7. States

| State | Trigger | UI Feedback | Available Actions | Recovery / Exit |
|---|---|---|---|---|
| Default | Entrada | Contenido inicial | Acción | N/A |
| Loading | Carga | Skeleton/progreso | Cancelar | Reintentar |
| Empty | Sin datos | Mensaje contextual | Crear/Reintentar | Salir |
| Error | Falla | Error accionable | Reintentar | Escalar |
| Success | Resultado | Confirmación | Continuar | N/A |
| Disabled | Precondición | Motivo visible | Corregir | N/A |
| Unauthorized | Sin permiso | Acceso denegado | Volver | N/A |

## 8. Edge Cases and Recovery

| ID | Severity | Trigger | Expected Behavior | User Feedback | Recovery | Related State | Test |
|---|---|---|---|---|---|---|---|
| EC-001 | High | Disparador | Comportamiento | Feedback | Recuperación | Error | TST-001 |

## 9. Permissions and Accessibility

| Area | Requirement |
|---|---|
| Permissions | Actor, alcance y dato restringido |
| Accessibility | Labels, foco, teclado, anuncios |
| Responsive | Desktop, tablet y mobile |

## 10. Components

| Component | Purpose in Screen | States / Variants |
|---|---|---|
| CMP-001 | Uso | Estados |

## 11. Event Storming Mapping

| User Action | Command | Aggregate | Event | UI Feedback / Destination |
|---|---|---|---|---|
| Acción | CMD-001 | Agregado | EVT-001 | Estado/destino |

## 12. Wireframe

```text
┌─────────────────────────────────────────────┐
│ Breadcrumb                                  │
│ Título de la pantalla           [Primaria]  │
├─────────────────────────┬───────────────────┤
│ Información principal   │ Contexto/ayuda    │
│ y controles              │ o datos relacionados │
├─────────────────────────┴───────────────────┤
│ [Secundaria]                      [Siguiente] │
└─────────────────────────────────────────────┘
```

## 13. Decisions and Gaps

| Evidence / Problem | UX Decision | Why | Expected Impact | Gap |
|---|---|---|---|---|
| Evidencia | Decisión | Razón | Impacto | N/A |

## 14. Related Tests

- TST-001

## 15. Problems and Opportunities

| Problem / Opportunity (Source ID) | How This Screen Resolves It | Related Decision |
|---|---|---|
| OP-001 — Nombre de la oportunidad fuente | Mecanismo concreto de esta pantalla | Fila de la sección 13 o `N/A` |
| N/A — sin ID de origen; describe la evidencia en una frase | Mecanismo concreto de esta pantalla | Fila de la sección 13 o `N/A` |

## 16. Open Questions

- Pregunta o `N/A — No aplica: sin preguntas abiertas`.
```

Asegúrate de que el wireframe refleje jerarquía, acciones, revelado progresivo,
estrategia de interacción, requerimientos de información, ubicación de errores,
estado del sistema, asistencia de IA, confirmaciones, recuperación, navegación,
y relaciones de datos.

## Conversation flow

Inclúyelo solo cuando la estrategia de interacción contenga conversación —
el chat vive como panel lateral persistente sobre la superficie estructurada
(según la decisión de layout vigente del proyecto), nunca como pantalla
propia. Cubre dos capas complementarias bajo la misma pantalla: la ficha
completa de `## Conversation Flow` para el disparador más rico en intención
libre, y la tabla `## Proactive Suggestion Points` para los momentos donde
el chat inicia sin que el usuario lo pida.

### Elegir el disparador

Un disparador se justifica solo cuando el usuario tiene una necesidad no
estructurada que un formulario no captura de un vistazo (ej. "necesito
resolver esto hoy, es urgente") o cuando el sistema detecta una
oportunidad de ahorro genuina (huecos de completitud, plantilla con
default sugerido). No agregues un disparador solo porque es posible — cada
uno interrumpe y debe justificarse. Tipos:

- **Entrada vacía** — el usuario llega a una superficie sin nada capturado
  todavía; el chat ofrece iniciar por texto libre en vez de forzar el
  formulario primero.
- **Detección de oportunidad** — el sistema nota una condición conocida
  (completitud incompleta, catálogo con sugerencia disponible, dependencia
  invalidada) y ofrece resolverla sin que el usuario tenga que preguntar.
- **Explícito** — el usuario abre el panel por su cuenta en cualquier
  momento; siempre disponible, nunca depende de los dos anteriores.

### Puntos de sugerencia proactiva

Modela en una tabla los momentos donde el chat puede iniciar sin pedirlo el
usuario — antes de empezar, durante la captura, y antes de guardar
definitivamente. Cada sugerencia es una propuesta editable, nunca una
escritura automática: el usuario siempre confirma o descarta, igual que la
propuesta de la IA en la validación de contenido.

```markdown
## Proactive Suggestion Points

| Moment | Trigger | Suggestion | Confirmation |
|---|---|---|---|
| Before | Entrada vacía a la pantalla | Ejemplo de invitación conversacional | El usuario elige chat o formulario; ninguna acción se ejecuta sin esto |
| During | Cambia una dependencia (ej. cliente/categoría/región) o se detecta un hueco | Ejemplo de sugerencia puntual | Propuesta editable; confirmar o descartar sin perder el borrador |
| Before Save | Antes de habilitar la acción final | Ejemplo de mejora de completitud sugerida | Nunca bloquea el envío por sí sola; el usuario decide aplicar, editar o ignorar |
```

Documenta el disparador `Before` (casi siempre el más rico) con la ficha
completa de abajo; `During`/`Before Save` suelen bastar con la tabla si no
necesitan clarificaciones ni rutas alternativas propias — solo agrégales su
propia ficha cuando la conversación se ramifique de verdad.

```markdown
## Conversation Flow

### Trigger

### User Intent

### Initial User Message

### Assistant Response

### Required Context

### Clarifications

### Tool / System Actions

### UI Feedback

### Alternative Path

### Failure Path

### Recovery

### Exit
```

## Componente

```markdown
## CMP-001 — Nombre del Componente

### Purpose

### Variants

### States

### Behavior

### Accessibility

### Implementation

| Field | Value |
|---|---|
| Status | Planned \| Implemented \| Referenced \| Retired \| Deprecated |
| Code Evidence | Ruta(s) del código que lo implementa o `N/A` |
| Base | Componente(s) del UI kit sobre los que se construye |
| Layer | shared \| feature `<nombre>` |
| Tokens | Tokens de `tokens/*.tokens.json` que usa, por nombre |
| Props API | Props públicas y variantes que expone |

### Screens Using This Component
- SCR-001
```

Define cada componente aquí (o en `ai-components.md`), nunca solo en la tabla
`Components` de una pantalla. Un mismo patrón visual con vocabularios distintos
(por ejemplo, etiquetas de estado con tonos) es un componente con variantes, no
varios componentes.

## Tokens de diseño

Valores en `03-design-system/tokens/<paquete>.tokens.json`, formato W3C Design
Tokens. Un archivo por paquete de marca o por superficie con identidad propia.
Cada token tiene `$type` propio o heredado del grupo, y cada grupo declara su
estado de evidencia en `$extensions.iris.status`: `adopted`, `inferred` o
`pending-decision`. Usa alias (`{color.palette.primary}`) en vez de repetir
valores.

```json
{
  "$description": "Paquete <nombre>. Fuente: foundations.md",
  "color": {
    "$type": "color",
    "palette": {
      "$extensions": { "iris": { "status": "adopted", "source": "foundations.md#color" } },
      "primary": { "$value": "#000000" }
    },
    "tone": {
      "danger": {
        "foreground": { "$value": "#000000" },
        "background": { "$value": "#ffffff" }
      }
    }
  },
  "font": {
    "family": {
      "$type": "fontFamily",
      "base": { "$value": ["Familia", "sans-serif"] }
    }
  },
  "radius": {
    "$type": "dimension",
    "md": { "$value": { "value": 8, "unit": "px" } }
  }
}
```

No agregues tokens sin evidencia aprobada; regístralos como pregunta abierta en
`foundations.md`.

## Manifiesto de assets de marca

Vive en `03-design-system/brand/assets.md`. `Path` es relativo al manifiesto o a
la raíz del repositorio; usa `N/A` cuando el asset no existe. `Status` es
`Adopted`, `Placeholder`, `Missing` o `Deprecated`; un placeholder nunca se
presenta como marca.

```markdown
# Brand Assets

## Assets

| Asset | Path | Source | License | Status |
|---|---|---|---|---|
| Logo principal | N/A | Sin archivo oficial en el repositorio | N/A | Missing |
| Favicon | public/favicon.svg | Entregado por el responsable de marca (fecha) | Internal | Adopted |

## Identity Conflicts

| Source | Brand Value | Surface | Status |
|---|---|---|---|
| Fuente A | Valor | Superficie | Adopted \| Pending decision |

## Open Questions
```

## Plantilla de página

Define en `patterns.md` una plantilla por tipo de pantalla recurrente, para que la
construcción componga slots en vez de diseñar el layout de cada pantalla.

```markdown
## Page Template — Listado con filtros

**Screens:** SCR-001, SCR-024

| Slot | Component | Rules |
|---|---|---|
| Header | CMP-002 Breadcrumb + título + acción primaria | Una sola acción primaria |
| Filters | CMP-021 Filter Bar | Chips removibles y "Limpiar filtros" |
| Content | CMP-020 Data Table | Loading, Empty y Error del propio componente |
| Aside | N/A | — |

### Responsive

Comportamiento del layout por ancho disponible.

### States

Qué muestra cada slot en Loading, Empty y Error.
```

## Hallazgo de UX

```markdown
## UXF-001 — Nombre del Hallazgo

**Screen:** SCR-001
**Category:** Usability | Consistency | State | Accessibility | AI UX
**Severity:** Critical | High | Medium | Low | Suggestion
**Status:** Open | Resolved | Justified

### Problem

### Evidence

### Recommendation

### Related Flow
- UF-001
```

## Matriz de trazabilidad

Divídela por dominio o caso de uso si una sola tabla se vuelve ilegible. Si
no existe un `use-cases.md` separado (ver "Caso de uso" arriba), abre este
archivo con una sección `## Use Cases` — un bloque mínimo por `UC-0XX`
(`Priority`, `Actor`, `Interaction Strategy`, `Related User Flows`,
`Related Tests`) — antes de la tabla principal.

```markdown
# Traceability Matrix

| Requirement | Use Case | User Flow | Interaction Strategy | Screen | Action | Command | Event | State | Edge Case | UX Finding | Test |
|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-001 | UC-001 | UF-001 | IS-001 | SCR-001 | Create | CMD-001 | EVT-001 | Success | EC-001 | UXF-001 | TST-001 |
```

La matriz debe soportar ambas direcciones: requerimiento → pantallas y pruebas,
pantalla → caso de uso/flujo de origen y comandos/eventos, evento →
representación en la UX, edge case → pantallas/pruebas, y componente ↔
pantallas.

Agrega, en el mismo archivo, estas dos tablas complementarias — citan
`Source ID` de dominio, no reescriben la entidad/evento:

```markdown
## Screen × Data Model

| Screen | Reads | Creates | Updates |
|---|---|---|---|
| SCR-001 | ENT-001 (EN01 Pedido) | — | — |

## Screen × Event

| Screen | Triggers | Reflects |
|---|---|---|
| SCR-002 | CM01 (EV01) | — |
```

## Caso de Uso × Evento

Cierra los casos de uso con esta matriz (dentro de `traceability-matrix.md`
o en `use-cases.md` si el proyecto tiene uno separado) — una fila por
evento de dominio relevante (`Source ID` de Event Storming o TO-BE), no por
caso de uso, para que sea fácil detectar eventos sin representación de UX:

```markdown
# Use Case × Event Coverage

| Event | Source | Related Use Case | Represented in UX? |
|---|---|---|---|
| EV01 | PedidoSolicitado | UC-001 | Yes |
| EV26 | PedidoArchivado | — | N/A — No aplica: fuera de alcance (EPIC-09) |
```

Cuando `Represented in UX?` sea `No` sin una razón de alcance documentada,
es una brecha real: agrega el evento al caso de uso/flujo que le
corresponde o regístralo en `05-validation/gaps.md`.

## Problema/Oportunidad × Pantalla

Agrega esta matriz únicamente cuando el dominio ya identificó problemas y
oportunidades con ID propio antes de que Iris empezara — típicamente un
Event Storming de Análisis de Mejoras (`OP-0XX`). Una fila por
problema/oportunidad de la fuente, no por pantalla, para verificar de un
vistazo qué oportunidades ya tienen representación en la UX y cuáles no.
Toda oportunidad de la fuente aparece — incluida la que ninguna pantalla
resuelve todavía — con `Screen: N/A` y el motivo (`No — pendiente` si es una
brecha real de UX, `N/A — no aplica a UX` si se resuelve en otra capa, p. ej.
una decisión de arquitectura o un requisito no funcional transversal).

```markdown
## Problem/Opportunity × Screen Coverage

| Problem/Opportunity | Screen | Resolved in UX? |
|---|---|---|
| OP-001 | SCR-002 | Yes |
| OP-036 | N/A | No — pendiente: requiere una pantalla nueva no modelada todavía |
| OP-042 | N/A | N/A — no aplica a UX: driver de arquitectura, no funcionalidad |
```

## Cobertura de diseño

```markdown
# Design Coverage

| Item | Expected | Designed | Validated | Gap |
|---|---:|---:|---:|---:|
| Priority Use Cases | 0 | 0 | 0 | 0 |
| User Flows | 0 | 0 | 0 | 0 |
| Happy Paths | 0 | 0 | 0 | 0 |
| Critical Edge Cases | 0 | 0 | 0 | 0 |
| Process Screens | 0 | 0 | 0 | 0 |
| Admin Screens | 0 | 0 | 0 | 0 |
| Critical Commands | 0 | 0 | 0 | 0 |
| User-visible Events | 0 | 0 | 0 | 0 |
| Error States | 0 | 0 | 0 | 0 |
| Confirmation States | 0 | 0 | 0 | 0 |
```

## Brecha

Incluye solo los ítems incompletos:

```markdown
## GAP-001 — Nombre de la Brecha

**Screen:** SCR-001
**User Flow:** UF-001
**Severity:** Critical | High | Medium | Low

Describe la cobertura faltante y la evidencia.

### Required Resolution
- Resolución concreta.
```

## Resumen de validación

```markdown
# Validation Summary

## Requirements Coverage

## Use Case Coverage

## User Flow Coverage

## Screen Coverage

## Event Storming Coverage

## State Coverage

## Edge Case Coverage

## Component Coverage

## Test Coverage

## Open Critical Gaps

## Open High Gaps

## Final Status
INCOMPLETE | NEEDS REVIEW | READY FOR PROTOTYPE | UX COMPLETE
```
