# Matriz de enrutamiento y handoffs

Esta matriz describe una ruta operable con los skills y agentes realmente instalados. No existe un router general en `.claude/agents/`: la secuencia es una guía para la sesión llamadora. Solution Baseline tiene su propio orquestador; Archi, Builder, Iris, Sofía, Storming, Takumi y Memoria son agentes directos; y Vulcano dispone de un orquestador limitado a definición y generación local.

## Flujo de referencia

```text
Fuentes / RFP
    │
    ├─ janus ──► requisitos extraídos
    │
    └─ epicureo ──► necesidad refinada
                       │
                       ├─ storming, cuando el dominio lo exige
                       │      └─► modelo, límites, reglas y hotspots
                       │
                       ├─ archi ──► arquitectura aprobada
                       │      ├─► iris, para arquitectura UX
                       │      ├─► solution-baseline, para aplicaciones
                       │      └─► vulcano, para DevOps/IaC/observabilidad
                       │
                       └─ specter ──► backlog Jira

solution-baseline ──► builder ──► code-review ──► ranger durante el desarrollo posterior
sofia ──► deriva al especialista cuando el usuario no sabe por dónde empezar
vulcano-orchestrator ──► vulcano ──► vulcano-bob ──► handoff humano ──► vulcano-operador
```

No todos los proyectos comienzan con una RFP ni requieren todos los pasos. Los gates de entrada, no una cadena rígida, determinan qué capacidades aplicar.

## Matriz principal

