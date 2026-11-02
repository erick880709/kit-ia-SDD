# Guía de uso

## Prerrequisitos

- Arquitectura aprobada o fuentes suficientes para construirla.
- Rutas de los repositorios destino.
- Python 3.11 o superior para el CLI auxiliar.
- PyYAML, jsonschema y referencing en las versiones fijadas por `requirements.txt`.
- Autorización explícita para red, publicación o creación de repositorios remotos cuando aplique.
- Catálogos autorizados y sus políticas de confianza, si ya existen.

Instalación del CLI:

```powershell
python -m pip install -r .claude/skills/solution-baseline/scripts/requirements.txt
```

## Entradas recomendadas

| Entrada | Ejemplo | Obligatoria |
|---|---|---|
| Identificador de solución | `octo-hr` | Sí |
| Fuentes arquitectónicas | `resources/architecture` | Sí |
| Repositorios o zonas destino | `apps/web`, repos API | Sí para materializar |
| Alcance | Web, API, Worker, Agent Service | Sí |
| Contratos | OpenAPI, AsyncAPI, schemas | Cuando existan |
| Catálogos permitidos | Namespace, ruta o URL autorizada | Para reuso |
| Restricciones | Node 24, licencias, topología | Cuando apliquen |
| Permisos | Red, repositorios remotos, publicación | Solo para efectos externos |

## Receta 1: diagnóstico de un repositorio

```powershell
python -B .claude/skills/solution-baseline/scripts/solution_baseline.py inspect --root apps/web
```

El resultado incluye manifiestos, dependencias, scripts, adaptadores candidatos, cantidad de archivos de aplicación, arquitectura visible, receipt y estado Git. `strategy_hint: reconcile` indica presencia de código o manifiestos; no autoriza por sí solo ninguna modificación.

## Receta 2: iniciar artefactos de control

```powershell
python -B .claude/skills/solution-baseline/scripts/solution_baseline.py init `
  --solution-id octo-hr `
  --solution-name "OCTO HR" `
  --architecture-root resources/architecture `
  --output-root resources/.solution-baseline
```

El comando crea un blueprint y un run manifest en estado borrador. Se niega a sobrescribir una salida existente. Después deben completarse fuentes, componentes, versiones exactas, contratos y decisiones.

## Receta 3: greenfield

1. Inspeccionar el destino y confirmar que no tiene código de aplicación.
2. Construir y validar el solution blueprint.
3. Resolver un arquetipo publicado compatible.
4. Si no existe, decidir entre candidato reusable y baseline específica.
5. Fijar motor, runtime, framework, package manager, arquetipo y digest.
6. Renderizar en un workspace temporal.
7. Instalar, compilar, probar y ejecutar el smoke test correspondiente.
8. Revisar el diff y aplicar únicamente lo aprobado.
9. Emitir receipt y handoff.

Las convenciones y plomería se detallan en [greenfield-conventions.md](../../skills/solution-baseline/references/greenfield-conventions.md) y [application-plumbing.md](../../skills/solution-baseline/references/application-plumbing.md).

## Receta 4: reconciliar un frontend o backend existente

1. Tratar el repositorio como evidencia del estado real.
2. Compararlo con arquitectura, contratos y baseline esperada.
3. Clasificar las rutas como `managed`, `extendable`, `project_owned`, `generated_once` o `ignored`.
4. Preservar funcionalidades existentes aunque el roadmap esté desactualizado.
5. Generar un parche mínimo mediante AST, parsers o APIs del framework cuando sea posible.
6. Renderizar y validar fuera del destino.
7. Presentar conflictos y cambios antes de aplicar.
8. Registrar drift aceptado y actualizar el receipt.

En OCTO-HR, `apps/web` es brownfield y debe conservar el Portal del Candidato.

## Receta 5: crear y reutilizar un arquetipo

```text
discover gap
  → decidir reusable vs project-specific
  → construir candidato en workspace de catálogo
  → neutralizar datos del proyecto origen
  → ejecutar golden projects y pruebas negativas
  → aprobar
  → publicar versión inmutable
  → resolver desde catálogo
  → instanciar en proyectos separados
```

Nunca se instancia desde el workspace mutable donde se desarrolla el arquetipo. La publicación debe ocurrir antes de abrir consumidores paralelos.

## Receta 6: multi-repositorio

1. Ejecutar discovery en paralelo porque es de solo lectura.
2. Consolidar un único blueprint.
3. Congelar OpenAPI, AsyncAPI, eventos y schemas compartidos.
4. Construir un DAG con dependencias y barreras.
5. Asignar un worker y un lease por repositorio o zona disjunta.
6. Ejecutar dry-runs paralelos únicamente entre nodos independientes.
7. Centralizar resultados en el run manifest.
8. Validar cada repositorio y luego la integración.
9. Conservar éxitos parciales y reanudar por idempotency key.

## Receta 7: upgrade

Un upgrade requiere receipt previo, versión destino compatible y ruta de migración publicada. Se compara:

- salida conocida de la versión anterior;
- salida esperada de la versión nueva;
- estado actual modificado por el proyecto.

Los conflictos en contenido `project_owned` no se resuelven sobrescribiendo. Se presentan para decisión explícita.

## Resultado esperado

Una ejecución completa entrega:

- blueprint normalizado;
- run manifest con estados y evidencias;
- resolución inmutable de catálogo;
- baseline por repositorio;
- receipt por instancia;
- validaciones locales e integradas;
- decisiones, warnings y bloqueos;
- handoff para Builder/Ranger;
- metadatos de runtime, puertos, health y variables para Vulcano, sin generar sus artefactos.
