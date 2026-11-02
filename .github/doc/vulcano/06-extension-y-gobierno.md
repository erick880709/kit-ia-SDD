# Extensión y gobierno

## Adaptadores de Vulcano-Bob

| Dimensión | Implementados | Alcance |
|---|---|---|
| Cloud | Azure, AWS, GCP | Providers, backend bootstrap y patrones cloud. |
| IaC | Terraform | Roots por ambiente, módulos, tests plan/mock, lockfiles y validación local. |
| Pipeline | Azure DevOps, GitHub Actions, GitLab CI | Renderers, OIDC, policy gates, despliegue progresivo, notificación y validación semántica. |
| GitOps | ArgoCD | Generación local de Kustomize base/overlays y Applications; no operación remota. |
| ChatOps | Ninguno operativo | Slack está catalogado como `planned`. |

Compatibilidad relevante:

- GitHub Actions y GitLab soportan `push_pipeline` y GitOps.
- Azure DevOps soporta pipelines push; su renderer actual rechaza GitOps.
- Solo Azure DevOps soporta actualmente `pipeline_topology: per_component`.
- Los tres pipelines soportan rolling/canary/blue-green, policy as code y notificación renderizada.
- Terraform es la única dimensión IaC implementada hoy.

## Adaptadores de Vulcano-Operador

| Dimensión | Adaptador | Modo/capacidades |
|---|---|---|
| Plataforma | Azure DevOps | Registrar y ejecutar pipelines/runs soportados; varias operaciones de configuración no están expuestas por el MCP oficial y quedan manuales. |
| Plataforma | GitHub Actions | Environments, variables, rulesets, dispatch/cancel, promoción, rollback y tags según MCP disponible. |
| Plataforma | GitLab | Environments, variables CI/CD, protected branches, run/cancel, promoción, rollback y tags según MCP disponible. |
| Cloud | Azure | Verificación de configuración no secreta y salud en modo `read_only_verification`. |
| Cloud | AWS | Verificación de solo lectura; no crea recursos. |
| Cloud | GCP | Verificación de solo lectura; no crea recursos. |

### Allowlist por plataforma

| Plataforma | Acciones de configuración | Acciones de ejecución |
|---|---|---|
| Azure DevOps | `register_pipeline`, `create_environment`, `update_variable_group`, `configure_branch_policy`, `tag_release` | `queue_pipeline`, `cancel_pipeline_run`, `approve_deployment`, `promote_release`, `rollback_deployment` |
| GitHub Actions | `create_environment`, `update_actions_variable`, `configure_repository_ruleset`, `tag_release` | `dispatch_workflow`, `cancel_workflow_run`, `approve_deployment`, `promote_release`, `rollback_deployment` |
| GitLab | `create_environment`, `update_cicd_variable`, `configure_protected_branch`, `tag_release` | `run_pipeline`, `cancel_pipeline`, `approve_deployment`, `promote_release`, `rollback_deployment` |

Que una acción esté en el allowlist no garantiza que el MCP activo exponga la
herramienta. Ambas condiciones deben cumplirse.

## Resolución del adaptador ArgoCD

Existe una asimetría real y verificada entre Vulcano-Bob y Vulcano-Operador para el
adaptador GitOps ArgoCD, y **no es un error de documentación**:

- **Vulcano-Bob sí lo tiene implementado**, pero solo para generación local: produce
  Kustomize base/overlays por ambiente y `Application` de ArgoCD (`render-bob-gitops.mjs`
  → salida `gitops-manifests`). No sincroniza el clúster ni opera nada remoto.
- **Vulcano-Operador lo mantiene en `planned`**: `gitops/argocd` no tiene routing MCP,
  sanitización, pruebas ni un ciclo `reconcile`/`sync` seguros implementados todavía. Es
  decir, Bob genera los manifiestos, pero Operador aún no puede reconciliarlos ni
  aplicarlos contra un clúster real.

En una ronda de validación previa contra el código y las suites de test reales se
encontró y corrigió una divergencia documental sobre este punto: `vulcano-bob/SKILL.md`
afirmaba que el adaptador ArgoCD **no** estaba implementado en Bob, lo cual era
incorrecto — el renderer y su prueba (`render-bob-gitops materializa Kustomize
base/overlays y Applications de ArgoCD`, dentro de `bob-state-scripts.test.mjs`) sí
existen y pasan. Esa afirmación de `vulcano-bob/SKILL.md` ya fue corregida. El estado
correcto y vigente es el descrito arriba: **implementado en Bob (local), `planned` en
Operador (remoto)**.

## Cómo se extendería un adaptador nuevo

