# CLI y operación

El CLI [solution_baseline.py](../../skills/solution-baseline/scripts/solution_baseline.py) proporciona operaciones locales y deterministas. No interpreta por sí solo toda la arquitectura, no ejecuta generadores remotos y no reemplaza al agente orquestador.

## Requisitos

```text
Python >= 3.11
PyYAML == 6.0.3
jsonschema == 4.26.0
referencing == 0.37.0
packaging == 26.2
filelock == 3.29.7
```

Ejecute los comandos desde la raíz del repositorio. `-B` evita crear `__pycache__` durante verificaciones puntuales.

## Comandos

| Comando | Función | Modifica repositorios de aplicación |
|---|---|---:|
| `validate` | Valida YAML/JSON contra schema e invariantes opcionales | No |
| `inspect` | Inventaría un repositorio y propone `strategy_hint` | No |
| `hash` | Calcula hash determinista de un árbol | No |
| `diff` | Compara render esperado y repositorio actual | No |
| `verify-source` | Atesta material local contra un digest inmutable | No |
| `resolve` | Resuelve un requirement contra catálogo y evidencia de fuente | No |
| `evaluate-routing` | Compara observaciones externas con casos esperados | No |
| `init` | Crea blueprint y manifest borrador sin sobrescribir | No |
| `record-step` | Agrega atómicamente un resultado idempotente al manifest | No |
| `audit-scope` | Rechaza rutas de DevOps/IaC/contenedores/despliegue | No |
| `check-drift` | Compara archivos `managed` con los hashes del receipt | No |
| `check-design-conformance` | Verifica que un componente `web`/`library` use el sistema de diseño congelado del blueprint (hashes de tokens/catálogo/assets y literales de estilo bajo el trinquete) | No |
| `verify-genesis-migration` | Histórico: verificaba el alias Genesis, ya retirado (ver la sección del comando) | No |
| `agents install/check` | Instala y verifica definiciones Claude/Codex y límite del runtime | Solo configuración local de agentes |
| `verify-workspace` | Comprueba aislamiento de un worktree frente al checkout principal | No |
| `check-concurrency` | Valida una ola contra límites globales y por recurso | No |
| `lease` | Adquiere, consulta o libera ownership local | Solo archivo de lease |

## `validate`

```powershell
python -B .claude/skills/solution-baseline/scripts/solution_baseline.py validate `
  --kind catalog `
  --file path/to/catalog.yaml `
  --strict
```

Sin `--strict` valida estructura. Con `--strict` comprueba invariantes semánticos soportados, como versiones exactas, digests inmutables, exclusiones obligatorias, DAG acíclico, pasos duplicados y validaciones fallidas.

## `inspect`

```powershell
python -B .claude/skills/solution-baseline/scripts/solution_baseline.py inspect `
  --root apps/web `
  --output evidence/web-inspect.json
```

El archivo de salida no se sobrescribe si ya existe. La inspección ignora dependencias y salidas comunes como `node_modules`, `.venv`, `dist`, `build`, `bin`, `obj` y caches.

## `hash` y `diff`

```powershell
python -B .claude/skills/solution-baseline/scripts/solution_baseline.py hash --root path/to/render

python -B .claude/skills/solution-baseline/scripts/solution_baseline.py diff `
  --expected path/to/render `
  --actual path/to/repository `
  --output evidence/repository-diff.json
```

El diff clasifica adiciones, modificaciones y candidatos a remoción. Una ruta marcada como candidato no autoriza su borrado.

## `verify-source` y `resolve`

Prepare primero la fuente en una caché local mediante un mecanismo autorizado. La verificación no clona, descarga ni ejecuta el material:

```powershell
python -B .claude/skills/solution-baseline/scripts/solution_baseline.py verify-source `
  --archetype-id ps-api-python-fastapi-modular-1.0.0 `
  --source https://catalog.example/archetypes.git `
  --material path/to/verified-cache/archetype `
  --digest sha256:<64-hex> `
  --output evidence/source-verification.yaml
```

```powershell
python -B .claude/skills/solution-baseline/scripts/solution_baseline.py resolve `
  --catalog path/to/catalog.yaml `
  --requirement path/to/archetype-requirement.yaml `
  --verification evidence/source-verification.yaml `
  --output evidence/catalog-resolution.yaml
```

Primero exige que todo el catálogo pase validación estructural y semántica estricta. Recalcula cada atestación y vincula identidad, source y digest; el requirement debe autorizar explícitamente `allowed_namespaces` y `allowed_sources`. Después aplica gates de estado, confianza, licencia, permisos, exclusiones y compatibilidad. `--verification` es repetible. Un resultado sin selección devuelve un código distinto de cero para que el orquestador decida entre composición, creación de arquetipo o baseline específica; no implica por sí solo una brecha de arquitectura.

Los constraints se interpretan según `version_scheme`: SemVer/npm, PEP 440, intervalos Maven/NuGet o comparación genérica. La compatibilidad puede usar rangos, pero la versión aplicada y registrada debe ser exacta.

## `evaluate-routing`

```powershell
python -B .claude/skills/solution-baseline/scripts/solution_baseline.py evaluate-routing `
  --evaluation .claude/skills/solution-baseline/assets/evaluations/skill-routing.yaml `
  --observations evidence/routing-observations.yaml `
  --output evidence/routing-report.json
```

