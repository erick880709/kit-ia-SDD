---
id: HU-XX
type: Historia de Usuario
epic: PROJ-XX
requirement_ids:
  - RF-000
title: Título corto de la historia
business_value: Qué valor aporta y para quién.
user_story:
  role: rol de usuario
  action: acción/funcionalidad
  benefit: beneficio/objetivo
description: Descripción ampliada (opcional).
scope:
  included:
    - Alcance incluido
  excluded:
    - Alcance excluido
business_rules:
  - Regla de negocio
preconditions:
  - Precondición
main_flow:
  - Paso del flujo principal
alternative_flows:
  - Flujo alternativo
exceptions:
  - Excepción
acceptance_criteria:
  - id: CA1
    scenario: Dado <contexto>, cuando <acción>, entonces <resultado observable>.
    negative: false
    requirement_ids:
      - RF-000
dependencies: []
nfr_references: []
test_references: []
assumptions: []
open_questions: []
priority: Media
points: 5
status: draft
schema_version: "0.1.0"
artifact_version: "1"
created_at: "2026-01-01T00:00:00Z"
updated_at: "2026-01-01T00:00:00Z"
source_artifact_ids: []
---

# HU-XX: Título corto

## Como
<rol de usuario>

## Quiero
<acción/funcionalidad>

## Para
<beneficio/objetivo>

## Criterios de Aceptación
- [ ] CA1: Dado <contexto>, cuando <acción>, entonces <resultado observable>.

## Recurso de datos involucrado
<!-- Incluir solo si la historia crea, modifica o expone una entidad. No inventar campos:
     usar "No especificado en la épica — definir con negocio" cuando falte el dato. -->

### Recurso
- **Nombre:** NombreDelRecurso
- **Capa(s):** backend / frontend / ambas

### Campos del recurso
| Campo | Tipo | Requerido | Descripción / Restricciones |
|---|---|---|---|
| ... | ... | ... | ... |

### Relaciones con otros recursos
- `NombreEntidad` (cardinalidad): descripción de la relación
