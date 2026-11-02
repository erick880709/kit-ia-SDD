# Catálogo reconciliado de agentes

Inventario de los 16 archivos `.claude/agents/*.agent.md` presentes, incluidos `iris`, `sofia` y `memoria` (entradas directas a sus skills homónimas; `sofia` vive en la carpeta `executive-routing`). Un nombre conservado en Git, documentación o prompts no se considera instalado si su archivo top-level no existe en el working tree.

## Agentes disponibles

| Archivo / identidad efectiva | Responsabilidad | Escritura | Relación con skills |
|---|---|---|---|
| [`archi.agent.md`](../agents/archi.agent.md) / `archi` | Diseñar, documentar o auditar arquitectura con gate de dominio y aprobación humana | Sí, solo artefactos arquitectónicos | `archi` |
| [`architecture-mapper.agent.md`](../agents/architecture-mapper.agent.md) / `architecture-mapper` | Discovery read-only, drift y brechas arquitectónicas para una baseline | No; `permissionMode: plan` | `solution-baseline` |
| [`archetype-curator.agent.md`](../agents/archetype-curator.agent.md) / `archetype-curator` | Crear o evolucionar arquetipos reutilizables gobernados | Sí, en worktree aislado | `solution-baseline` |
| [`repository-baseline-worker.agent.md`](../agents/repository-baseline-worker.agent.md) / `repository-baseline-worker` | Materializar `create`, `reconcile` o `upgrade` en una unidad con lease y ownership | Sí, en worktree aislado | `solution-baseline` |
| [`baseline-validator.agent.md`](../agents/baseline-validator.agent.md) / `baseline-validator` | Validación independiente de contratos, procedencia, calidad y drift | No corrige; valida en worktree | `solution-baseline` |
| [`builder.agent.md`](../agents/builder.agent.md) / `builder` | Implementar, explorar, planificar, depurar o reanudar cambios concretos de aplicación | Sí, dentro del alcance autorizado | `builder` |
| [`iris.agent.md`](../agents/iris.agent.md) / `iris` | Diseñar arquitectura UX y entregar el sistema de diseño del proyecto listo para construir | Sí, solo artefactos de UX y sistema de diseño | `iris` |
| [`sofia.agent.md`](../agents/sofia.agent.md) / `sofia` | Conversar con criterio ejecutivo, resolver dudas y documentos de apoyo, y derivar al especialista cuando el encargo es un entregable de dominio | Sí, solo documentos de apoyo | `sofia` (carpeta `executive-routing`) |
| [`memoria.agent.md`](../agents/memoria.agent.md) / `memoria` | Mantener la memoria y el contexto del proyecto como grafo de conocimiento en `.memoria/` | Sí, solo `.memoria/` | `memoria` |
| [`solution-baseline-orchestrator.agent.md`](../agents/solution-baseline-orchestrator.agent.md) / `solution-baseline-orchestrator` | Coordinar discovery, DAG, arquetipos, writers, validación y cierre multi-repositorio | Único writer del run manifest | `solution-baseline` |
| [`storming.agent.md`](../agents/storming.agent.md) / `storming` | Facilitar Event Storming y documentar el comportamiento del dominio | Sí, solo artefactos Event Storming | `storming` |
| [`takumi.agent.md`](../agents/takumi.agent.md) / `takumi` | Caracterizar, documentar y mejorar procesos de negocio | Sí, bajo `resources/procesos/` | `takumi` |
| [`vulcano.agent.md`](../agents/vulcano.agent.md) / `vulcano` | Definir la estrategia DevSecOps, IaC y observabilidad | Sí, solo definición documental y manifiesto | `vulcano` |
| [`vulcano-bob.agent.md`](../agents/vulcano-bob.agent.md) / `vulcano-bob` | Materializar y validar IaC y CI/CD local ya definidos | Sí, en worktree aislado; nunca remoto | `vulcano-bob` |
| [`vulcano-orchestrator.agent.md`](../agents/vulcano-orchestrator.agent.md) / `vulcano-orchestrator` | Coordinar definición y generación local, validar gates y preparar el handoff remoto | No escribe directamente; coordina writers | Coordina `vulcano` y `vulcano-bob`; no tiene skill propia |
| [`vulcano-operador.agent.md`](../agents/vulcano-operador.agent.md) / `vulcano-operador` | Reconciliar y ejecutar una operación remota autorizada, con verificación posterior | Evidencia local; remoto solo por acción autorizada | `vulcano-operador` |

## Propuesta materializada: agentes de entrada directa

`archi`, `builder`, `iris`, `sofia`, `storming`, `takumi` y `memoria` son agentes delgados, invocables por el usuario, que cargan una única skill canónica. Añaden una identidad estable, un conjunto mínimo de herramientas y límites de salida; no duplican el proceso de la skill ni coordinan subagentes.

