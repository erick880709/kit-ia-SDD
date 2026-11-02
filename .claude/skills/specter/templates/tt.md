---
id: TT-XX
type: Tarea Técnica
parent_hu_id: HU-XX
epic: PROJ-XX
title: Título corto de la tarea
technical_objective: Qué se logra técnicamente y por qué.
component: componente-afectado   # o "pendiente" si no se conoce
architecture_layer: capa         # backend / frontend / persistencia / ...; o "pendiente"
implementation_scope: Alcance de implementación acotado.
file_boundaries:
  - ruta/o/módulo afectado si se conoce
api_contracts:
  - "GET /recurso (o contrato OpenAPI/GraphQL/AsyncAPI)"
data_contracts:
  - "Tabla o entidad afectada"
security_considerations:
  - Control de seguridad aplicable
dependencies: []
implementation_steps:
  - Paso de implementación
test_strategy: Estrategia de pruebas.
definition_of_done:
  - Criterio verificable de terminado
evidence_requirements:
  - Evidencia que debe dejar la tarea
priority: Media
points: 3
status: draft
schema_version: "0.1.0"
artifact_version: "1"
created_at: "2026-01-01T00:00:00Z"
updated_at: "2026-01-01T00:00:00Z"
source_artifact_ids: []
---

# TT-XX: Título corto

## Objetivo técnico
<qué se logra y por qué>

## Alcance
<alcance acotado; qué queda dentro y qué fuera>

## Pasos de implementación
1. <paso 1>
2. <paso 2>

## Contratos afectados
- API: <...>
- Datos: <...>

## Estrategia de pruebas
<...>

## Definition of Done
- [ ] <criterio verificable>

## Evidencias requeridas
- [ ] <evidencia>
