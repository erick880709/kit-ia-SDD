# Kit de entrega de software asistido por IA (kit-ia)

Este repositorio es un **kit de skills** que implementa un pipeline de entrega de software:
desde un documento RFP hasta código funcionando. No es una aplicación; `resources/` es el
estado compartido que las skills leen y escriben.

## Fuente canónica de las skills

Las skills viven en **`.claude/skills/`** (fuente única, editada a mano). GitHub Copilot las
descubre automáticamente desde esa ruta; **no** dupliques skills en `.github/skills/`.
Los custom agents de Copilot están en `.github/agents/` y se generan desde `.claude/agents/`.

## Memoria del proyecto

Cada skill registra un nodo de avance en la memoria del proyecto (`.memoria/`) al terminar su
tarea. Al terminar la tuya, deja un nodo:

```bash
node .claude/skills/memoria/scripts/memoria.mjs record \
  --skill <skill> --type avance --title "..." --summary "..." \
  --file <ruta-del-artefacto> [--link <id-del-nodo-previo>]
```

- Tipos de nodo: `avance`, `decision`, `hito`, `estado`, `nota`, `tarea`.
- No dupliques: si ya existe un nodo con el mismo `skill` + `title`, actualízalo.
- Guarda solo contexto de alto valor; nada de secretos.

El workflow `.github/workflows/memoria.yml` valida el grafo en CI. El hook de Stop de Claude
Code consolida los nodos pendientes (`.memoria/pending/`).

## Convenciones

- Todo lo que producen las skills se escribe **en español** (los términos técnicos se mantienen
  en inglés donde es estándar del sector).
- No edites `.github/agents/` a mano: se genera desde `.claude/agents/`.
- Sigue el pipeline documentado en `CLAUDE.md` y en cada `SKILL.md`.
