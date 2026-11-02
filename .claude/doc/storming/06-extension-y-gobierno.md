# Extensión y gobierno

## Qué no está gobernado

`SKILL.md` y `references/artifact-contract.md` no definen un procedimiento para crear un nuevo tipo de artefacto `ES-0xx` más allá del catálogo fijo `ES-001`–`ES-016` (ver [03 — Contratos y artefactos](./03-contratos-y-artefactos.md)). No hay campo de extensibilidad, plantilla en blanco ni guía para registrar un `ES-017` nuevo. La evidencia del proyecto confirma este drift: `ES-016` se reutilizó para una presentación HTML y existen `ES-017`/`ES-018` fuera del contrato actual.

Este documento no debe interpretarse como una guía normativa para agregar tipos de artefacto: describe únicamente los mecanismos de crecimiento que sí existen dentro del catálogo actual.

## Cómo crece el modelo dentro del catálogo existente

### Asignación y conservación de IDs

`SKILL.md` ("Convenciones obligatorias") fija reglas de nomenclatura que gobiernan cómo se extiende cada archivo `ES-*` con nuevos elementos:

- Usar consecutivos con cero a la izquierda y no reutilizar IDs eliminados.
- Asignar IDs durante el harvesting, no durante la exploración caótica del taller.
- Nombrar eventos en pasado (`VacanteSolicitada`, no `SolicitarVacante`) y comandos en imperativo/infinitivo (`SolicitarVacante`).
- Mantener una única fuente de verdad por concepto y referenciarla desde los demás archivos.

### Modo `reconciliacion`

Es el mecanismo real de crecimiento del modelo a lo largo del tiempo. Al detectar `ES-*.md` existentes en `resources/functional/eventstorming/`, la skill entra en modo `reconciliacion`:

- Lee los artefactos existentes antes de proponer cambios.
- Preserva IDs estables y ediciones manuales.
- Agrega nuevos IDs desde el máximo existente (no renumera).
- Marca elementos retirados como `retirado` en lugar de eliminarlos o renumerar los siguientes.

El modelo A&S de OCTO-HR (ver [03](./03-contratos-y-artefactos.md)) documenta reconciliaciones fechadas reales (2026-08-04, 2026-08-18, 2026-08-28), consistentes con este mecanismo.

### Extensiones opcionales como mecanismo gobernado de ampliar alcance

Sin modificar el catálogo base, la skill define dos extensiones opcionales, cada una con precondiciones explícitas de cuándo ejecutarlas:

| Extensión | Precondición | Artefactos que agrega |
|---|---|---|
| Análisis y definición TO-BE | El usuario solicita mejora/automatización/TO-BE y existe una base AS-IS | `ES-014`, `ES-015` |
| Escenarios de aceptación | Se ejecutó `process-modelling` o `software-design` con flujo suficientemente robusto | `ES-016` |

Ninguna extensión se ejecuta por rutina; todas requieren pedido explícito del usuario y base suficiente del modelo.

## Versionamiento

La skill no versiona semánticamente sus artefactos (no hay noción de `major`/`minor`/`patch` como en un catálogo de arquetipos). El control de cambios es el propio modo `reconciliacion` más el historial de Git del repositorio.
