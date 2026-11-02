# Contratos y artefactos

## Los tres manifiestos

### `resources/.vulcano/manifest.yaml` (Vulcano)

Controla el estado de la sesión y conserva decisiones que no pueden deducirse con
seguridad del código: línea base, restricciones, decisiones de nube/IaC/CI-CD/
observabilidad, estado y metadata de cada documento, supuestos, pendientes `PD-NNN`,
omisiones y última validación. Permite pausar, reanudar y entregar un contrato estable a
Bob. Nunca almacena secretos. Las decisiones persistidas se listan en
[Guía de uso — Parámetros de sesión](./02-guia-de-uso.md#parámetros-de-sesión).

### `resources/.vulcano/bob-manifest.yaml` (Vulcano-Bob)

Contrato schema v4: snapshot de Vulcano, adaptadores, perfil Terraform, preflight,
capacidades, artefactos, grafo, interfaces, hashes, evidencia, `OP-NNN` y resultado del
cierre.

Prácticas y garantías que sostiene este manifiesto:

| Área | Capacidades |
|---|---|
| Contratos | Grafo acíclico, interfaces explícitas, rutas únicas y dependencias verificables. |
| Trazabilidad | Hashes SHA-256 de fuentes, snapshot de decisiones y evidencia de validación. |
| Terraform | Roots independientes, providers/versiones por root, pruebas plan/mock, módulos, moved/import declarativo y protección de secretos. |
| Pipelines | Build once/promote, plan guardado, approvals externos, drift sin apply, progressive delivery, rollback, DORA y notificaciones. |
| Seguridad | Lint, escaneo IaC, secret scanning, policy as code y ausencia de credenciales persistidas. |
| Estado | Manifest schema v4, JSON Schema, migración v3 y reconciliación determinista. |
| Extensibilidad | Registro de adaptadores por dimensión, assets y renderers independientes (ver [Extensión y gobierno](./06-extension-y-gobierno.md)). |

### `resources/.vulcano/operations-manifest.yaml` (Vulcano-Operador)

Contrato schema v2 con hash de Bob, commit opcional, adaptadores, gate, modo, target,
capacidades MCP, reconciliación, acciones, autorizaciones, ejecución, verificación y
validación.

| Registro | Estado o fase | Qué demuestra |
|---|---|---|
| `source` | Inicio | Ruta y SHA-256 exacto de Bob, más commit Git opcional sobre el que se opera. |
| `operator_selection` | Resolución | Plataforma/cloud implementados que gobiernan allowlist y capacidades MCP. |
| `gate` | Preflight | Si el operador está `pending`, `ready` o `blocked`, con bloqueos explícitos. |
| `target` | Inicialización | Organización, proyecto cuando aplica, repositorio y rama autorizables. |
| `capabilities` | Reconcile | Disponibilidad `unknown/available/missing` de MCP de plataforma y cloud. |
| `reconciliation` | Reconcile | Herramienta, fecha y hash del snapshot observado. |
| Acción `proposed` | Plan | Tipo, riesgo, logical ID, target, ambiente, hashes, diff y `scope_hash`. |
| Acción `authorized` | Authorize | Quién, cuándo, expiración, hash de confirmación y alcance exacto autorizado. |
| Acción `running` | Operate | Evidencia de que los gates fueron revalidados inmediatamente antes de la llamada MCP. |
| Acción `succeeded` / `failed` | Operate | Resultado de la mutación con hashes sanitizados e ID externo, si existe. |
| Acción `verified` | Verify | Lectura posterior exitosa con el mismo `scope_hash`; es el único cierre positivo completo. |
| Acción `cancelled` | Control | Autorización o ejecución cancelada por expiración, drift, cambio de alcance u otra condición segura. |
| `validation` | Cierre | Timestamp, cantidad de errores y warnings de la validación estricta. |

## Contratos que conectan los componentes

| Desde | Hacia | Contrato | Gate de transferencia |
|---|---|---|---|
| Vulcano | Vulcano-Bob | `resources/.vulcano/manifest.yaml` + documentos técnicos | Diseño consistente, decisiones suficientes y validación documental. |
| Vulcano-Bob | Vulcano-Operador | `resources/.vulcano/bob-manifest.yaml` + artefactos locales | Cierre estricto, hashes y adaptadores implementados. |
| Vulcano-Operador | Auditoría/owner | `resources/.vulcano/operations-manifest.yaml` | Acción autorizada, evidencia sanitizada y verificación posterior. |
| Vulcano-Bob | Vulcano | `conflict` con fuentes y artefactos afectados | Decisión o contrato debe corregirse antes de generar. |
| Vulcano-Operador | Vulcano-Bob/Vulcano | Diff, fallo o bloqueo clasificado | Se devuelve al componente propietario del problema. |

## Catálogo de documentos que produce Vulcano

Vulcano produce hasta 26 documentos principales, dos documentos de cierre y el
manifiesto de estado. Todos viven bajo `{resources_root}`. Los documentos pueden quedar
como `generated`, `existing`, `pending` u `omitted`; una omisión siempre necesita
justificación.

### Documentos DevOps

| # | Output | Propósito | Contenido y relaciones principales |
|---:|---|---|---|
| 1 | `devops-strategy/01-devops-overview.md` | Establecer la visión operativa general. | Objetivos, principios, responsabilidades, colaboración entre desarrollo, QA, plataforma y seguridad, y criterios de selección. |
| 2 | `devops-strategy/02-repository-management.md` | Definir cómo se organizan y gobiernan los repositorios. | Topología mono/multirepo, ownership, permisos, revisores, políticas de PR, documentación, trazabilidad y ciclo de vida. |
| 3 | `devops-strategy/03-task-management.md` | Documentar el sistema de gestión del trabajo. | Tablero, tipos de ítem, estados, campos, prioridades, owners, Definition of Ready/Done y trazabilidad con commits, ramas, PR y releases. |
| 4 | `devops-strategy/04-branching-strategy.md` | Definir el flujo de cambios en Git. | Modelo y nomenclatura de ramas, vida útil, merges, protección, revisión, hotfixes y eliminación. |
| 5 | `devops-strategy/05-environments.md` | Definir los ambientes desde el ciclo de entrega. | Nombre, propósito, usuarios, datos, similitud con producción, promoción, aprobaciones y escala. Contrato funcional para `infrastructure-as-code/02-environments.md`. |
| 6 | `devops-strategy/06-ci-cd.md` | Especificar integración, delivery y deployment. | Topología/rutas de pipelines, triggers, stages, artefactos, gates, inspección continua, deuda, seguridad, promociones, aprobaciones, despliegue, rollback y notificaciones. Origina `devops_platform`, `pipeline_topology`, `deployment_strategy` y `deployment_model`. |
| 7 | `devops-strategy/07-continuous-testing.md` | Definir qué se prueba, dónde y cuándo. | Pruebas unitarias, integración, contrato, E2E, rendimiento y seguridad; cobertura, datos, ambientes, flaky tests, owners y gates. |
| 8 | `devops-strategy/08-security.md` | Consolidar DevSecOps y AppSec. | Amenazas, controles, secret scanning, SAST, SCA, DAST/IAST, permisos, identidad efímera, supply chain, vulnerabilidades, excepciones y cumplimiento. |
| 9 | `devops-strategy/09-release-management.md` | Gobernar el versionado y liberación por componente. | SemVer u otra convención, cadencia, changelog, artefactos inmutables, promoción, compatibilidad, approvals, rollback/roll-forward, feature flags y comunicaciones. |
| 10 | `devops-strategy/10-incident-management.md` | Establecer el modelo de respuesta a incidentes. | Severidades, declaración/cierre, SLA, roles, escalamiento, canales, status page, timeline, handoff y postmortem. |
| 11 | `devops-strategy/11-disaster-recovery.md` | Definir la recuperación ante desastres. | Escenarios, impacto, RTO/RPO, backups, retención, cifrado, inmutabilidad, restore, failover, owners y comunicaciones; incluye tabletop y restore tests. |

### Documentos de infraestructura como código

| # | Output | Propósito | Contenido y relaciones principales |
|---:|---|---|---|
| 1 | `infrastructure-as-code/01-architecture.md` | Fijar la estrategia IaC. | Herramienta, alcance, límites manual/declarativo, estructura, gobierno, policy as code, seguridad, costos y lifecycle. Origina `decisions.iac` y `decisions.policy_engine`. |
| 2 | `infrastructure-as-code/02-environments.md` | Traducir los ambientes a aislamiento técnico. | Cuentas/subscriptions/proyectos, roots/stacks/workspaces, variables, state, identidades, conectividad y capacidad. |
| 3 | `infrastructure-as-code/03-naming-conventions.md` | Uniformar nombres y metadata. | Patrones para recursos, módulos, archivos y estados; abreviaturas, ambiente, región, aplicación, restricciones del proveedor y tags/labels. |
| 4 | `infrastructure-as-code/04-<herramienta>-structure.md` | Detallar la estructura de la herramienta IaC seleccionada. | Carpetas, roots/stacks, módulos, archivos, versiones, providers, dependencias, pruebas, registry y adopción; por ejemplo `04-terraform-structure.md`. |
| 5 | `infrastructure-as-code/05-state-management.md` | Gobernar el estado de infraestructura. | Separación por ambiente, backend, naming, locking, cifrado, permisos, backup, restore, break-glass, retención, drift y autorización de plan/apply. |
| 6 | `infrastructure-as-code/06-modules.md` | Definir catálogo y contratos de módulos. | Responsabilidad, inputs, outputs, dependencias, composición, versionado, pruebas, compatibilidad, deprecación y ownership. |
| 7 | `infrastructure-as-code/07-networking.md` | Documentar topología, límites y flujos de red. | CIDR, VNet/VPC, subnets, rutas, NSG/firewalls, ingress/egress, peering, endpoints privados, DNS, confianza y conectividad externa. |
| 8 | `infrastructure-as-code/08-secrets-management.md` | Gobernar secretos y configuración sensible. | Inventario/clasificación, gestor, identidad, creación, inyección, rotación, expiración, auditoría, recuperación, desarrollo local y pipelines. Origina `secrets_manager`. |

### Documentos de observabilidad

| # | Output | Propósito | Contenido y relaciones principales |
|---:|---|---|---|
| 1 | `observability/01-monitoring.md` | Definir la estrategia general de monitoreo. | Catálogo de servicios/owners, señales técnicas y de negocio, RED/USE, sintéticos/RUM y salud de telemetría. Incluye las cinco métricas DORA por servicio. |
| 2 | `observability/02-logging.md` | Estandarizar logs útiles y seguros. | Esquema, niveles, eventos, correlation ID, redacción de PII/secretos, cardinalidad, transporte, retención, costo, acceso y consultas operativas. |
| 3 | `observability/03-tracing.md` | Diseñar la trazabilidad distribuida. | Instrumentación, W3C Trace Context, spans, atributos, sampling, baggage, correlación y controles de privacidad/costo. Puede omitirse justificadamente en un monolito sin llamadas distribuidas relevantes. |
| 4 | `observability/04-slis-slos.md` | Convertir confiabilidad en objetivos medibles. | Flujo/servicio, fórmula, fuente, ventana, target, exclusiones, error budget y política de consumo. |
| 5 | `observability/05-dashboards.md` | Diseñar tableros accionables. | Audiencia, preguntas, paneles, fuentes, filtros, variables, ownership y enlaces a SLO/runbooks. |
| 6 | `observability/06-alerting.md` | Definir alertas accionables y comprobables. | ID, señal, condición, umbral, ventana, severidad, owner, canal, deduplicación, acción y prueba; toda alerta alta/crítica requiere runbook. |
| 7 | `observability/07-runbooks.md` | Documentar procedimientos de respuesta. | Trigger, prerrequisitos, diagnóstico, mitigación, recuperación, validación, rollback, escalamiento, comunicación y postmortem. |

### Documentos de cierre

| Output | Propósito | Contenido y relaciones principales |
|---|---|---|
| `01-devops-index.md` | Servir como puerta de entrada a la documentación Vulcano. | Agrupa por pilar los documentos `generated` o `existing`, los enlaza y resume. |
| `02-madurez-devsecops.md` | Separar completitud documental de madurez operativa. | Estándar/framework, archivos generados/pendientes/omitidos, madurez por pilar con evidencia, decisiones `PD-NNN` y roadmap de 3–5 acciones. No es una certificación. |

**Garantías de estos outputs:** Markdown en español, técnico y sin contenido de
relleno; prefijos numéricos estables por carpeta; frontmatter, fuentes, modo, owner,
resumen y validación coherentes con el manifiesto; sin placeholders no aceptados,
secretos ni decisiones inventadas; contratos cruzados consistentes (ambientes,
seguridad/secretos, alertas/runbooks, SLO/RNF y CI-CD/testing/releases); cierre estricto
con cero errores, con warnings aceptados siempre justificados. Vulcano no produce
Terraform, YAML de pipelines ni cambios remotos como parte de estos outputs.

## Artefactos que genera Vulcano-Bob

Las rutas dependen del adaptador y del contrato del proyecto. Los logical ID describen
los tipos; los módulos y pipelines por componente pueden expandirse a varias rutas
físicas.

### Estado y cierre

| Output | Condición | Propósito y contenido |
|---|---|---|
| `resources/.vulcano/bob-manifest.yaml` | Siempre | Ver [Los tres manifiestos](#los-tres-manifiestos). |
| `resources/03-iac-pipelines-index.md` | Cierre | Índice determinista por categoría con logical ID, estado, ruta, fuentes y última validación; resume generados, pendientes, conflictos y omitidos. |

### Infraestructura y ambientes

| Logical ID / output | Condición | Propósito y contenido |
|---|---|---|
| `bootstrap-backend` → `infra/bootstrap/create-backend.sh` | Terraform con backend cloud | Script idempotente que crea/configura el almacenamiento remoto de state, locking, cifrado y contenedores/prefijos requeridos sin ejecutar Terraform apply. Sus parámetros cambian para Azure, AWS o GCP. |
| `module-<nombre>` → ruta declarada en `06-modules.md` | Por cada módulo aprobado | Implementación Terraform del contrato: resources, variables, outputs, versiones y `tests/*.tftest.hcl` con `command = plan` y providers mockeados. |
| `env-dev` → `infra/environments/dev/` | Ambiente definido | Root module independiente de desarrollo con backend, providers, versiones, lockfile, composición de módulos y variables del ambiente. |
| `env-qa` → `infra/environments/qa/` | Ambiente definido | Root module independiente de QA, aislado de dev/prod y con su propia configuración de state y capacidad. |
| `env-prod` → `infra/environments/prod/` | Ambiente definido | Root module independiente de producción, con constraints, protección y configuración acordes al contrato aprobado. |
| `secrets-bindings` → ruta del adaptador cloud | `secrets_manager != none` | Enlaces declarativos entre identidades/servicios y referencias del gestor de secretos. Solo usa URI/referencia; nunca el valor secreto. |

### Pipelines

| Logical ID / output | Condición | Propósito y contenido |
|---|---|---|
| `pipeline-iac` | Siempre que IaC se automatice | Pipeline de fmt/validate/test/lint/security/plan/policy/approval/apply por ambiente. Publica y aplica el mismo plan guardado; la ruta depende de Azure DevOps, GitHub o GitLab. |
| `pipeline-drift` | Ambientes generados | Pipeline programado de detección de drift mediante plan/detailed exit code. Produce reportes por ambiente y nunca ejecuta apply. |
| `pipeline-app` | Topología `single` | Pipeline CI/CD combinado de aplicación: build, pruebas, análisis, artefacto inmutable, promoción, health check, estrategia de despliegue, rollback y notificación. |
| `pipeline-app-<componente>` | Topología `per_component` compatible | Un pipeline por unidad desplegable, con trigger por path, artefacto, environments y ciclo de release propios. Actualmente se genera con Azure DevOps. |
| `pipeline-dora` + `scripts/dora-collect.mjs` | `dora_collection_method: automated` | Pipeline programado y colector de las cinco métricas DORA. Publica `dora-metrics-dataset`, por aplicación o componente, sin inventar datos cuando no hay muestra. |

### GitOps y setup auxiliar

| Logical ID / output | Condición | Propósito y contenido |
|---|---|---|
| `gitops-manifests` | `deployment_model: gitops`, ArgoCD y pipeline compatible | Kustomize base, overlays por ambiente y `Application` de ArgoCD. El pipeline actualiza la imagen deseada; Bob no sincroniza el clúster. |
| `infra/bootstrap/setup-azure-devops.sh` | Plataforma Azure DevOps | Script auxiliar idempotente para Variable Groups, Environments y Branch Policy que el MCP oficial no cubre. Se registra como paso `OP-NNN`, no como artefacto base del catálogo. |

**Garantías de estas salidas:** un logical ID corresponde a una sola ruta física; no hay
placeholders, pseudocódigo, secretos ni validaciones fabricadas; inputs y outputs
coinciden con documentos Vulcano; las dependencias son acíclicas y están generadas antes
de sus consumidores; cada estado `generated` incluye validación real y hashes de
fuentes; una omisión tiene razón y un conflicto bloquea dependientes; ninguna salida
implica que infraestructura o pipelines hayan sido aplicados o registrados.

## Registros y salidas de Vulcano-Operador

Operador no genera infraestructura ni pipelines nuevos. Su salida persistente principal
es el manifiesto operacional (ver [Los tres manifiestos](#los-tres-manifiestos)), que
acumula estados y evidencia sin guardar payloads ni secretos.

| Output | Momento | Propósito y contenido |
|---|---|---|
| `resources/.vulcano/operations-manifest.yaml` | Inicialización y todo el ciclo | Contrato schema v2 descrito arriba. |
| Snapshot observado sanitizado temporal | `reconcile` | Representación mínima del estado remoto usada para calcular `snapshot_sha256`; no se persiste como payload crudo en el manifiesto. |
| Archivo de confirmación | `authorize` | Entrada temporal con confirmación humana; el manifiesto conserva solo `confirmation_sha256`, identidad y expiración. |
| Archivo de evidencia sanitizada | `operate` / `verify` | Entrada temporal proveniente del MCP; el manifiesto conserva herramienta, resultado, hashes, ID externo y timestamp. |

### Efectos remotos permitidos

| Tipo de salida remota | Ejemplos | Restricciones |
|---|---|---|
| Configuración de plataforma | Registro de pipeline, environment, variable no secreta/referencia, policy/ruleset, tag | Debe estar en allowlist y disponible por MCP; una operación por autorización. |
| Ejecución | Queue/dispatch/run, cancelación, promoción o rollback | Autorización corta, progresión de ambiente y verificación posterior. |
| Verificación cloud | Estado/configuración no secreta y salud | Solo lectura; nunca crea ni modifica recursos Terraform. |

**Garantías de estas salidas:** no contienen PAT, tokens, contraseñas, secretos,
connection strings ni payloads crudos; toda mutación está ligada a un ID, target, hash
de Bob, snapshot y autorización vigente; una confirmación no autoriza más de una acción;
`succeeded` no se confunde con `verified`; una operación ambigua obliga a reconciliar
antes de reintentar; las afirmaciones de cambio remoto requieren evidencia MCP
registrada.
