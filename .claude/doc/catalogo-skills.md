# Catálogo reconciliado de skills

Inventario de los 30 directorios presentes en `.claude/skills/`, contrastado con el `name` y la responsabilidad declarados en cada `SKILL.md` el 27 de octubre de 2026. No existe un router general instalado: “invocación directa” significa seleccionar la skill por su nombre canónico y ejecutar su propio contrato. Cuando la tabla menciona un agente homónimo, este funciona como una entrada especializada a esa misma skill.

Para la entrada, la salida y un ejemplo de invocación de cada skill, consulte el [README del proyecto](../../README.md#5-catálogo-de-skills).

## Descubrimiento, producto y dominio

| Directorio | Nombre canónico | Responsabilidad | Modo de uso vigente |
|---|---|---|---|
| [`janus`](../skills/janus/SKILL.md) | `janus` | Extraer requisitos y contexto desde RFP y documentos de entrada | Invocación directa |
| [`epicureo`](../skills/epicureo/SKILL.md) | `epicureo` | Refinar necesidades hasta un índice de ambigüedad aceptable | Invocación directa; Jira opcional por MCP |
| [`storming`](../skills/storming/SKILL.md) | `storming` | Descubrir y validar dominio con Big Picture, Process Modelling y Software Design de EventStorming | Agente `storming` o invocación directa |
| [`specter`](../skills/specter/SKILL.md) | `specter` | Desglosar una épica en historias y tareas técnicas trazables, con contrato formal HU/TT y Quality Gate determinista | Invocación directa; Jira por MCP o Markdown; valida con `scripts/quality_gate.mjs` |
| [`cupido`](../skills/cupido/SKILL.md) | `effort-estimator` | Estimar esfuerzo, cronograma y costo, incluida la comparación con aceleración por IA | Invocación directa; la carpeta y el nombre canónico difieren |
| [`takumi`](../skills/takumi/SKILL.md) | `takumi` | Levantar, documentar y mejorar procesos de negocio | Agente `takumi` o invocación directa |

## Arquitectura, experiencia y materialización

| Directorio | Nombre canónico | Responsabilidad | Modo de uso vigente |
|---|---|---|---|
| [`archi`](../skills/archi/SKILL.md) | `archi` | Diseñar, auditar y evolucionar arquitectura de sistema; exige el gate DR-01 antes de arquitectura de detalle | Agente `archi` o invocación directa |
| [`iris`](../skills/iris/SKILL.md) | `iris` | Crear arquitectura de UX, flujos, pantallas, wireframes y trazabilidad, y entregar el sistema de diseño del proyecto listo para construir | Agente `iris` o invocación directa |
| [`solution-baseline`](../skills/solution-baseline/SKILL.md) | `solution-baseline` | Materializar arquitectura aprobada en baselines reproducibles (`create`, `reconcile`, `upgrade`, `archetype-create`) y coordinar multi-repositorio | Invocación directa o célula de cinco agentes especializados |

## Construcción y revisión

| Directorio | Nombre canónico | Responsabilidad | Modo de uso vigente |
|---|---|---|---|
| [`builder`](../skills/builder/SKILL.md) | `builder` | Implementar, explorar, planificar y reanudar cambios de aplicación mediante SDD incremental y evidencia; perfiles para Go, Angular, Java/Spring y el Scaffold de Bancolombia | Agente `builder` o invocación directa; paquete instalable con `install_builder.py` |
| [`code-review`](../skills/code-review/SKILL.md) | `code-review` | Revisar cambios con evidencia (cumplimiento de AC, corrección, arquitectura, seguridad, rendimiento, pruebas) y emitir un veredicto; quality gate de SonarQube opcional | Invocación directa; Builder la usa como revisor independiente |
| [`aegis`](../skills/aegis/SKILL.md) | `aegis` | Seguridad de aplicaciones defensiva: controles antes de implementar, auditoría y verificación de hallazgos en código, IaC, pipelines, contenedores, dependencias e IA, y playbooks de incidentes | Invocación directa; gate de seguridad para cambios reforzados de Builder y escalamiento desde code-review |

Builder y code-review ofrecen al iniciar, de forma opcional, conectar un tablero de Jira o Azure DevOps por MCP para leer el work item y actualizarlo al cerrar.

## Calidad (familia Ranger)

| Directorio | Nombre canónico | Responsabilidad | Modo de uso vigente |
|---|---|---|---|
| [`ranger`](../skills/ranger/SKILL.md) | `ranger` | Estrategia de calidad, selección de herramienta, coordinación de especialistas, ejecución de runbooks, evidencia y veredicto | Invocación directa |
| [`qa-ranger-plan-pruebas`](../skills/qa-ranger-plan-pruebas/SKILL.md) | `qa-ranger-plan-pruebas` | Diseñar el plan y runbook con trazabilidad entre requisitos, casos y exclusiones | Desde Ranger o invocación directa |
| [`qa-ranger-playwright`](../skills/qa-ranger-playwright/SKILL.md) | `qa-ranger-playwright` | Crear, revisar y depurar suites E2E y de API con Playwright | Desde Ranger o invocación directa |
| [`qa-ranger-karate`](../skills/qa-ranger-karate/SKILL.md) | `qa-ranger-karate` | Automatizar pruebas de API y aceptación con Karate (v1 y v2) | Desde Ranger o invocación directa |
| [`qa-ranger-selenium`](../skills/qa-ranger-selenium/SKILL.md) | `qa-ranger-selenium` | Suites Selenium WebDriver 4 en Java (JUnit 5/TestNG) o Python (pytest) | Desde Ranger o invocación directa |
| [`qa-ranger-robotframework`](../skills/qa-ranger-robotframework/SKILL.md) | `qa-ranger-robotframework` | Suites Robot Framework 7 de base de datos, API y web, incluido el stage *Acceptance Test* de releases en Azure DevOps | Desde Ranger o invocación directa |
| [`qa-ranger-jmeter`](../skills/qa-ranger-jmeter/SKILL.md) | `qa-ranger-jmeter` | Pruebas de carga con JMeter y JMeter DSL, análisis JTL y gates de SLA | Desde Ranger o invocación directa |
| [`qa-ranger-unitarias`](../skills/qa-ranger-unitarias/SKILL.md) | `qa-ranger-unitarias` | Diseñar, implementar, revisar y diagnosticar unitarias con cobertura del runner del stack | Desde Ranger o invocación directa |

Las ocho skills QA están registradas en el contrato de salida común (`.claude/contracts/output/validators.json`). Ver [Ranger y especialistas QA](./ranger/README.md).

## DevOps, IaC y operación

| Directorio | Nombre canónico | Responsabilidad | Modo de uso vigente |
|---|---|---|---|
| [`vulcano`](../skills/vulcano/SKILL.md) | `vulcano` | Diseñar y documentar DevSecOps, IaC y observabilidad; no ejecutar | Agente `vulcano`, `vulcano-orchestrator` o invocación directa |
| [`vulcano-bob`](../skills/vulcano-bob/SKILL.md) | `vulcano-bob` | Materializar y validar localmente IaC y CI/CD ya definidos por Vulcano | Agente `vulcano-bob`, `vulcano-orchestrator` o invocación directa tras el cierre de Vulcano |
| [`vulcano-operador`](../skills/vulcano-operador/SKILL.md) | `vulcano-operador` | Reconciliar y operar planos remotos con autorización por acción | Agente de invocación humana o skill directa tras el cierre estricto de Bob |
| [`terragrunt-iac`](../skills/terragrunt-iac/SKILL.md) | `terragrunt-iac` | Diseñar, generar, revisar, migrar y automatizar IaC con Terragrunt 1.x sobre OpenTofu/Terraform y sus pipelines | Invocación directa; code-review la revisa y aegis audita su seguridad |

`solution-baseline` excluye explícitamente DevOps, IaC y despliegue. Esas responsabilidades pertenecen a la secuencia Vulcano → Vulcano Bob → Vulcano Operador.
`vulcano-orchestrator` coordina las dos primeras skills, pero no es una cuarta skill y nunca invoca al operador.

## Transversales

| Directorio | Nombre canónico | Responsabilidad | Modo de uso vigente |
|---|---|---|---|
| [`executive-routing`](../skills/executive-routing/SKILL.md) | `sofia` | Acompañamiento ejecutivo: resolver dudas y documentos de apoyo, y derivar al especialista cuando el encargo es de un dominio | Agente `sofia` o invocación directa; la carpeta y el nombre canónico difieren |
| [`cronos`](../skills/cronos/SKILL.md) | `cronos` | Presentaciones HTML con marca PersonalSoft o en modo libre, con exportación a PPTX o PDF | Invocación directa |
| [`docx`](../skills/docx/SKILL.md) | `docx` | Crear, leer y editar documentos Word | Invocación directa |
| [`pdf`](../skills/pdf/SKILL.md) | `pdf` | Leer, crear, transformar y validar PDF | Invocación directa |
| [`pptx`](../skills/pptx/SKILL.md) | `pptx` | Crear, leer y editar presentaciones PowerPoint | Invocación directa |
| [`xlsx`](../skills/xlsx/SKILL.md) | `xlsx` | Crear, leer y editar hojas de cálculo | Invocación directa |

## Skills retiradas

Estas skills existieron en versiones anteriores del kit y ya no están en `.claude/skills/`. No las invoque ni enlace como instaladas.

| Skill | Situación |
|---|---|
| `genesis` | Alias de compatibilidad retirado en el commit `93e9800`. El bootstrap greenfield se hace con `solution-baseline` en modo `create`. |
| `az-func-openapi`, `frontend-design`, `file-organization-standards`, `ts-ecmascript-standards`, `commit-es`, `create-agentsmd` | Retiradas del kit. |
| `bancolombia-brand-manual` | Salió del repositorio el 14 de septiembre de 2026; su copia vive en el proyecto que la usa. La identidad visual de cada proyecto es un artefacto del propio proyecto (`resources/design/ux/<proyecto>/03-design-system/`). |

## Cobertura documental detallada

| Área | Documentación |
|---|---|
| Arquitectura | [Archi](./archi/README.md) |
| Implementación de aplicaciones | [Builder](./builder/README.md) y la [guía rápida](../skills/builder/README.md) |
| Revisión de código | [Guía de code-review](../skills/code-review/README.md) |
| Seguridad de aplicaciones | [Guía de Aegis](../skills/aegis/README.md) |
| Calidad | [Ranger y especialistas QA](./ranger/README.md) y la [guía rápida](../skills/ranger/README.md) |
| Arquitectura UX | [Iris](./iris/README.md) |
| Baseline y arquetipos | [Solution Baseline](./solution-baseline/README.md) |
| Modelado de dominio | [Storming](./storming/README.md) |
| Procesos de negocio | [Takumi](./takumi/README.md) |
| DevOps/IaC/operación | [Vulcano](./vulcano/README.md) |

## Validación estructural

Comprobación del 27 de octubre de 2026 con `node test/validate-skill-catalog.mjs`: las 28 skills de entonces tienen frontmatter YAML válido y declaran `metadata.capability` y `metadata.capability-summary` dentro de los límites del catálogo. `aegis`, agregada el 2 de noviembre de 2026, pasa la misma validación, y también `terragrunt-iac`, agregada el mismo día (30/30).

Ese validador no revisa claves de primer nivel. `cupido`/`effort-estimator` y `epicureo` siguen
declarando la clave top-level `compatibility`, que el validador de `skill-creator` no admite (solo
permite `allowed-tools`, `description`, `license`, `metadata` y `name`). Es una deuda de
empaquetado preexistente: no invalida su lógica funcional, pero impide declararlas conformes con
ese contrato. La corrección debe preservar la restricción de integración en el cuerpo o en
`metadata`. (`specter` ya la resolvió en su evolución 2.0: la restricción de MCP de Jira se movió
al cuerpo del `SKILL.md`.)

## Reglas de identidad

- Invoque una skill por el `name` declarado en su frontmatter, no necesariamente por el nombre de la carpeta.
- Use `$storming` como identificador técnico; “Event Storming” o “EventStorming” nombran la técnica.
- Trate `cupido` como ruta física; el identificador publicado es `$effort-estimator`.
- Trate `executive-routing` como ruta física; el identificador publicado es `$sofia`.
- Use `$solution-baseline` para el bootstrap greenfield; `genesis` ya no existe.
- Solo `solution-baseline` declara una célula de agentes especializada. Builder tiene un agente de entrada directa, no una célula ni un orquestador.
