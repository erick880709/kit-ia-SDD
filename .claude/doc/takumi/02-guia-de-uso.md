# 02 — Guía de uso

## Entradas y preparación

Invoque la skill `takumi` o seleccione el agente del mismo nombre. Indique el proceso o tipo de documento y las fuentes disponibles. Se revisan `Meetings/`, documentos anteriores, inventarios y documentos ya elaborados antes de solicitar información repetida.

Las plantillas oficiales pertenecen a `resources/procesos/templates/`. Si faltan, se utiliza el esquema genérico de la skill para redactar Markdown; esto no garantiza que los exportadores Office puedan operar sin sus plantillas específicas.

## Protocolo de sesión

| Paso | Acción y resultado |
|---|---|
| 0 | Revisar novedades de `Meetings/`, leer cada fuente completa y actualizar `.meetings/index.md` |
| 1 | Revisar plantillas e inventario; resolver proceso, macroproceso y tipo documental; registrar procesos nuevos |
| 2 | Recopilar contenido existente, reuniones, antecedentes y entrevista; marcar faltantes |
| 2b | Para fuentes extensas o complejas, construir la matriz de trazabilidad antes de redactar |
| 3 | Redactar el Markdown con campos del cliente o respaldo genérico, conservando cada actividad sustentada |
| 4 | Registrar vacíos, contradicciones y decisiones como hotspots locales y globales |
| 5 | Evaluar mejoras en orden Eliminar, Simplificar, Integrar y Automatizar; identificar oportunidades de IA cuando aplique |
| 6 | Para documentos con flujo, producir Mermaid con un nodo por actividad y decisiones explícitas |
| 7 | Actualizar estado, ruta y hotspots en el inventario |
| 7b | Inicializar listados maestros si faltan; actualizar internos al validar y externos al incorporar referencias |
| 8 | Reportar fuentes, documentos, rutas, estados, hotspots, mejoras y cambios de maestros |

La generación de actas tiene un flujo propio bajo pedido: reunir notas, aplicar la plantilla, asignar `ACTA-###`, enlazar con el proceso y registrar compromisos/hotspots. Leer una reunión no obliga a generar un acta.

## Salidas / outputs

El entregable habitual es Markdown bajo `resources/procesos/`: documentos `PROC-###`, `DOC-###` o `ACTA-###`, inventario, hotspots e índices. La [tabla de contratos](03-contratos-y-artefactos.md) describe cada archivo y su condición de generación.

Word, Excel y BPMN se producen únicamente cuando se solicitan. El Markdown conserva la autoridad después de exportar; los listados maestros no se sincronizan automáticamente con la exportación.

## Ejemplos de solicitudes

- «Documenta el proceso de compras con las reuniones y antecedentes disponibles».
- «Continúa el PROC-004 e incorpora esta respuesta del dueño del proceso».
- «Genera el acta de esta reunión y vincúlala al proceso correspondiente».
- «Exporta este PROC a Word, Excel y BPMN».

En solicitudes genéricas o cuando falta el macroproceso, la skill pide resolver la selección. Un dato operativo sin evidencia queda como `[PENDIENTE]` y hotspot; no se completa como hecho por inferencia silenciosa.

[Volver al índice](README.md).
