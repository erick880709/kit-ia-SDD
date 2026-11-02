# Specter 2.0 — Contrato de Tarea Técnica (TT)

> Esquema: [.claude/skills/specter/contracts/technical-task.schema.json](../../.claude/skills/specter/contracts/technical-task.schema.json) ·
> `$id: urn:kit-ia:specter:0.1.0:technical-task` · JSON Schema Draft 2020-12.

## 1. Propósito

Define la forma estructural de una tarea técnica (trabajo de ingeniería sin valor de negocio
directo). La TT siempre se relaciona con su historia de usuario padre; de forma excepcional y
documentada puede relacionarse con la épica (`parent_hu_id: null` + `epic_id` presente).

## 2. Campos

### Obligatorios

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | Patrón `^[A-Za-z0-9][A-Za-z0-9._-]*$` (ej. `TT-01`) |
| `type` | const `tarea_tecnica` | Discriminador del artefacto |
| `title` | string no vacío | Título corto |
| `parent_hu_id` | string \| null | HU padre (o null solo si es habilitador de épica) |
| `status` | enum | `draft` \| `ready` \| `needs_refinement` \| `blocked` |
| `schema_version` | const `0.1.0` | Versión del esquema |
| `artifact_version` | string no vacío | Versión del artefacto |
| `created_at` / `updated_at` | date-time ISO 8601 | Sellos |

### Contenido técnico

| Campo | Tipo | Notas |
|---|---|---|
| `technical_objective` | string | Objetivo técnico explícito |
| `component` | string \| null | Componente afectado; `null` = pendiente de identificar (el gate lo marca) |
| `architecture_layer` | string \| null | Capa (backend/frontend/persistencia/…); `null` = pendiente |
| `implementation_scope` | string | Alcance de implementación acotado |
| `file_boundaries` | string[] | Límites de archivos (sin inventar rutas si no se conocen) |
| `api_contracts` | string[] | Contratos API afectados (OpenAPI, GraphQL, AsyncAPI…) |
| `data_contracts` | string[] | Contratos de datos (esquemas, migraciones, entidades) |
| `security_considerations` | string[] | Controles de seguridad |
| `implementation_steps` | string[] | Pasos de implementación |
| `test_strategy` | string | Estrategia de pruebas |
| `definition_of_done` | string[] | Criterios verificables de terminado |
| `evidence_requirements` | string[] | Evidencias que debe dejar la tarea |

### Trazabilidad y calidad

| Campo | Tipo | Notas |
|---|---|---|
| `epic_id` | string \| null | Épica de origen |
| `dependencies` | string[] | Ids de HU/TT previas |
| `source_artifact_ids` | string[] | Artefactos fuente |
| `priority` | enum | `alta` \| `media` \| `baja` |
| `points` | enum | `1,2,3,5,8,13` |
| `quality_score` | number 0–100 | Lo asigna el gate |

## 3. Reglas de no-invención

- `component`, `architecture_layer`, `file_boundaries`, `api_contracts` y `data_contracts` se
  completan **solo** con información que la fuente sustente. Si no se conoce, se dejan `null` o
  vacíos; el gate los marca como `needs_refinement`, nunca se inventan.
- Specter **no** decide arquitectura: si una TT exige una decisión arquitectónica, se registra en
  `open_questions` (HU) o se deja `component: null` con nota, y se deriva a `archi`.

## 4. Migración desde Specter 1.0

| 1.0 | 2.0 |
|---|---|
| `type: Tarea Técnica` | `type: tarea_tecnica` |
| `epic: CLAVE` | `epic_id: CLAVE` |
| "Criterios de Done" | `definition_of_done[]` |
| "Dependencias" (texto libre) | `dependencies[]` (ids) |
| "Descripción" (texto libre) | `technical_objective`, `implementation_steps[]`, `implementation_scope` |
| (no existía) | `parent_hu_id`, `component`, `architecture_layer`, `file_boundaries[]`, `api_contracts[]`, `data_contracts[]`, `security_considerations[]`, `test_strategy`, `evidence_requirements[]`, `quality_score`, versionado |

## 5. Ejemplo mínimo válido

```yaml
---
id: TT-01
type: tarea_tecnica
parent_hu_id: HU-01
title: "Diseñar y migrar el esquema de usuarios"
technical_objective: "Crear la tabla de usuarios con las columnas mínimas para el login."
component: backend
architecture_layer: persistencia
data_contracts:
  - "Tabla users (id, email, password_hash, created_at)"
implementation_steps:
  - "Escribir la migración de la tabla users"
  - "Aplicar la migración en non-prod"
test_strategy: "Prueba de la migración con idempotencia y rollback."
definition_of_done:
  - "La migración aplica y revierte sin errores"
evidence_requirements:
  - "Resultado de la migración en non-prod"
status: ready
schema_version: "0.1.0"
artifact_version: "1"
created_at: "2026-11-02T15:00:00Z"
updated_at: "2026-11-02T15:00:00Z"
---
```
