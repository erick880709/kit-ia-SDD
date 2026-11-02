# Quality Gate — Reglas, pesos y estados (Specter 2.0)

Determinista, sin LLM. Implementado en `scripts/engine.mjs`; CLIs en `scripts/validate_hu.mjs`,
`scripts/validate_tt.mjs` y `scripts/quality_gate.mjs`.

## 1. Estados

| Estado | Significado |
|---|---|
| `READY` | Cumple todas las reglas obligatorias y no tiene bloqueos |
| `NEEDS_REFINEMENT` | Información incompleta o problemas corregibles (sin bloqueos) |
| `BLOCKED` | Contradicción, discriminador/enum inválido o decisión que requiere aprobación |

El score (0-100) es informativo: **no compensa** una regla bloqueante ni una regla obligatoria
fallida. El estado se decide así: `BLOCKED` si hay bloqueos; si no, `READY` si todas las reglas
obligatorias pasan; si no, `NEEDS_REFINEMENT`.

## 2. Dimensiones y pesos

| Dimensión | Peso HU | Peso TT |
|---|---|---|
| Completitud | 25 | 25 |
| Consistencia | 20 | 20 |
| Trazabilidad | 20 | 20 |
| Testabilidad | 20 | 20 |
| Implementabilidad | 15 | 15 |
| **Total** | **100** | **100** |

## 3. Reglas de HU

### Completitud (25)
| Regla | Peso | Obligatoria |
|---|---|---|
| `business_value` explícito | 5 | sí |
| `user_story` con role/action/benefit | 5 | sí |
| `scope.included` y `scope.excluded` | 5 | sí |
| `acceptance_criteria` no vacío | 5 | sí |
| `main_flow` o `description` | 5 | sí |

### Consistencia (20)
| Regla | Peso | Obligatoria |
|---|---|---|
| cada criterio con `id` no vacío | 8 | sí |
| `requirement_ids` sin duplicados | 6 | sí |
| `dependencies` sin duplicados | 6 | sí |

### Trazabilidad (20)
| Regla | Peso | Obligatoria |
|---|---|---|
| origen presente (`epic_id` o `requirement_ids`) | 12 | sí |
| `requirement_ids` con formato de id | 8 | sí |

### Testabilidad (20)
| Regla | Peso | Obligatoria |
|---|---|---|
| cada criterio con resultado observable (`scenario` o `then`) | 12 | sí |
| escenario negativo cuando hay excepciones o flujos alternativos | 8 | sí |

### Implementabilidad (15)
| Regla | Peso | Obligatoria |
|---|---|---|
| `points` estimado y ≤ 8 (INVEST small) | 8 | sí |
| `priority` presente y válida | 7 | no |

## 4. Reglas de TT

### Completitud (25)
| Regla | Peso | Obligatoria |
|---|---|---|
| `technical_objective` explícito | 6 | sí |
| `implementation_steps` presentes | 6 | sí |
| `definition_of_done` presente | 7 | sí |
| `test_strategy` presente | 6 | sí |

### Consistencia (20)
| Regla | Peso | Obligatoria |
|---|---|---|
| cada item de `definition_of_done` no vacío | 7 | sí |
| `dependencies` sin duplicados | 7 | sí |
| `evidence_requirements` presentes y no vacíos | 6 | sí |

### Trazabilidad (20)
| Regla | Peso | Obligatoria |
|---|---|---|
| anclaje presente (`parent_hu_id` o `epic_id`) | 14 | sí |
| `dependencies` con formato de id | 6 | sí |

### Testabilidad (20)
| Regla | Peso | Obligatoria |
|---|---|---|
| `definition_of_done` verificable (sin frases genéricas) | 10 | sí |
| `evidence_requirements` requeridos | 10 | sí |

### Implementabilidad (15)
| Regla | Peso | Obligatoria |
|---|---|---|
| `component` identificado o marcado pendiente | 8 | sí |
| `architecture_layer` identificado o marcado pendiente | 7 | no |

## 5. Reglas bloqueantes (independientes del score)

| Regla | Condición |
|---|---|
| Discriminador | `type` distinto del esperado (`historia_usuario` / `tarea_tecnica`) |
| Enum | `status`, `priority` o `points` con valor fuera del vocabulario |
| Criterio | criterio de aceptación sin `id` o sin resultado observable |
| Duplicados | `acceptance_criteria` con `id` repetido |
| Auto-dependencia | `dependencies` incluye el propio `id` |
| Sin anclaje (TT) | `parent_hu_id` y `epic_id` ambos ausentes |

## 6. Determinismo y evidencia

Cada resultado incluye por artefacto: `score`, `state`, reglas superadas/fallidas (con dimensión y
peso), bloqueos y errores estructurales. Los mismos artefactos producen el mismo resultado: los
validadores no usan red, reloj más allá de lo declarado en los artefactos, ni modelos de lenguaje.
