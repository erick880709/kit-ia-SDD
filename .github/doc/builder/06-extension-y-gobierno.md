# Extensión y gobierno

## Extender Builder

Una mejora debe responder a un fallo observado o a una capacidad reusable demostrada:

1. Formular un escenario y resultado observable.
2. Ejecutar el comportamiento actual cuando sea posible.
3. Modificar la instrucción, referencia o script de menor alcance.
4. Ajustar una evaluación que mida decisiones y efectos.
5. Validar la fuente canónica y sincronizar el plugin.

No se agregan reglas universales por una preferencia aislada ni ejemplos que repitan capacidades normales del modelo.

## Fuente y distribución

`.claude/skills/builder` es la fuente del skill. `plugins/builder/skills/builder` es una copia autocontenida verificable y `.agents/skills/builder` es un wrapper de desarrollo. Los adaptadores de agente referencian el skill y no mantienen otro workflow.

## Hooks

Builder no instala hooks. Un hook solo se incorpora para un control determinista, repetitivo y probado, con alcance, evento, timeout y salida breve. No debe habilitar acciones remotas, autorreparación, bypass de confianza o suites completas después de cada edición.

## Gobierno

- Conservar instrucciones y autorizaciones explícitas del usuario.
- Mantener decisiones materiales en su fuente y ownership.
- No debilitar aceptación o pruebas para cerrar una tarea.
- No editar receipts de baseline para ocultar drift.
- No copiar datos de clientes o resultados al paquete reusable.
- No fijar modelos en adaptadores sin requisito explícito.

Consulte [distribución y mantenimiento](../../skills/builder/references/distribution.md).