El comando valida observaciones capturadas por una prueba externa y reporta casos faltantes, inesperados o divergentes. No llama a un modelo.

## `init`

```powershell
python -B .claude/skills/solution-baseline/scripts/solution_baseline.py init `
  --solution-id demo `
  --solution-name "Demo" `
  --architecture-root resources/architecture `
  --output-root resources/.solution-baseline
```

Genera un borrador válido estructuralmente y un run ID. No resuelve automáticamente las decisiones arquitectónicas.

## `record-step`

```powershell
python -B .claude/skills/solution-baseline/scripts/solution_baseline.py record-step `
  --manifest resources/.solution-baseline/runs/<run-id>/run-manifest.yaml `
  --result evidence/web-render-result.yaml `
  --run-status rendered
```

Repetir el mismo resultado es idempotente. Usar la misma clave lógica con un input hash distinto produce error.

## `audit-scope`

El archivo de entrada puede ser una lista YAML/JSON, un objeto con `paths` o `changes`, o texto con una ruta por línea.

```powershell
python -B .claude/skills/solution-baseline/scripts/solution_baseline.py audit-scope `
  --changes evidence/changed-paths.yaml
```

Bloquea, entre otros, `.github/workflows`, CircleCI, Bitbucket/GitLab/Azure pipelines, Dockerfile/Containerfile, Compose, Bicep, Pulumi, Terraform, Helm, Kubernetes e `infra/`. La política versionada vive en `assets/policies/scope-boundaries.yaml`.

## Empaquetado portable

```powershell
python -B .claude/skills/solution-baseline/scripts/sync_plugin.py
python -B .claude/skills/solution-baseline/scripts/sync_plugin.py --check
```

El primer comando construye `plugins/solution-baseline` desde la fuente canónica y agrega copias de los adaptadores Claude/Codex. El segundo detecta drift. El plugin no incluye marketplace y no publica nada.

Las instrucciones empaquetadas resuelven `<skill-root>` desde el `SKILL.md` cargado. Ningún comando distribuido depende de que el consumidor tenga `.claude/skills/solution-baseline`.

## `agents`, `verify-workspace` y `check-concurrency`

```powershell
python "<skill-root>/scripts/solution_baseline.py" agents install `
  --project-root <repo> --platform codex claude --configure-runtime

python "<skill-root>/scripts/solution_baseline.py" agents check `
  --project-root <repo> --platform codex claude

python "<skill-root>/scripts/solution_baseline.py" verify-workspace `
  --workspace <worktree> --main-checkout <checkout-principal>

python "<skill-root>/scripts/solution_baseline.py" check-concurrency `
  --assignments <agent-assignments.yaml>
```

La instalación es idempotente cuando los hashes coinciden y falla ante archivos modificados. `verify-workspace` exige por defecto dos worktrees del mismo repositorio. `check-concurrency` evalúa la política versionada y devuelve las violaciones como JSON estructurado.

## `lease`

```powershell
python -B .claude/skills/solution-baseline/scripts/solution_baseline.py lease status `
  --file resources/.solution-baseline/leases/web.json

python -B .claude/skills/solution-baseline/scripts/solution_baseline.py lease release `
  --file resources/.solution-baseline/leases/web.json `
  --owner web-worker
```

Solo el owner puede liberar un lease válido. El archivo debe vivir directamente en un directorio `leases/`; acquire, status y release usan el mismo lock de exclusión mutua y no eliminan documentos malformados.

## `verify-genesis-migration`

> **Histórico.** La carpeta `.claude/skills/genesis` se retiró en el commit `93e9800`, así que este
> comando ya no tiene alias que verificar. Se conserva en el script como registro del gate de retiro.

```powershell
python -B .claude/skills/solution-baseline/scripts/solution_baseline.py verify-genesis-migration `
  --genesis-root .claude/skills/genesis
```

Valida:

- que Genesis sea un alias a `--mode create`;
- que Web, API, Worker y Agent tengan adaptadores y evidencia contractual;
- que se mantengan las exclusiones de Vulcano;
- que el gate de retiro exija publicación y al menos dos adopciones demostradas.

## Códigos de salida

| Código | Significado general |
|---:|---|
| `0` | Operación válida o completada |
| `1` | Validación o auditoría negativa esperada |
| `2` | Sin candidato resuelto, input inválido o error operativo controlado |

Consuma además el JSON de salida; no deduzca el resultado únicamente del texto mostrado.