| Agente | Por qué existe | Límite que protege | Handoff típico |
|---|---|---|---|
| `builder` | Da una entrada explícita a la implementación de cambios con SDD y evidencia proporcional. | No redefine arquitectura, crea baselines, diseña estrategia QA ni realiza IaC o despliegue. | `archi`, `solution-baseline`, `ranger` o `vulcano` cuando aparece trabajo fuera de su ownership. |
| `storming` | Da una entrada explícita al descubrimiento de dominio y a su validación con expertos. | No convierte el modelo de dominio en arquitectura, backlog o código. | `archi`, `specter`, `iris` o `ranger`, informado para decisión del usuario. |
| `archi` | Mantiene en una sesión especializada los escenarios A/B/C, DR-01, los artefactos y los gates arquitectónicos. | No ejecuta otras skills, no implementa la solución y no autoaprueba decisiones. | `solution-baseline`, `iris` o `vulcano` después de aprobación. |
| `sofia` | Ofrece un punto de entrada cuando el usuario no sabe con qué especialista empezar. | No ejecuta el trabajo de un dominio especializado ni inventa su alcance. | El agente o la skill dueña del dominio (`archi`, `builder`, `ranger`, `effort-estimator`, `epicureo`…), en voz alta. |
| `memoria` | Da una entrada explícita al custodio del grafo de conocimiento, para registrar avances, decisiones y tareas sin mezclarlos con el código. | No convierte la memoria en arquitectura, backlog ni documentación funcional. | `epicureo`, `specter`, `archi` o `builder` solo cuando el usuario pida trabajar sobre el contenido recordado. |
| `takumi` | Separa procesos organizacionales y evidencia operacional del modelado de software. | No inventa hechos ni transforma automáticamente procesos en bounded contexts o automatizaciones. | `epicureo`, `storming` o `archi` cuando el análisis lo justifica. |

La familia Vulcano usa tres agentes de fase y un orquestador opcional. Las etapas permanecen separadas porque tienen permisos y criterios de entrada incompatibles entre sí:

```text
vulcano-orchestrator
   ├── vulcano             definición documental y decisiones
   ├── vulcano-bob         generación y validación local en worktree
   └── handoff humano
          └── vulcano-operador  acción remota explícitamente autorizada
```

| Agente | Por qué está separado | Permiso máximo |
|---|---|---|
| `vulcano-orchestrator` | Conserva continuidad, reanudación y gates sin absorber las decisiones ni escrituras de las fases. | Invocar `vulcano` y `vulcano-bob`, ejecutar validadores locales y reportar el handoff. |
| `vulcano` | La estrategia debe poder evaluarse sin que documentarla produzca cambios técnicos o remotos. | Documentación y manifiesto de definición. |
| `vulcano-bob` | La implementación local debe conservar el contrato aprobado y poder revisarse antes de operar. | Escritura local aislada y validaciones sin despliegue. |
| `vulcano-operador` | Las mutaciones remotas requieren reconciliación, autorización por acción y evidencia posterior. | Una acción allowlisted dentro del `scope_hash` autorizado; no puede ser invocado como subagente. |

El orquestador automatiza únicamente la transición `vulcano → vulcano-bob` cuando el usuario solicita el flujo completo y el gate anterior está cerrado. Las demás transiciones conservan control humano: terminar `storming` no autoriza `archi`; cerrar `archi` no autoriza materialización; cerrar Bob no autoriza operación remota.

## Célula de Solution Baseline

La única célula multi-writer con ownership, leases y validación independiente implementada hoy es:

```text
solution-baseline-orchestrator
├── architecture-mapper          (descubrimiento, solo lectura)
├── archetype-curator            (catálogo/arquetipo, worktree)
├── repository-baseline-worker   (un repositorio o zona, worktree)
└── baseline-validator           (validación independiente, worktree)
```

El `solution-baseline-orchestrator` mantiene el manifiesto del run; cada writer recibe ownership exclusivo, lease y workspace verificado. La concurrencia solo es válida entre nodos independientes del DAG y dentro de los límites del manifest.

### Por qué existen cinco agentes

La separación no responde a cinco implementaciones diferentes de `solution-baseline`, sino a cinco responsabilidades con permisos distintos. Todos aplican la misma skill como fuente de verdad, pero operan con alcances, permisos de escritura y criterios de salida diferentes. Esto reduce la acumulación de contexto y privilegios, evita que un mismo agente construya y apruebe su propio resultado, y limita el radio de impacto de cada cambio.

| Agente | Por qué está separado | Cuándo se usa |
|---|---|---|
| `solution-baseline-orchestrator` | Conserva la visión global, construye el DAG, asigna ownership y leases, coordina y es el único writer del run manifest. No materializa por sí mismo cada repositorio. | Corridas largas, multi-repositorio, con dependencias entre unidades o que requieren reanudación y conservación de éxitos parciales. |
| `architecture-mapper` | Separa el diagnóstico de la implementación. Al ser read-only, no puede cambiar el sistema para hacer que coincida con su interpretación de la arquitectura. | Al iniciar discovery, determinar el estado real, elegir `create|reconcile|upgrade` o volver a medir drift. |
| `archetype-curator` | Aísla el catálogo reusable de las instancias consumidoras. Evita que datos o decisiones específicas de una solución contaminen un arquetipo organizacional. | Solo cuando el catálogo no contiene un arquetipo apto y la brecha demostrada es generalizable. No participa si la solución es `project-specific`. |
| `repository-baseline-worker` | Limita cada writer a un repositorio o zona con ownership explícito. Permite paralelizar unidades independientes sin compartir archivos ni sobrescribir trabajo ajeno. | Una instancia por unidad de escritura durante `create`, `reconcile` o `upgrade`. |
| `baseline-validator` | Mantiene independencia entre construcción y veredicto. Recalcula evidencia y ejecuta gates sin corregir el código que evalúa. | Después del dry-run/apply y antes de aceptar receipts, cerrar el run o entregar el resultado. |

