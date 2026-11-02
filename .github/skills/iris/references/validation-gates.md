# UX review, gates de cobertura, y Definition of Done

## Contenido

- [UX review](#ux-review)
- [Design Coverage Gate](#design-coverage-gate)
- [Design System Handoff Gate](#design-system-handoff-gate)
- [Gate de prototipo](#gate-de-prototipo)
- [Reglas de estado](#reglas-de-estado)
- [Definition of Done](#definition-of-done)

## UX review

Revisa cada nivel aplicable y crea hallazgos `UXF-*` con evidencia, severidad,
estado, recomendación, pantalla relacionada, y flujo relacionado.

### Usabilidad

Verifica pasos innecesarios, formularios largos, problemas de navegación,
acciones ambiguas, feedback faltante, sobrecarga cognitiva, repetición,
jerarquía, confirmaciones innecesarias, y recuperación faltante.

### Consistencia

Verifica terminología, comportamiento de componentes, navegación, acciones,
patrones, y campos.

### Estados faltantes

Evalúa loading, error, empty, success, disabled, y unauthorized en cada
pantalla. Evalúa working, offline, timeout, partial result, y confirmation
cuando sea relevante. Exige un `N/A` justificado en vez de la omisión.

### Accesibilidad

Verifica labels, mensajes de error, manejo de foco, navegación por teclado,
estructura semántica, jerarquía de encabezados, nombres accesibles,
anuncios, y — una vez que exista UI visual — contraste.

### AI UX

Cuando aplique, verifica salida editable, corrección, retry, cancel,
preservación de contexto, incertidumbre, confirmación, fuentes, escalamiento
humano, y transparencia.

## Design Coverage Gate

### Requerimientos

- Mapea cada requerimiento relevante a un caso de uso o justifica por qué no
  produce UX.

### Casos de uso

- Da a cada caso de uso prioritario un user flow, una estrategia de
  interacción con justificación, y al menos una prueba.

### User flows

- Da a cada flujo una ruta feliz, punto de entrada, estado de salida,
  alternativas relevantes, edge cases, fallas, y recuperación.

### Pantallas y superficies

- Representa cada paso que requiera UI con una pantalla o superficie de UI.
- Define cada pantalla una sola vez dentro de `02-ui-architecture/screens/`;
  `screen-inventory.md` es únicamente un índice y `screen-detail.md` no es válido.
- Da a cada pantalla actor, propósito, requerimiento/caso de uso/flujo
  relacionado, entrada, salida, acciones, componentes, estados, edge cases,
  recuperación, pruebas, y wireframe en el Modo Diseño.
- Asegura que cada pantalla sea alcanzable desde un user flow y que ninguna
  pantalla/flujo quede huérfano.
- Verifica numeración consecutiva de secciones, prioridad P0–P3 de acciones y
  compactación: tablas para datos comparables y revisión obligatoria sobre 450
  líneas.

### Información

- Da a cada dato requerido una fuente, destino, validación, editabilidad, y
  representación en la UX. Marca explícitamente la inferencia de IA y la
  confirmación.

### Event Storming

- Mapea cada comando iniciado por el usuario a una acción de UX.
- Mapea cada evento visible relevante a feedback, estado, o destino.
- Mapea las fallas relevantes a un estado de error y recuperación.

### Acciones y estados

- Da feedback a cada acción primaria.
- Da confirmación a las acciones irreversibles o de alto riesgo cuando se
  justifique, y pruebas.
- Da recuperación a las acciones fallidas.
- Evalúa Default, Loading, Empty, Error, Success, Disabled, y Unauthorized
  para cada pantalla, usando `N/A` justificado cuando sea necesario.

### Edge cases

- Da a cada edge case crítico recuperación o terminación explícita, y una
  prueba.

### Componentes

- Define cada componente usado o regístralo como faltante/nuevo.
- Mantén consistentes los mapeos pantalla → componente y componente →
  pantallas.

### Pruebas

- Da a cada caso de uso prioritario al menos una prueba.
- Da a cada edge case crítico una prueba.
- Da a cada acción de alto riesgo una prueba.

## Design System Handoff Gate

Aplica antes de declarar `READY FOR BUILD` o de entregar el sistema de diseño a
una baseline o a construcción. Ejecuta `validate_ux_docs.py --mode build` y
`check_design_drift.py` contra el código existente, y verifica:

### Fundamentos y tokens

- Cada valor aprobado de `foundations.md` existe en
  `03-design-system/tokens/*.tokens.json` con `$type`, alias resueltos y estado
  de evidencia en `$extensions.iris.status`.
- Lo que no tiene evidencia aprobada queda fuera de los tokens y registrado
  como pregunta abierta; nunca se completa con valores inventados.

### Marca y assets

- `03-design-system/brand/assets.md` inventaría cada asset con `Asset`, `Path`,
  `Source`, `License` y `Status`, y cada `Path` declarado existe.
- No hay logos redibujados: un asset oficial faltante figura como `Missing`
  con su placeholder rotulado.
- Los conflictos entre fuentes de marca están registrados como decisión
  pendiente, sin elegir.

### Componentes

- Todo `CMP-*` está definido en `components.md` o `ai-components.md`; las
  pantallas solo lo referencian.
- Cada componente tiene `### Implementation` con `Status` (`Planned`,
  `Implemented`, `Referenced`, `Retired` o `Deprecated`), evidencia de código,
  base del UI kit, capa (compartida o de feature), tokens que usa y API de
  props.
- Componentes visualmente equivalentes con vocabularios distintos se modelan
  como un componente con variantes.
- `check_design_drift.py` no reporta componentes usados en código sin
  catalogar.

### Plantillas de página

- Cada tipo de pantalla recurrente (listado, detalle o workspace, formulario
  por pasos, dashboard, superficie pública) tiene plantilla con slots y
  componentes.

Un hallazgo abierto de este gate impide `READY FOR BUILD`, pero no invalida el
modo de diseño ya alcanzado.

## Gate de prototipo

Exige intención explícita de prototipo más lo siguiente aprobado o
explícitamente aceptado:

- user flows;
- estrategias de interacción;
- inventario de pantallas;
- especificaciones de pantalla;
- wireframes;
- UX review con hallazgos Critical/High resueltos o justificados;
- mapeo de sistema de diseño;
- trazabilidad y cobertura actualizadas.

Después de prototipar, vuelve a ejecutar Final UX Review, validación de
trazabilidad, validación de cobertura, reporte de brechas, y el resumen de
validación.

## Reglas de estado

- `INCOMPLETE`: falta evidencia o artefactos requeridos para el modo
  seleccionado, o queda alguna brecha Critical/High sin justificar.
- `NEEDS REVIEW`: los artefactos y las verificaciones automatizadas están
  sustancialmente presentes, pero queda un gate humano/de stakeholder o un
  juicio de UX material pendiente.
- `READY FOR BUILD`: los gates del Modo Diseño de las pantallas a construir y
  el Design System Handoff Gate pasan; la construcción puede empezar con el
  sistema de diseño congelado.
- `READY FOR PROTOTYPE`: los gates del Modo Diseño pasan y la generación del
  prototipo es la etapa restante solicitada.
- `UX COMPLETE`: pasan todas las condiciones de Definition of Done después de
  la validación final.

Nunca dejes que un validador automatizado autoapruebe un gate de stakeholder.

## Definition of Done

Declara `UX COMPLETE` solo cuando pasen todas las condiciones:

- Cubre o justifica cada requerimiento relevante.
- Diseña cada caso de uso prioritario con un user flow y una ruta feliz
  end-to-end.
- Documenta las rutas alternativas relevantes, edge cases críticos, fallas, y
  recuperación.
- Define y justifica una estrategia de interacción para cada caso de uso.
- Representa toda la información crítica e identifica cada superficie de UI
  necesaria.
- Da a cada pantalla relevante una especificación completa y un wireframe.
- Documenta cada estado de pantalla requerido, o un `N/A` justificado.
- Representa los comandos/eventos relevantes en acciones, feedback, estados, o
  destinos de UX.
- Da feedback a las acciones importantes, confirmación adecuada a las
  acciones riesgosas, y recuperación a los errores.
- Define cada componente usado o registra una brecha; mantén los mapeos
  bidireccionales.
- Elimina pantallas huérfanas, user flows huérfanos, referencias rotas, y
  navegación rota.
- Elimina definiciones duplicadas de pantallas/flujos/edge cases y cualquier
  `screen-detail.md`; cada pantalla conserva una sola fuente dentro de `screens/`.
- Da a cada caso de uso prioritario y edge case crítico una prueba.
- Resuelve todas las brechas Critical y resuelve o justifica explícitamente
  todas las brechas High.
- Actualiza la matriz de trazabilidad.
- Pasa el Design Coverage Gate.
- Registra `UX COMPLETE` en el resumen final de validación.
