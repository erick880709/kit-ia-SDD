# Specter 2.1 — Migración y compatibilidad

## 1.0 → 2.0 → 2.1

- Se conservan `type` (español), `epic` y `priority` (capitalizada) para no romper a cupido.
- `epic_id` es alias de `epic`.
- `points` pasa a **opcional/deprecado**: Specter ya no lo exige; Cupido estima Story Points.
- Nuevos campos orientativos: `functional_complexity`, `technical_complexity`, `risk_factors`,
  `uncertainties`.
- TT sin HU padre: `parent_hu_id` nullable con `parent_exception_reason` y `epic_id` obligatorios.

## Reglas de no-destrucción

- No reutilizar ni renumerar IDs históricos.
- No reescribir artefactos antiguos; migrar solo bajo pedido.
- El gate es opt-in: un artefacto 1.0 sin migrar aparece como `NEEDS_REFINEMENT`, no rompe el kit.
- Los consumidores que leen el cuerpo Markdown siguen funcionando; el frontmatter es aditivo.
