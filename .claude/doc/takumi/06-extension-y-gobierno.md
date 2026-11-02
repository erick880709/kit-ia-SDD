# 06 — Extensión y gobierno

## Adaptación a un cliente

Cada proyecto aporta sus plantillas en `resources/procesos/templates/` y su taxonomía en el inventario. No trasladar responsables, sistemas, códigos o macroprocesos de otro cliente como si fueran hechos. En un proyecto existente, revisar y conservar documentos e inventarios antes de continuar.

Las plantillas del cliente se leen como referencia; se documentan sus campos en el índice. El respaldo genérico permite redactar Markdown cuando no hay plantilla, pero los exportadores actuales necesitan revisar nombres de archivo, tablas y celdas antes de reutilizarse con otro formato.

## Extender un tipo documental

1. Ajustar el contrato en [SKILL.md](../../skills/takumi/SKILL.md) y la referencia correspondiente.
2. Mantener el esqueleto Markdown y sus metadatos compatibles con el parser.
3. Si debe exportarse, actualizar la detección y el exportador; comprobar todas sus secciones contra la plantilla real.
4. Añadir o actualizar su fila en [contratos](03-contratos-y-artefactos.md) e [inventario](08-inventario-de-implementacion.md).
5. Ejecutar los casos relevantes de [evaluación](09-evaluacion-y-release-gates.md) y registrar qué se verificó.

## Evidencia y aprobación

Separar hechos evidenciados, inferencias explícitas, información no evidenciada, contradicciones y contenido irrelevante. Los faltantes quedan como `[PENDIENTE]` con hotspot; una contradicción no se resuelve eligiendo silenciosamente una fuente.

La validación operativa corresponde al dueño del proceso. Generar un archivo o completar una plantilla no constituye aprobación. Los listados maestros conservan los responsables de elaboración, revisión y aprobación según la convención del cliente; una codificación no definida requiere una decisión explícita.

Las mejoras y oportunidades de IA son propuestas sustentadas. Deben preservar la distinción entre el proceso vigente y el cambio propuesto. Los handoffs no autorizan ejecución automática de otro agente.

[Volver al índice](README.md).
