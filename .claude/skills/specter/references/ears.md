# Redacción de requisitos con EARS

EARS (Easy Approach to Requirements Syntax) estructura cada requisito en patrones verificables.
Specter usa EARS en la Fase 2 (Requirement Analysis) para convertir hallazgos en requisitos con
disparador y respuesta claros, sin inventar contenido que la fuente no sustente.

## Patrones

| Tipo | Plantilla | Cuándo |
|---|---|---|
| **Ubicuo** | El sistema **debe** `<respuesta>`. | Requisito sin condición |
| **Eventual** | **Cuando** `<disparador>`, el sistema **debe** `<respuesta>`. | Respuesta a un evento |
| **No deseado** | **Si** `<condición no deseada>`, **entonces** el sistema **debe** `<respuesta>`. | Manejo de fallo/excepción |
| **Condicional** | **Si** `<condición opcional>`, **entonces** el sistema **debe** `<respuesta>`. | Funcionalidad condicional |
| **Opcional** | **Donde** `<característica>`, el sistema **debe** `<respuesta>`. | Conjunto de características |

## Reglas

1. **Un requisito por frase:** un solo "debe" por requisito.
2. **Disparador explícito:** toda respuesta depende de un disparador o condición verificable.
3. **Respuesta observable:** se puede probar (no "debe ser bueno" o "debe funcionar bien").
4. **Trazable:** cada requisito lleva su `id` de origen (RF/RNF/RT) o `[SUPUESTO]`/`[INFERIDO]`.

## Ejemplos

| Enunciado vago | EARS |
|---|---|
| "El login debe ser seguro" | **Si** las credenciales son inválidas, **entonces** el sistema **debe** rechazar el acceso con un error genérico y registrar el intento. |
| "Debe enviar notificaciones" | **Cuando** un pedido cambia a "despachado", el sistema **debe** enviar un correo al comprador en menos de 2 minutos. |
| "Soportar reportes" | **Donde** el rol es "supervisor", el sistema **debe** permitir exportar el reporte a Excel. |

Los enunciados que no encajen en ningún patrón son señal de ambigüedad: formúlalos como pregunta en
`open_questions` o como supuesto explícito en `assumptions`, nunca como requisito confirmado.