### Flujo de colaboración

```text
Fuentes arquitectónicas aprobadas
        |
        v
architecture-mapper
        | evidencia confirmada/inferida/pendiente
        v
solution-baseline-orchestrator
        | blueprint, contratos congelados, DAG, ownership y leases
        +--> archetype-curator            (solo si falta un arquetipo reusable)
        +--> repository-baseline-worker   (uno por repositorio o zona)
        `--> baseline-validator           (validación independiente)
                |
                v
       receipts, veredicto y handoffs
```

El orquestador coordina y consolida; el mapper observa; el curator modifica únicamente el catálogo asignado; cada worker modifica una sola unidad; y el validator emite un veredicto sin corregir el resultado. La separación evita acumulación innecesaria de permisos, conflictos de escritura, contaminación entre catálogo y proyectos, y autovalidación.

### Composición según el escenario

| Escenario | Agentes requeridos o recomendados |
|---|---|
| Consulta o tarea pequeña, sin materialización compleja | Invocar `solution-baseline` directamente; no es obligatorio iniciar la célula. |
| Una sola baseline en un repositorio | `architecture-mapper` + `repository-baseline-worker` + `baseline-validator`; el orquestador es opcional si no hay DAG ni reanudación compleja. |
| Varios repositorios o unidades dependientes | `solution-baseline-orchestrator` + mapper + un worker por unidad + validator. |
| Falta un arquetipo y la necesidad es reusable | Agregar `archetype-curator` en un workspace de catálogo aislado. |
| Brecha exclusiva del proyecto | No usar curator; el worker aplica una estrategia `project-specific` dentro de la unidad autorizada. |

Por tanto, los cinco agentes forman el conjunto completo de capacidades, pero no tienen que ejecutarse todos en cada corrida. `archetype-curator` es condicional y el orquestador solo resulta necesario cuando la coordinación supera una operación local sencilla.

## Agentes independientes retirados y necesidad

Las cinco utilidades genéricas importadas están eliminadas del working tree. No forman parte de la célula de `solution-baseline`, no son dependencias de las skills locales y su ausencia no impide materializar una baseline.

| Agente | Necesidad en OCTO-HR | Disposición recomendada |
|---|---|---|
| `accessibility` | Opcional, útil para revisar el Portal del Candidato y superficies web contra WCAG. | Retirado; recuperar solo si se normalizan modelo y tools para el host vigente. |
| `debug` | Opcional; su flujo se solapa con las capacidades normales de diagnóstico y testing. | Retirado; recuperar solo si el equipo usa explícitamente ese modo. |
| `critical-thinking` | Opcional y consultivo; no implementa soluciones. | Retirado; no es prerrequisito de ningún flujo local. |
| `prompt-builder` | Opcional; se justifica si el equipo crea y valida prompts reutilizables con frecuencia. | Retirado; no recuperar junto con `prompt-engineer` sin resolver la duplicidad. |
| `prompt-engineer` | Opcional; se solapa con `prompt-builder` y no declara tools. | Retirado; no es prerrequisito de ninguna skill. |

## Metadata local de una skill

Un archivo como `.claude/skills/storming/agents/openai.yaml` o `.claude/skills/solution-baseline/agents/openai.yaml` configura presentación e invocación de la skill. No sustituye un archivo `.claude/agents/*.agent.md`, no añade aislamiento y no crea por sí solo capacidad de coordinación.

## Orquestador general

`orquestador.agent.md` existió en el repositorio de origen, pero no está en este repositorio. No se incluye entre los agentes disponibles ni se enlaza como archivo local. Consulte [Orquestador general retirado](./orquestador-retirado.md) para conocer su historia, las referencias inválidas que contenía y las opciones de recuperación o retiro definitivo.

## Ausencias de agentes dedicados

No hay agentes top-level dedicados para `ranger` y sus especialistas `qa-ranger-*`, `code-review`, `epicureo`, `specter`, `janus`, `effort-estimator`, `cronos` ni las skills de documentos (`docx`, `pdf`, `pptx`, `xlsx`). Esas skills se ejecutan directamente. Que no tengan agente dedicado no implica que estén incompletas; sí significa que no existe una identidad especializada instalada para ellas.

## Regla operativa

Solo delegue a un agente si el archivo correspondiente está presente y su contrato permite la tarea. En ausencia de router general, seleccione la skill por su `name` canónico y lea su `SKILL.md`; no reconstruya rutas históricas desde Git ni trate prompts como agentes.
