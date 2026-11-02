# Orquestador general retirado

## Estado actual

`.claude/agents/orquestador.agent.md` no existe en este repositorio ni en su historial Git: el estado correcto es **retirado**. La historia de esta página proviene del repositorio de origen (OCTO_HR), donde el archivo sí estuvo comprometido; los hashes citados abajo pertenecen a ese repositorio.

Esta ausencia no afecta a `solution-baseline-orchestrator`, que es un agente distinto, especializado y todavía instalado.

## Historia Git

`git log --follow -- .claude/agents/orquestador.agent.md` muestra tres versiones comprometidas:

| Commit | Autor y fecha | Cambio |
|---|---|---|
| `b2c6a6c2c4b0ed747d17e22c7fa9363a5fbeafd8` | Steve Xavier Cardenas Ospina, 2026-07-23 12:06:58 -05:00 | Agrega el archivo como parte de la copia de `.claude` desde `kit-ia-poc-bancolombia` |
| `6db7ed6f0dc82df5e7fad8b9a0f386c1771d1a4b` | steve cardenas, 2026-08-03 16:02:31 -05:00 | Amplía Archi e incorpora la ruta histórica de Event Storming |
| `9291c4a945b63567ce8afabc144fd298d90880ed` | steve cardenas, 2026-09-10 11:12:11 -05:00 | Integra Solution Baseline y convierte Genesis en alias |

El primer commit identifica a quien importó el archivo a OCTO_HR, no necesariamente a su autor original, porque el mensaje declara que provino de otro repositorio.

## Estado de la última versión comprometida

Antes de su eliminación, el router combinaba inventario, clasificación, coordinación multi-paso, validación de contratos y fallback. La auditoría de esa última versión encontró:

| Hallazgo histórico | Evidencia |
|---|---:|
| Agentes candidatos declarados | 26 |
| Candidatos resolubles por archivo local | 10 |
| Agentes referenciados sin archivo local | 16 |
| Skills declaradas en el inventario | 19 |
| Skills instaladas | 26 |
| Skills instaladas omitidas | 7 |
| Identificadores adicionales de skill usados en rutas pero inexistentes | 5 |
| Archivo obligatorio `copilot-instructions.md` | Ausente |

Los cinco identificadores de skill inexistentes eran `az-func-scaffold`, `az-func-auth`, `az-func-tests`, `az-func-infra` y `sql-optimization`. El último existe como prompt, no como skill.

El fallback y el reintento dependían de `gpt-5-beast-mode`, uno de los agentes ausentes. Esto hacía que una ruta desconocida y una ruta fallida terminaran en la misma dependencia no resoluble.

## Cambio canónico de Storming

El identificador vigente de la skill es `storming`. `epicureo`, Archi y la documentación usan ese nombre. La última versión comprometida del router todavía conserva el identificador histórico en Git, pero ese contenido no se ejecuta porque el archivo está eliminado. Si se restaura, debe recuperarse ya reconciliado con `storming`, no copiarse sin revisión desde `HEAD`.

“Event Storming” sigue siendo el nombre de la técnica; no es el identificador técnico de la skill.

## Impacto operativo

- No hay selección automática global entre las 28 skills.
- Las skills continúan disponibles por invocación directa y por sus reglas de descubrimiento.
- Los cinco agentes de Solution Baseline conservan su coordinación especializada.
- `vulcano-orchestrator` coordina únicamente `vulcano` y `vulcano-bob`; no sustituye al router general ni puede iniciar operación remota.
- Archi, Storming, Takumi y las tres etapas de Vulcano disponen ahora de agentes top-level de entrada directa; no constituyen un router global.
- Sus handoffs, y los de Epicureo e Iris, deben ser aceptados por el usuario o resueltos por la sesión llamadora; no se ejecutan automáticamente.
- Ningún agente o skill de la versión histórica debe considerarse disponible solo porque aparezca en Git.

## Opciones de decisión

### A. Retiro definitivo

Confirmar la eliminación en Git, conservar la [matriz de handoffs](./matriz-enrutamiento-y-handoffs.md) como guía y usar invocación directa o agentes especializados. Es la opción de menor complejidad si el host ya descubre skills automáticamente.

### B. Reconstrucción gobernada

Restaurar únicamente el propósito de routing, no el archivo histórico completo. El nuevo router debería:

1. descubrir o validar agentes y skills desde archivos existentes;
2. separar agentes, skills y prompts como namespaces distintos;
3. usar nombres canónicos de frontmatter;
4. declarar capacidades externas con proveedor y precondición de instalación;
5. degradar a invocación directa cuando exista la skill pero no un agente dedicado;
6. delegar el workflow a cada `SKILL.md`, sin duplicar contratos extensos;
7. fallar en CI si una ruta, fallback o archivo obligatorio no se puede resolver.

## Gate para cerrar este estado

El estado pendiente termina únicamente cuando ocurra una de estas dos condiciones:

- la eliminación se confirma en un commit y las referencias activas quedan retiradas; o
- se incorpora un router nuevo cuyo inventario y rutas pasen validación automática contra los archivos reales.