| Intención | Skill canónica | Agente coordinador disponible | Precondición mínima | Handoff principal |
|---|---|---|---|---|
| Orientarse o resolver una duda general | `sofia` (carpeta `executive-routing`) | `sofia` | Ninguna | La skill o el agente dueño del dominio, en voz alta |
| Mantener o consultar la memoria del proyecto | `memoria` | `memoria` | `.memoria/` inicializado o poder crearlo | Grafo de conocimiento actualizado; deriva a `epicureo`/`specter`/`archi`/`builder` solo si se trabaja sobre lo recordado |
| Extraer requisitos de RFP | `janus` | Sin agente dedicado; invocación directa | Documento fuente accesible | `epicureo`, `archi`, `iris` o `takumi` según contenido |
| Reducir ambigüedad de una necesidad | `epicureo` | Sin agente dedicado | Necesidad o requisitos de entrada | `storming`, `archi`, `specter` o `effort-estimator` |
| Modelar dominio complejo | `storming` | `storming` | Propósito, alcance, fuentes y participantes conocidos | `archi`, `specter`, `iris` o `ranger` |
| Diseñar arquitectura de sistema | `archi` | `archi` | Gate DR-01 satisfecho mediante EventStorming, paquete equivalente o excepción justificada | `solution-baseline`, `iris` y/o `vulcano` |
| Diseñar arquitectura UX y entregar el sistema de diseño | `iris` | `iris` | Requisitos, procesos, dominio, APIs o evidencia de UI; para el sistema de diseño, evidencia de marca del proyecto | `solution-baseline` (tokens, catálogo y assets congelados) y `builder` |
| Diseñar o revisar datos, persistencia o migraciones | `dba` | Sin agente dedicado | Modelo, requerimiento de datos o consulta a revisar | Modelo/migración revisado o plan de tuning; informa a `archi` si cambia el modelo TO-BE |
| Desglosar épica en Jira | `specter` | Sin agente dedicado; Jira por MCP opcional, Markdown siempre disponible | Épica accesible y suficientemente refinada | HU/TT con contrato y Quality Gate (READY/NEEDS_REFINEMENT/BLOCKED); `builder`, `ranger`, `effort-estimator` |
| Estimar esfuerzo/costo | `effort-estimator` | Sin agente dedicado | Épica refinada o backlog | Propuesta y planificación |
| Materializar aplicaciones | `solution-baseline` | `solution-baseline-orchestrator` y su célula | Arquitectura aprobada, decisiones materiales cerradas y repositorios identificados | Desarrollo y requisitos para Vulcano |
| Implementar funcionalidad, bug, refactor o integración | `builder` | `builder` | Intención o spec suficiente y repositorio inspeccionado; rigor proporcional al riesgo | Cambio verificado; `code-review` como revisor independiente (recomendado en rigor estándar, obligatorio en reforzado); `ranger` cuando se requiera QA especializado |
| Revisar un cambio antes de cerrarlo o fusionarlo | `code-review` | Sin agente dedicado; Builder la invoca en modo `gate` | Diff accesible y spec o criterios del cambio | Reporte con veredicto; Builder corrige los hallazgos aceptados |
| Revisar o asesorar la seguridad de un cambio, IaC, pipeline o componente de IA | `aegis` | Sin agente dedicado; Builder la pide en modo `gate` y code-review escala a ella | Código, configuración o artefactos que el usuario posee o está autorizado a revisar | Reporte con veredicto de seguridad; Builder corrige (`fix`); amenazas nuevas a `archi` como propuesta para `19.1` |
| Definir o ejecutar calidad | `ranger` | Sin agente dedicado | Riesgos, criterios o código ejecutable | Gates de entrega |
| Diseñar plan o runbook de pruebas | `qa-ranger-plan-pruebas` | Sesión actual o instancia permitida por el host | Requisitos verificables y documentos solicitados | Plan, runbook o ambos; nunca ejecución inventada |
| Suite Playwright | `qa-ranger-playwright` | Sesión actual o instancia permitida por el host | Herramienta solicitada/seleccionada, app o API, datos y evidencia resuelta | Diseño, implementación, revisión o ejecución según el encargo |
| Suite Karate | `qa-ranger-karate` | Sesión actual o instancia permitida por el host | Línea v1/v2, contrato API, entorno y evidencia resuelta | Trabajo Karate con identidad propia |
| Suite Selenium | `qa-ranger-selenium` | Sesión actual o instancia permitida por el host | Lenguaje (Java o Python), DOM real, entorno autorizado y evidencia resuelta | Diseño, implementación, revisión o ejecución según el encargo |
| Suite Robot Framework | `qa-ranger-robotframework` | Sesión actual o instancia permitida por el host | Base de datos, API o web objetivo, variables del entorno y evidencia resuelta | Suites `.robot` y resultados con evidencia; stage *Acceptance Test* del release |
| Carga y rendimiento con JMeter | `qa-ranger-jmeter` | Sesión actual o instancia permitida por el host | Ambiente autorizado, carga objetivo y SLA acordados | Plan `.jmx`, resultados JTL y gate de SLA |
| Unitarias y cobertura | `qa-ranger-unitarias` | Sesión actual o instancia permitida por el host | Unidad, requisitos, runner del stack y evidencia resuelta | Pruebas y cobertura verificadas, o diagnóstico con pendientes |
| Presentar resultados o una propuesta | `cronos` | Sin agente dedicado | Contenido o resultados a presentar | Presentación HTML; PPTX o PDF bajo pedido |
| Trabajar con un vault de Obsidian o ver la memoria como grafo | `obsidian` | Sin agente dedicado | Vault de Obsidian o `.memoria/graph.json` | Vault con notas y `Memoria.canvas`; MCP de Obsidian configurado. Se apoya en `memoria` y, si está disponible, en `graphify` |
| Leer, crear o editar documentos de oficina | `docx`/`pdf`/`pptx`/`xlsx` | Sin agente dedicado; soporte para otras skills | Archivo existente o contenido | El archivo en su formato |
| Documentar procesos de negocio | `takumi` | `takumi` | Fuentes o entrevistas | Mejora de procesos, `epicureo`, `storming` o automatización posterior |
| Generar, revisar o migrar IaC con Terragrunt y sus pipelines | `terragrunt-iac` | Sin agente dedicado | Necesidad de infraestructura, arquitectura aprobada o repositorio Terragrunt existente | `code-review` para la revisión y `aegis` (`iac`/`pipeline`) para la seguridad |
| Diseñar DevOps/IaC/observabilidad | `vulcano` | `vulcano` o `vulcano-orchestrator` para flujo completo | Arquitectura y evidencia real del repositorio | `vulcano-bob` |
| Generar IaC/CI/CD local | `vulcano-bob` | `vulcano-bob` o `vulcano-orchestrator` | Manifiesto Vulcano completo y consistente | `vulcano-operador` |
| Operar plataformas remotas | `vulcano-operador` | `vulcano-operador`, solo invocación humana | Cierre estricto de Bob, capacidades reales y autorización por acción | Verificación y evidencia operacional |

