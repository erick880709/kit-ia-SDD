# Contrato de salida para PAP basado en las skills builder, archi, ranger y epicureo

El contrato 0.1.0 define el resultado que **produce la sesión al aplicar cada skill**.
Cada skill aporta instrucciones y reglas específicas. El agente ejecuta o coordina
el encargo y el host recibe los resultados. PAP es el host previsto para esta integración.
Los roles están en el [contrato común](README.md#quién-recibe-y-quién-entrega).

En este documento, un nombre en código (`builder`, `ranger`) es la skill. "el
agente Epicureo" es el agente de PAP que coordina skills. El validador comprueba
estructura, condiciones de cierre y métricas. Hoy solo tiene registradas las
skills `ranger`, `qa-ranger-plan-pruebas`, `qa-ranger-playwright`, `qa-ranger-karate`, `qa-ranger-unitarias`, `qa-ranger-selenium` y `qa-ranger-jmeter`. Las reglas de las skills `builder`, `archi`
y `epicureo` son el diseño previsto. La integración con PAP está pendiente.

## Reglas de las skills

| Skill | Recibe y entrega | Qué determina el cierre |
|---|---|---|
| [`builder`](../../skills/builder/SKILL.md#6-entregar) | Recibe texto, issue o spec; entrega implementación, plan, exploración o reanudación | La entrega solicitada y sus comprobaciones. En el contrato común usaría `completed`, `partial` y `failed`; una comprobación obligatoria pendiente impide `completed` |
| [`archi`](../../skills/archi/SKILL.md) y su [gobierno](../../skills/archi/references/guia-gobierno-validacion.md) | Recibe requisitos o repositorio; entrega escenario A, B o C, documentos, decisiones y revisión | DR-01 cuando aplica, cierre de artefactos, validadores, dictamen y aprobación humana. El documento `00` requiere aprobación |
| [`ranger`](../../skills/ranger/SKILL.md) y [`qa-ranger-plan-pruebas`](../../skills/qa-ranger-plan-pruebas/SKILL.md) | Reciben código, requisitos, plan o resultados; entregan estrategia, plan, pruebas y reportes según el pedido | Condiciones de la tarea aplicada. Un reporte terminado puede recomendar `NO-GO`; la meta del 95% pertenece exclusivamente a unitarias |
| [`epicureo`](../../skills/epicureo/SKILL.md) | Recibe una necesidad o requisitos; entrega rondas de clarificación y especificación refinada | IA ≤ 15 permite declarar lista para diseño. Tras cuatro rondas sin convergencia entrega una especificación con brechas y alineación pendiente. Guardar o publicar requiere confirmar el destino y ejecutar la operación |

La skill `builder` registra [evidencia por criterio](../../skills/builder/references/spec-and-evidence.md)
y exige [validación según riesgo](../../skills/builder/references/validation.md).
La skill `archi` tiene validadores de coherencia, presentación, costos y diagramas.
La skill `ranger` ejecuta pruebas y organiza sus evidencias. La skill `epicureo`
evalúa seis dimensiones: propósito (25), alcance (25), éxito (20), restricciones (15),
actores (10) y prioridad (5). Cada skill determina sus comprobaciones y métricas.

En PAP, el agente Epicureo aplica las skills `janus`, `epicureo` y `specter` según
el encargo y hoy reporta con `AGENT_PROGRESS`. Leer el formato común requiere un
adaptador en PAP.

## Resultado común

| Información compartida | Lo que PAP recibe de cada skill |
|---|---|
| Identidad | Skill que produjo el resultado; la invocación la asigna el host con la ruta del archivo |
| Encargo | La parte del encargo que recibió la skill y sobre qué alcance/revisión |
| Entrega | Resumen y estado según el cumplimiento del encargo |
| Artefactos | Referencias a archivos, recursos o contenido entregado |
| Comprobaciones | Qué se comprobó, resultado y evidencia; distinguir no ejecutado y no aplicable |
| Pendientes | Qué falta, si impide cerrar y quién debe resolverlo |
| Métricas | Observaciones disponibles con identificador, unidad, fuente y alcance; conteos cuando sean porcentajes |
| Datos específicos | Modo en `builder`; escenario, dictamen y aprobación en `archi`; nivel y recomendación QA en `ranger`; ronda, dimensiones de ambigüedad y disposición para diseño en `epicureo` |

El estado técnico del proceso (ejecutándose, falló, cancelado) pertenece al host.
La entrega de una skill puede ser parcial aunque el proceso haya terminado sin error.
Una decisión o aprobación humana no se deduce de que el modelo haya terminado.
En `epicureo`, especificación producida, lista para diseño y guardada/publicada son
hechos distintos. Un destino pendiente no invalida el refinamiento ya realizado.

Las métricas son opcionales. Contar archivos de `builder` no mide productividad.
contar documentos de `archi` no demuestra calidad arquitectónica. PAP puede mostrar
una métrica principal y conservar las demás sin imponer una puntuación a todas.
El IA es una evaluación del modelo cuyas sumas puede verificar PAP. No es un
porcentaje de avance ni una medida común de calidad para las cuatro skills.
Las etiquetas de presentación se mantienen fuera de las instrucciones de las skills.

## Casos de aceptación

Los casos describen el comportamiento esperado para la integración.
Las pruebas automatizadas actuales cubren la interfaz común y las siete skills QA con datos ficticios.
Los casos de `builder`, `archi` y `epicureo` siguen pendientes de implementación.

| Caso | Resultado que la interfaz debe conservar |
|---|---|
| `builder` recibe solo un pedido de plan | Puede completar el plan sin modificar código ni afirmar pruebas ejecutadas |
| `builder` implementa y pasa las comprobaciones requeridas | Entrega completa con evidencia vinculada al cambio |
| `builder` implementa y falta una comprobación obligatoria | Entrega parcial, o bloqueo si no puede continuar; nunca `completed` de implementación |
| `archi` diseña A/C y no supera DR-01 | Bloqueo y handoff con faltantes concretos; no arquitectura objetivo inventada |
| `archi` documenta AS-IS | Puede observar sin DR-01; no aplicar por defecto condiciones de diseño TO-BE |
| `archi` tiene dictamen técnico apto y espera al comité | Revisión técnica terminada, aprobación pendiente; no generar `00` como aprobado |
| `qa-ranger-plan-pruebas` termina un plan | Casos diseñados; no contabilizarlos como ejecutados |
| `ranger` termina un reporte con un crítico omitido | Reporte completo y recomendación `NO-GO` |
| `ranger` escribe unitarias sin poder medir cobertura | Conservar lo escrito y lo pendiente; no declarar alcanzado el 95% |
| `epicureo` recibe un saludo sin necesidad | Solicitar fuente; sin índice de ambigüedad, ronda ni entregable nuevo |
| `epicureo` alcanza cuatro rondas con IA > 15 | Especificación producida con brechas; sigue pendiente la alineación para diseño |
| `epicureo` alcanza IA ≤ 15 y falta elegir destino | Lista para diseño, destino pendiente; no afirmar que se guardó o publicó |
| El agente Epicureo aplica `janus`, `epicureo` y `specter` | Un resultado por skill aplicada, con sus métricas y artefactos, sin sustituirlos por los del último paso |

Los [tests comunes](tests/interface.test.mjs) comprueban la interfaz compartida.
Las [pruebas de Ranger](../../skills/ranger/tests/contracts.test.mjs) comprueban
los cálculos QA y las condiciones de cierre compartidas. Las
[pruebas del plan](../../skills/qa-ranger-plan-pruebas/tests/contracts.test.mjs)
comprueban requisitos y entregables propios. Los
[tests de suites QA](../../skills/ranger/tests/contracts.test.mjs) comprueban
reglas de cierre y composición compartidas. Playwright y Karate mantienen sus
pruebas de aceptación en sus propias carpetas `tests/`. Los casos de `builder`,
`archi` y `epicureo` se automatizan cuando cada skill registre sus reglas en el validador.

El [contrato común](README.md) documenta los campos compartidos y los
[datos QA](../../skills/ranger/references/qa-output.md) detallan la salida
de las skills `ranger`, `qa-ranger-plan-pruebas`, `qa-ranger-playwright`, `qa-ranger-karate`, `qa-ranger-unitarias`, `qa-ranger-selenium` y `qa-ranger-jmeter`.
