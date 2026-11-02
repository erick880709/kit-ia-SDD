# Validación, estado y troubleshooting

## Validación del skill

Desde la raíz del repositorio:

```powershell
python -X utf8 -B .claude/skills/solution-baseline/scripts/test_solution_baseline.py -v

python -B C:/Users/Alejandro/.codex/skills/.system/skill-creator/scripts/quick_validate.py `
  .claude/skills/solution-baseline

python -B C:/Users/Alejandro/.codex/skills/.system/skill-creator/scripts/quick_validate.py `
  .claude/skills/genesis

python -B .claude/skills/solution-baseline/scripts/solution_baseline.py `
  verify-genesis-migration

python -B .claude/skills/solution-baseline/scripts/sync_plugin.py --check
```

La ruta de `quick_validate.py` corresponde al entorno local actual. En otro equipo debe localizarse el validador equivalente o ejecutarse el set contractual del repositorio.

## Cobertura automatizada actual

Las 31 pruebas incluidas cubren:

1. schemas, plantillas y registro incluidos;
2. versiones exactas requeridas en blueprint estricto y rechazo de rangos como versión resuelta;
3. rechazo de digest placeholder en catálogo estricto;
4. inicialización válida y protección contra overwrite;
5. detección de React/Vite como brownfield;
6. hash/diff estable ignorando dependencias;
7. resolución de catálogo con gates de seguridad, atestación local obligatoria y detección de material alterado;
8. constraints SemVer/npm, PEP 440, Maven y NuGet, incluidos caret `0.x`;
9. exclusión mutua mediante leases con lock, ruta restringida y documento validado;
10. registro idempotente de pasos;
11. política versionada y bloqueo case-insensitive de rutas Vulcano, incluida traversal, Bicep, CircleCI, Containerfile, Pulumi y Bitbucket;
12. DAG acíclico, dependencias/barreras conocidas y finalización de nodos;
13. contrato y bloqueo de brechas arquitectónicas abiertas;
14. evaluación de routing contra observaciones, con ruta positiva y divergencia;
15. equivalencia contractual de Genesis para cuatro workloads;
16. bloqueo del retiro de Genesis antes de cumplir adopción.
17. comandos portables sin dependencia del layout `.claude` del consumidor;
18. instalación idempotente y detección de drift en agentes Claude/Codex;
19. configuración Codex preservando contenido existente y rechazando límites incompatibles;
20. verificación real de worktrees Git enlazados;
21. límites de readers/writers y colisiones de ownership por repositorio.

Ejecutado el 10 de septiembre de 2026:

| Comprobación | Resultado |
|---|---|
| Unit/contract tests | 31/31 |
| Validación de `solution-baseline` | Válido |
| Validación de `genesis` | Válido en esa corrida; la skill se retiró después (commit `93e9800`) |
| JSON Schemas | 16 válidos |
| Plugin portable | Manifest válido y 66/66 archivos sincronizados |
| Workloads de equivalencia | Web, API, Worker y Agent válidos contractualmente |
| Gate de retiro de Genesis | No listo |

## Lo que aún debe validarse por arquetipo

Las pruebas del skill no sustituyen:

- golden projects;
- instalación reproducible;
- build y tests del código generado;
- arranque o smoke real;
- repetibilidad de render;
- parámetros inválidos;
- combinaciones pairwise;
- migraciones entre versiones;
- ausencia de secretos y datos del proyecto origen;
- permisos y hooks efectivos.

Estas pruebas se agregan cuando exista cada arquetipo publicado.

## Quality gates de una baseline

Antes de declarar un repositorio `completed` debe existir evidencia de:

- arquitectura y contratos trazados;
- versiones exactas;
- procedencia inmutable;
- dry-run y diff revisados;
- scope audit limpio;
- instalación reproducible;
- lint/types/build/test aplicables;
- smoke o vertical slice mínimo;
- seguridad y secretos revisados;
- receipt actualizado;
- handoff claro.

En multi-repositorio también deben validarse contratos integrados y compatibilidad productor/consumidor.

## Problemas frecuentes

### El CLI propone `reconcile` pero el roadmap dice greenfield

El repositorio real tiene precedencia para determinar la estrategia. Revise manifiestos y archivos detectados. Preserve funcionalidades y registre la inconsistencia documental.

### No se selecciona ningún arquetipo

Revise `candidates[].rejection_reasons`. Las causas comunes son verificación local ausente, licencia, confianza, permisos, exclusiones, runtime, framework o capability incompatible. No relaje gates de seguridad para forzar una selección.

El resolver exige validación estricta del catálogo y una atestación recalculable antes de puntuar. Un digest placeholder o una exclusión obligatoria ausente detiene la resolución completa; una fuente no verificada queda inelegible.

### Falta una decisión arquitectónica

No la complete como preferencia del generador. Cree un `architecture-gap`, registre evidencia y devuelva la decisión a `archi`. La ausencia de un arquetipo no cuenta como brecha si el estado deseado ya está definido.

### Falla la validación estricta del blueprint

Complete versiones resueltas, agregue componentes y cierre decisiones pendientes de alto impacto. `intent: stable` no es una versión efectiva.

### El receipt falla por digest

Use `sha256:<64 hex>` o `git:<40-64 hex>` real. Los placeholders de las plantillas son deliberadamente inválidos en modo estricto.

### Un lease está ocupado

Consulte su owner y expiración. No borre el archivo para evadir ownership. Espere, coordine con el owner o recupere únicamente un lease expirado mediante `lease acquire`.

### `audit-scope` encuentra Docker, Terraform o pipelines

Separe esos cambios del baseline y entréguelos como requisitos a Vulcano. No agregue excepciones para incorporarlos al skill.

### Un archivo brownfield tiene conflicto

Revise su categoría de ownership. En `project_owned` el cambio requiere decisión del equipo; en `extendable` use el punto de extensión declarado. No reemplace el archivo completo.

### Genesis no está listo para retirarse

Es el estado esperado mientras `archetypes_published` sea falso o haya menos de dos adopciones con evidencia. Actualice la matriz solo con resultados verificables.

## Criterio de bloqueo

Un componente puede quedar `blocked` sin detener discovery o planificación de toda la solución. Documente causa, evidencia, decisión requerida, owner y efecto. Use `partial` cuando otros componentes sí completaron su trabajo.