Los tres documentos fuente (`vulcano.md`, `vulcano-bob.md`, `vulcano-operador.md`) no
describen un procedimiento formal de alta de adaptadores equivalente al de
`solution-baseline`. Lo único documentado como mecanismo de extensibilidad es: "Registro
de adaptadores por dimensión, assets y renderers independientes" (capacidad de
Vulcano-Bob).

La estructura observada en el repositorio (confirmada con Glob, no un procedimiento
declarado en los documentos fuente) es consistente con ese mecanismo: cada adaptador
vive como un archivo JSON propio bajo una carpeta por dimensión y se declara en un
registro central.

```text
.claude/skills/vulcano-bob/adapters/registry.json
.claude/skills/vulcano-bob/adapters/cloud/{aws,azure,gcp}.json
.claude/skills/vulcano-bob/adapters/iac/terraform.json
.claude/skills/vulcano-bob/adapters/pipelines/{azure-devops,github-actions,gitlab}.json
.claude/skills/vulcano-bob/adapters/gitops/argocd.json
.claude/skills/vulcano-bob/adapters/chatops/slack.json

.claude/skills/vulcano-operador/adapters/registry.json
.claude/skills/vulcano-operador/adapters/platforms/{azure-devops,github-actions,gitlab}.json
.claude/skills/vulcano-operador/adapters/cloud/{aws,azure,gcp}.json
.claude/skills/vulcano-operador/adapters/gitops/argocd.json
.claude/skills/vulcano-operador/adapters/chatops/slack.json
```

Agregar una dimensión o proveedor nuevo implicaría, como mínimo, un adaptador JSON nuevo
en la carpeta de su dimensión, su alta en `registry.json`, un renderer/operación
independiente y las pruebas correspondientes — pero esto es una inferencia razonada a
partir de la estructura existente, no un procedimiento que los documentos fuente
declaren explícitamente. Si se necesita el detalle exacto, debe consultarse
`references/adapters.md` (Bob) y `references/adapter-contract.md` (Operador), que no
fueron parte del alcance verificado de esta reorganización.

## Gates de salida

### Gate de Vulcano (diseño)

Su gate de salida exige:

- Decisiones de nube, IaC, CI/CD, despliegue, seguridad y observabilidad trazables.
- Inputs, outputs, ambientes y módulos coherentes entre documentos.
- Pendientes `PD-NNN` con owner y criterio de salida.
- Omisiones justificadas.
- `manifest.yaml` y cierre documental sin errores bloqueantes.

Cuando el diseño está listo, Vulcano entrega el control a Vulcano-Bob. No genera
Terraform ni registra pipelines remotos.

### Gate de Vulcano-Bob (generación local)

El gate de salida de Vulcano-Bob exige:

- Ningún artefacto `pending` o `conflict`.
- Dependencias generadas u omitidas justificadamente.
- Validaciones locales y evidencia registradas.
- `bob-manifest.yaml` actualizado y cierre estricto exitoso.
- Índice de IaC y pipelines regenerado.

Vulcano-Bob puede terminar aquí si solo se pidió generación local. "Generado" no
significa "aplicado", "registrado" ni "desplegado".

### Gate de Vulcano-Operador (ciclo de seguridad)

Para un diff válido, el flujo es obligatorio:

```text
reconcile → plan → authorize → operate → verify
```

| Fase | Qué hace | ¿Cambia el sistema remoto? |
|---|---|---:|
| `reconcile` | Lee el estado remoto y calcula el snapshot. | No |
| `plan` | Define una acción, target, riesgo, diff y `scope_hash`. | No |
| `authorize` | Vincula una confirmación humana al alcance exacto. | No |
| `operate` | Ejecuta una única acción permitida mediante MCP. | Sí |
| `verify` | Relee el objeto o ejecución y registra el resultado. | No |

Si una ejecución devuelve timeout o un resultado ambiguo, Vulcano-Operador no reintenta
inmediatamente: vuelve a `reconcile`. Si la verificación revela un defecto de artefacto,
retroalimenta a Vulcano-Bob; si revela un problema en la decisión, retroalimenta a
Vulcano.

## Seguridad operacional de Vulcano-Operador

| Control | Garantía |
|---|---|
| Lectura predeterminada | Ninguna mutación antes de reconcile, plan y authorize. |
| Mínimo alcance | Una autorización corresponde a un ID, target, snapshot y `scope_hash`. |
| Expiración | Configuración ≤24 h; ejecución ≤30 min. |
| Concurrencia | Relectura inmediata antes de mutar; cancelación si cambió el snapshot. |
| Evidencia | Solo hashes de request/response sanitizados, herramienta, resultado, ID externo y timestamps. |
| Progresión | QA requiere dev verificado; prod requiere QA verificado para el mismo logical ID. |
| Separación de funciones | El agente no aprueba producción ni su propio cambio. |
| IaC | MCP cloud nunca crea recursos administrados por Terraform. |
