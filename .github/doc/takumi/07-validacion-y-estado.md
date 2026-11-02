# 07 — Validación y estado

Inspección documental del 2026-09-14. Se revisaron el contrato, el agente, la estructura de plantillas y referencias y el código de exportación. Esta revisión no acredita la calidad visual ni una ejecución completa de los exportadores.

## Estado verificable

| Elemento | Evidencia / estado |
|---|---|
| Skill y agente | Presentes y enlazados desde esta documentación |
| Plantillas y referencias | Cinco esqueletos y cinco referencias presentes |
| Scripts | Doce archivos Python presentes; inventariados en el capítulo 08 |
| CLI de exportación | Inspeccionado estáticamente; no ejecutado en esta actualización |
| Entregables en `resources/procesos/` | Directorio no encontrado durante esta revisión; no se afirma evidencia de exportación local |
| Suite propia de tests/evaluaciones | No hay directorios `tests/` ni `evaluations/` en la skill inspeccionada |
| Validación semántica integral | No hay un validador dedicado; requiere contrastar fuentes, documentos, índices y aprobación |

## Limitaciones y diferencias detectadas

| Hallazgo | Evidencia e implicación |
|---|---|
| Exportadores ligados a plantillas concretas | La skill lo declara y los scripts fijan nombres/mapeos; cambiar de cliente exige verificarlos |
| Estado de acta incompatible con criterio común de validación | [acta.md](../../skills/takumi/templates/acta.md) usa `Aprobada`; [common.py](../../skills/takumi/scripts/common.py) busca `validado por el dueno`. Un acta aprobada puede seguir exportándose como borrador |
| Borrador BPMN | La función `_generar_bpmn` no transmite el estado documental al escritor BPMN; no asumir una marca de borrador equivalente a Office |
| BPMN condicional | El router retorna sin generar BPMN si no encuentra Mermaid en la sección reconocida; la promesa de tres archivos para PROC depende de ese contenido |
| Layout y flujograma | BPMN usa un layout simple; Word referencia el archivo sin imagen embebida, según las limitaciones declaradas por la skill |
| Política | La skill declara que el exportador añade tablas de cambios/aprobación desde la plantilla de apoyo y emite un warning; confirmar su adecuación con el cliente |
| Delegación | La skill menciona delegación de lecturas extensas; el agente instalado no expone `Agent` ni implementa subagentes |

Estos puntos se documentan como límites o pendientes de implementación. Esta actualización no modifica scripts, estados canónicos ni plantillas para ocultar las diferencias.

## Cierre de una revisión documental

- Comprobar que todos los archivos de implementación estén inventariados y enlazados.
- Comprobar que cada salida tenga propósito, ruta y condición de creación.
- Verificar enlaces relativos y diferencias contra el contrato vigente.
- Registrar por separado verificaciones ejecutadas y casos todavía propuestos.

Los casos de aceptación están en [09 — Evaluación y release gates](09-evaluacion-y-release-gates.md).

[Volver al índice](README.md).
