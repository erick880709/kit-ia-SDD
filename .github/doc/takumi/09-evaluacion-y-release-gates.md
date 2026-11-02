# 09 — Evaluación y release gates

Los siguientes casos son una pauta de revisión para cambios de Takumi; no constituyen una suite automatizada existente ni resultados de pruebas ejecutadas.

## Casos de evaluación

| Caso | Resultado esperado |
|---|---|
| Proceso nuevo con fuente completa | Registrar inventario, asignar ID sin colisiones y documentar todas las actividades sustentadas |
| Reanudar proceso | Preservar contenido previo e incorporar novedades con trazabilidad |
| Fuente larga con pasos similares | Mantener actividades realmente distintas y matriz de evidencia cuando corresponda |
| Datos ausentes o contradictorios | `[PENDIENTE]` y hotspots locales/globales; no inventar responsables ni resolver contradicciones sin evidencia |
| Resolución de hotspot | Actualizar ambos registros conservando fecha y respuesta |
| Política declarativa | No forzar Mermaid ni oportunidades de automatización sin flujo operativo |
| Acta solicitada | Asignar `ACTA-###`, registrar acuerdos y enlazar proceso; revisar el pendiente de estado de exportación |
| Sesión sin pedido de Office/BPMN | Producir Markdown y reporte sin disparar exportadores |
| PROC con Mermaid reconocido | Generar derivados solicitados y contrastar tablas, nodos y decisiones |
| DOC sin tipo reconocible | Informar el error de tipo; no producir un documento de otro tipo por defecto |
| Exportar listado maestro | Usar el Markdown actualizado sin atribuir al exportador la sincronización editorial |
| Plantilla de otro cliente | Revisar mapeos antes de afirmar compatibilidad o calidad del resultado |

## Gates para cambios

| Gate | Criterio | Evidencia necesaria |
|---|---|---|
| Coherencia documental | Skill, agente, plantillas y documentación concuerdan o declaran sus diferencias | Revisión y enlaces válidos |
| Fidelidad del proceso | Actividades, actores, reglas y controles se pueden rastrear a fuentes completas | Documento y matriz cuando aplique |
| Control documental | IDs únicos, versiones/estados coherentes y maestros actualizados cuando corresponde | Inventario, hotspots, listados y decisión del dueño |
| Exportación | Los formatos afectados conservan contenido y muestran el estado correcto | Archivos abiertos/renderizados y resultados de revisión, incluidos warnings |
| Compatibilidad | Cambios de plantilla/parser no pierden campos ni alteran otros tipos | Muestras representativas de los formatos afectados |

Para un cambio exclusivamente documental, verificar enlaces, cobertura y correspondencia con la implementación. Para cambiar un exportador o prometer compatibilidad con nuevas plantillas, ejecutar los casos afectados y conservar evidencia visual. No declarar todos los gates aprobados con una inspección estática.

[Volver al índice](README.md).
