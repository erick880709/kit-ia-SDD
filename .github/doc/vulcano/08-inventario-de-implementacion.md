# Inventario de implementación

Este inventario permite localizar cada pieza generada y su responsabilidad. Los
conteos de scripts, referencias, assets y adaptadores fueron verificados con Glob sobre
`.claude/skills/vulcano*/` al redactar esta reorganización.

## Skills principales

| Archivo | Propósito |
|---|---|
| [vulcano/SKILL.md](../../skills/vulcano/SKILL.md) | Router, flujo, persona y límites de Vulcano. |
| [vulcano-bob/SKILL.md](../../skills/vulcano-bob/SKILL.md) | Router, flujo y límites de Vulcano-Bob. |
| [vulcano-operador/SKILL.md](../../skills/vulcano-operador/SKILL.md) | Router, flujo y límites de Vulcano-Operador. |

## Referencias operativas

| Componente | Directorio | Archivos |
|---|---|---:|
| Vulcano | [references/](../../skills/vulcano/references/) | 9 |
| Vulcano-Bob | [references/](../../skills/vulcano-bob/references/) | 15 |
| Vulcano-Operador | [references/](../../skills/vulcano-operador/references/) | 9 |

```text
vulcano/references/
  contrato-handoff-archi.md
  entrega-y-consistencia.md
  estado-y-validacion.md
  estandares-madurez.md
  estandares-operativos.md
  orden-y-dependencias.md
  plantillas-archivos.md
  preguntas-por-archivo.md
  senales-modernizacion.md

vulcano-bob/references/
  adapters.md
  aws-terraform.md
  azure-devops-setup.md
  dora-collector.md
  estado-y-validacion.md
  gcp-terraform.md
  github-actions.md
  gitlab-ci.md
  gitops.md
  hashicorp-terraform-integrations.md
  orden-y-dependencias.md
  plantillas-codigo.md
  practicas-implementacion.md
  preguntas-por-artefacto.md
  validacion-estatica.md

vulcano-operador/references/
  adapter-contract.md
  aws.md
  azure-devops.md
  gcp.md
  github-actions.md
  gitlab.md
  gitops-argocd.md
  operational-safety.md
  state-and-migration.md
```

## Scripts

### Vulcano — 2 archivos

| Archivo | Propósito |
|---|---|
| [validate-vulcano.mjs](../../skills/vulcano/scripts/validate-vulcano.mjs) | Validador semántico y de completitud. |
| [test-validate-vulcano.mjs](../../skills/vulcano/scripts/test-validate-vulcano.mjs) | Pruebas de regresión del validador (37/37, ver [Validación y estado](./07-validacion-y-estado.md)). |

### Vulcano-Bob — 24 archivos (bajo `scripts/`, incluye `scripts/renderers/`)

