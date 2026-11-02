# Validación y estado

Este documento consolida la evidencia de validación de los tres componentes. Todas las
suites se reejecutaron el **2026-09-10** sobre este mismo repositorio con **Node.js
v24.16.0**, como parte de la reconciliación de documentación e implementación. Ninguno
de los tres componentes tiene una sesión real activa en este repositorio
(`resources/.vulcano/manifest.yaml`, `bob-manifest.yaml` u `operations-manifest.yaml` no
existen), por lo que la evidencia siguiente demuestra que el código de cada componente
funciona, no que exista un cierre end-to-end sobre un proyecto concreto.

## Evidencia de validación — Vulcano

El cierre documental de una sesión de Vulcano se valida con:

```powershell
node .claude/skills/vulcano/scripts/validate-vulcano.mjs --strict-completeness
```

(sin `--strict-completeness` valida una sesión parcial; `--root` y `--resources-dir`
cambian la raíz del workspace). El script comprueba, entre otros puntos: que
`manifest.yaml` tenga una estructura y valores permitidos (`mode` en
`greenfield`/`as-is`/`as-is+to-be`, estado de cada documento en
`pending`/`generated`/`existing`/`omitted`, fechas ISO válidas); que cada uno de los 26
documentos lógicos esté en la carpeta y con el prefijo numérico esperado
(`devops-strategy`/`infrastructure-as-code`/`observability`); que las rutas declaradas
no salgan del `resources_root`; y, en modo estricto, que los documentos de cierre
(`01-devops-index.md`, `02-madurez-devsecops.md`) y el resto de artefactos requeridos
existan.

Se verificó la suite de regresión por fixtures del validador:

```text
node .claude/skills/vulcano/scripts/test-validate-vulcano.mjs
→ Vulcano validator fixtures: 37/37 passed.
```

No se encontró en el repositorio un reporte, log o `README` de pruebas con fecha previa
que documente una corrida anterior de esta suite; el resultado anterior es evidencia
generada al redactar la documentación original, no un registro preexistente.

## Evidencia de validación — Vulcano-Bob

La validación real de un cierre de Bob se ejecuta con:

```powershell
node .claude/skills/vulcano-bob/scripts/validate-vulcano-bob.mjs `
  --strict-completeness --write-summary
