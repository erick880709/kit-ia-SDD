# Inventario de implementación

Este inventario permite localizar cada pieza de la skill y su responsabilidad. Los conteos se verificaron por listado directo del directorio `.claude/skills/archi/` al momento de escribir este documento.

## Skill principal

| Archivo | Propósito |
|---|---|
| [SKILL.md](../../skills/archi/SKILL.md) | Persona, numeración canónica, Paso 0 y reglas de diagramación/ubicación de salida |
| [release.md](../../skills/archi/release.md) | Bitácora de release por rama: alcance, características incorporadas, validaciones y limitaciones |

## Referencias — 33 archivos agrupados en 11 categorías

Directorio: [references/](../../skills/archi/references/)

### Línea base, arquetipos y diseño detallado (5)

| Archivo | Contenido |
|---|---|
| [guia-preparacion-dominio.md](../../skills/archi/references/guia-preparacion-dominio.md) | Gate DR-01, aplicabilidad de Event Storming, evidencia equivalente, estados y handoffs para Casos A/C |
| [cuestionario-linea-base.md](../../skills/archi/references/cuestionario-linea-base.md) | Checklist de confirmación de fuentes, contexto, stack y autoridades para `01` |
| [guia-arquetipo-solucion.md](../../skills/archi/references/guia-arquetipo-solucion.md) | Análisis de arquetipos implementables y baseline tecnológico vivo para `10.1` |
| [guia-diseno-detallado-contenedores.md](../../skills/archi/references/guia-diseno-detallado-contenedores.md) | Estructura de `14.xx` por contenedor significativo |
| [guia-microfrontends.md](../../skills/archi/references/guia-microfrontends.md) | Evaluación y diseño gobernado de microfrontends |

### Alternativas, decisión y evolución AS-IS/TO-BE (3)

| Archivo | Contenido |
|---|---|
| [guia-alternativas-solucion.md](../../skills/archi/references/guia-alternativas-solucion.md) | Configuraciones consolidadas, híbridas, distribuidas y mapa común de alcance para `09` |
| [guia-matriz-decision.md](../../skills/archi/references/guia-matriz-decision.md) | Criterios, pesos, escala normalizada, evidencia y sensibilidad para `10` |
| [guia-as-is-to-be.md](../../skills/archi/references/guia-as-is-to-be.md) | Brechas, decisiones reemplazadas y transición controlada para Caso C |

### Diagramación C4 y complementaria (5)

| Archivo | Contenido |
|---|---|
| [diagramas-c4-ejemplos.md](../../skills/archi/references/diagramas-c4-ejemplos.md) | Uso de C4 por nivel y separación del detalle por contenedor |
| [diagramas-adicionales-ejemplos.md](../../skills/archi/references/diagramas-adicionales-ejemplos.md) | Diagramas complementarios y explicaciones de decisiones/interacciones |
| [guia-mcp-diagramacion.md](../../skills/archi/references/guia-mcp-diagramacion.md) | Detección de MCP `excalidraw-remoto`/`drawio-remoto` y fallback a Mermaid/`.drawio` manual |
| [drawio-iconos-nube.md](../../skills/archi/references/drawio-iconos-nube.md) | Separación entre diseño y representación, catálogo curado, referencia neutra y validación estricta |
| [guia-terraform-a-diagrama.md](../../skills/archi/references/guia-terraform-a-diagrama.md) | Derivación `recurso IaC → rol → CT → archiIconId → estilo` para despliegue AS-IS |

### Diseño y gobierno de APIs / integraciones externas (2)

| Archivo | Contenido |
|---|---|
| [guia-gobierno-y-diseno-apis.md](../../skills/archi/references/guia-gobierno-y-diseno-apis.md) | Nomenclatura, seguridad, compatibilidad y ciclo de vida del catálogo `API-xxx`/`API-xxx-OP-xxx` |
| [guia-mapeo-integraciones-externas.md](../../skills/archi/references/guia-mapeo-integraciones-externas.md) | Mapeo campo a campo de un sistema externo `EXT-xx` para `14.xx.N` |

### Modelos de datos (2)

| Archivo | Contenido |
|---|---|
| [guia-catalogo-bases-de-datos.md](../../skills/archi/references/guia-catalogo-bases-de-datos.md) | Catálogo `DATA-xxx` de conjuntos persistentes |
| [guia-diccionario-fisico-datos.md](../../skills/archi/references/guia-diccionario-fisico-datos.md) | Esquema físico y diccionario de datos por contenedor |

