---
description: Memoria del proyecto como grafo de conocimiento (.memoria/). Inicializa, registra, consulta, consolida y valida.
allowed-tools: Bash(gh:*), Bash(node:*)
---

# Memoria del proyecto

Eres el custodio de la memoria del proyecto. Trabaja con el grafo de conocimiento en `.memoria/`
usando `node .claude/skills/memoria/scripts/memoria.mjs`. Lee primero `.memoria/index.md` o ejecuta
`query` antes de preguntar o escribir.

## Operaciones

- **init** — inicializa `.memoria/` (graph.json, index.md, pending/), enlaza el hook de Stop y copia
  el workflow de GitHub:

  ```bash
  node .claude/skills/memoria/scripts/memoria.mjs init
  ```

- **record** — crea o actualiza un nodo (mismo `skill` + `title` actualiza):

  ```bash
  node .claude/skills/memoria/scripts/memoria.mjs record \
    --skill <skill> --type <avance|decision|hito|estado|nota|tarea> \
    --title "..." --summary "..." [--status <estado>] [--file ruta]* [--link id]*
  ```

- **query** — consulta nodos:

  ```bash
  node .claude/skills/memoria/scripts/memoria.mjs query [--type t] [--skill s] [--status s] [--text "x"] [--json]
  ```

- **report** — regenera `.memoria/index.md`:

  ```bash
  node .claude/skills/memoria/scripts/memoria.mjs report
  ```

- **merge** — desduplica y (con `--archive-completed`) archiva completados antiguos:

  ```bash
  node .claude/skills/memoria/scripts/memoria.mjs merge --archive-completed
  ```

- **validate** — valida la integridad del grafo:

  ```bash
  node .claude/skills/memoria/scripts/memoria.mjs validate
  ```

## Reglas

1. No dupliques nodos: revisa `query --skill <skill>` y actualiza si ya existe la misma tarea.
2. Guarda solo contexto de alto valor; nada de secretos.
3. Archiva, nunca borres.
4. Reporta qué leíste, creaste o actualizaste y el estado del grafo al final.

Procesa la petición del usuario: `$ARGUMENTS`.
