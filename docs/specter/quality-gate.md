# Specter 2.1 — Quality Gate

Implementado en `scripts/engine.mjs` (individual) y `scripts/quality_gate.mjs` (conjunto).
Determinista, sin LLM. Validación estructural contra los JSON Schema (ajv standalone generado).

## Estados y precedencia

Precedencia estricta: **BLOCKED > NEEDS_REFINEMENT > READY**.

- `BLOCKED`: violación de `const`/`enum` (discriminador/vocabulario), regla bloqueante (duplicados
  de criterio, auto-dependencia, TT sin anclaje o sin justificación), o hallazgo crítico del conjunto.
- `NEEDS_REFINEMENT`: **cualquier** error de JSON Schema (`schema_valid: false`), regla obligatoria
  fallida, o hallazgo alto del conjunto.
- `READY`: esquema válido, todas las reglas obligatorias aprobadas y sin bloqueos.

**Ningún artefacto con error de JSON Schema alcanza READY.** La puntuación no compensa una
condición crítica.

## Dimensiones y pesos

| Dimensión | Peso |
|---|---|
| Completitud | 20 |
| Testabilidad | 20 |
| Trazabilidad | 20 |
| Consistencia | 15 |
| Implementabilidad | 15 |
| Claridad | 10 |

## Modelo de resultado (individual)

```json
{
  "artifact_id": "HU-01",
  "artifact_type": "HU",
  "schema_valid": true,
  "state": "READY",
  "status": "READY",
  "score": 100,
  "severity": "none",
  "errors": [],
  "warnings": [],
  "blocking_issues": [],
  "passed_rules": [],
  "failed_rules": [],
  "rules_passed": [],
  "rules_failed": [],
  "evidence": [],
  "recommendations": [],
  "evaluated_at": null
}
```

`evaluated_at` lo fija el CLI al serializar; el motor es determinista.

## Quality Gate del conjunto

`quality_gate.mjs` valida además transversalmente: IDs únicos, TT con HU padre existente, huellas
duplicadas (título normalizado), dependencias circulares y coherencia HU↔TT. Emite `set.state`
(READY/NEEDS_REFINEMENT/BLOCKED) y `set.findings`. Una HU individual READY no implica conjunto READY.

## Códigos de salida (scripts de trazabilidad/gate)

| Código | Significado |
|---|---|
| 0 | Éxito |
| 1 | Errores de calidad (hallazgos high/critical) |
| 2 | Error de configuración o ejecución |
| 3 | Entrada inválida o estructura imposible de procesar (archivo corrupto) |
