# Specter 2.0 — Quality Gate

> Implementación: `.claude/skills/specter/scripts/engine.mjs` (motor) y CLIs
> `validate_hu.mjs`, `validate_tt.mjs`, `quality_gate.mjs`. Catálogo de reglas:
> `.claude/skills/specter/references/quality-gate-rules.md`.

## Qué es

Validador **determinista** (sin LLM) de los artefactos HU/TT de Specter. Evalúa cinco dimensiones
— Completitud, Consistencia, Trazabilidad, Testabilidad, Implementabilidad — con reglas
ponderadas (0-100) y reglas bloqueantes independientes de la puntuación.

## Estados de salida

| Estado | Significado |
|---|---|
| `READY` | Cumple todas las reglas obligatorias y no tiene bloqueos |
| `NEEDS_REFINEMENT` | Información incompleta o problemas corregibles |
| `BLOCKED` | Contradicción, discriminador/enum inválido o decisión que requiere aprobación |

Un score alto **no** compensa una regla bloqueante: si hay bloqueo, el estado es `BLOCKED` aunque
el score sea 100.

## Cómo validar una HU

```bash
node .claude/skills/specter/scripts/validate_hu.mjs resources/functional/hu/hu-01-login.md [--json]
```

## Cómo validar una TT

```bash
node .claude/skills/specter/scripts/validate_tt.mjs resources/functional/hu/tt-01-migrar.md [--json]
```

## Cómo ejecutar el Quality Gate agregado

```bash
node .claude/skills/specter/scripts/quality_gate.mjs --root . [--json]
```

Escanea `resources/functional/hu/hu-*.md` y `tt-*.md`, valida cada artefacto y devuelve por cada
uno: `score`, `state`, reglas fallidas, bloqueos y errores estructurales. Exit `0` si todos están
`READY`; `1` si alguno no lo está.

## Cómo interpretar los resultados

- `READY` con score < 100: cumple lo obligatorio pero le faltan mejoras opcionales
  (p. ej. `priority` sin definir).
- `NEEDS_REFINEMENT`: falta información corregible (business_value, criterios, componente…).
  Corrige y revalida.
- `BLOCKED`: hay una contradicción (ids duplicados, tipo/estado inválido, TT sin anclaje).
  Resuélvela antes de continuar; si requiere una decisión de negocio o arquitectura, derívala.

Cada regla fallida indica dimensión y evidencia; las reglas bloqueantes listan el motivo exacto.
