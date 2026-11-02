# Flujo de trabajo de Iris

## Contenido

- [Capas](#capas)
- [Modos de operación](#modos-de-operación)
- [Secuencia obligatoria](#secuencia-obligatoria)
- [Rebanada vertical](#rebanada-vertical)
- [Reviews y gate de prototipo](#reviews-y-gate-de-prototipo)
- [Estrategia de interacción](#estrategia-de-interacción)
- [Búsqueda sistemática de edge cases](#búsqueda-sistemática-de-edge-cases)
- [Anti-patrones](#anti-patrones)

## Capas

Mantén estas vistas separadas y etiqueta los diagramas explícitamente:

1. **Business Process:** qué debe ocurrir en el negocio sin importar la UI.
2. **User Flow:** qué hace el usuario para lograr un objetivo; excluye los
   servicios internos.
3. **Interaction Flow:** los mecanismos usados en cada etapa, como formulario,
   tabla, recomendación, revisión o confirmación.
4. **Conversation Flow:** turnos conversacionales, solo donde la conversación es
   parte de la estrategia de interacción elegida.
5. **UI State Flow:** transiciones visibles como idle, loading, working, empty,
   partial, error, success, disabled, unauthorized, confirmation o timeout.
6. **System/Agent Flow:** usuario → interfaz → orquestador → agente →
   herramienta/API → sistema. No lo expongas automáticamente en la UX.

Usa Mermaid `flowchart`, `stateDiagram-v2`, o `sequenceDiagram` solo cuando
aclare materialmente una relación o secuencia.

## Modos de operación

### Modo Arquitectura

Produce casos de uso, user flows, rutas felices/alternativas/de falla/
recuperación, edge cases, estrategias de interacción, inventarios de superficies
de UI y pantallas, trazabilidad, reporte de brechas, y validación de cobertura
apropiada al nivel.

### Modo Diseño

Produce todo lo del Modo Arquitectura más requerimientos de información,
especificaciones de pantalla, wireframes de baja fidelidad, UX reviews por
etapa, mapeo de sistema de diseño, y validación de trazabilidad.

### Modo Build

Produce lo del Modo Diseño necesario para construir más la entrega del sistema
de diseño: tokens (`03-design-system/tokens/*.tokens.json`), manifiesto de
assets de marca, `### Implementation` por componente, plantillas de página y
reporte de deriva contra el código existente. No exige que todas las pantallas
estén diseñadas: habilita construir, con el sistema de diseño congelado, las
pantallas cuyo diseño ya está aprobado.

### Modo Prototipo

Produce todo lo del Modo Diseño más un prototipo funcional, estados de
interacción, datos simulados/APIs apropiados o respuestas de IA simuladas, UX
review final, y validación de prototipo. Haz que navegación, formularios,
tablas, filtros, modales, confirmaciones, loading, errores, estados vacíos,
permisos, interacciones de IA, y rutas de recuperación sean verificables donde
ocurran.

Valida siempre la cobertura del modo realmente alcanzado.

## Secuencia obligatoria

Ejecuta en este orden:

1. Entender los requerimientos.
2. Inventariar artefactos existentes.
3. Identificar actores.
4. Identificar y normalizar requerimientos.
5. Identificar entidades y relaciones de datos.
6. Mapear comandos, eventos, agregados, políticas y hotspots de Event Storming.
7. Definir casos de uso.
8. Generar user flows end-to-end.
9. Generar una ruta feliz significativa para cada caso de uso prioritario.
10. Identificar rutas alternativas.
11. Identificar edge cases, rutas de falla y recuperación.
12. Definir y justificar la estrategia de interacción por caso de uso y pantalla
    relevante.
13. Definir requerimientos de información, fuentes, destinos, validación,
    editabilidad, confirmación y asistencia de IA.
14. Generar el inventario ligero de pantallas y superficies sin detalle narrativo.
15. Crear un archivo fuente por pantalla en `02-ui-architecture/screens/`.
16. Validar cobertura, alcanzabilidad y ausencia de definiciones duplicadas.
17. Generar/actualizar la especificación en su único archivo de pantalla.
18. Mapear acción de usuario → comando → agregado → evento → feedback/estado de
    UI.
19. Generar wireframes de baja fidelidad.
20. Ejecutar UX review.
21. Resolver hallazgos Critical y High, o documentar una justificación aprobada.
22. Definir o mapear fundamentos, componentes, patrones y componentes de IA
    relevantes. Registra cada componente en el catálogo (`components.md` o
    `ai-components.md`), nunca solo en una tabla de pantalla. Cuando la UX vaya
    a construirse, exporta los valores aprobados a
    `03-design-system/tokens/*.tokens.json`, inventaría los assets en
    `03-design-system/brand/assets.md`, completa `### Implementation` por
    componente y las plantillas de página, y ejecuta el Design System Handoff
    Gate junto con `check_design_drift.py` contra el código existente.
23. Actualizar la trazabilidad bidireccional, incluida pantalla ↔ entidad de
    datos, pantalla ↔ evento, y la matriz Caso de Uso × Evento al cierre de
    los casos de uso (en `traceability-matrix.md` o en `use-cases.md` si el
    proyecto tiene uno separado).
24. Ejecutar el Design Coverage Gate.
25. Generar un prototipo solo cuando se solicite y pase el gate.
26. Ejecutar Final UX Review.
27. Volver a ejecutar la validación de trazabilidad.
28. Volver a ejecutar la validación de cobertura de diseño.
29. Generar un reporte que contenga solo las brechas no resueltas.
30. Generar el resumen final de validación.

## Rebanada vertical

Para un sistema nuevo, demuestra primero una rebanada end-to-end de alta
prioridad. Confirma que los artefactos puedan responder:

- ¿Qué requerimiento originó la pantalla?
- ¿Qué caso de uso y user flow implementa?
- ¿Qué actor la usa?
- ¿Qué información y validaciones necesita?
- ¿Qué acciones primarias/secundarias existen?
- ¿Qué comandos y eventos dispara o representa?
- ¿Qué estados visibles se requieren?
- ¿Qué puede fallar y cómo se puede recuperar el usuario?
- ¿Qué componentes del sistema de diseño usa?
- ¿Qué pruebas cubren el caso de uso y los edge cases críticos?
- ¿El gate de cobertura la considera completamente diseñada?

Detén la expansión cuando falte alguna respuesta; registra la ausencia como una
brecha.

## Reviews y gate de prototipo

Ejecuta reviews de forma incremental:

```text
User Flow → Flow Review
Especificación de Pantalla → Screen Review
Wireframe → Wireframe Review
Especificación de Pantalla + Wireframe → UX Review → Hallazgos → Revisión
Flujos aprobados + estrategia + inventarios + pantallas + wireframes + review
  + mapeo de sistema de diseño → Prototipo
Prototipo → Final UX Review → Validación Final
```

No autoapruebes gates de stakeholders. Registra `Needs Review` hasta que el
aprobador designado apruebe explícitamente el artefacto.

## Estrategia de interacción

Elige y justifica un modo para cada caso de uso y pantalla relevante:

- **Conversacional:** intención ambigua, exploración, muchos objetivos
  posibles, explicación, o refinamiento iterativo.
- **Estructurada:** campos conocidos, datos obligatorios, validación, listas,
  tablas, filtros, fechas, números, precisión, comparación, o administración.
- **Híbrida:** intención no estructurada seguida de información o acción
  estructurada. Nunca elijas Híbrida por defecto.

Evalúa ambigüedad, estructura de entrada, información requerida, validación,
riesgo, consecuencia, volumen de datos, comparación, exploración,
reversibilidad, frecuencia y experiencia. La IA puede asistir a la UI
estructurada mediante autocompletado, recomendaciones, validación, detección de
inconsistencias, procesamiento de documentos, explicación contextual, o
detección de errores, sin convertir toda la experiencia en chat.

## Búsqueda sistemática de edge cases

Evalúa información faltante o inválida, duplicados, acceso no autorizado,
cancelación, corrección, cambio de objetivo, falla de red/API, timeout,
concurrencia, estado inválido, entidad eliminada, dependencia no disponible,
resultados vacíos/parciales, cambios de permisos, sesiones expiradas, acciones
destructivas, y acciones irreversibles. Da a los edge cases críticos
recuperación o terminación explícita, y pruebas.

## Anti-patrones

Marca chat para todo, formularios para todo, CRUD para cada entidad, una
pantalla por cada estado, explosión de pantallas, pantallas sobrecargadas,
formularios largos sin agrupar, capas de modales apiladas, confirmación/
recuperación/estado/feedback faltantes, componentes duplicados, terminología
inconsistente, pantallas inalcanzables u huérfanas, comandos/eventos sin
mapear, casos de uso sin flujos, flujos sin cobertura de pantalla, pantallas sin
flujos, edge cases sin recuperación/pruebas, frontend antes de validar la UX,
prototipos antes de las especificaciones de pantalla, `screen-detail.md` como
segunda fuente, secciones no numeradas, documentos extensos por listas repetidas
en vez de tablas, y **re-documentar
actores, entidades o eventos que el dominio ya describe** en vez de
referenciarlos y agregar solo el delta de UX — si un contenido se puede
borrar sin perder ninguna decisión de UX porque ya está, con las mismas
palabras, en la fuente, es evidencia duplicada, no un artefacto de Iris.
