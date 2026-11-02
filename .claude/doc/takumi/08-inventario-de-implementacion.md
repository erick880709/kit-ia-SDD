# 08 — Inventario de implementación

Inventario de archivos inspeccionado el 2026-09-14. Cada entrada enlaza a la implementación; su presencia no implica prueba de ejecución.

## Entradas

| Archivo | Responsabilidad |
|---|---|
| [SKILL.md](../../skills/takumi/SKILL.md) | Contrato canónico, protocolo y gobierno documental |
| [takumi.agent.md](../../agents/takumi.agent.md) | Agente directo, herramientas y límites |

## Referencias — 5 archivos

| Archivo | Contenido |
|---|---|
| [plantilla-caracterizacion.md](../../skills/takumi/references/plantilla-caracterizacion.md) | Caracterización, SIPOC, recursos, controles, actores y reglas |
| [plantilla-procedimiento.md](../../skills/takumi/references/plantilla-procedimiento.md) | Actividades PHVA, flujograma, aprobación y variantes documentales |
| [plantilla-acta.md](../../skills/takumi/references/plantilla-acta.md) | Reunión, agenda, desarrollo, compromisos y cambios |
| [plantilla-listado-maestro.md](../../skills/takumi/references/plantilla-listado-maestro.md) | Columnas y actualización de registros internos/externos |
| [plantilla-apqc.md](../../skills/takumi/references/plantilla-apqc.md) | Guía de categorización APQC |

## Plantillas Markdown — 5 archivos

| Archivo | Documento resultante |
|---|---|
| [proceso.md](../../skills/takumi/templates/proceso.md) | `PROC-###`, caracterización y procedimiento consolidados |
| [manual-tecnico.md](../../skills/takumi/templates/manual-tecnico.md) | `DOC-###`, manual técnico |
| [politica.md](../../skills/takumi/templates/politica.md) | `DOC-###`, política |
| [documento-apoyo.md](../../skills/takumi/templates/documento-apoyo.md) | `DOC-###`, documento de apoyo |
| [acta.md](../../skills/takumi/templates/acta.md) | `ACTA-###`, acta de reunión |

## Scripts — 12 archivos

| Archivo | Responsabilidad / salida |
|---|---|
| [exportar_oficial.py](../../skills/takumi/scripts/exportar_oficial.py) | Entrada principal, detección de tipo y coordinación de derivados |
| [export_caracterizacion.py](../../skills/takumi/scripts/export_caracterizacion.py) | Caracterización Excel |
| [export_procedimiento.py](../../skills/takumi/scripts/export_procedimiento.py) | Procedimiento Word |
| [export_manual_tecnico.py](../../skills/takumi/scripts/export_manual_tecnico.py) | Manual técnico Word |
| [export_politica.py](../../skills/takumi/scripts/export_politica.py) | Política Word |
| [export_documento_apoyo.py](../../skills/takumi/scripts/export_documento_apoyo.py) | Documento de apoyo Word |
| [export_acta.py](../../skills/takumi/scripts/export_acta.py) | Acta Word |
| [export_listado_maestro.py](../../skills/takumi/scripts/export_listado_maestro.py) | Listados interno/externo Excel desde sus Markdown |
| [md_parser.py](../../skills/takumi/scripts/md_parser.py) | Lectura de front matter YAML, secciones, tablas y bloques Mermaid |
| [mermaid_to_graph.py](../../skills/takumi/scripts/mermaid_to_graph.py) | Conversión del Mermaid admitido a grafo intermedio y warnings |
| [bpmn_writer.py](../../skills/takumi/scripts/bpmn_writer.py) | Escritura BPMN XML y layout simple desde el grafo |
| [common.py](../../skills/takumi/scripts/common.py) | Utilidades compartidas, campos, rutas y criterio de borrador |

Los scripts auxiliares no son artefactos documentales del cliente. Los archivos generados se describen en [03 — Contratos y artefactos](03-contratos-y-artefactos.md).

## Documento complementario

[proceso-skills-agentes.md](proceso-skills-agentes.md) conserva la propuesta existente de ciclo de vida de capacidades de IA. No es el contrato de salida de Takumi ni evidencia de un proceso validado por un cliente.

[Volver al índice](README.md).
