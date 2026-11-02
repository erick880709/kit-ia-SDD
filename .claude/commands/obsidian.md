---
description: Puente a Obsidian: MCP, notas con wikilinks, JSON Canvas y exportación de .memoria/ como grafo visual.
allowed-tools: Bash(node:*), Bash(claude mcp:*)
---

# Obsidian — vault y grafo visual del proyecto

Conecta el kit con Obsidian. **Siempre** verifica o configura el MCP de Obsidian antes de operar
sobre un vault; la guía canónica está en
`.claude/skills/obsidian/references/mcp-configuracion.md`. Solo pídele al usuario la API key del
plugin Local REST API (host `127.0.0.1`, puerto `27124` por defecto); nunca inventes credenciales.

## Operaciones

- **Exportar la memoria como vault + grafo visual** (determinista, sin proveedor de IA):

  ```bash
  node .claude/skills/obsidian/scripts/obsidian.mjs export [--root <proyecto>] [--out <carpeta-vault>]
  ```

  Genera `Inicio.md`, `notas/<id>.md` por nodo y `Memoria.canvas`. Guía al usuario: abrir la
  carpeta como vault en Obsidian y activar la vista de grafo.

- **Validar un JSON Canvas**:

  ```bash
  node .claude/skills/obsidian/scripts/obsidian.mjs validate-canvas <archivo.canvas>
  ```

- **Crear/editar notas** con Obsidian Flavored Markdown (wikilinks, embeds, callouts, properties):
  sigue `.claude/skills/obsidian/references/obsidian-markdown.md`.

- **Crear/editar un `.canvas`**: sigue `.claude/skills/obsidian/references/json-canvas.md` y valida
  antes de entregar.

## Reglas

1. Nunca leas/escribas un vault abierto por vías que no sean el MCP o el CLI oficial.
2. `memoria` es la dueña del grafo; esta skill solo lo proyecta. No inventes nodos de memoria aquí.
3. `graphify` (si está disponible) enriquece; el `export` de esta skill es la salida determinista.
4. Nada de secretos en archivos versionados.
5. Al terminar, registra el avance con el payload mínimo
   `{ "skill": "obsidian", "type": "avance", "title": "...", "summary": "..." }` vía
   `node .claude/skills/memoria/scripts/memoria.mjs record`.

Procesa la petición del usuario: `$ARGUMENTS`.
