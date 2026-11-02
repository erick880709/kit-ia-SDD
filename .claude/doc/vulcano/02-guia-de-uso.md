# Guía de uso

## Prerrequisitos

### Vulcano

**Funcionales**

- Workspace con arquitectura, requerimientos o código suficiente para levantar una línea base.
- Carpeta de trabajo `resources_root`; por defecto, `resources/`.
- Permiso para crear o actualizar documentación dentro de esa carpeta.
- Participación del arquitecto para resolver únicamente decisiones que no estén sustentadas por evidencia.

**Técnicos**

- Node.js para ejecutar el validador; este repositorio declara Node.js `>=20`.
- Python 3 con `PyYAML`, utilizado por el validador para leer YAML.
- Opcional: `@mermaid-js/mermaid-cli` para compilar los diagramas Mermaid. Si no está instalado, el validador informa un warning.
- No se requiere un MCP o conector remoto para el flujo base.
- Apoyo adicional: fuentes primarias para comprobar estándares o benchmarks cambiantes, y agentes de exploración opcionales en repositorios grandes.

### Vulcano-Bob

**Funcionales**

- `resources/.vulcano/manifest.yaml` completo y coherente.
- Documentos fuente de IaC, ambientes, CI/CD, testing, seguridad y observabilidad aplicable.
- Decisiones independientes de nube, IaC y plataforma CI/CD.
- Perfil `decisions.terraform` completo cuando `iac: terraform`.
- Adaptadores resueltos con estado `implemented`.
- Código existente accesible para detectar conflictos antes de sobrescribir.

**Técnicos**

| Herramienta | Requisito | Uso |
|---|---:|---|
| Node.js | Obligatorio | Ejecutar inicializadores, renderers, registradores y validadores. |
| Python 3 + PyYAML | Obligatorio | Leer y escribir los manifiestos YAML. |
| `jsonschema` para Python | Opcional | Validar `bob-manifest.yaml` contra su JSON Schema; sin él queda un warning. |
| Terraform CLI | Obligatorio para `module-*` y `env-*` | Format, validate y pruebas reales. |
| Bash | Obligatorio para `bootstrap-backend` | Validar la sintaxis del bootstrap. |
| `tflint` | Recomendado | Lint de Terraform. |
| Trivy, tfsec o Checkov | Recomendado, elegir uno | Escaneo de seguridad IaC; Trivy es la opción preferida. |
| `shellcheck` | Opcional | Lint de scripts Bash. |
| `gitleaks` | Opcional recomendado | Detección especializada de secretos. |
| OPA o Conftest | Obligatorio si fue seleccionado | Gate de policy as code. |
| Terraform Registry MCP | Condicional | Consulta de Registry en modo lectura. |
| Skills HashiCorp | Condicional | Estilo, pruebas, AVM o refactor según el perfil aprobado. |

### Vulcano-Operador

**Funcionales**

| Requisito | Criterio |
|---|---|
| `resources/.vulcano/bob-manifest.yaml` | Debe tener cierre estricto exitoso y artefactos sin `pending`/`conflict`. |
| Selección de Bob | `adapter_selection` debe coincidir con el manifiesto Vulcano. |
| Adaptadores | Plataforma y cloud deben estar `implemented`; GitOps/ChatOps solo si también lo están. |
| Coordenadas | Organización, proyecto cuando aplique, repositorio y rama confirmados. |
| MCP de plataforma | Obligatorio y descubierto antes de `reconcile`. |
| MCP cloud | Opcional; requerido solo para verificación posterior de nube. |
| Credenciales | Administradas por el MCP/cliente; nunca guardadas en manifiestos o evidencias. |

**Técnicos**

| Plataforma/capacidad | MCP esperado | Alcance |
|---|---|---|
| Azure DevOps | `@azure-devops/mcp` oficial | Repositorios, pipelines y acciones expuestas por su toolset. Autenticación interactiva, `az login` o PAT suministrado por entorno. |
| Azure cloud | `@azure/mcp` oficial | Verificación no secreta y de salud, en modo lectura. |
| GitHub Actions | Capacidad `github_mcp` | Operaciones permitidas por el descriptor GitHub. |
| GitLab | Capacidad `gitlab_mcp` | Operaciones permitidas por el descriptor GitLab. |
| AWS/GCP cloud | `aws_mcp` / `gcp_mcp` | Verificación cloud de solo lectura. |