## Gate de dominio para Archi

`archi` no debe producir arquitectura de detalle sin resolver DR-01. La forma preferida para dominios complejos es `storming`. También puede aceptar un paquete equivalente que cubra actores, eventos, reglas, estados, excepciones, lenguaje y límites, o una excepción explícita para un cambio acotado y de bajo impacto.

Si faltan esos insumos, `archi` devuelve el control al levantamiento de dominio. Si existen hotspots, puede continuar solo en áreas no afectadas y debe conservar las decisiones bloqueadas como pendientes.

## Responsabilidad de Builder

`builder` implementa cambios de aplicación con SDD incremental: descubre el estado
real, especifica comportamiento y aceptación, diseña el cambio local, implementa y
registra evidencia. Acepta issues, archivos o texto; no exige Jira ni una estructura
documental fija. Reutiliza contratos y decisiones existentes y no obliga a recorrer
todos los skills para cada tarea.

Puede usarse mediante el agente de entrada directa
[`builder.agent.md`](../agents/builder.agent.md) o invocando el skill. Ambas entradas
aplican el mismo `SKILL.md`; el agente no constituye una segunda implementación.

La validación del cambio pertenece a Builder aunque exista Ranger. Devuelve las
decisiones arquitectónicas materiales a su responsable y respeta el ownership de
Solution Baseline. La ejecución es secuencial salvo independencia real y delegación
disponible/autorizada; SDD no incorpora un router global ni habilita despliegues.

## Responsabilidad de Solution Baseline

`solution-baseline` comienza después de la arquitectura aprobada. Puede buscar y reutilizar arquetipos, crear un arquetipo reutilizable cuando exista una brecha generalizable o usar una estrategia específica del proyecto. No redefine arquitectura ni absorbe backlog, DevOps, IaC o despliegue.

En multi-repositorio, el agente `solution-baseline-orchestrator` construye un DAG. `architecture-mapper` descubre en solo lectura; `repository-baseline-worker` escribe una unidad con lease; `archetype-curator` trabaja el catálogo separado; `baseline-validator` valida independientemente. La concurrencia se limita a nodos sin ownership compartido y a los límites declarados por el manifest.

## Frontera Vulcano

| Componente | Decide | Escribe localmente | Ejecuta remoto |
|---|---:|---:|---:|
| `vulcano-orchestrator` | No | No directamente | No |
| `vulcano` | Sí | Solo documentación | No |
| `vulcano-bob` | No redecide | Sí, IaC y CI/CD | No por defecto |
| `vulcano-operador` | No redecide | Evidencia/manifiesto operacional | Sí, con autorización y allowlist |

## Responsabilidad de Vulcano Orchestrator

`vulcano-orchestrator` deriva el estado desde los manifiestos existentes, invoca `vulcano` cuando la
definición no está cerrada y habilita `vulcano-bob` solo después del validador de completitud. No crea
un manifiesto adicional, no edita artefactos directamente y no toma decisiones de las fases.

Cuando Bob alcanza cierre estricto, el orquestador termina la entrega local. Si se solicitó operación
remota, presenta el handoff para que el usuario inicie `vulcano-operador`; nunca lo invoca, autoriza ni
opera en su nombre.

## Takumi frente a Storming

`takumi` caracteriza y mejora procesos organizacionales, procedimientos, actas, políticas y documentación ISO/BPM. `storming` descubre comportamiento de dominio para software mediante eventos, comandos, políticas, agregados y bounded contexts. Pueden encadenarse, pero ninguno sustituye al otro.

## Estado de enrutabilidad

La secuencia anterior es válida por los contratos de las skills, pero no está automatizada globalmente. Use el agente dedicado cuando exista y valide cada handoff antes de avanzar. Archi, Storming y Takumi informan la transición y devuelven el control al usuario. `vulcano-orchestrator` es la única excepción en esa cadena: puede invocar Vulcano y Bob, pero se detiene antes del operador. Para baselines, delegue en `solution-baseline-orchestrator`; ese agente no debe seleccionar ni gobernar capacidades ajenas a su dominio.

El router general anterior está eliminado del working tree. Su historia y las condiciones para retirarlo o reconstruirlo están en [Orquestador general retirado](./orquestador-retirado.md).
