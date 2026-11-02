# Extensión y gobierno

## Agregar una guía nueva a `references/`

`archi` no declara un procedimiento formal de extensión (no existe un equivalente a `stack-adapters.md` o a un registro versionado como el de `solution-baseline`). El mecanismo real, inferido de la estructura actual de la skill, es:

1. Crear el archivo Markdown (o JSON, para esquemas) dentro de [references/](../../skills/archi/references/), siguiendo el patrón de nombres existente (`guia-<tema>.md` para guías temáticas, `plantilla-<tema>.md` para plantillas, `<tema>.schema.json`/`esquema-<tema>.json` para contratos de forma).
2. Enlazar la referencia nueva desde `SKILL.md` en el punto del proceso donde aplica (por ejemplo, `references/guia-microfrontends.md` se referenció junto a la evaluación de patrones en `09` y el diseño detallado en `14.xx`).
3. Si la guía introduce un artefacto de salida nuevo, asignarle un número dentro de la numeración canónica `00`-`26` (heredando el prefijo de su documento dueño si es complementaria) — nunca un archivo generado sin número.
4. Si la guía requiere criterios de cierre propios, agregarlos siguiendo el patrón `Cumple` / `Cumple con observaciones` / `No cumple` / `No aplica` que usa el resto de la skill.
5. Documentar el cambio en `release.md` (ver abajo), no crear un changelog paralelo.

No existe automatización que valide que una referencia nueva esté correctamente enlazada desde `SKILL.md`; es responsabilidad manual de quien extiende la skill.

## Qué dice `release.md` sobre versionamiento

`archi` **no tiene una política de versionamiento semántico** (no hay equivalente a los niveles Patch/Minor/Major que usa `solution-baseline`). Lo que existe es un [release.md](../../skills/archi/release.md) que funciona como bitácora de release por rama, con esta estructura real:

- **Encabezado con metadatos de corte:** rama, base comparada (`main` en un commit específico), commit de corte documentado, fecha y estado (por ejemplo, "implementado y validado; la aprobación de arquitecturas generadas continúa siendo humana").
- **Resumen y alcance de la release:** qué transforma la rama, cuántos archivos y líneas cambiaron, cuántos son nuevos frente a actualizados.
- **Cambios de arquitectura de la semana anterior:** tabla de commits directos sobre `resources/architecture/` (no sobre el skill) con fecha, alcance y resultado.
- **Proceso arquitectónico resultante:** tabla de la numeración canónica vigente al momento del corte.
- **Características incorporadas:** lista numerada y detallada de capacidades nuevas por área temática (gobierno, QAW, Well-Architected, alternativas, arquetipo, diseño por contenedor, modelo de datos, tácticas y patrones, Clean Code, cloud/costos, presentación, microfrontends, seguridad).
- **Artefactos nuevos / actualizados:** listas explícitas de qué se creó y qué se modificó, separadas por assets, referencias y scripts.
- **Comportamiento por escenario:** cómo cambia el comportamiento de Caso A/B/C con la release.
- **Reglas de calidad y trazabilidad:** la cadena mínima de trazabilidad (`OBJ-xx → QA/FAS → alternativa → selección → ...`) y las reglas de unicidad de dueño documental.
- **Cambios de compatibilidad y migración:** qué debe migrarse desde versiones anteriores del skill (renumeración, separación de índices maestros, etc.).
- **Validaciones realizadas:** ver [07-validacion-y-estado.md](./07-validacion-y-estado.md) para el detalle.
- **Historial de commits:** tabla con hash, fecha/hora, área y cambio principal.
- **Limitaciones y condiciones:** condiciones operativas permanentes (no brechas), detalladas en [09-evaluacion-y-release-gates.md](./09-evaluacion-y-release-gates.md).

En síntesis: el gobierno de `archi` es documental y por rama (un `release.md` fechado que describe una release completa), no un esquema de versiones incrementales por archivo. `release.md` explícitamente aclara que "documenta la release solicitada; no es una instrucción operativa del skill ni reemplaza `SKILL.md` y sus referencias".

## Seguridad y supply chain de los assets visuales

El único elemento con procedencia y supply chain fijados explícitamente es el catálogo de iconos: `release.md` documenta que fija la versión de draw.io (`31.1.5`) y un commit específico de origen (`3b4210678207f3880888969ee53c9fe4580104ab`), con fuentes AWS4, Azure2 y GCP3. El validador `validate_drawio_catalog.py` rechaza XML comprimido, múltiples páginas, placeholders, bibliotecas legadas, mezcla de proveedor, imágenes sin excepción y divergencias entre `archiIconId` y el estilo — es el único mecanismo de gobierno automatizado que existe sobre un asset de `archi`.

## No hay distribución como plugin ni catálogo separado

A diferencia de `solution-baseline`, no hay evidencia en la skill de un modelo de distribución organizacional (plugin interno, catálogo versionado con owners por namespace, métricas de adopción). `archi` se consume directamente desde `.claude/skills/archi/` en este repositorio.