Después de registrar un MCP se debe recargar el cliente y confirmar que sus herramientas
estén disponibles. Si no aparecen, se registra `missing_capability`; no se improvisa REST
o CLI.

## Entradas

### Vulcano

| Entrada | Uso |
|---|---|
| Repositorio local | Evidencia observable de stack, CI/CD, pruebas, IaC, seguridad y telemetría. |
| `{resources_root}/architecture/` | Arquitectura, nube, servicios, restricciones y requisitos no funcionales. |
| `{resources_root}/qa/` | Estrategia y evidencia de pruebas, si existe. |
| Documentos Vulcano existentes | Continuación de sesiones y preservación de cambios manuales. |
| `{resources_root}/.vulcano/manifest.yaml` | Estado persistente, decisiones, fuentes, supuestos, pendientes y omisiones. |
| Respuestas del arquitecto | Información no demostrable mediante las fuentes anteriores. |
| Restricciones corporativas | Herramientas obligatorias, plataforma DevOps, presupuesto y cumplimiento. |

Para hechos observables manda el código/configuración actual. Para intención y
decisiones manda el manifiesto. Las contradicciones se presentan al arquitecto; nunca se
resuelven sobrescribiendo silenciosamente una fuente. No se guardan secretos ni datos
personales en las salidas.

### Vulcano-Bob

| Entrada | Uso |
|---|---|
| `resources/.vulcano/manifest.yaml` | Fuente de decisiones aprobadas y estado documental. |
| Documentos `resources/infrastructure-as-code/` | Contratos de herramienta, módulos, ambientes, red, state y secretos. |
| `05-environments.md`, `06-ci-cd.md`, `07-continuous-testing.md`, `08-security.md` | Contrato de pipelines, promociones, gates y comandos. |
| Documentos de observabilidad | Recursos, alertas y recolección DORA que deben materializarse. |
| `resources/.vulcano/bob-manifest.yaml` | Estado persistente de generación; se crea si no existe. |
| Código local existente | Evidencia para reconciliación, idempotencia y detección de conflictos. |
| Parámetros operativos `OP-NNN` | Nombres o coordenadas no arquitectónicas que pueden parametrizarse sin cambiar el diseño. |

La precedencia es: documentos Vulcano para el diseño, código para lo que existe y
manifiesto Bob para saber qué fue generado, contra qué snapshot y con qué evidencia. Un
cambio en las fuentes invalida los hashes y obliga a revisar; no se regenera
silenciosamente.

### Vulcano-Operador

| Entrada | Uso |
|---|---|
| `resources/.vulcano/bob-manifest.yaml` | Fuente de artefactos cerrados, hashes y selección de adaptadores. |
| `resources/.vulcano/manifest.yaml` | Verificación indirecta de coherencia con decisiones de arquitectura. |
| Artefacto local deseado | Archivo que se compara o registra en la plataforma. |
| Coordenadas remotas | Organización, proyecto, repositorio, rama, target y ambiente. |
| Herramientas MCP descubiertas | Único canal operativo predeterminado. |
| Snapshot observado sanitizado | Base del diff y protección contra cambios concurrentes. |
| Confirmación humana | Debe nombrar el ID `OP-ACT-NNN` o target exacto. |
| Evidencia MCP sanitizada | Hashes y resultado de ejecución/verificación, nunca payloads crudos. |

## Parámetros de sesión

### Vulcano

Los parámetros se expresan en lenguaje natural al invocar `$vulcano`:

| Parámetro | Valores típicos | Comportamiento predeterminado |
|---|---|---|
| `resources_root` | `resources/`, `services/auth/resources/` | `resources/` cuando es la única candidata razonable. |
| Alcance | Todo, DevOps, IaC, observabilidad o archivo puntual | Se confirma después del descubrimiento. |
| Modo | `greenfield`, `as-is`, `as-is+to-be` | Se deriva de la evidencia y se confirma si hay hallazgos. |
| Secuencia | Recomendada, por pilar o libre | Orden recomendado por dependencias. |
| Avance | Pausa entre archivos o continuo | Pausa y confirmación entre archivos. |
| Plataforma DevOps | Azure DevOps, GitHub, GitLab u otra | No se asume. |
| Herramientas corporativas | SonarQube, Checkmarx, Snyk, Artifactory, etc. | No se asumen. |
| Madurez | Básico, intermedio o avanzado | Se infiere con evidencia o se confirma. |
| Estándar | DORA, NIST SSDF, DSOMM, CIS, ISO 27001, SOC 2, PCI-DSS, CMMI, etc. | Framework interno si no existe uno declarado. |

