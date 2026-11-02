# Evaluación y release gates

## Estado de madurez por componente

| Componente | Documentado | Validado localmente (suites) | Evidencia de operación real sobre un proyecto | Brecha de mayor prioridad conocida |
|---|---|---|---|---|
| Vulcano | Sí | Sí — 37/37 (2026-09-10) | No existe `resources/.vulcano/manifest.yaml` real en este repositorio | Contrato FinOps aún no verificable (ver abajo). |
| Vulcano-Bob | Sí | Sí — 13/13 + 6/6 + 24/25 + 8/8 + 3/3 (2026-09-10) | No existe `resources/.vulcano/bob-manifest.yaml` real | **Bug conocido de GitOps** (ver abajo). |
| Vulcano-Operador | Sí | Sí — 13/13 (2026-09-10) | No existe `resources/.vulcano/operations-manifest.yaml` real; ningún ciclo remoto se ha ejecutado contra una plataforma | Adaptador operativo ArgoCD sigue `planned`. |

Los tres componentes están en un estado de "contrato y validador local implementados,
sin evidencia de cierre end-to-end sobre un proyecto real" — equivalente al nivel
"Listo para piloto controlado" de `solution-baseline`, no a "generador completo en
producción".

## Brecha pendiente conocida: bug de GitOps en los renderers de pipeline

