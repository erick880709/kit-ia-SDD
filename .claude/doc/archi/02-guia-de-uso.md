# Guía de uso

## Prerrequisitos

### Funcionales

- Haber resuelto el **Paso 0** (escenario A/B/C) — si es ambiguo, `archi` debe preguntar antes de generar.
- **Caso A y C (DR-01 y línea base):** evaluar primero la preparación del dominio con [guia-preparacion-dominio.md](../../skills/archi/references/guia-preparacion-dominio.md). Event Storming es obligatorio cuando el dominio es complejo y su ausencia bloquea la arquitectura objetivo; para un dominio simple se admite evidencia equivalente validada y para uno puramente técnico puede registrarse `No aplica`. Después del gate se leen por completo las fuentes aplicables. `ES-002`, `ES-004`, `ES-010`, `ES-012`, `ES-013` y `ES-015` forman el paquete mínimo solo cuando correspondan al formato ejecutado; nunca se convierte automáticamente cada bounded context en microservicio.
- **Caso C:** exige generar o confirmar primero un AS-IS reciente (equivalente a ejecutar el Caso B) antes de diseñar el TO-BE.
- `epicureo` no es un prerrequisito universal: DR-01 devuelve a la sesión llamadora un handoff hacia esa skill únicamente cuando faltan propósito, alcance, métricas o decisiones de stakeholders. `janus` continúa siendo una fuente indirecta por las rutas `resources/architecture/definitions/` y `resources/design/models/`, no una dependencia obligatoria por nombre.
- Para interfaces conversacionales/agentic UI, si existe un paquete de diseño Iris, `archi` reutiliza su base `UF/IF/CF/SCR/CMP/ST/ERR/TC` — es un insumo condicional, no universal.

### Técnicos

- **MCP de diagramación (opcional, no bloqueante):** antes de generar diagramas, `archi` valida si están disponibles los MCP `excalidraw-remoto` o `drawio-remoto` (ver [guia-mcp-diagramacion.md](../../skills/archi/references/guia-mcp-diagramacion.md)). Si no están disponibles, usa Mermaid o `.drawio` manual **sin bloquear la entrega** — por tanto no es un prerrequisito duro, es una mejora cuando existe.
- **Python 3** para ejecutar los 6 scripts de `scripts/` (generación y validación de la presentación de comité, validación de coherencia y del catálogo `.drawio`, extracción de inventario Postman). Todos son de biblioteca estándar, sin dependencias externas declaradas en su código.
- **Navegador moderno** para navegar las vistas de `25.1-Presentacion-Comite-Arquitectura_<Proyecto>.html` (Ejecutiva/Arquitectura/Completa).
- Carpeta de salida escribible: `resources/architecture/` en la raíz del proyecto, o `resources/architecture/<Proyecto>/` si el repositorio contiene varias iniciativas. Los materiales fuente (`resources/architecture/definitions/`, `resources/design/models/`, `resources/functional/eventstorming/`) permanecen donde están y no se mueven.

## Entradas

- Especificaciones/requerimientos en lenguaje natural aportados por el usuario (Caso A).
- El propio repositorio como evidencia observable para Caso B/AS-IS: dependencias, estructura, puntos de entrada, datos, integraciones, comunicación, contratos, rutas/controllers/endpoints/topics/schemas/clientes de API, patrones observables, fronteras de confianza, configuración de lint/análisis/pruebas, CI/CD e IaC.
- Artefactos previos en `resources/architecture/definitions/`, `resources/design/models/` y `resources/functional/eventstorming/`, cuando existen.
- Un AS-IS aprobado o reciente (Caso C).
- Opcional: documentación, colección Postman o URL con detalle real de campos de un sistema externo `EXT-xx`, para generar `14.xx.N-Mapeo-Integracion_EXT-xx_<Sistema>.md` — si la fuente es Postman, se procesa con `scripts/extract_postman_inventory.py`.
- Opcional: `05.04.06-Analysis-Archetypes.md`, usado **solo como ejemplo estructural** de profundidad para `10.1`, nunca como fuente de tecnologías/versiones/scripts/umbrales.
- Opcional: IaC (Terraform) como evidencia para derivar despliegue AS-IS cuando no existe documentación vigente ([guia-terraform-a-diagrama.md](../../skills/archi/references/guia-terraform-a-diagrama.md)).
- Assets de referencia visual del propio skill: `assets/iconos/catalogo_iconos_curado.json`, `assets/iconos/aliases_iconos.json` y `assets/drawio/referencia-despliegue-azure.drawio` (gobiernan solo representación visual, nunca deciden servicios ni topología).