```

(u omitiendo `--strict-completeness`/`--write-summary` para una corrida no estricta;
`--root` y `--resources-dir` cambian la raíz del workspace; `--skip-tools` solo es
válido en modo no estricto). El script valida, entre otros puntos: que
`bob-manifest.yaml` tenga el schema v4 esperado; que cada artefacto declarado tenga
fuentes, hash SHA-256 y evidencia de una herramienta real (nunca un éxito fabricado);
que el grafo de dependencias sea acíclico; que las rutas generadas no salgan del
workspace; que las plantillas de pipeline (Azure DevOps, GitHub Actions, GitLab)
cumplan su política semántica (OIDC, environments, plan inmutable, deployment jobs con
pasos ejecutables); y que el cierre estricto no tenga artefactos `pending` o `conflict`.

Suites de regresión del validador y de los renderers:

| Suite | Comando | Resultado |
|---|---|---|
| `validate-vulcano-bob.test.mjs` | `node .claude/skills/vulcano-bob/scripts/validate-vulcano-bob.test.mjs` | 13/13 pruebas pasaron (manifiestos faltantes, conflictos bloqueantes, rutas fuera del workspace, cierre estricto con pendientes, ciclos declarados y de grafo, política semántica de pipelines, cierre estricto completo). |
| `adapter-registry.test.mjs` | `node .claude/skills/vulcano-bob/scripts/adapter-registry.test.mjs` | 6/6 pruebas pasaron (resolución de adaptadores por dimensión, normalización `github` → `github_actions`, rechazo de provider incompatible). |
| `bob-state-scripts.test.mjs` | `node .claude/skills/vulcano-bob/scripts/bob-state-scripts.test.mjs` | 24/25 pruebas pasaron. **Falla** "render-github-actions y render-gitlab cambian el deploy directo por actualizar manifiestos GitOps" (ver [Bug conocido](#bug-conocido-swap-del-deploy-gitops-en-github-actionsgitlab) abajo). El resto —incluida "render-bob-gitops materializa Kustomize base/overlays y Applications de ArgoCD"— pasa. |
| `dora-collect.test.mjs` | `node .claude/skills/vulcano-bob/scripts/dora-collect.test.mjs` | 8/8 pruebas pasaron. |
| `terraform-integrations.test.mjs` | `node .claude/skills/vulcano-bob/scripts/terraform-integrations.test.mjs` | 3/3 pruebas pasaron. |

No se encontró en el repositorio un reporte, log o `README` de pruebas con fecha previa
que documente una corrida anterior de estas suites; la tabla anterior es evidencia
generada al redactar la documentación original, no un registro preexistente.

### Bug conocido: swap del deploy GitOps en GitHub Actions/GitLab

`bob-state-scripts.test.mjs` falla hoy **1 de 25 pruebas**, en el caso
"render-github-actions y render-gitlab cambian el deploy directo por actualizar
manifiestos GitOps": con `deployment_model: gitops`, la plantilla renderizada **conserva
un step de deploy push-based** en vez de reemplazarlo por completo.

- `render-bob-gitops.mjs` (generación de Kustomize/Application) **sí pasa** su propia
  prueba — el problema no está en la generación de los manifiestos GitOps.
- El defecto está específicamente en el **swap del step** dentro de
  `render-github-actions.mjs` / `render-gitlab.mjs`: cuando el modelo de despliegue es
  `gitops`, esos renderers deberían dejar de emitir el step de deploy directo por push y
  emitir solo la actualización de manifiestos GitOps, y actualmente no lo hacen.

Este es un hallazgo real de la ronda de validación contra las suites de test reales, no
una hipótesis. Se documenta también como brecha pendiente en
[Evaluación y release gates](./09-evaluacion-y-release-gates.md).

## Evidencia de validación — Vulcano-Operador

El cierre del operador se valida con:

```powershell
node .claude/skills/vulcano-operador/scripts/validate-operations-manifest.mjs --strict
```

(`--root` y `--resources-dir` cambian la raíz del workspace; sin `--strict` valida un
ciclo parcial). El script comprueba, entre otros puntos: que
`operations-manifest.yaml` cumpla el schema v2; que `source` conserve el hash real del
cierre estricto de Bob; que el `gate` y las capacidades MCP estén en un estado válido;
que cada acción respete el allowlist de su plataforma y su tipo de riesgo
(`configure`/`execute`); que las autorizaciones estén ligadas a un `scope_hash`, no
hayan expirado (`configure` ≤24 h, `execute` ≤30 min) y no excedan una acción por
confirmación; que la progresión de ambiente (`dev` → `qa` → `prod`) no se salte un
ambiente sin verificación previa; y que ninguna evidencia contenga secretos, tokens o
payloads crudos.

Se verificó la suite de regresión de los scripts del operador:

```text
node .claude/skills/vulcano-operador/scripts/operator-scripts.test.mjs
→ tests 13, pass 13, fail 0
```

Las 13 pruebas cubren, entre otros casos: resolución independiente de adaptadores de
plataforma y nube (GitHub/AWS, GCP en modo `read_only_verification`, GitLab); aplicación
del allowlist específico por plataforma en `plan-operation.mjs`; inicialización del
manifiesto schema v2 tras un cierre estricto de Bob; migración v1 → v2 que invalida
autorizaciones previas; un ciclo completo `reconcile → plan → authorize → operate →
verify` que conserva gates, allowlist y evidencia; las reglas de progresión de ambiente
(`dev` sin predecesor, `qa` solo tras `dev` verificado, `prod` bloqueado sin `qa`
verificado); fallas `missing_capability` cuando la herramienta MCP no es real para
acciones como `create_environment`, `update_variable_group`,
`configure_branch_policy`, `approve_deployment` o `tag_release`; y el rechazo de
acciones fuera del allowlist o de archivos con secretos.

No se encontró en el repositorio un reporte, log o `README` de pruebas con fecha previa
que documente una corrida anterior de esta suite; el resultado anterior es evidencia
generada al redactar la documentación original, no un registro preexistente.

## Resumen de resultados

| Componente | Suite(s) | Resultado | Fecha | Node.js |
|---|---|---|---:|---|
| Vulcano | `test-validate-vulcano.mjs` | 37/37 | 2026-09-10 | v24.16.0 |
| Vulcano-Bob | `validate-vulcano-bob.test.mjs` | 13/13 | 2026-09-10 | v24.16.0 |
| Vulcano-Bob | `adapter-registry.test.mjs` | 6/6 | 2026-09-10 | v24.16.0 |
| Vulcano-Bob | `bob-state-scripts.test.mjs` | 24/25 (1 bug conocido de GitOps) | 2026-09-10 | v24.16.0 |
| Vulcano-Bob | `dora-collect.test.mjs` | 8/8 | 2026-09-10 | v24.16.0 |
| Vulcano-Bob | `terraform-integrations.test.mjs` | 3/3 | 2026-09-10 | v24.16.0 |
| Vulcano-Operador | `operator-scripts.test.mjs` | 13/13 | 2026-09-10 | v24.16.0 |