Las principales decisiones persistidas en el manifiesto son `cloud_provider`,
`devops_platform`, `iac`, `observability`, `artifact_registry`, `workload_identity`,
`secrets_manager`, `policy_engine`, `deployment_strategy` (`rolling`, `canary` o
`blue_green`), `deployment_model` (`push_pipeline` o `gitops`), `pipeline_topology`
(`single` o `per_component`), `feature_flags`, `dora_collection_method`,
`notification_channel`, y para Terraform: versión, constraints de providers, estándar de
módulos, backend de ejecución, pruebas, Registry/MCP y modo de adopción. No hay defaults
implícitos: una decisión no tomada permanece en `null` o se registra como `PD-NNN`, con
owner y criterio de salida.

El comando y las opciones del validador de Vulcano están en
[CLI y operación](./05-cli-y-operacion.md).

### Vulcano-Bob

| Modo | Propietario | Descripción |
|---|---|---|
| `generate` | Bob | Único modo propio: escribe y valida archivos locales. |
| `reconcile`, `plan`, `authorize`, `operate`, `verify` | Operador | Se delegan después del cierre estricto. |

Las decisiones de `deployment_strategy`, `deployment_model`, `pipeline_topology`,
`policy_engine`, `notification_channel` y `dora_collection_method` se copian desde
Vulcano; Bob no las reemplaza con defaults arquitectónicos. Los comandos de Bob están en
[CLI y operación](./05-cli-y-operacion.md).

### Vulcano-Operador

| Concepto | Valores |
|---|---|
| Modo | `reconcile`, `plan`, `authorize`, `operate`, `verify`. |
| Gate | `pending`, `ready`, `blocked`. |
| Capacidad | `unknown`, `available`, `missing`. |
| Riesgo | `configure` o `execute`; lo determina el descriptor, no el usuario. |
| Estado de acción | `proposed`, `authorized`, `running`, `succeeded`, `failed`, `verified`, `cancelled`. |
| Ambiente | `dev`, `qa`, `prod` o `null` cuando no aplica. |

Las autorizaciones `configure` expiran como máximo en 24 horas y las `execute` en 30
minutos. Cambiar el snapshot, el hash de Bob o el alcance invalida la autorización. Los
comandos de Operador están en [CLI y operación](./05-cli-y-operacion.md).

## Proceso operativo

### Vulcano

**Fase 0 — Descubrimiento**

1. Determina `resources_root`.
2. Lee arquitectura y requerimientos existentes.
3. Escanea evidencia de repositorio, CI/CD, pruebas, IaC, seguridad y observabilidad.
4. Clasifica cada documento como sin evidencia, implementado sin documentar o ya documentado.
5. Detecta mejoras con riesgo e impacto concretos.
6. Pregunta solo las decisiones transversales aún desconocidas.

**Fase 1 — Alcance**

1. Construye el inventario de los 26 documentos.
2. Presenta estado y hallazgos.
3. Permite elegir pilar, archivo u orden recomendado.
4. Confirma herramientas y modo AS-IS/TO-BE solo para el alcance seleccionado.

**Fase 2 — Ciclo por archivo**

1. Expone lo conocido y sus fuentes.
2. Pregunta únicamente lo faltante, máximo 5 o 6 preguntas por ronda.
3. Genera un solo Markdown usando la plantilla y numeración canónica.
4. Actualiza el manifiesto y valida contratos cruzados.
5. Resume la salida y propone el siguiente documento.

En `as-is+to-be` se agregan hallazgos, riesgos, diseño objetivo, gap analysis y roadmap
por fases. En `greenfield` no se inventa un AS-IS vacío.

**Fase 3 — Cierre**

1. Actualiza `01-devops-index.md`.
2. Genera `02-madurez-devsecops.md`.
3. Actualiza el manifiesto.
4. Ejecuta el validador con `--strict-completeness`.
5. Corrige errores y reporta warnings, pendientes y omisiones.

### Vulcano-Bob

**Fase 0 — Preflight**