## Parámetros

### De la sesión

`archi` se invoca como skill en lenguaje natural (no como comando con flags), por lo que sus "parámetros de sesión" son decisiones que fija el propio proceso, no argumentos de CLI:

- **Escenario** resuelto en el Paso 0: `A` (greenfield), `B` (AS-IS) o `C` (TO-BE) — coincide con el valor `--scenario` que después reciben los scripts de validación.
- **Nombre del proyecto** (`<Proyecto>`), usado como sufijo estable en prácticamente todos los nombres de archivo generados.
- **Ubicación de salida**: `resources/architecture/` o `resources/architecture/<Proyecto>/`, según si el repositorio aloja una o varias iniciativas.
- **Disponibilidad de MCP de diagramación** (`excalidraw-remoto`, `drawio-remoto`), detectada al inicio de la generación de diagramas.
- **IDs estables** que persisten durante toda la sesión y sesiones futuras: `CT-xx` (contenedores), `API-xxx`/`API-xxx-OP-xxx` (APIs/operaciones), `DATA-xxx` (conjuntos persistentes), `ARQ-xxx` (arquetipos), `THR-xxx`/`SEC-xxx` (amenazas/requisitos de seguridad), `TP-xxx` (tácticas/patrones), `CC-xxx` (Clean Code), `DA-xxx` (decisiones).

### Del validador

Los parámetros reales de línea de comandos de los 6 scripts están documentados en [05-cli-y-operacion.md](./05-cli-y-operacion.md).

## Proceso que aplica

1. **Paso 0 — determinar escenario** (A/B/C, o terminar sin artefactos si no hay trabajo arquitectónico).
2. **Gate DR-01 — preparación del dominio** (Casos A y C): clasifica la complejidad, valida Event Storming o evidencia equivalente y solo continúa en `Listo` o `Listo con riesgos`. Los demás estados generan handoff a `epicureo` o `storming` y detienen la arquitectura objetivo.
3. **Paso 1 — línea base** (Casos A y C): después de DR-01, lee fuentes existentes, usa [cuestionario-linea-base.md](../../skills/archi/references/cuestionario-linea-base.md) como checklist (confirma siempre bloques críticos 1-4; pregunta 5-11 solo si quedan vacíos relevantes) y genera `01-Linea-Base_<Proyecto>.md`, incluyendo `## Preparación del dominio`.
4. **Caso A (orden obligatorio):** contexto/restricciones/supuestos (`02`-`04`) → atributos y funcionalidades significativas (`05`-`06`) → QAW (`07`) → Well-Architected (`08`) → alternativas de solución con mapa común de alcance (`09`) → selección humana explícita (`10`) → arquetipo de solución y baseline tecnológico (`10.1`) → tecnologías emergentes si aplica (`11`) → incertidumbres y PoC si aplica (`12`-`13`) → diseño detallado por contenedor y gobierno de APIs si aplica (`14`/`14.00`/`14.xx`) → secuencias (`15`) → modelo de datos (`16`/`16.xx`) → despliegue y costos si aplica (`17`/`17.1`-`17.5`) → tácticas y patrones (`18`) → dimensiones arquitectónicas y Clean Code (`19`) → modelo de amenazas si aplica (`19.1`) → decisiones/riesgos/glosario (`20`-`22`) → revisión técnica (`25`) → presentación de comité (`25.1`/`25.1.1`) → validación/aprobación humana (`26`) → documento orquestador final (`00`).
5. **Caso B (AS-IS):** describe solo lo observable (código, configuración, IaC, pipelines); omite `01` si no aplica y `07`-`13` porque no hay propuesta que seleccionar; genera `10.1` en estado `Observado`; exige evidencia reproducible para cada tecnología/relación/patrón/regla Clean Code.
6. **Caso C (AS-IS → TO-BE):** genera o confirma primero el AS-IS (Caso B), supera DR-01, ejecuta el flujo completo del Caso A anclado a esa evidencia, y agrega `23-Analisis-de-Brechas.md` y `24-Roadmap-de-Migracion.md` después de `22`.
7. **Gates y checkpoints transversales:** DR-01 se ejecuta antes de `01`; cuatro checkpoints de auditoría de coherencia (`CP-01 Drivers`, `CP-02 Selección y viabilidad`, `CP-03 Integridad del diseño`, `CP-04 Reconciliación`) se ejecutan en distintos puntos del flujo (ver [guia-auditoria-coherencia-arquitectura.md](../../skills/archi/references/guia-auditoria-coherencia-arquitectura.md)); los gates de gobierno (`07`, `10`-`13`, `25`-`26`) están descritos en [guia-gobierno-validacion.md](../../skills/archi/references/guia-gobierno-validacion.md). Ninguna decisión de selección (`10`) ni de aprobación final (`26`) puede ser autoaprobada por el agente.
8. **Reapertura incremental:** cualquier capacidad, dato, integración, operación, requisito de seguridad o decisión agregada/cambiada después de un checkpoint reabre a `No cumple` el documento dueño y sus dependientes; no puede declararse "fuera de alcance de esta ronda" mientras siga dentro de la arquitectura vigente.

