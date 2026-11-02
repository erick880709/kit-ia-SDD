# Carpetas por proveedor de IA

> **Estado actual (27 de octubre de 2026).** En este repositorio solo existe `.claude/`
> (28 skills y 15 agentes). El generador `scripts_agents/sync_agent_adapters.py` y las
> carpetas generadas `.codex/`, `.agents/` y `.github/` **no están presentes**, y
> `.claude/instructions/` tampoco. Este documento conserva el diseño de esos
> adaptadores como referencia para regenerarlos; no describe archivos instalados.
> Mientras tanto, GitHub Copilot puede descubrir las skills directamente desde
> `.claude/skills/` (ruta legacy oficial), y los agentes declaran `providers:` en su
> frontmatter para cuando se restituya el generador.

El diseño expone los agentes y skills de `.claude/` en dos
runtimes adicionales: **OpenAI Codex CLI** y **GitHub Copilot**. `.claude/` es
la única carpeta editada a mano; `.codex/`, `.github/` y `.agents/` son
**generadas** por `scripts_agents/sync_agent_adapters.py` a partir de ella — nunca se
editan directamente.

Kiro y los paquetes de `plugins/` (marketplace) quedaron **fuera de alcance**
por decisión explícita: se evaluaron y son técnicamente viables con el mismo
enfoque, pero hoy el script no los genera y esas carpetas no existen en el
repo. Ver [Fuera de alcance](#fuera-de-alcance-hoy) al final.

## Resumen

| Carpeta | Proveedor / runtime | Formato de archivo | Rol |
|---|---|---|---|
| `.claude/` | Claude Code (Anthropic) | `SKILL.md`, `*.agent.md` (frontmatter YAML) | **Fuente canónica**, única editada a mano |
| `.codex/` | OpenAI Codex CLI | `agents/*.toml` | Generada por `sync_agent_adapters.py` |
| `.agents/` | Convención de descubrimiento de Codex CLI | `skills/<skill>/SKILL.md` | Generada por `sync_agent_adapters.py`, un wrapper por cada una de las 26 skills |
| `.github/` | GitHub Copilot — Custom Agents | `agents/*.agent.md` (frontmatter YAML) | Generada por `sync_agent_adapters.py` |

## Detalle por carpeta

### `.claude/`
Fuente de verdad. `.claude/skills/<skill>/SKILL.md` contiene el contrato
canónico de cada una de las 26 skills; `.claude/agents/<agente>.agent.md` es
el agente top-level de Claude Code para cada uno de los 13 agentes. Cada
`.agent.md` declara además el campo `providers:` (p. ej.
`providers: [codex, github]`) que le dice al generador para qué runtimes
distribuir ese agente. Un agente sin `providers:` (o con la lista vacía)
solo existe en Claude Code.

### `.codex/`
`.codex/agents/<agente>.toml` — un adaptador por cada agente que declara
`codex` en `providers:`. `developer_instructions` reutiliza **verbatim** el
cuerpo completo del `.agent.md` correspondiente (sin reescrituras
específicas de Codex); solo `name`, `description`, `sandbox_mode` y la marca
de generado son propios del adaptador. `.codex/config.toml` (habilitar
agentes, límite de hilos concurrentes) no lo gestiona este script — tiene su
propio generador en
`sb.configure_codex_concurrency()` (`.claude/skills/solution-baseline/scripts/solution_baseline.py`),
también derivable solo desde `.claude/`.

### `.agents/`
`.agents/skills/<skill>/SKILL.md` — un wrapper corto por **cada una de las
26 skills** de `.claude/skills/`, generado en cuanto al menos un agente pide
`codex`. Es la convención que usa Codex CLI para descubrir skills en la raíz
del repo; el wrapper no repite el contenido, solo remite por ruta relativa a
`.claude/skills/<skill>/SKILL.md` (`../../../.claude/skills/<skill>/SKILL.md`
desde su propia ubicación). Se genera para las 26 skills sin importar si
tienen o no un agente dedicado, porque el objetivo es que cualquier skill sea
utilizable desde Codex.

### `.github/`
GitHub Copilot tiene **dos mecanismos independientes** (documentados en
`.claude/instructions/agent-skills.instructions.md` y
`.claude/instructions/agents.instructions.md`, ambos citando la doc oficial
de GitHub):

- **Agent Skills** (carga automática por `description`, sin selector): lee
  `SKILL.md` en `.github/skills/<n>/` (recomendado) **o en
  `.claude/skills/<n>/`**, declarada explícitamente como ruta "Legacy, for
  backward compatibility". Por esto **las 26 skills ya son descubribles hoy
  sin generar nada**: este mecanismo no necesita `.github/`.
- **Custom Agents** (`.github/agents/<agente>.agent.md`, la persona que
  aparece en el selector de Copilot): sí necesita generación — es lo único
  que produce este script para GitHub. El cuerpo del archivo es el prompt
  literal del agente.

`.codex/agents/<agente>.toml` en cambio no distingue entre skills con o sin
agente: por diseño, solo se genera un Custom Agent para los 13 agentes que
existen en `.claude/agents/`; una skill sin agente dedicado sigue siendo
usable en Copilot solo vía Agent Skills.

## El script generador

`python scripts_agents/sync_agent_adapters.py` (raíz del repo) recorre
`.claude/agents/*.agent.md`, y para cada agente y cada proveedor en su
`providers:` genera el adaptador correspondiente. Reglas clave:

- **Nunca sobrescribe un archivo sin su marca de "generado"** (comentario en
  `.toml`, comentario HTML en `.md`) salvo que se pase `--adopt-all` o
  `--adopt <ruta>` — así una edición manual accidental no se pierde en
  silencio.
- `--check` no escribe nada; reporta diffs y sale con código 1 si hay
  alguno (incluye archivos bloqueados por falta de marca).
- `--agent <nombre>` / `--provider {codex,github}` acotan la ejecución.
- El wrapper de `.agents/skills/` usa el **nombre de carpeta** de la skill
  para todas las rutas, nunca el campo `name:` de su frontmatter — la
  carpeta `cupido` declara `name: effort-estimator`, y el wrapper vive en
  `.agents/skills/cupido/` enlazando a `.claude/skills/cupido/SKILL.md`
  (usar el nombre declarado habría generado un enlace roto).

### Casos borde que el script maneja explícitamente

- **Agente sin `tools:` declaradas** (p. ej. `vulcano-operador`): en Claude
  Code, omitir `tools:` significa "todas las herramientas". El generador
  omite también el campo en el `.agent.md` de GitHub — escribir `tools: []`
  habría significado lo contrario ("ninguna herramienta") en el spec de
  Copilot.
- **Agente sin `skills:` declaradas, o con más de una** (p. ej.
  `vulcano-orchestrator`, que coordina varios agentes sin ser dueño de un
  skill propio): el adaptador de GitHub no fuerza una referencia de skill
  inexistente; reutiliza el cuerpo del agente tal cual.
- **`disable-model-invocation: true`** (p. ej. `vulcano-operador`, que solo
  puede iniciarse por el usuario): se propaga al frontmatter del adaptador
  de GitHub, que soporta el mismo campo con el mismo significado.

## Qué necesita cada proveedor

| Proveedor / mecanismo | Carpeta(s) necesarias | Generado por |
|---|---|---|
| Claude Code | `.claude/` | — (fuente) |
| Codex CLI | `.codex/` + `.agents/` | `scripts_agents/sync_agent_adapters.py` |
| Codex CLI — concurrencia | `.codex/config.toml` | `sb.configure_codex_concurrency()` |
| GitHub Copilot — Agent Skills | ninguna adicional | ya lee `.claude/skills/` (ruta legacy oficial) |
| GitHub Copilot — Custom Agents | `.github/` | `scripts_agents/sync_agent_adapters.py` |

Todas las carpetas generadas dependen de que `.claude/agents/` y
`.claude/skills/` sigan existiendo — no son copias independientes, son
adaptadores que remiten a `.claude/` o reutilizan su contenido verbatim. Esto
se verificó vaciando el repo hasta dejar solo `.claude/` (más el propio
script) y corriendo `sync_agent_adapters.py`: reconstruyó los 52 archivos
(13 `.agent.md` de GitHub, 13 `.toml` de Codex, 26 wrappers de skill) sin
ningún insumo adicional.

## Mantenimiento

```text
python scripts_agents/sync_agent_adapters.py            # generar/actualizar
python scripts_agents/sync_agent_adapters.py --check     # verificar drift, sin escribir
python -m unittest test_agents.test_sync_agent_adapters -v
```

Para sumar un agente nuevo a Codex/GitHub, solo hace falta añadir
`providers: [codex, github]` (o el subconjunto que aplique) a su
`.agent.md` y correr el script — nunca tocar `.codex/` o `.github/` a mano.

## Fuera de alcance hoy

- **Amazon Kiro**: se diseñó y probó una extensión (`.kiro/agents/*.json` +
  wrapper `.kiro/skills/<skill>/SKILL.md`, ya que Kiro no tiene un fallback
  documentado hacia `.claude/skills/` como sí lo tiene GitHub) pero se
  retiró del alcance a pedido explícito — "me basta con codex y github
  copilot". El diseño queda disponible para retomar si se necesita.
- **`plugins/<skill>/` (paquetes de marketplace)**: existían antes con sus
  propios sincronizadores (`install_builder.py`, `sync_plugin.py` por
  skill) y una fuente de metadata adicional (`plugin.json`). Se eliminaron
  del repo junto con `.kiro/` en una limpieza posterior y no se han vuelto a
  generar. Si se necesitan de nuevo, el patrón ya validado es: copia física
  completa del skill + `.agent.md` verbatim + `plugin.json` con fuente única
  bajo `.claude/skills/<skill>/plugin.json`.