### Seguridad y modelo de amenazas (1)

| Archivo | Contenido |
|---|---|
| [guia-modelo-amenazas-y-requisitos-seguridad.md](../../skills/archi/references/guia-modelo-amenazas-y-requisitos-seguridad.md) | Activos, superficies, `THR-xxx`, `SEC-xxx`, riesgo residual y handoff verificable a Vulcano |

### Cloud, multi-nube, IaC y costos (4)

| Archivo | Contenido |
|---|---|
| [guia-multi-cloud-deployment.md](../../skills/archi/references/guia-multi-cloud-deployment.md) | Alcance, riesgos, operación y patrones multi-cloud |
| [guia-pricing-cloud.md](../../skills/archi/references/guia-pricing-cloud.md) | Fuentes, supuestos, moneda, región y trazabilidad del cálculo de pricing |
| [guia-costos-ia.md](../../skills/archi/references/guia-costos-ia.md) | Estimación de costos de componentes de IA |
| [plantilla-reporte-costos.md](../../skills/archi/references/plantilla-reporte-costos.md) | Correspondencia entre pricing, arquitectura y recomendación (base de `17.4`/`17.5`) |

### Calidad, tácticas y patrones arquitectónicos (4)

| Archivo | Contenido |
|---|---|
| [guia-catalogo-tacticas-calidad.md](../../skills/archi/references/guia-catalogo-tacticas-calidad.md) | Catálogo de tácticas de calidad usado en QAW y ATAM |
| [guia-tacticas-patrones.md](../../skills/archi/references/guia-tacticas-patrones.md) | Catálogo maestro `TP-xxx` con trazabilidad `QA → TP → CT → DA → prueba/evidencia` |
| [guia-catalogo-patrones.md](../../skills/archi/references/guia-catalogo-patrones.md) | Fichas de patrones arquitectónicos, de diseño, cloud y de IA |
| [guia-well-architected.md](../../skills/archi/references/guia-well-architected.md) | Evaluación holística de los seis pilares Well-Architected para `08` |

### Clean Code (1)

| Archivo | Contenido |
|---|---|
| [guia-clean-code.md](../../skills/archi/references/guia-clean-code.md) | Catálogo transversal `CC-xxx` y separación frente a operacionalización CI/CD de Vulcano |

### Gobierno, auditoría y validación de coherencia (2)

| Archivo | Contenido |
|---|---|
| [guia-gobierno-validacion.md](../../skills/archi/references/guia-gobierno-validacion.md) | Checkpoints progresivos y gates de gobierno (`07`, `10`-`13`, `25`-`26`) |
| [guia-auditoria-coherencia-arquitectura.md](../../skills/archi/references/guia-auditoria-coherencia-arquitectura.md) | Checkpoints `CP-01`-`CP-04` de auditoría de coherencia |

### Presentación ejecutiva y plantillas documentales (3)

| Archivo | Contenido |
|---|---|
| [guia-presentacion-comite-arquitectura.md](../../skills/archi/references/guia-presentacion-comite-arquitectura.md) | Estructura y audiencias de `25.1`/`25.1.1` |
| [esquema-presentacion-arquitectura.json](../../skills/archi/references/esquema-presentacion-arquitectura.json) | Contrato de forma que valida el manifiesto `25.1.1` |
| [plantilla-documento-arquitectura.md](../../skills/archi/references/plantilla-documento-arquitectura.md) | Estructura `00`-`26`, propiedad documental y criterios de cierre |

## Scripts (6)

Directorio: [scripts/](../../skills/archi/scripts/)

| Archivo | Propósito |
|---|---|
| [validate_architecture_coherence.py](../../skills/archi/scripts/validate_architecture_coherence.py) | Audita coherencia estructural y trazabilidad de artefactos contra `25`; incluye `--self-test` |
| [validate_architecture_presentation.py](../../skills/archi/scripts/validate_architecture_presentation.py) | Valida el HTML `25.1` ya generado |
| [validate_drawio_catalog.py](../../skills/archi/scripts/validate_drawio_catalog.py) | Valida catálogo curado de iconos y `.drawio` de despliegue |
| [generate_architecture_presentation.py](../../skills/archi/scripts/generate_architecture_presentation.py) | Genera el HTML `25.1` desde el manifiesto `25.1.1` |
| [extract_postman_inventory.py](../../skills/archi/scripts/extract_postman_inventory.py) | Extrae inventario normalizado de una colección Postman |

