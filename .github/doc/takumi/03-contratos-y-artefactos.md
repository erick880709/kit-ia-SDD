# 03 — Contratos y artefactos

Los contratos de Takumi son instrucciones, plantillas Markdown y convenciones interpretadas por scripts. No hay un catálogo de JSON Schemas ni un validador integral de documentos instalado en esta skill.

## Catálogo de archivos de salida

Todas las rutas de esta tabla son relativas a `resources/procesos/`. Los archivos existentes se revisan y continúan, sin reconstruirlos silenciosamente.

| Archivo | Contenido esperado | Cuándo se crea o actualiza |
|---|---|---|
| `templates/00-indice-plantillas.md` | Correspondencia entre archivo oficial, tipo documental, secciones y columnas | Al identificar las plantillas del cliente; revisar ante cambios |
| `00-inventario-procesos.md` | Taxonomía de macroprocesos/procesos/subprocesos, estado, archivo y hotspots abiertos | Inicialización y seguimiento de cada proceso; fuente de verdad de la taxonomía del proyecto |
| `00-hotspots-pendientes.md` | Backlog global `HS-###`, proceso, tipo, descripción, pregunta, impacto, origen y estado | Al abrir o resolver un hotspot; conservar su historial |
| `00-listado-maestro-documentos-internos.md` | Registro documental: código, versión y responsables de elaboración, revisión y aprobación, según plantilla | Inicializar desde plantilla poblada o encabezados; incorporar/actualizar documentos validados |
| `00-listado-maestro-documentos-externos.md` | Registro de normas, contratos y documentos externos de referencia, según plantilla | Inicializar y agregar referencias nuevas citadas por los procesos |
| `.meetings/index.md` | Archivo leído, fecha de lectura, resumen y procesos relacionados | Tras revisar novedades; la bitácora no sustituye la extracción completa |
| `<macro>/PROC-###-<slug-proceso>.md` | Caracterización y procedimiento consolidados: descripción, recursos, indicadores, controles, SIPOC, actividades PHVA, Mermaid, actores/RACI, APQC, reglas, mejoras, automatización/IA, hotspots y fuentes | Al levantar o continuar un proceso |
| `<macro>/DOC-###-<slug>.md` — manual técnico | Objeto, alcance, definiciones, condiciones, desarrollo, cambios y fuentes; flujo, mejoras y hotspots según contenido | Cuando se solicita un manual técnico |
| `<macro>/DOC-###-<slug>.md` — política | Objeto, alcance, lineamientos, hotspots, notas y control de cambios | Cuando se solicita una política; no forzar actividades ni mejoras ficticias |
| `<macro>/DOC-###-<slug>.md` — apoyo | Objeto, alcance, documentos relacionados, desarrollo, hotspots y cambios; mejoras solo si hay actividad operativa | Cuando se solicita un documento de apoyo |
| `actas/ACTA-###-<fecha>-<slug>.md` | Datos de reunión, agenda, compromisos anteriores, desarrollo temático, anexos, acuerdos, próxima reunión y cambios | Bajo solicitud de acta; enlazar con el proceso cuando corresponda |
| `<macro>/matriz-trazabilidad-<slug-proceso>.md` | Evidencia por elemento: fuente y ubicación, actor, actividad, entradas/salidas, secuencia, categoría A–E, estado y observaciones | Recomendado para fuentes extensas o complejas; respaldo de trabajo |

Las plantillas oficiales `.docx`/`.xlsx` dentro de `templates/` son entradas de solo lectura, no documentos generados por Takumi.

## Identificadores y estados

`PROC-###`, `DOC-###`, `ACTA-###` y `HS-###` tienen consecutivos globales independientes: buscar el máximo existente y sumar uno. Manuales, políticas y apoyos comparten la serie `DOC`. Los slugs usan minúsculas sin tildes y guiones, aproximadamente hasta seis palabras.

Las plantillas de proceso y DOC incluyen identidad, versión y estado. Los valores de estado previstos son `Pendiente`, `En levantamiento`, `Borrador generado` y `Validado por el dueno`; se elige un valor, no se conserva la lista del esqueleto. El acta usa `Borrador` o `Aprobada`, con la incompatibilidad de exportación descrita en [validación](07-validacion-y-estado.md).

Los hotspots son de información faltante, ambigüedad, contradicción, decisión pendiente o control/riesgo no definido. Se cierran como `Resuelto`, registrando fecha y respuesta tanto en el documento como en el maestro.

## Archivos derivados bajo pedido

Los derivados conservan el nombre base completo del Markdown y se guardan junto a él.

| Origen | Salida | Condición |
|---|---|---|
| `PROC-###-<slug>.md` | Mismo nombre `.xlsx` y `.docx` | Caracterización y procedimiento con las plantillas esperadas |
| `PROC-###-<slug>.md` | Mismo nombre `.bpmn` | El script encuentra Mermaid en la sección de diagrama reconocida |
| DOC manual técnico | Mismo nombre `.docx` y, si encuentra diagrama, `.bpmn` | `tipo_documento` reconocido como manual |
| DOC política o apoyo | Mismo nombre `.docx` | `tipo_documento` reconocido |
| ACTA | Mismo nombre `.docx` | Identificado por prefijo `ACTA-` |
| Listado maestro interno o externo `.md` | Mismo nombre `.xlsx` | Exportación separada del listado correspondiente |

El script reconoce primero los prefijos `PROC-` y `ACTA-`; para DOC utiliza `tipo_documento`. Un DOC sin tipo reconocible produce un error. La generación de BPMN se omite si no se encuentra el bloque esperado. La marca de borrador y sus límites deben revisarse por formato; no se debe asumir que todos los derivados llevan la misma marca.

## Plantillas dueñas

El [inventario de implementación](08-inventario-de-implementacion.md) enlaza cada plantilla, referencia y exportador. Los campos oficiales del cliente prevalecen sobre el esqueleto genérico para redactar; los scripts requieren verificar su mapeo si esos campos cambian.

[Volver al índice](README.md).
