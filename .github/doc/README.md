# Documentación de skills y agentes

Este directorio documenta la implementación local de `.claude/` y su forma de colaboración. La reconciliación vigente se realizó el **27 de octubre de 2026** contra los archivos existentes en `.claude/skills/` y `.claude/agents/`.

## Fuente de verdad

Cuando exista una diferencia, aplique esta precedencia:

1. el `SKILL.md` de la skill instalada;
2. el archivo top-level `.claude/agents/*.agent.md` del agente instalado;
3. schemas, referencias, scripts y plantillas que acompañan la implementación;
4. esta documentación;
5. ejemplos o artefactos históricos de un proyecto.

La documentación no convierte una capacidad propuesta en implementada. Los drifts detectados se describen explícitamente hasta que se corrija el código correspondiente.

## Inventario reconciliado

| Tipo | Cantidad | Fuente |
|---|---:|---|
| Directorios de skills | 30 | [Catálogo de skills](./catalogo-skills.md) |
| Agentes top-level | 15 | [Catálogo de agentes](./catalogo-agentes.md) |
| Agentes de entrada directa | 9 | `archi`, `builder`, `iris`, `sofia`, `storming`, `takumi` y las tres etapas de Vulcano |
| Coordinador adicional de Vulcano | 1 | `vulcano-orchestrator`; no incluye al operador remoto |
| Agentes de la célula Solution Baseline | 5 | Orquestador, mapper, curator, worker y validator |
| Skills con agente top-level asociado | 10 | Nueve skills directas más `solution-baseline` |
| Skills de la familia QA registradas en el contrato común | 8 | `ranger` y siete especialistas `qa-ranger-*` |
| Áreas con documentación detallada | 8 | `archi`, `builder`, `iris`, `ranger`, `solution-baseline`, `storming`, `takumi` y familia `vulcano`; `builder`, `code-review` y `ranger` tienen además una guía rápida en su carpeta |

Las skills no cubiertas por una guía propia se encuentran documentadas en el catálogo general. Esto evita copiar contratos extensos que ya viven en su `SKILL.md` y reduce el riesgo de drift.

## Navegación

- [Catálogo de skills](./catalogo-skills.md): propósito, nombre canónico, cobertura y estado de integración.
- [Catálogo de agentes](./catalogo-agentes.md): agentes realmente instalados y sus responsabilidades.
- [Matriz de enrutamiento y handoffs](./matriz-enrutamiento-y-handoffs.md): secuencias recomendadas y límites de ownership.
- [Orquestador general retirado](./orquestador-retirado.md): historia Git, estado actual, impacto y alternativas de gobierno.
- [Archi](./archi/README.md): arquitectura de solución y gate de preparación del dominio.
- [Builder](./builder/README.md): implementación de cambios de aplicación con SDD proporcional y evidencia ([guía rápida](../skills/builder/README.md)).
- [code-review](../skills/code-review/README.md): revisión de cambios con evidencia, severidades y veredicto.
- [Iris](./iris/README.md): arquitectura de UX y diseño trazable.
- [Solution Baseline](./solution-baseline/README.md): materialización reproducible, arquetipos y coordinación multi-repositorio.
- [Storming](./storming/README.md): descubrimiento y modelado de dominio mediante EventStorming.
- [Takumi](./takumi/README.md): diseño y mejora de procesos de negocio, agente dedicado y límites con Storming.
- [Vulcano](./vulcano/README.md): diseño DevOps/IaC, generación local y operación remota.
- [Ranger y especialistas QA](./ranger/README.md): responsabilidades, contratos y herramientas; [comprobaciones QA](./ranger/validacion.md); [guía rápida](../skills/ranger/README.md).

## Dos significados distintos de “agente”

- Un archivo `.claude/agents/*.agent.md` define un agente ejecutable o coordinador top-level.
- Un archivo `.claude/skills/<skill>/agents/openai.yaml` contiene metadata de interfaz para exponer una skill; por sí solo no crea un agente top-level.

Por ello, una skill puede estar completa y ser invocable directamente aunque no tenga un agente dedicado. `archi`, `builder`, `iris`, `sofia`, `storming` y `takumi` cuentan con agentes de entrada directa. La familia Vulcano separa definición, generación local y operación remota, y dispone de un orquestador que solo coordina las dos primeras fases. `solution-baseline` mantiene una célula con orquestador y especialistas internos.

## Estado de coordinación

- `.claude/agents/orquestador.agent.md` no existe en este repositorio. Su historia, heredada del repositorio de origen, está en [Orquestador general retirado](./orquestador-retirado.md).
- No existe actualmente un router general que seleccione todas las skills. Deben invocarse directamente o mediante un agente especializado realmente instalado.
- `solution-baseline-orchestrator` permanece instalado y solo coordina el dominio de `solution-baseline`; no reemplaza al router general.
- Los agentes `archi`, `storming` y `takumi` no invocan automáticamente el siguiente paso. `vulcano-orchestrator` puede encadenar únicamente `vulcano` y `vulcano-bob` después de validar el gate.
- `vulcano-operador` solo admite invocación humana y autorización explícita por acción remota.
- El directorio `cupido` publica la skill con el nombre canónico `effort-estimator`.
- La carpeta `executive-routing` publica la skill con el nombre canónico `sofia`.
- `genesis` fue retirado en el commit `93e9800`; el bootstrap greenfield se hace con `solution-baseline` en modo `create`.

El detalle verificable está en [Orquestador general retirado](./orquestador-retirado.md).

## Evidencia de esta reconciliación

Comprobaciones ejecutadas el 27 de octubre de 2026:

| Comprobación | Resultado |
|---|---:|
| Skills presentes e inventariadas | 30/30 |
| Agentes top-level presentes e inventariados | 15/15 |
| Frontmatter y capacidades válidos (`node test/validate-skill-catalog.mjs`) | 30/30 |
| Pruebas Node del kit (`node --test`) | 325/325 |
| Pruebas de scripts de `builder` (`python -m unittest`) | 71 OK, 15 omitidas por falta de Go, Java o Angular |
| Pruebas de scripts de `code-review` (`python -m unittest`) | 26/26 |
| Enlaces Markdown relativos rotos en `.claude/doc` | 0 |

La evidencia de Vulcano se conserva en [Validación y estado](./vulcano/07-validacion-y-estado.md) y la de la familia QA en [comprobaciones QA](./ranger/validacion.md); no se volvieron a ejecutar en esta reconciliación.

Hay tres excepciones estructurales: `effort-estimator` (carpeta `cupido`), `epicureo` y `specter` declaran la clave top-level `compatibility`, que el validador de `skill-creator` no admite. Es una deuda de empaquetado preexistente; no invalida su lógica funcional, pero impide declararlas conformes con el contrato de skill vigente.

## Mantenimiento

Al agregar, renombrar o retirar una skill o agente:

1. actualice primero su implementación;
2. actualice el catálogo y la matriz de handoffs;
3. revise los documentos especializados afectados;
4. compruebe enlaces relativos y ejemplos de invocación;
5. registre evidencia de tests solo si se ejecutaron realmente.
