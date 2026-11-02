# Specter 2.0 — Contrato de Historia de Usuario (HU)

> Esquema: [.claude/skills/specter/contracts/user-story.schema.json](../../.claude/skills/specter/contracts/user-story.schema.json) ·
> `$id: urn:kit-ia:specter:0.1.0:user-story` · JSON Schema Draft 2020-12.

## 1. Propósito

Define la forma estructural de una historia de usuario desglosada por Specter. El esquema solo
garantiza la **forma**; la **calidad** (completitud, consistencia, trazabilidad, testabilidad,
implementabilidad) la evalúa el Quality Gate.

## 2. Campos

### Obligatorios (el esquema los exige siempre)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | Patrón `^[A-Za-z0-9][A-Za-z0-9._-]*$` (ej. `HU-01`) |
| `type` | const `historia_usuario` | Discriminador del artefacto |
| `title` | string no vacío | Título corto |
| `status` | enum | `draft` \| `ready` \| `needs_refinement` \| `blocked` |
| `schema_version` | const `0.1.0` | Versión del esquema |
| `artifact_version` | string no vacío | Versión del artefacto |
| `created_at` / `updated_at` | date-time ISO 8601 | Sellos de creación/actualización |

### Trazabilidad

| Campo | Tipo | Notas |
|---|---|---|
| `epic_id` | string \| null | Épica de origen (opcional si hay `requirement_ids`) |
| `requirement_ids` | string[] | RF/RNF/RT de origen (puede estar vacío) |
| `source_artifact_ids` | string[] | Artefactos fuente (reqs de `epicureo`, eventos de `storming`, etc.) |

### Contenido

| Campo | Tipo | Notas |
|---|---|---|
| `user_story` | objeto `{role, action, benefit}` | Equivalente a Como/Quiero/Para |
| `business_value` | string | Valor de negocio explícito |
| `description` | string | Descripción ampliada |
| `scope.included` / `scope.excluded` | string[] | Alcance dentro/fuera |
| `business_rules` | string[] | Reglas de negocio |
| `preconditions` | string[] | Precondiciones |
| `main_flow` | string[] | Flujo principal |
| `alternative_flows` | string[] | Flujos alternativos |
| `exceptions` | string[] | Excepciones |
| `assumptions` | string[] | Supuestos explícitos |
| `open_questions` | string[] | Preguntas abiertas |

### Criterios de aceptación

`acceptance_criteria`: array de objetos. Cada criterio exige `id` y un resultado observable
(`scenario` Gherkin completo **o** `then`); opcionalmente `given`, `when`, `negative` y
`requirement_ids` para trazabilidad.

```json
{
  "id": "CA1",
  "given": "el usuario está autenticado",
  "when": "solicita su resumen de cuenta",
  "then": "ve el saldo y los últimos 20 movimientos",
  "negative": false,
  "requirement_ids": ["RF-012"]
}
```

### Estimación y calidad

| Campo | Tipo | Notas |
|---|---|---|
| `priority` | enum | `alta` \| `media` \| `baja` |
| `points` | enum | `1,2,3,5,8,13` (Fibonacci) |
| `quality_score` | number 0–100 | Lo asigna el gate, no el autor |
| `dependencies` | string[] | Ids de HU/TT de los que depende |
| `nfr_references` | string[] | Requisitos no funcionales aplicables |
| `test_references` | string[] | Casos de prueba asociados |

## 3. Migración desde Specter 1.0

| 1.0 (frontmatter) | 2.0 |
|---|---|
| `type: Historia de Usuario` | `type: historia_usuario` |
| `epic: CLAVE` | `epic_id: CLAVE` |
| `priority: Alta` | `priority: alta` |
| `points: 5` | `points: 5` |
| (no existía) | `requirement_ids`, `user_story`, `scope`, `business_rules`, `acceptance_criteria[]`, `dependencies`, `nfr_references`, `test_references`, `assumptions`, `open_questions`, `quality_score`, versionado |

Los campos legados que conservan consumidores (`priority`, `points`) se mantienen. Los IDs
históricos no se renumeran: los nuevos continúan la secuencia. Detalle completo en
[MIGRATION.md](MIGRATION.md).

## 4. Ejemplo mínimo válido

```yaml
---
id: HU-01
type: historia_usuario
title: "Iniciar sesión con usuario y contraseña"
user_story:
  role: "usuario registrado"
  action: "iniciar sesión con su usuario y contraseña"
  benefit: "acceder a sus funcionalidades"
business_value: "Acceso seguro a la plataforma."
acceptance_criteria:
  - id: CA1
    scenario: "Dado un usuario registrado, cuando ingresa credenciales válidas, entonces accede a la plataforma."
    negative: false
    requirement_ids: ["RF-001"]
status: ready
priority: alta
points: 5
schema_version: "0.1.0"
artifact_version: "1"
created_at: "2026-11-02T15:00:00Z"
updated_at: "2026-11-02T15:00:00Z"
---
```