Los comandos con propósito documentado (12 scripts) están en
[CLI y operación](./05-cli-y-operacion.md#comandos-principales-de-vulcano-bob). El resto
del inventario literal, incluidas 5 suites de test (ver
[Validación y estado](./07-validacion-y-estado.md)) y el subdirectorio `renderers/`:

```text
vulcano-bob/scripts/
  adapter-registry.mjs
  adapter-registry.test.mjs
  bob-state-scripts.test.mjs
  compile-bob-contract.mjs
  dora-collect.test.mjs
  generate-bob-index.mjs
  init-bob-manifest.mjs
  record-bob-artifact.mjs
  record-bob-capability.mjs
  render-bob-azure-devops-setup.mjs
  render-bob-bootstrap.mjs
  render-bob-dora.mjs
  render-bob-gitops.mjs
  render-bob-pipelines.mjs
  resolve-bob-adapters.mjs
  terraform-integrations.test.mjs
  terraform-test-policy.mjs
  validate-and-record-bob-artifact.mjs
  validate-vulcano-bob.mjs
  validate-vulcano-bob.test.mjs
  renderers/render-azure-devops.mjs
  renderers/render-github-actions.mjs
  renderers/render-gitlab.mjs
  renderers/renderer-lib.mjs
```

`renderers/render-github-actions.mjs` y `renderers/render-gitlab.mjs` son los archivos
donde vive el bug de swap GitOps descrito en
[Validación y estado](./07-validacion-y-estado.md#bug-conocido-swap-del-deploy-gitops-en-github-actionsgitlab).
`render-bob-pipelines.mjs` es el punto de entrada que invoca al renderer seleccionado.

### Vulcano-Operador — 11 archivos

Los comandos con propósito documentado (8 scripts) están en
[CLI y operación](./05-cli-y-operacion.md#comandos-principales-de-vulcano-operador).
Inventario literal completo:

```text
vulcano-operador/scripts/
  adapter-registry.mjs        (librería interna, sin descripción propia en la fuente)
  authorize-operation.mjs
  begin-operation.mjs
  init-operations-manifest.mjs
  operations-lib.mjs          (librería interna, sin descripción propia en la fuente)
  operator-scripts.test.mjs   (suite de test: 13/13, ver Validación y estado)
  plan-operation.mjs
  record-operation-evidence.mjs
  record-reconciliation.mjs
  resolve-operator-adapters.mjs
  validate-operations-manifest.mjs
```

## Schemas y plantillas

| Componente | Schema del manifiesto | Plantilla del manifiesto | Otras plantillas/assets |
|---|---|---|---:|
| Vulcano | — (validación imperativa en el script, sin JSON Schema publicado) | [assets/manifest.template.yaml](../../skills/vulcano/assets/manifest.template.yaml) | 1 |
| Vulcano-Bob | [assets/bob-manifest.schema.json](../../skills/vulcano-bob/assets/bob-manifest.schema.json) | [assets/bob-manifest.template.yaml](../../skills/vulcano-bob/assets/bob-manifest.template.yaml) | 27 (incluye schema y template; ver detalle abajo) |
| Vulcano-Operador | [assets/operations-manifest.schema.json](../../skills/vulcano-operador/assets/operations-manifest.schema.json) | [assets/operations-manifest.template.yaml](../../skills/vulcano-operador/assets/operations-manifest.template.yaml) | 2 |

Assets de Vulcano-Bob (27 archivos bajo `assets/`, incluye `assets/gitops/`):

```text
aws-backend.bootstrap.template.sh
azure-devops-setup.template.sh
azure-pipelines.dora.template.yml
azure-pipelines.node-angular-app.template.yml
azure-pipelines.node-backend-app.template.yml
azure-pipelines.node-frontend-app.template.yml
azure-pipelines.terraform-drift.template.yml
azure-pipelines.terraform.template.yml
bob-manifest.schema.json
bob-manifest.template.yaml
ci-notify.template.sh
dora-collect.template.mjs
gcp-backend.bootstrap.template.sh
github-actions.application.template.yml
github-actions.dora.template.yml
github-actions.terraform-drift.template.yml
github-actions.terraform.template.yml
gitlab.application.template.yml
gitlab.dora.template.yml
gitlab.terraform-drift.template.yml
gitlab.terraform.template.yml
gitops/argocd.application.template.yaml
gitops/base.configmap.template.yaml
gitops/base.deployment.template.yaml
gitops/base.kustomization.template.yaml
gitops/base.service.template.yaml
gitops/overlay.kustomization.template.yaml
```

## Adaptadores

| Componente | Registro | Adaptadores por dimensión |
|---|---|---|
| Vulcano | No aplica (Vulcano no tiene carpeta `adapters/`) | — |
| Vulcano-Bob | [adapters/registry.json](../../skills/vulcano-bob/adapters/registry.json) | Cloud: `aws`, `azure`, `gcp` (3); IaC: `terraform` (1); Pipelines: `azure-devops`, `github-actions`, `gitlab` (3); GitOps: `argocd` (1); ChatOps: `slack` (1) — 9 adaptadores + registro. |
| Vulcano-Operador | [adapters/registry.json](../../skills/vulcano-operador/adapters/registry.json) | Platforms: `azure-devops`, `github-actions`, `gitlab` (3); Cloud: `aws`, `azure`, `gcp` (3); GitOps: `argocd` (1); ChatOps: `slack` (1) — 8 adaptadores + registro. |

El estado real de cada adaptador (`implemented` vs. `planned`), incluida la resolución
del caso ArgoCD, está en
[Extensión y gobierno](./06-extension-y-gobierno.md#resolución-del-adaptador-argocd).

## Agentes

Existen cuatro agentes top-level, además del metadato de interfaz de cada skill:

| Archivo | Propósito |
|---|---|
| [vulcano-orchestrator.agent.md](../../agents/vulcano-orchestrator.agent.md) | Coordina Vulcano y Bob, valida gates y prepara el handoff humano al operador; no tiene skill propia. |
| [vulcano.agent.md](../../agents/vulcano.agent.md) | Entrada directa para definición documental, sin generación ni operación. |
| [vulcano-bob.agent.md](../../agents/vulcano-bob.agent.md) | Generación y validación local en worktree, sin operación remota. |
| [vulcano-operador.agent.md](../../agents/vulcano-operador.agent.md) | Operación remota con invocación humana, autorización por acción y verificación. |
| [vulcano/agents/openai.yaml](../../skills/vulcano/agents/openai.yaml) | Nombre, descripción corta y prompt predeterminado de interfaz de Vulcano. |
| [vulcano-bob/agents/openai.yaml](../../skills/vulcano-bob/agents/openai.yaml) | Ídem para Vulcano-Bob. |
| [vulcano-operador/agents/openai.yaml](../../skills/vulcano-operador/agents/openai.yaml) | Ídem para Vulcano-Operador. |

## Conteo resumido

| Grupo | Vulcano | Vulcano-Bob | Vulcano-Operador |
|---|---:|---:|---:|
| `SKILL.md` | 1 | 1 | 1 |
| Referencias | 9 | 15 | 9 |
| Scripts (incluye tests) | 2 | 24 | 11 |
| Schemas del manifiesto | 0 | 1 | 1 |
| Plantillas/assets | 1 | 27 | 2 |
| Adaptadores por dimensión + registro | 0 | 9 + 1 | 8 + 1 |
| Metadato `agents/openai.yaml` | 1 | 1 | 1 |
| Agentes Claude Code dedicados | 1 | 1 | 1 |

Además existe un agente coordinador transversal, `vulcano-orchestrator`, para un total de cuatro
agentes en la familia. No añade una cuarta skill ni un manifiesto de orquestación.

Documentos de esta guía: 10 (índice más 9 capítulos numerados).
