# CLI y operación

## Validador de Vulcano

```powershell
node .claude/skills/vulcano/scripts/validate-vulcano.mjs [opciones]
```

| Opción | Descripción |
|---|---|
| Sin opciones | Valida una sesión parcial en `./resources`. |
| `--strict-completeness` | Exige los 26 IDs lógicos y los artefactos de cierre. |
| `--root <ruta>` | Cambia la raíz del workspace. |
| `--resources-dir <ruta>` | Apunta directamente a un `resources_root`; prevalece sobre `--root`. |

## Comandos principales de Vulcano-Bob

| Comando | Parámetros relevantes | Propósito |
|---|---|---|
| `init-bob-manifest.mjs` | `--resources-dir`, `--migrate-adapters` | Inicializar schema v4 o migrar v3 sin perder estado. |
| `compile-bob-contract.mjs` | Raíz/recursos según script | Derivar módulos, contratos y dependencias desde `06-modules.md`. |
| `resolve-bob-adapters.mjs` | `--allow-planned` solo diagnóstico | Resolver nube, IaC, pipeline y dimensiones condicionales. |
| `record-bob-capability.mjs` | `--capability`, `--status` | Registrar disponibilidad real de skills/MCP sin guardar tokens. |
| `render-bob-bootstrap.mjs` | Parámetros del backend cloud | Generar bootstrap seguro del backend de state. |
| `render-bob-pipelines.mjs` | Plataforma, cron, variable groups, estrategia, modelo, topología, policy y notificación | Generar IaC, drift y aplicación usando el renderer seleccionado. |
| `render-bob-dora.mjs` | `--dora-cron`, `--components` | Generar colector y pipeline DORA cuando la recolección es automática. |
| `render-bob-gitops.mjs` | Repo, app, imagen, puertos, réplicas | Generar Kustomize y Applications ArgoCD cuando GitOps aplica. |
| `render-bob-azure-devops-setup.mjs` | Variable groups, topología, componentes, revisores | Generar setup idempotente de objetos que el MCP oficial no cubre. |
| `validate-and-record-bob-artifact.mjs` | `--logical-id` | Ejecutar validación real y registrar hashes/evidencia. |
| `validate-vulcano-bob.mjs` | `--strict-completeness`, `--write-summary`, `--root`, `--resources-dir`, `--skip-tools` | Validar contrato, código, herramientas y cierre. `--skip-tools` solo sirve en pruebas no estrictas. |
| `generate-bob-index.mjs` | Manifiesto activo | Regenerar el índice de cierre de forma determinista. |

Las decisiones de `deployment_strategy`, `deployment_model`, `pipeline_topology`,
`policy_engine`, `notification_channel` y `dora_collection_method` se copian desde
Vulcano; Bob no las reemplaza con defaults arquitectónicos.

## Comandos principales de Vulcano-Operador

| Comando | Parámetros principales | Propósito |
|---|---|---|
| `resolve-operator-adapters.mjs` | `--resources-dir`, `--allow-planned` solo diagnóstico | Resolver plataforma y cloud desde Bob. |
| `init-operations-manifest.mjs` | `--organization`, `--project`, `--repository`, `--branch`, `--migrate` | Crear schema v2 o migrar v1 invalidando autorizaciones anteriores. |
| `record-reconciliation.mjs` | `--platform-mcp`, `--cloud-mcp`, `--tool`, `--snapshot-file` | Registrar capacidades y hash del estado observado. |
| `plan-operation.mjs` | `--id`, `--type`, `--logical-id`, `--target-ref`, `--desired-file`, `--observed-file`, `--summary`, `--environment` | Crear una acción mínima y calcular su `scope_hash`. |
| `authorize-operation.mjs` | `--id`, `--authorized-by`, `--confirmation-file`, `--expires-in-minutes` | Vincular autorización humana al ID, alcance y snapshot exactos. |
| `begin-operation.mjs` | `--id` | Revalidar y marcar `running` inmediatamente antes de invocar el MCP. |
| `record-operation-evidence.mjs` | `--id`, `--phase`, `--tool`, `--evidence-file` | Guardar evidencia sanitizada de ejecución o verificación. |
| `validate-operations-manifest.mjs` | `--strict`, `--root`, `--resources-dir` | Validar schema, cierre Bob, gates, hashes, estados y seguridad operacional. |

Las autorizaciones `configure` expiran como máximo en 24 horas y las `execute` en 30
minutos. Cambiar el snapshot, el hash de Bob o el alcance invalida la autorización; ver
el detalle de expiración y evidencia en
[Extensión y gobierno — Seguridad operacional](./06-extension-y-gobierno.md#seguridad-operacional-de-vulcano-operador).
