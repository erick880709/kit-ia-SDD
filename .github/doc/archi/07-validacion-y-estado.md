# Validación y estado

Hay dos niveles de evidencia distintos, y conviene no mezclarlos.

## 1. Autopruebas del propio skill (calidad de los scripts)

Documentadas en [release.md](../../skills/archi/release.md) con fecha **2026-08-04**:

- validación estructural con `quick_validate.py`;
- self-test de `validate_architecture_coherence.py` (acepta auditoría sintética completa, rechaza un `QA-xx` prometido sin cobertura);
- pruebas de DR-01: acepta líneas base A/C válidas, conserva la exención de Caso B, rechaza una línea base sin `Preparación del dominio` e impide declarar evidencia equivalente para eludir Event Storming en un dominio complejo;
- validación AST de los 4 scripts de coherencia, generación y presentación;
- prueba del gate de presentación (una auditoría `No apto`/no ejecutada impide `approvalEligible`; `Apto` con validador limpio permite continuar si los demás gates cumplen);
- validación JSON del esquema y manifiesto de ejemplo;
- validación Draft 2020-12 del catálogo de iconos curado contra su esquema;
- cruce de los 50 iconos curados contra `resources/architecture/catalogo_iconos.json` sin rutas/shapes faltantes;
- validación estricta de la referencia Azure neutra (una página, 11 iconos con `archiIconId` trazable);
- prueba negativa sobre un `.drawio` legado (`11.2-Despliegue_Azure_OCTO-HR.drawio`): rechazo correcto por dos páginas, imágenes sin trazabilidad, bibliotecas legadas y mezcla de proveedor;
- validación de sintaxis JavaScript de la plantilla HTML;
- prueba de generación y validación de una presentación borrador;
- prueba de `--strict` contra una arquitectura con bloqueos: rechazo correcto;
- `git diff --check` limpio.

Esto certifica que las herramientas funcionan, no que un proyecto concreto ya pasó la auditoría.

El **2026-09-10** se reejecutó `python -X utf8 -B .claude/skills/archi/scripts/validate_architecture_coherence.py --self-test`: finalizó con `SELF-TEST OK` e incluyó los casos DR-01 A/C, la exención B y el rechazo de bypass. Esta evidencia actualiza la salud del script, no reemplaza los resultados históricos contra `resources/architecture/` descritos a continuación.

## 2. Ejecuciones reales registradas contra la arquitectura de este mismo repositorio (OCTO_HR)

Encontradas en los propios artefactos generados:

### `validate_architecture_coherence.py` — evidencia con fecha 2026-08-11

`resources/architecture/25-Revision-Tecnica-Arquitectura.md` (sección "Reapertura rondas 14-15") registra la ejecución real:

```text
python .claude/skills/archi/scripts/validate_architecture_coherence.py resources/architecture --scenario C --strict
```

Resultado: **`FAIL: 43 error(es), 0 advertencia(s)`** (42 tras la ronda 14, +1 tras la ronda 15), con las causas desglosadas por categoría (snapshot desactualizado, compromisos sin cerrar, compromisos y trazabilidad inversa faltantes en el propio `25`). El criterio de cierre correspondiente queda explícitamente `[ ]` sin marcar, y el documento declara que **no se recierra** para esas rondas.

El dictamen vigente para el snapshot de la ronda 12 es `Cumple con observaciones` / `approvalEligible=true` — elegibilidad técnica, no aprobación humana (`26` sigue pendiente).

### `validate_drawio_catalog.py` — evidencia registrada

`resources/architecture/17-Vista-de-Despliegue.md` (línea 187) registra la ejecución real:

```text
python .claude/skills/archi/scripts/validate_drawio_catalog.py --drawio resources/architecture/17.2-Despliegue_Azure_OCTO-HR.drawio --provider azure --strict
```

Resultado: **`OK: catálogo (50 iconos) y draw.io (17 iconos trazables) válidos`**.

### `validate_architecture_presentation.py` — sin evidencia registrada

No se encontró en este repositorio ninguna ejecución registrada (fecha, comando y resultado).

### `extract_postman_inventory.py` — sin evidencia registrada

Solo aparece **mencionado como paso recomendado a futuro** en `resources/architecture/12-Registro-de-Incertidumbres.md` (`INC-17`), condicionado a que BUK entregue una colección Postman. No hay evidencia de que ya se haya ejecutado.

## Síntesis

| Script | Evidencia en este repositorio |
|---|---|
| `validate_architecture_coherence.py` | Sí — 2026-08-11, `FAIL: 43 errores` contra `resources/architecture` en escenario C estricto |
| `validate_drawio_catalog.py` | Sí — `OK` contra `17.2-Despliegue_Azure_OCTO-HR.drawio` |
| `validate_architecture_presentation.py` | No registrada |
| `generate_architecture_presentation.py` | No registrada de forma independiente (el HTML `25.1` existente implica al menos una generación, pero no hay comando/fecha documentados) |
| `extract_postman_inventory.py` | No registrada — solo mencionada como paso futuro condicionado a un insumo externo (`INC-17`) |

Existe evidencia real y fechada de dos de los cinco scripts corriendo sobre este repositorio, con resultados mixtos: uno en fallo declarado y no resuelto (`validate_architecture_coherence.py`), otro en éxito (`validate_drawio_catalog.py`). Para los otros tres scripts no hay evidencia de ejecución registrada en este repositorio, y se declara así en lugar de inventarla.

## Qué significa el `FAIL` de coherencia

El `FAIL: 43 errores` no invalida la skill ni sus scripts: es la evidencia de que el validador de coherencia detecta correctamente inconsistencias reales entre lo prometido y lo diseñado en un documento vivo (`25`) que aún no se ha recerrado tras reabrir rondas `14`-`15`. Es evidencia de que el gate funciona como gate — bloquea cuando corresponde — y de que el estado de aprobación de la arquitectura de este repositorio sigue abierto en ese punto, no de un defecto del script.

## Actualización de costos — 2026-09-14

Se ejecutaron 15 pruebas de `tests/test_pricing.py` con precios sintéticos: cobertura por ambiente, asignación compartida, costos únicos, meters/IDs duplicados, exclusiones, cantidades inválidas, evidencia vencida/futura, soporte de gasto observado, integridad de bloques, rutas y CLI/integración. Todas pasaron. También pasí `validate_architecture_coherence.py --self-test`.

Esta evidencia no valida tarifas actuales ni el presupuesto OCTO-HR. Su `17.4` histórico todavía no tiene el manifiesto `17.4.1`; el nuevo gate lo identifica como pendiente de migración. Los reportes aprobados previamente no se han recalculado ni se ha alterado su decisión histórica.