1. Lee completamente el manifiesto Vulcano, los documentos fuente, Bob manifest y código local.
2. Confirma proyecto, `resources_root` y manifiesto fuente.
3. Comprueba que cada artefacto tenga fuentes completas.
4. Compila y valida el grafo de inputs, outputs y dependencias.
5. Detecta ciclos, interfaces inexistentes, comandos indefinidos e incompatibilidades.
6. Resuelve adaptadores y capacidades; un adaptador no implementado bloquea su artefacto.
7. Copia el perfil Terraform sin reinterpretarlo.

**Fase 1 — Plan de artefactos**

Clasifica cada artefacto como `pending`, `generated`, `conflict` u `omitted`. Si se pide
"todo", avanza en orden topológico. Solo pregunta cuando una decisión cambia el
resultado; los datos operativos parametrizables se registran como `OP-NNN`.

**Fase 2 — Generación y validación**

Por cada artefacto:

1. Cita documentos y secciones fuente.
2. Exige dependencias generadas.
3. Produce un archivo funcional, sin pseudocódigo ni placeholders sin ID.
4. Conserva exactamente inputs y outputs aprobados.
5. Ejecuta format, validate, tests, lint, seguridad o sintaxis aplicable.
6. Registra resultado, comandos, versiones, fecha, hashes de evidencia y SHA-256 de fuentes.

**Fase 3 — Cierre**

1. Ejecuta `validate-vulcano-bob.mjs --strict-completeness --write-summary`.
2. Corrige errores y hace visibles herramientas ausentes como warnings.
3. Regenera `resources/03-iac-pipelines-index.md`.
4. Separa generado, validado, bloqueado y pasos manuales.
5. Si se pidió operación remota, transfiere a Operador empezando en `reconcile`.

El cierre significa "generado y validado localmente", nunca "desplegado" o "aplicado".

### Vulcano-Operador

1. **Resolver e inicializar**: verifica el cierre estricto de Bob, resuelve adaptadores
   sin combinarlos cartesianamente, descubre MCP y herramientas disponibles, e
   inicializa o migra `operations-manifest.yaml` sin perder historial.
2. **`reconcile` — lectura**: lee solo el estado remoto necesario, busca por nombre/ID,
   sanitiza un snapshot temporal y registra su SHA-256. Si falta el MCP de plataforma,
   termina con `missing_capability`. La nube es opcional cuando no se requiere
   verificación cloud.
3. **`plan` — diff sin efectos**: crea una acción mínima permitida por el allowlist.
   Conserva hashes del estado observado y deseado, un resumen de diferencias y
   `scope_hash`; no persiste payloads. Para acciones de promoción exige ambiente y
   progresión verificada `dev → qa → prod`.
4. **`authorize` — gate humano**: muestra ID, plataforma, target, acción, riesgo, diff y
   `scope_hash`. Una confirmación inequívoca autoriza una sola acción, expira y queda
   ligada al snapshot y hash de Bob actuales.
5. **`operate` — una mutación**: valida manifiesto y autorización, relee el target para
   prevenir duplicados y concurrencia, ejecuta `begin-operation.mjs`, invoca exactamente
   una herramienta MCP para una acción y registra únicamente hashes y evidencia
   sanitizada. Ante timeout o resultado ambiguo no reintenta: vuelve a `reconcile`.
6. **`verify` — lectura posterior**: relee el objeto o run mediante el adaptador de
   plataforma. Usa cloud solo para configuración no secreta y salud. Una ejecución
   exitosa queda `succeeded`; solo la lectura posterior consistente permite marcarla
   `verified`.
7. **Cierre**: ejecuta `validate-operations-manifest.mjs --strict` y reporta por
   separado lo observado, propuesto, autorizado, ejecutado, verificado, fallido y
   bloqueado.

## Ejemplos de invocación

### Flujo completo

```text
Usa $vulcano para diseñar y documentar DevSecOps, IaC y observabilidad del proyecto.
Usa $vulcano-bob para materializar localmente el diseño aprobado y ejecutar el cierre estricto.
Usa $vulcano-operador para reconciliar los artefactos cerrados con la plataforma remota.
```

### Solo diseño

```text
Usa $vulcano para actualizar la estrategia de CI/CD. No generes ni operes artefactos.
```

### Diseño y generación local

```text
Usa $vulcano para cerrar las decisiones pendientes y después $vulcano-bob para regenerar y
validar los artefactos. No realices operaciones remotas.
```

### Reconciliación sin cambios

```text
Usa $vulcano-operador únicamente en reconcile para comparar el estado remoto. No planifiques ni
ejecutes mutaciones.
```
