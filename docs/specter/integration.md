# Specter 2.1 — Integración

## Specter → Cupido (effort-estimator)

- HU/TT legibles con `epic`, `type` en español, `priority: Alta/Media/Baja` y `points` (opcional).
- Complejidad orientativa disponible (`functional_complexity`, `technical_complexity`).
- Story Points y estimación oficial son de Cupido. Ver `tests/compat.test.mjs`.

## Specter → Archi

Specter **no inventa decisiones arquitectónicas**: `component`/`architecture_layer` quedan
`null`/`pendiente` si no se conocen y se derivan a Archi.

## Specter → Builder

Builder consume HU READY y TT ejecutables con criterios de aceptación, contratos API/datos,
dependencias y scope preservados. Una HU `NEEDS_REFINEMENT`/`BLOCKED` no pasa a Builder sin
excepción explícita.

## Builder → Ranger

Ranger deriva casos de prueba de los criterios de aceptación verificables y las evidencias
requeridas por las TT.
