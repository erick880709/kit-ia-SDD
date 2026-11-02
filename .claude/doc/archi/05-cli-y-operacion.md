# CLI y operación

Los 6 scripts viven en [scripts/](../../skills/archi/scripts/). Todos son de biblioteca estándar de Python 3, sin dependencias externas declaradas en su código, y se ejecutan desde la raíz del repositorio.

## Resumen

| Script | Función |
|---|---|
| `validate_architecture_coherence.py` | Valida DR-01 en Casos A/C y audita coherencia estructural y trazabilidad entre artefactos `archi` contra el contrato de auditoría de `25` |
| `validate_architecture_presentation.py` | Valida estructura, fuentes, hashes, assets, operación offline y coherencia del gate del HTML `25.1` ya generado |
| `validate_drawio_catalog.py` | Valida el catálogo curado de iconos y, opcionalmente, un `.drawio` de despliegue |
| `generate_architecture_presentation.py` | Genera el HTML `25.1` a partir del manifiesto `25.1.1` |
| `extract_postman_inventory.py` | Extrae inventario normalizado de una colección Postman v2.0/v2.1 |

## `validate_architecture_coherence.py`

```text
posicional: architecture_dir (opcional si se usa --self-test)
--scenario {A,B,C}   (default A)
--strict
--json-output <ruta>
--self-test
```

Valida el contrato DR-01 de `01-Linea-Base_<Proyecto>.md` en Casos A/C y la coherencia estructural y trazabilidad entre artefactos `archi` (IDs, owners, cobertura, snapshot/hashes, estados de evidencia, contradicciones) contra el contrato de auditoría de `25`; incluye `--self-test`. No decide si un dominio es complejo ni evalúa la calidad de una decisión: comprueba que la clasificación, evidencia, estados y handoffs estén documentados de forma coherente.

Ejemplo real ejecutado sobre este repositorio (ver evidencia fechada en [07-validacion-y-estado.md](./07-validacion-y-estado.md)):

```powershell
python .claude/skills/archi/scripts/validate_architecture_coherence.py resources/architecture --scenario C --strict
```

## `validate_architecture_presentation.py`

```text
--presentation <ruta>   (obligatorio)
--project-root <ruta>   (default cwd)
```

Valida estructura, fuentes, hashes, assets, operación offline y coherencia del gate del HTML `25.1` ya generado.

```powershell
python .claude/skills/archi/scripts/validate_architecture_presentation.py --presentation resources/architecture/25.1-Presentacion-Comite-Arquitectura_OCTO-HR.html
```

## `validate_drawio_catalog.py`

```text
--catalog <ruta>   (default assets/iconos/catalogo_iconos_curado.json)
--aliases <ruta>   (default assets/iconos/aliases_iconos.json)
--drawio <ruta>
--provider {azure,aws,gcp}
--strict                  (exige archiIconId y excepción explícita para imágenes fuera de catálogo)
--reference                (permite placeholders [CT-*] solo al validar la referencia neutra — nunca para aprobar entregables)
--allow-multiple-pages
```

Valida el catálogo curado de iconos y, opcionalmente, un `.drawio` de despliegue: exige una sola página, XML sin comprimir, proveedor único, ausencia de placeholders `[CT-*]` (salvo `--reference` sobre la referencia neutra) y trazabilidad de `archiIconId`.

Ejemplo real ejecutado sobre este repositorio (ver evidencia fechada en [07-validacion-y-estado.md](./07-validacion-y-estado.md)):

```powershell
python .claude/skills/archi/scripts/validate_drawio_catalog.py --drawio resources/architecture/17.2-Despliegue_Azure_OCTO-HR.drawio --provider azure --strict
```

## `generate_architecture_presentation.py`

```text
--manifest <ruta>       (obligatorio)
--output <ruta>         (obligatorio)
--project-root <ruta>   (default cwd)
--template <ruta>
--strict
```

Genera el HTML `25.1` a partir del manifiesto `25.1.1`: calcula hashes SHA-256, valida la forma del manifiesto contra un conjunto de campos obligatorios (`schemaVersion`, `project`, `scenario`, `review`, `decisionRequest`, `executiveSummary`, `workPerformed`, `drivers`, `alternatives`, `selection`, `architecture`, `security`, `validation`, `risks`, `sources`, `conflicts`), resuelve enlaces relativos dentro del project-root y evalúa el gate de aprobación.

```powershell
python .claude/skills/archi/scripts/generate_architecture_presentation.py --manifest resources/architecture/25.1.1-Manifiesto-Presentacion_OCTO-HR.json --output resources/architecture/25.1-Presentacion-Comite-Arquitectura_OCTO-HR.html
```

## `extract_postman_inventory.py`

```text
posicional: collection   (ruta a .postman_collection.json)
--format {md,csv}   (default md)
```

Extrae inventario normalizado (carpeta, nombre, método, URL, tipo de auth, si tiene ejemplo de respuesta) de una colección Postman v2.0/v2.1, en formato Markdown o CSV, para alimentar `14.xx.N-Mapeo-Integracion_EXT-xx_<Sistema>.md`.

```powershell
python .claude/skills/archi/scripts/extract_postman_inventory.py coleccion.postman_collection.json --format md
```

## MCP de diagramación (no es CLI local, pero es parte de la operación)

Antes de generar diagramas, `archi` valida si están disponibles los MCP `excalidraw-remoto` o `drawio-remoto`. Son opcionales y no bloqueantes: si no están disponibles, la skill usa Mermaid o `.drawio` manual sin bloquear la entrega. Ver [guia-mcp-diagramacion.md](../../skills/archi/references/guia-mcp-diagramacion.md).

## Pricing por ambiente

[validate_pricing.py](../../skills/archi/scripts/validate_pricing.py) valida el [contrato de costos](../../skills/archi/references/contrato-costos.md) con biblioteca estándar. Comandos desde la raíz:

```powershell
python .claude/skills/archi/scripts/validate_pricing.py resources/architecture/17.4.1-Costos_Proyecto.json --sync-reports
python .claude/skills/archi/scripts/validate_pricing.py resources/architecture/17.4.1-Costos_Proyecto.json
python -m unittest discover -s .claude/skills/archi/tests -v
```

`--sync-reports` actualiza únicamente los bloques delimitados de reportes existentes. Sin la opción, es solo lectura. Sale con código 1 ante contrato/cobertura/evidencia temporal/bloques inconsistentes; código 0 acredita integridad aritmética, no exactitud comercial de tarifas. `--help` muestra sus argumentos. El validador general de coherencia integra este chequeo y rechaza pricing sin manifiesto.
