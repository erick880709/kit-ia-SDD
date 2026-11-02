# Specter 2.0 — Migración y versionado

## Política de versionado

| Campo | Valor | Significado |
|---|---|---|
| `schema_version` | `0.1.0` | Versión del esquema del artefacto (fija en esta entrega) |
| `artifact_version` | string | Versión del artefacto concreto; la asigna el autor |

Los `$id` de los esquemas fijan la versión: `urn:kit-ia:specter:0.1.0:user-story` y
`urn:kit-ia:specter:0.1.0:technical-task`. Un cambio incompatible se publica como un nuevo esquema
con nuevo `$id` y nuevo `schema_version`; el validador antiguo se conserva para leer artefactos
históricos.

## Migración desde Specter 1.0

Los artefactos 1.0 (Markdown con frontmatter mínimo) **siguen siendo legibles** por `builder` y
`ranger`; no se renumeran ni se reescriben. Para convertirlos a 2.0:

| 1.0 | 2.0 |
|---|---|
| `type: Historia de Usuario` | `type: historia_usuario` |
| `type: Tarea Técnica` | `type: tarea_tecnica` |
| `epic: CLAVE` | `epic_id: CLAVE` |
| `priority: Alta/Media/Baja` | `priority: alta/media/baja` |
| `points: N` | `points: N` (se conserva; el gate exige ≤ 8) |
| `Criterios de Aceptación` (checklist) | `acceptance_criteria[]` con `id` y `scenario`/`then` |
| `Criterios de Done` (TT) | `definition_of_done[]` |
| `Dependencias` (texto libre) | `dependencies[]` (ids) |
| (nuevo) | `requirement_ids`, `user_story`, `scope`, `business_rules`, `nfr_references`, `test_references`, `assumptions`, `open_questions`, `quality_score`, `schema_version`, `artifact_version`, `created_at`, `updated_at`, `source_artifact_ids` |

## Reglas de no-destrucción

1. **No reutilizar ni renumerar** IDs históricos (`HU-XX`, `TT-XX`): los nuevos continúan la
   secuencia.
2. **No reescribir** artefactos 1.0 en su lugar: migrar solo bajo pedido explícito.
3. **Compatibilidad de consumidores:** `builder` y `ranger` siguen leyendo el cuerpo Markdown; el
   frontmatter 2.0 es aditivo. Si un consumidor solo entiende 1.0, puede ignorar los campos nuevos.
4. **Gate opt-in:** el Quality Gate es una herramienta de validación, no un bloqueo de lectura.
   Un artefacto 1.0 sin migrar no rompe el kit; al validarlo aparecerá como `NEEDS_REFINEMENT`.

## Flujo de migración sugerido

1. Conservar el archivo 1.0 en su lugar.
2. Crear el artefacto 2.0 con el frontmatter completo (contratos + gate).
3. Ejecutar `quality_gate.mjs` y corregir hasta `READY`.
4. Actualizar las referencias de `builder`/`ranger` al nuevo artefacto si aplica.
