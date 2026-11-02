# Guía de uso de Builder

## Prerrequisitos

- Intención, issue o especificación suficiente para determinar el cambio.
- Acceso al repositorio y fuentes funcionales pertinentes.
- Herramientas del stack necesarias para las comprobaciones.
- Autorización adicional solo para efectos externos o destructivos no incluidos.

## Elegir la entrada

Builder admite una instrucción en conversación, un identificador de issue accesible,
un archivo Markdown autorizado o una especificación existente. Proporcione el objetivo
y, cuando ya se conozcan, las restricciones o criterios de aceptación. No es necesario
convertir previamente una tarea pequeña en una plantilla extensa.

| Necesidad | Ejemplo de solicitud | Modo |
|---|---|---|
| Nueva capacidad | `agrega recuperación de contraseña` | `feature` |
| Cambio sobre una capacidad | `permite filtrar vacantes por ciudad` | `extend` |
| Defecto | `corrige el redondeo del total` | `bugfix` |
| Cambio interno | `extrae el cálculo sin alterar la API` | `refactor` |
| Conexión entre componentes | `publica y consume el evento CandidateCreated` | `integrate` |
| Incertidumbre | `evalúa si este SDK soporta streaming` | `explore` |
| Continuación | `reanuda PROJ-123 desde el estado actual` | `resume` |

Una tarea puede combinar modos. En `resume`, Builder conserva el objetivo original,
reconcilia código, documentos, pruebas y estado Git, y continúa desde evidencia real.

## Elegir rigor SDD

| Rigor | Aplicación típica | Evidencia documental suficiente |
|---|---|---|
| Ligero | Cambio localizado, entendido y reversible | Intención, aceptación y resultado en el issue o respuesta. |
| Estándar | Feature, bug con lógica, varias capas o integración acotada | Spec breve, impacto, plan y evidencia trazable. |
| Reforzado | Permisos, persistencia, incompatibilidades, concurrencia o varios repositorios | Escenarios negativos, compatibilidad, secuencia y riesgos concretos. |

El rigor depende del impacto, incertidumbre y reversibilidad. La cantidad de líneas no
determina por sí sola el nivel. Si el repositorio usa OpenSpec o Spec Kit, Builder
conserva sus IDs, ubicaciones y estados; no inicializa ni archiva esas herramientas sin
que el flujo lo requiera.

## Qué hace durante la implementación

1. Lee instrucciones locales, fuentes funcionales, contratos y el código afectado.
2. Revisa el estado inicial y conserva modificaciones ajenas.
3. Define aceptación y comportamiento que debe preservarse.
4. Diseña el cambio mínimo compatible con los patrones reales del proyecto.
5. Implementa incrementos significativos y ejecuta comprobaciones enfocadas.
6. Revisa el diff, contratos, aceptación y regresiones.
7. Entrega resultado, evidencia ejecutada y límites reales.

Builder no introduce automáticamente CRUD, DDD, ORM, HTTP, capas adicionales o nuevas
dependencias. Usa los mecanismos apropiados del proyecto y modifica la fuente de los
archivos generados en lugar de parchear sus salidas.

## Validación esperada

La validación se adapta al cambio y al stack. Puede incluir lint, análisis estático,
tipos, build, pruebas unitarias, contratos, integración y smoke tests. Para un bug o
una regla nueva debe existir evidencia observable aunque el módulo no tuviera pruebas
previas.

Ejemplo de cierre correcto:

```text
Estado: completed
Comportamiento: el total conserva dos decimales y aplica descuento antes del impuesto.
Archivos: src/pricing.ts, tests/pricing.test.ts
Comprobaciones: npm test -- pricing.test.ts (8 passed); npm run typecheck (passed)
Límites: no se ejecutó integración con el proveedor porque no existe credencial local.
```

Si una comprobación obligatoria no pudo ejecutarse, Builder separa “implementado” de
“verificado” y usa `partial` o `blocked` según lo que todavía pueda hacerse.

## Agente y skill

El agente [`builder.agent.md`](../../agents/builder.agent.md) define identidad,
herramientas y fronteras. El [skill](../../skills/builder/SKILL.md) contiene el flujo,
los modos y las reglas detalladas. Puede invocarse cualquiera de las dos entradas:

- use el agente para una sesión dedicada de implementación;
- invoque `/builder` cuando ya está trabajando con el asistente principal;
- no cargue ambos como procesos independientes ni duplique el procedimiento.

La revisión del mismo agente sirve para cambios ordinarios, pero no cuenta como
revisión independiente. Cuando el riesgo o el gobierno exijan independencia, la
revisión debe ejecutarse en otro contexto o por otro responsable con la misma revisión
objetiva de aceptación y evidencia.

## Límites y handoffs

| Situación encontrada | Destino apropiado |
|---|---|
| Falta una decisión de arquitectura global | `archi` |
| Debe crearse o reconciliarse una baseline gobernada | `solution-baseline` |
| Se necesita estrategia QA transversal | `ranger` |
| Deben diseñarse DevSecOps, IaC u observabilidad | `vulcano` |
| Debe materializarse IaC/CI/CD ya definido | `vulcano-bob` |
| Se requiere una operación remota autorizada | `vulcano-operador` |

Un hallazgo no autoriza automáticamente el handoff ni amplía el alcance. Builder
termina lo que pertenece a su responsabilidad y reporta el trabajo restante con la
evidencia necesaria para que el siguiente responsable pueda decidir.

## Resultado esperado

Una implementación completa entrega comportamiento acordado, diff limitado, comprobaciones pertinentes, documentación afectada y evidencia vinculada a la revisión validada. Un plan o una exploración se cierra con su propio resultado y no afirma que el código fue modificado.
