# Specter 2.1 — Trazabilidad

`scripts/traceability.mjs` valida la cadena **RFP → RF/RNF/RT → EPIC → HU → TT → TC → Evidence**.

## Detecciones

- Requisito sin HU (`--req-ids`).
- HU sin origen (`epic`/`epic_id`/`requirement_ids`).
- TT sin HU padre, sin anclaje o sin `parent_exception_reason` (habilitadora injustificada).
- Dependencias inexistentes y **dependencias circulares**.
- IDs duplicados.
- **Archivos corruptos o no parseables** (nunca se omiten silenciosamente).
- Casos de prueba inexistentes (`--tc-ids`) o sin HU/TT asociada.
- Evidencias faltantes en TT.
- HU sin TT (informativo).

## Códigos de salida

| Código | Significado |
|---|---|
| 0 | Éxito |
| 1 | Hallazgos de calidad (high/critical) |
| 2 | Error de configuración/ejecución |
| 3 | Archivo corrupto o estructura imposible de procesar |

## Uso

```bash
node .claude/skills/specter/scripts/traceability.mjs --root . [--req-ids RF-001,RF-002] [--tc-ids TC-01] [--json]
```