## Salidas / outputs

Todos los artefactos se guardan en `resources/architecture/` (o `resources/architecture/<Proyecto>/` si hay varias iniciativas). La numeración es canónica y refleja el orden real de generación; los artefactos condicionales se omiten sin renumerar los restantes, y `00` se genera al final aunque ordene primero en el explorador.

| Rango | Artefacto(s) | Propósito |
|---|---|---|
| `01` | Línea base | Fuentes, contexto, stack, gobierno, autoridad de aprobación |
| `02`-`04` | Contexto, restricciones, supuestos | Delimitar alcance y vacíos vivos |
| `05`-`07` | Atributos de calidad, funcionalidades significativas, QAW | Identificar y priorizar drivers |
| `08` | Well-Architected | Revisión holística de 6 pilares |
| `09`-`10` | Alternativas y selección | Comparar configuraciones y registrar decisión humana |
| `10.1` | Arquetipo de solución | Arquetipos `ARQ-xxx` y baseline tecnológico vivo |
| `11`-`13` | Tecnologías emergentes, incertidumbres, PoC | Reducir riesgo antes de diseño detallado (condicionales) |
| `14`/`14.00`/`14.xx` | Vistas C4, gobierno de APIs, diseño por contenedor `CT-xx` | Diseñar el sistema y catalogar `API-xxx`/`API-xxx-OP-xxx` |
| `14.xx.N` | Mapeo de integración externa `EXT-xx` | Condicional, cuando hay documentación/Postman/URL real |
| `15` | Secuencias | Flujos críticos y rutas de error |
| `16`/`16.xx`/`16.xx.y` | Modelo de datos | Catálogo `DATA-xxx`, madurez conceptual/lógica/física, esquema físico si aplica |
| `17`/`17.1`-`17.5` | Despliegue, `.drawio` AWS/Azure/GCP, pricing y costos | Condicional, topología y estimaciones |
| `18` | Tácticas y patrones | Catálogo `TP-xxx` |
| `19`/`19.1` | Dimensiones arquitectónicas, Clean Code (`CC-xxx`), amenazas y seguridad (`THR-xxx`/`SEC-xxx`) | `19.1` condicional |
| `20`-`22` | Decisiones (`DA-xxx`), riesgos y deuda, glosario | Consolidación |
| `23`-`24` | Análisis de brechas y roadmap de migración | Solo Caso C |
| `25` | Revisión técnica de arquitectura | Auditoría independiente y dictamen |
| `25.1`/`25.1.1` | Presentación de Comité (HTML) + manifiesto (JSON) | Vistas Ejecutiva/Arquitectura/Completa |
| `26` | Validación y aprobación | Decisión humana explícita |
| `00` | Documento orquestador | Generado al final, tras aprobación; 100-150 líneas |

Este repositorio (OCTO_HR) ya tiene un ejemplo real y completo de esta salida en `resources/architecture/` (de `01` a `26`, incluidos `25.1`/`25.1.1` y varios `14.xx`/`16.xx` por contenedor), generado por ejecuciones previas de esta misma skill.
