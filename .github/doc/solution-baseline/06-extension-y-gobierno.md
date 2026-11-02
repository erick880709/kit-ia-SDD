# Extensión y gobierno

## Agregar un adaptador

El registro vive en [adapters/registry.json](../../skills/solution-baseline/adapters/registry.json) y se valida con [adapter-registry.schema.json](../../skills/solution-baseline/assets/schemas/adapter-registry.schema.json).

Un adaptador declara:

- ID estable;
- workloads soportados;
- owner;
- detectores por archivos, dependencias o contenido;
- motores nativos posibles;
- validaciones y condiciones de ejecución.

Procedimiento:

1. Confirmar que ningún adaptador actual cubre el stack.
2. Consultar documentación oficial del framework/generador.
3. Definir detectores específicos que no produzcan coincidencias accidentales.
4. Fijar motores soportados y política de versiones exactas.
5. Definir instalación, lint, types, build, test y smoke adecuados.
6. Agregar casos contractuales positivos y negativos.
7. Validar el registro completo.
8. Documentar owner y soporte.

Un adaptador no debe incrustar credenciales, invadir rutas DevOps/IaC ni introducir un gestor de paquetes por preferencia personal.

## Adaptadores iniciales

| ID | Workloads | Motores registrados |
|---|---|---|
| `react-vite` | Web | Nx, npm create Vite, Copier |
| `nextjs` | Web | create-next-app, Nx, Copier |
| `nestjs` | API, Worker, Integrations | Nest CLI, Nx, Copier |
| `fastapi` | API, Integrations | Copier, Cookiecutter |
| `python-worker` | Worker | Copier, Cookiecutter |
| `python-agent-service` | Agent | Copier, Cookiecutter |
| `dotnet-api` | API, Worker, Integrations | dotnet new |
| `spring-boot` | API, Worker, Integrations | Initializr, Maven/Gradle, Copier |

El registro indica compatibilidad de coordinación; no significa que ya exista un arquetipo corporativo publicado para cada combinación.

## Crear una familia de arquetipo

Los arquetipos viven en un repositorio o workspace de catálogo separado del skill y de sus instancias. Cada versión debe declarar:

- familia, versión semántica, owner y estado;
- fuente y licencia;
- digest o commit inmutable;
- motor y versión exacta;
- compatibilidad de runtimes/frameworks;
- inputs tipados;
- capabilities y restricciones;
- permisos y hooks;
- exclusiones;
- migraciones soportadas.

### Gate de publicación

Antes de publicar:

1. Validar descriptor y schemas.
2. Generar al menos dos golden projects con nombres y parámetros distintos.
3. Instalar, compilar, probar y arrancar/smoke-testear los resultados.
4. Repetir con las mismas entradas y comparar salida normalizada.
5. Probar parámetros inválidos e incompatibilidades.
6. Probar combinaciones pairwise relevantes.
7. Probar upgrades desde versiones soportadas.
8. Verificar ausencia de secretos, datos del proyecto origen y artefactos de Vulcano.
9. Verificar que hooks deshabilitados no se ejecutan.
10. Obtener aprobación del owner y publicar de forma inmutable.

## Capabilities y overlays

Una capability agrega un comportamiento reusable con inputs, compatibilidad, ownership y pruebas. Un overlay adapta una baseline dentro de límites declarados.

Prefiera pocas familias base y capabilities componibles. Cree una nueva familia cuando cambie de manera fundamental el runtime, framework o estilo estructural, no por cada combinación de opciones.

## Versionamiento y upgrades

- Patch: corrección compatible sin cambiar inputs ni ownership de forma incompatible.
- Minor: capability compatible o ampliación de comportamiento con migración cuando aplique.
- Major: ruptura de contrato, estructura, inputs u ownership.

Una versión nueva no actualiza automáticamente instancias. Debe publicarse una ruta de upgrade con precondiciones, transformaciones, validación posterior y estrategia de recuperación.

## Seguridad y supply chain

- Permitir únicamente fuentes oficiales o aprobadas.
- Registrar licencia y procedencia.
- Fijar digest/commit y verificar integridad.
- Mantener hooks y red deshabilitados por defecto.
- Revisar scripts de post-install y tareas del generador.
- No almacenar secretos en blueprint, manifest, catálogo o receipt.
- Renderizar material no confiable en un workspace aislado.
- Solicitar autorización por cada clase de efecto externo.

## Genesis

Genesis fue un alias temporal hacia `solution-baseline --mode create`. Su conocimiento canónico fue absorbido por `solution-baseline` y la carpeta `.claude/skills/genesis` se retiró en el commit `93e9800`. Para un bootstrap greenfield use `solution-baseline` en modo `create`.

El gate de retiro exigía simultáneamente:

- matriz contractual válida;
- arquetipos requeridos publicados;
- al menos dos proyectos/equipos exitosos;
- evidencia registrada por adopción;
- ausencia de automatizaciones dependientes del comportamiento anterior.

El estado se conserva en [genesis-greenfield-equivalence.yaml](../../skills/solution-baseline/assets/evaluations/genesis-greenfield-equivalence.yaml).

## Distribución organizacional

Cuando la capacidad se comparta entre múltiples proyectos, el skill y sus adaptadores de agentes se empaquetan desde la fuente canónica con `scripts/sync_plugin.py`. El plugin local vive en `plugins/solution-baseline`; `--check` debe pasar antes de distribuirlo. No existe marketplace ni publicación implícita. El catálogo debe mantenerse como producto independiente, con owners por namespace, política de precedencia, soporte, deprecación y métricas de adopción.

Las métricas recomendadas incluyen tiempo hasta desarrollo, reuso por familia, fallos por fase, reintentos, drift, conflictos, upgrades exitosos y preservación brownfield.