**No se omite este hallazgo.** `bob-state-scripts.test.mjs` falla 1 de 25 pruebas: con
`deployment_model: gitops`, `render-github-actions.mjs` y `render-gitlab.mjs` deberían
reemplazar por completo el step de deploy directo por push con la actualización de
manifiestos GitOps, y actualmente conservan el step de deploy push-based además de (o en
vez de) el swap esperado. `render-bob-gitops.mjs`, que genera los manifiestos
Kustomize/Application de ArgoCD, no tiene este defecto y pasa su propia prueba. El
detalle completo, con el nombre exacto del caso de prueba, está en
[Validación y estado](./07-validacion-y-estado.md#bug-conocido-swap-del-deploy-gitops-en-github-actionsgitlab).

Esta brecha bloquea declarar "GitOps con GitHub Actions/GitLab" como completamente
cerrado en Vulcano-Bob, aunque la generación de manifiestos GitOps en sí misma funciona.

## Brechas pendientes por componente

### Vulcano

| Prioridad | Capacidad | Estado actual |
|---:|---|---|
| Alta | Parser YAML autocontenido | El validador Node depende de Python/PyYAML. |
| Alta | Esquema formal del manifiesto | Hay plantilla y validación imperativa, pero no JSON Schema publicado. |
| Alta | Contrato FinOps verificable | Vulcano contempla costo, tags y budgets como prácticas, pero el manifiesto y el validador no exigen presupuesto, moneda, owner, umbrales, alertas ni estimación de costos. Se cierra cuando exista un perfil FinOps estructurado y `validate-vulcano.mjs` compruebe su completitud y consistencia. |
| Alta | Contrato de nomenclatura cloud | Falta definir en el manifiesto reglas estructuradas de nombres y tags para Azure/AWS. |
| Media | Perfiles para IaC no Terraform | La documentación es neutral, pero el perfil estructurado especializado es de Terraform. |
| Media | Validación Mermaid reproducible | Mermaid CLI es opcional; su ausencia produce un warning. |
| Media | Control automático de frescura de estándares | La revisión de fuentes primarias y benchmarks es manual. |
| Baja | Evidencia remota de plataformas | No lee automáticamente policies, boards, pipelines ni dashboards remotos. |
| Baja | Prueba end-to-end conversacional | Hay tests del validador, no del flujo completo de 26 documentos y reanudación. |

No son defectos de Vulcano: generar artefactos ejecutables corresponde a
`vulcano-bob`, operar sistemas remotos corresponde a `vulcano-operador` y modificar
infraestructura viva exige una autorización explícita fuera de la skill.

### Vulcano-Bob

| Prioridad | Capacidad pendiente | Estado actual |
|---:|---|---|
| Alta | ChatOps directo | `chatops/slack` está `planned`; no existe renderer/operación directa del adaptador. Teams tampoco tiene adaptador ChatOps propio. |
| Alta | GitOps con Azure DevOps | El renderer Azure DevOps rechaza `deployment_model: gitops`. |
| Alta | Validación de nombres Azure/AWS | Falta generar y validar nombres contra el contrato de Vulcano y las reglas del proveedor antes de construir el plan. |
| Media | Topología por componente en GitHub/GitLab | `per_component` solo está implementado para Azure DevOps. |
| Media | Herramientas IaC adicionales | No hay adaptadores de OpenTofu, Pulumi, Bicep, CloudFormation u otros. |
| Media | Swap de deploy GitOps en GitHub Actions/GitLab | Ver [Bug conocido](#brecha-pendiente-conocida-bug-de-gitops-en-los-renderers-de-pipeline) arriba. |
| Baja | Registro automático de artefactos condicionales | `pipeline-dora`, `gitops-manifests` y el setup Azure DevOps aún requieren pasos manuales de registro o bookkeeping. |

La ejecución remota, los approvals y Terraform apply son límites intencionales, no
pendientes de Bob.

### Vulcano-Operador

| Prioridad | Capacidad pendiente | Estado actual |
|---:|---|---|
| Alta | Adaptador operativo ArgoCD | `gitops/argocd` está `planned`; faltan routing MCP, sanitización, pruebas y reconcile/sync seguros. Bob sí genera los manifiestos locales (ver la resolución de este caso en [Extensión y gobierno](./06-extension-y-gobierno.md#resolución-del-adaptador-argocd)). |
| Alta | Adaptador ChatOps Slack | `chatops/slack` está `planned`; `post_notification` no se puede operar todavía. |
| Alta | Cobertura MCP de Azure DevOps | El MCP oficial no expone Environments/approvals, Variable Groups, Branch Policies ni tags; esas acciones quedan como pasos manuales o `missing_capability`. |
| Alta | Preflight de nombres cloud | Falta comprobar en solo lectura la disponibilidad y el estado del nombre antes de autorizar una mutación; si falla, debe bloquearse antes de operar. |
| Media | ChatOps Teams | No existe descriptor operacional de Teams aunque un pipeline generado pueda notificar mediante webhook configurado. |
| Media | Verificación integral de despliegues GitOps | No puede cerrar el ciclo repositorio → controlador → workload hasta implementar el adaptador ArgoCD. |
| Baja | Reporte de cierre independiente | El estado está en `operations-manifest.yaml`; no existe un índice/informe sanitizado separado equivalente al índice de Bob. |

No aprobar producción, aplicar Terraform ni crear infraestructura por MCP son límites de
seguridad intencionales, no capacidades pendientes.

## Consideraciones para el contrato FinOps futuro

La responsabilidad debe conservar las fronteras del ecosistema:

| Componente | Responsabilidad FinOps futura | Consideraciones |
|---|---|---|
| Vulcano | Definir el contrato. | Debe acordar presupuesto, moneda, scope, owner, tags de asignación, umbrales, tratamiento de incrementos y criterio de excepción. No debe asumir una herramienta ni un valor financiero. |
| Vulcano-Bob | Materializar y validar el control. | Debe generar una etapa `cost` en el pipeline de IaC —por ejemplo, mediante Infracost si esa herramienta fue aprobada—, calcular el impacto desde el plan, publicar el reporte y validar su ejecución. El renderer no debe inventar thresholds ni bloquear cambios hasta que Vulcano los haya definido. |
| Vulcano-Operador | Observar el resultado financiero. | Debe consultar costos reales, budgets, anomalías y cumplimiento de tags mediante adaptadores cloud en modo de solo lectura. La evidencia debe ser sanitizada y no debe habilitar creación, modificación o eliminación de budgets o recursos sin una capacidad y autorización distintas. |

El flujo esperado es: Vulcano define la política; Vulcano-Bob incorpora el gate de
costo; Vulcano-Operador reconcilia y verifica la información financiera. Un
incumplimiento observado vuelve a Vulcano si exige cambiar la política, o a Vulcano-Bob
si el problema está en el gate o artefacto generado.
