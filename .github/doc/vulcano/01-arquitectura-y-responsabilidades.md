# Arquitectura y responsabilidades

## Modelo de tres componentes

Vulcano separa el diseño, la materialización local y la operación remota en tres skills
independientes que se transfieren el control mediante manifiestos, nunca por supuestos:

| Componente | Responsabilidad | Entrada principal | Salida principal |
|---|---|---|---|
| Vulcano | Descubrir, diseñar y documentar DevSecOps, IaC y observabilidad. | Arquitectura, código, restricciones y decisiones del arquitecto. | Documentos técnicos y `resources/.vulcano/manifest.yaml`. |
| Vulcano-Bob | Materializar y validar localmente el diseño aprobado. | Manifiesto y documentos de Vulcano. | IaC, pipelines y `resources/.vulcano/bob-manifest.yaml`. |
| Vulcano-Operador | Reconciliar, autorizar, operar y verificar cambios remotos. | Cierre estricto de Vulcano-Bob, adaptadores y estado remoto. | `resources/.vulcano/operations-manifest.yaml` y evidencia sanitizada. |

En una frase:

```text
Vulcano decide → Vulcano-Bob construye → Vulcano-Operador aplica y verifica.
```

Regla de retorno:

- Si está mal la decisión o el diseño, vuelve a **Vulcano**.
- Si está mal el archivo generado, vuelve a **Vulcano-Bob**.
- Si el resultado remoto es incierto, **Vulcano-Operador** vuelve a observar antes de intentar otra acción.

El diagrama del flujo completo está en [Flujo de referencia del README](./README.md#flujo-de-referencia) y su versión detallada, con cada bifurcación, en [Agentes y paralelismo](./04-agentes-y-paralelismo.md).

## Responsabilidades por componente

### Vulcano

Actúa como un arquitecto DevOps/SRE senior: analiza arquitectura, documentación y
evidencia real del repositorio para diseñar una estrategia verificable.

**Qué hace:**

- Diseña desde cero DevOps, IaC u observabilidad.
- Documenta una implementación existente a partir del código real.
- Compara AS-IS y TO-BE y construye un roadmap incremental.
- Moderniza prácticas de entrega, seguridad, infraestructura u operación.
- Evalúa madurez DevSecOps con evidencia.
- Reanuda una sesión sin perder decisiones, supuestos u omisiones.

**Qué NO hace:**

- No ejecuta pipelines, aplica IaC ni cambia infraestructura viva.
- No genera código de infraestructura (eso es Vulcano-Bob).
- No responde dudas aisladas de sintaxis.
- Si no existe arquitectura ni código suficiente para determinar stack y servicios, la
  arquitectura debe definirse primero con `archi`.

**Alcance técnico documentado:** plataformas CI/CD (Azure DevOps, GitHub, GitLab, sujetas
a confirmación), Terraform con perfil especializado (evaluación conceptual de OpenTofu y
otras opciones IaC), calidad/deuda técnica/SAST/SCA/DAST/IAST, OIDC/workload identity,
least privilege, pinning, SBOM, firma y provenance, rolling/canary/blue-green,
push-pipeline y GitOps, estado remoto/locking/backup/restore/drift/policy as
code/FinOps/lifecycle de IaC, métricas/logs/trazas/RUM/sintéticos/OpenTelemetry/W3C Trace
Context, RED/USE, SLI/SLO, error budgets, alertas, runbooks, incidentes, RTO/RPO,
restore tests y las cinco métricas DORA vigentes.

### Vulcano-Bob

Es el generador local del ecosistema. Convierte el diseño aprobado por Vulcano en
artefactos ejecutables de IaC y CI/CD, preservando la trazabilidad entre documentos,
contratos, archivos físicos y validaciones.

Distingue tres niveles:

| Nivel | Significado |
|---|---|
| Definido | Los documentos fuente de Vulcano existen o fueron omitidos con una razón válida. |
| Implementable | Las decisiones, adaptadores, inputs, outputs y dependencias no son ambiguos, incompatibles ni cíclicos. |
| Generado | Los archivos existen, coinciden con sus fuentes y superaron validaciones locales reales. |

**Qué hace:**

- Materializa una definición Vulcano como Terraform, módulos, ambientes o pipelines.
- Continúa una generación local previa desde `bob-manifest.yaml`.
- Reconcilia artefactos existentes con documentos de diseño actualizados.
- Genera pipelines de aplicación, IaC, drift o recolección DORA.
- Genera manifiestos GitOps locales cuando la combinación es compatible.
- Valida estática y semánticamente artefactos antes de una operación remota.
- Cierra el segundo paso del flujo `vulcano → vulcano-bob → vulcano-operador`.

**Qué NO hace:**

- No redefine herramientas, versiones, módulos, SKUs o topologías aprobadas.
- No ejecuta `terraform plan/apply`, despliegues, logins ni llamadas remotas.
- No crea Service Connections, Environments, approvals, variables ni registros de pipelines.
- No importa recursos ni muta Terraform state.
- No genera mediante un adaptador `planned` o incompatible.

Bob no decide arquitectura ni opera sistemas remotos: las contradicciones vuelven a
Vulcano y las acciones remotas se delegan a Vulcano-Operador después del cierre estricto.

### Vulcano-Operador

Ejecuta el tramo remoto del ecosistema. Reconcilia el estado observado de una
plataforma, propone cambios mínimos, exige autorización humana por acción, ejecuta una
única operación mediante el MCP seleccionado y verifica posteriormente el resultado.

Su ciclo obligatorio es:

```text
reconcile → plan → authorize → operate → verify
```

**Qué hace** (cuando Bob ya cerró estrictamente):

- Observa repositorios, pipelines/workflows, environments, variables, políticas o runs remotos.
- Compara un artefacto Bob con el objeto actualmente registrado en una plataforma.
- Registra o actualiza un pipeline soportado.
- Crea/configura objetos permitidos por el adaptador y disponibles por MCP.
- Ejecuta, cancela, promueve o hace rollback de pipelines/releases permitidos.
- Verifica configuración no secreta o salud posterior mediante un MCP cloud de solo lectura.
- Conserva autorización y evidencia sanitizada de cada acción.

**Qué NO hace:**

- No aplica Terraform ni crea por MCP recursos administrados por IaC.
- No persiste credenciales.
- No aprueba producción, salta ambientes ni opera adaptadores `planned`.

La disponibilidad técnica de un adaptador nunca equivale a permiso para mutar. El
operador mantiene separados plataforma CI/CD, proveedor cloud, GitOps y ChatOps, y nunca
sustituye a Terraform para crear infraestructura.

## Reglas esenciales

- Vulcano decide; Vulcano-Bob no redecide arquitectura.
- Vulcano-Bob genera localmente; no interpreta generación como autorización remota.
- Vulcano-Operador lee por defecto y solo muta después de una autorización específica.
- Una autorización corresponde a una sola acción y alcance.
- Vulcano-Operador nunca aplica Terraform ni crea por MCP recursos administrados por IaC.
- Un conflicto vuelve al componente que posee la decisión o artefacto.
- Cada transferencia se realiza mediante manifiestos y hashes, no mediante supuestos.
