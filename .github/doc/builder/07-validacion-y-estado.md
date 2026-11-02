# Validación, estado y troubleshooting

## Validación por riesgo

| Cambio | Evidencia mínima orientativa |
|---|---|
| Texto o configuración | Diff y comprobación del consumidor. |
| Regla de negocio o bug | Prueba focalizada de regresión. |
| Refactor | Comportamiento preservado y análisis del stack. |
| API o evento | Contrato y productor/consumidor compatibles. |
| Persistencia | Migración, compatibilidad y destino identificado. |
| Worker | Idempotencia, ciclo de vida y fallos pertinentes. |

Para cambios estándar o reforzados se separan cumplimiento de la especificación y calidad de implementación. Consulte [validación](../../skills/builder/references/validation.md) y [diagnóstico y revisión](../../skills/builder/references/review-and-debugging.md).

## Estados

| Estado | Condición |
|---|---|
| `completed` | La entrega terminó y su validación obligatoria pasó. |
| `partial` | Hay resultado útil con pendientes identificados. |
| `blocked` | Falta un insumo o capacidad concreta para continuar. |

Una exploración puede cerrar con incertidumbre residual documentada. Un plan puede estar completo sin implementación. `not_run` y un mock no equivalen a integración real.

## Diagnóstico y problemas frecuentes

Builder prueba una hipótesis observable por vez y replantea cuando los intentos no producen evidencia.

| Síntoma | Acción |
|---|---|
| Documentación y código se contradicen | Clasificar drift, defecto, cambio aprobado o decisión pendiente. |
| Falla una prueba preexistente | Registrar baseline y determinar si el cambio la afecta. |
| Falta servicio o credencial | Validar lo local y declarar integración pendiente. |
| Hay cambios ajenos | Preservarlos; no usar reset o stash para limpiar. |
| Archivo gestionado por baseline | Usar extensión o handoff; no alterar receipt. |
| Cambió una fuente durante `resume` | Invalidar solo evidencia dependiente. |