Flags reales de cada script en [05-cli-y-operacion.md](./05-cli-y-operacion.md).

## Assets (7 archivos)

Directorio: [assets/](../../skills/archi/assets/)

| Archivo | Propósito |
|---|---|
| [`PS-ARQ-001 template.docx`](<../../skills/archi/assets/PS-ARQ-001 template.docx>) | Plantilla documental corporativa para versión Word de un artefacto |
| [plantilla-presentacion-arquitectura.html](../../skills/archi/assets/plantilla-presentacion-arquitectura.html) | Base HTML autocontenida y adaptable por audiencia de `25.1` |
| [plantilla-manifiesto-presentacion.json](../../skills/archi/assets/plantilla-manifiesto-presentacion.json) | Base estructurada para construir el manifiesto real `25.1.1` |
| [iconos/catalogo_iconos_curado.json](../../skills/archi/assets/iconos/catalogo_iconos_curado.json) | Catálogo canónico de 50 iconos Azure2/AWS4/GCP3 con procedencia fijada |
| [iconos/aliases_iconos.json](../../skills/archi/assets/iconos/aliases_iconos.json) | Resolución estable de términos tecnológicos a `archiIconId` |
| [iconos/catalogo_iconos.schema.json](../../skills/archi/assets/iconos/catalogo_iconos.schema.json) | Contrato de estructura y compatibilidad del catálogo de iconos |
| [drawio/referencia-despliegue-azure.drawio](../../skills/archi/assets/drawio/referencia-despliegue-azure.drawio) | Composición Azure neutra, auditable y sin topología de OCTO-HR |

## Agentes

[`archi.agent.md`](../../agents/archi.agent.md) es el agente top-level dedicado. Declara la skill `archi`, herramientas documentales y límites explícitos; no incorpora subagentes ni paralelismo.

## Ejemplo real de salida en este repositorio

| Ubicación | Contenido |
|---|---|
| [resources/architecture/](../../../resources/architecture/) | Ejecución completa `01`-`26` sobre OCTO_HR, incluidos `25.1`/`25.1.1` y varios `14.xx`/`16.xx` por contenedor |
| [resources/architecture/25-Revision-Tecnica-Arquitectura.md](../../../resources/architecture/25-Revision-Tecnica-Arquitectura.md) | Evidencia fechada de `validate_architecture_coherence.py` (2026-08-11) |
| [resources/architecture/17-Vista-de-Despliegue.md](../../../resources/architecture/17-Vista-de-Despliegue.md) | Evidencia registrada de `validate_drawio_catalog.py` |
| [resources/architecture/12-Registro-de-Incertidumbres.md](../../../resources/architecture/12-Registro-de-Incertidumbres.md) | `INC-17`: menciona `extract_postman_inventory.py` como paso futuro, sin evidencia de ejecución |

## Conteo resumido

| Grupo | Cantidad |
|---|---:|
| Referencias del skill (`references/`, `.md` + `.json`) | 33 |
| Categorías temáticas de referencias | 11 |
| Scripts | 6 |
| Assets reutilizables (`assets/`, incluidos los 3 de `iconos/` y 1 de `drawio/`) | 7 |
| Agentes dedicados | 1 |
| Documentos de esta guía | 9 (índice más 8 capítulos; el contrato del agente se enlaza desde el índice y no requiere un capítulo 04 separado) |

## Incorporaciones de costos — 2026-09-14

| Archivo | Responsabilidad |
|---|---|
| [contrato-costos.md](../../skills/archi/references/contrato-costos.md) | Contrato JSON v1, inventario en `17`, fórmulas, evidencia, bloques y migración histórica; complementa las guías de pricing |
| [validate_pricing.py](../../skills/archi/scripts/validate_pricing.py) | Sexto CLI: validación de costos y sincronización de bloques `17.4`/`17.5`; integrado en coherencia |
| [test_pricing.py](../../skills/archi/tests/test_pricing.py) | Quince pruebas con datos sintéticos y sin llamadas a proveedores |

El contrato se implementa en el validador de biblioteca estándar; no se declara un JSON Schema externo que no exista.
