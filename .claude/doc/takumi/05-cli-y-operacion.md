# 05 — CLI y operación

La documentación Markdown se elabora mediante el protocolo de la skill. El CLI cubre la exportación; no ejecuta por sí solo entrevistas, validaciones humanas ni sincronización editorial de inventarios.

## Preparación

Ejecutar desde la raíz del repositorio con Python y las dependencias de los exportadores disponibles, incluidas `python-docx`, `openpyxl` y `PyYAML`. Revisar las plantillas esperadas por cada script: contienen rutas, nombres y mapeos específicos del proyecto. No hay un `requirements.txt` propio dentro de Takumi.

Antes de exportar, comprobar el Markdown, su tipo, estado, campos y diagrama. Conservar las plantillas oficiales intactas. Los comandos siguientes son ejemplos con rutas que deben sustituirse por un documento real.

## Exportar un documento

```powershell
python .claude/skills/takumi/scripts/exportar_oficial.py resources/procesos/compras/PROC-001-gestion-de-compras.md
```

[exportar_oficial.py](../../skills/takumi/scripts/exportar_oficial.py) recibe un argumento posicional, detecta el tipo y llama a los exportadores correspondientes. Imprime tipo, archivos generados y warnings. Su función devuelve `tipo`, `archivos` y `warnings`; el CLI no publica ese resultado como JSON estructurado.

No dispone de un contrato `--help` con argparse: pasar `--help` puede interpretarse como ruta de entrada. Los derivados se escriben con el mismo nombre base, reemplazando los existentes; no se debe asumir atomicidad si falla uno de varios exportadores.

## Exportar listados maestros

```powershell
python .claude/skills/takumi/scripts/export_listado_maestro.py internos
python .claude/skills/takumi/scripts/export_listado_maestro.py externos
```

Se ejecutan por separado, una vez actualizado el Markdown del listado conforme al control documental. Exportar un PROC no agrega su fila al maestro.

## Revisión del resultado

Abrir los archivos producidos y contrastar actividades, tablas, campos y estado con el Markdown. Revisar warnings, contenido faltante, desbordamientos y legibilidad; verificar nodos, decisiones y conexiones del BPMN en un visor compatible. El `.docx` referencia el BPMN por nombre y no incorpora una imagen renderizada del flujo.

La evidencia de esta actualización es documental; no se ejecutaron exportaciones oficiales. Véase [estado y limitaciones](07-validacion-y-estado.md).

[Volver al índice](README.md).
