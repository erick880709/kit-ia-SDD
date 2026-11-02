# Specter 2.1 — Contratos HU y TT

JSON Schema Draft 2020-12 autocontenidos, validados con ajv (validador standalone generado en
`contracts/specter-schemas.validate.mjs`; regenerar con
`.claude/contracts/output/scripts/generate-specter-validators.mjs`).

## Campos de compatibilidad con el ecosistema

| Campo | Valores | Consumidor |
|---|---|---|
| `type` | `Historia de Usuario` \| `Tarea Técnica` | cupido, builder |
| `epic` | clave de épica | cupido (canónico) |
| `epic_id` | alias de `epic` | traza interna |
| `priority` | `Alta` \| `Media` \| `Baja` | cupido |
| `points` | `1,2,3,5,8,13` | cupido (deprecado en Specter: ya no es regla obligatoria) |

## Separación con Cupido (FASE 4)

Specter emite complejidad **orientativa**: `functional_complexity`, `technical_complexity`
(`baja/media/alta`), `risk_factors`, `uncertainties` y `dependencies`. `points` es opcional y
deprecado; Cupido es responsable de Story Points y estimación oficial. Un artefacto **sin** Story
Points sigue siendo válido.

## TT sin HU padre (habilitadora de épica)

Condición JSON Schema (`if/then`): si `parent_hu_id` es `null`, son obligatorios `epic_id` y
`parent_exception_reason`. La regla bloqueante `block_unjustified_parentless` rechaza una TT sin
padre y sin justificación.

## Criterios de aceptación (FASE 6)

Cada criterio: `id` (obligatorio), `type` (`functional/security/performance/usability/other`),
`description`, `scenario` (Gherkin completo) **o** `given/when/then` con `then` verificable,
`negative`, `requirement_ids`. El esquema exige resultado observable (`scenario` o `then`).

## Versionado

`schema_version` (const `0.1.0`), `artifact_version`, `created_at`, `updated_at`,
`source_artifact_ids`. Migración retrocompatible documentada en [migration.md](migration.md).
