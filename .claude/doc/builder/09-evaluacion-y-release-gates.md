# Evaluación y release gates

## Estrategia

Builder se evalúa por decisiones y efectos observables. El harness separa fixtures y oráculos, protege archivos mediante hashes y ejecuta comprobaciones con PYTHONPATH aislado. No constituye una sandbox de seguridad.

| Área | Estado |
|---|---|
| Siete fixtures durables | Implementados y cubiertos por tests. |
| Routing positivo y negativo | Dataset y comparador implementados. |
| Campaña control/previous/candidate | Plantilla y resumen implementados. |
| Observaciones de modelos reales | Pendientes. |
| Escenarios B01–B15 | Catálogo definido; cobertura durable parcial. |
| Acreditación universal por stack | No demostrada. |

Las pruebas unitarias validan el harness, no que un agente real haya seleccionado Builder o producido un cambio correcto.

## Ejecución

```powershell
python .claude/skills/builder/scripts/evaluate_builder.py prepare bugfix <eval-root>/run-01
# Ejecutar Builder en una sesión limpia
python .claude/skills/builder/scripts/evaluate_builder.py check bugfix <eval-root>/run-01
```

## Release gates

### Gate A — estructura

- Frontmatter válido, referencias resolubles y adaptadores coherentes.
- Sin placeholders ni caches distribuidos.

### Gate B — paquete

- Tests aprobados e instalación autocontenida e idempotente.
- Update rechaza drift; plugin sincronizado con la fuente.

### Gate C — comportamiento

- Fixtures relevantes aprobados sin modificar oráculos.
- Criterios, regresiones y cambios fuera de alcance revisados.
- Routing observado en sesiones limpias cuando se mida selección.

### Gate D — promoción

- Campaña comparable contra control y versión anterior.
- Mejora atribuible al skill, sin regresiones materiales.
- Costo documental aceptable y piloto en proyectos reales.

El estado actual acredita paquete y harness listos para piloto controlado; no desempeño universal ni publicación externa. Consulte [evaluación conductual](../../skills/builder/references/behavioral-evaluation.md).
