# Contratos y artefactos

## Perfiles mínimos de harvesting

No se exige el catálogo completo como condición de éxito. El perfil mínimo depende del formato ejecutado:

| Formato | Perfil mínimo (`references/artifact-contract.md`) |
|---|---|
| `big-picture` | `ES-001`, `ES-002`, `ES-003`, `ES-004`, `ES-013` |
| `process-modelling` | `ES-001`, `ES-002`, `ES-005`, `ES-006`, `ES-007`, `ES-008`, `ES-013` |
| `software-design` | `ES-001`, `ES-002`, `ES-006`, `ES-007`, `ES-008`, `ES-010`, `ES-011`, `ES-012`, `ES-013` |
| `cadena` | Unión sin duplicados de los perfiles ejecutados |

Se permite un harvesting todavía más liviano cuando preserve suficiente contexto para el objetivo de la sesión (por ejemplo, export/fotografía del board más un resumen de hotspots). El catálogo completo solo se genera por solicitud explícita o necesidad comprobada de un consumidor posterior.

## Catálogo `ES-001`–`ES-016`

| Archivo | Nivel | Contenido mínimo |
|---|---|---|
| `ES-001-Resumen-Ejecutivo-y-Alcance.md` | Sesión | Modo, estado, proceso, propósito, inicio/fin, IN/OUT, fuentes, participantes, hallazgos y enlaces |
| `ES-002-Eventos-de-Dominio.md` | Big Picture | Catálogo de eventos, línea temporal, proceso, descripción, datos mínimos y fuente |
| `ES-003-Actores.md` | Big Picture | Actores, tipo, responsabilidad, comandos y consultas |
| `ES-004-Sistemas-Externos.md` | Big Picture | Sistemas, rol, dirección, mecanismo conocido, fuente de verdad y estado AS-IS/TO-BE |
| `ES-005-Flujos-del-Proceso.md` | Process | Flujo principal, pivotes, rutas alternativas, excepciones y compensaciones |
| `ES-006-Comandos.md` | Process | Comando, actor, precondiciones, validaciones, evento resultante y errores |
| `ES-007-Consultas.md` | Process | Read models/consultas, consumidor, datos y comandos que soportan |
| `ES-008-Politicas-y-Reglas-de-Negocio.md` | Process | Políticas reactivas, condiciones, reglas, excepciones y fuente |
| `ES-009-Entidades.md` | Design | Identidad, ciclo de vida, atributos sustentados, reglas y relaciones |
| `ES-010-Agregados.md` | Design | Raíz, miembros, invariantes, comandos, eventos y límite de consistencia |
| `ES-011-Lenguaje-Ubicuo.md` | Design | Término, definición, contexto, fuente, sinónimos y estado de discusión |
| `ES-012-Clasificacion-Dominio-y-Contextos.md` | Domain | Subdominios, bounded contexts, ownership, lenguaje, relaciones y context map |
| `ES-013-Hotspots-Consolidados.md` | Transversal | Hotspot, evidencia, impacto, prioridad, bloqueo, responsable y estado |
| `ES-014-Analisis-de-Mejoras.md` | TO-BE | Problema/hotspot, oportunidad, valor, contexto, dependencias y prioridad |
| `ES-015-Definicion-TO-BE.md` | TO-BE | Diferencias AS-IS/TO-BE, eventos/comandos, integraciones, transición y criterios de éxito |
| `ES-016-Escenarios-de-Aceptacion.md` | Extensión | Escenarios Dado/Cuando/Entonces con ejemplos, resultado observable y trazabilidad |
`ES-017` y `ES-018` no forman parte del catálogo ni del workflow actuales de la skill.

## Identificadores

| Concepto | Prefijo | Ejemplo |
|---|---|---|
| Evento | `EV` | `EV01` |
| Actor | `AC` | `AC03` |
| Sistema externo | `SX` | `SX02` |
| Comando | `CM` | `CM07` |
| Consulta/read model | `QR` | `QR04` |
| Política | `PL` | `PL02` |
| Regla de negocio | `RN` | `RN05` |
| Entidad | `EN` | `EN03` |
| Agregado | `AG` | `AG02` |
| Subdominio | `SD` | `SD01` |
| Bounded context | `BC` | `BC04` |
| Hotspot | `HS` | `HS08` |
| Oportunidad | `OP` | `OP06` |
| Escenario de aceptación | `AT` | `AT03` |

## Ruta real de salida

Todos los artefactos de la skill se escriben bajo `resources/functional/eventstorming/`. La generación de historias pertenece a `specter`; la skill actual no escribe en `resources/functional/HUs/`.

## Evidencia real encontrada en el repositorio

`resources/functional/eventstorming/` contiene un modelo real y extenso para el proceso de Atracción y Selección (A&S) de OCTO-HR, con `ES-001` a `ES-015`, además de artefactos históricos o específicos del proyecto (`ES-016` HTML, `ES-017`, `ES-018` y otra presentación HTML) que exceden el contrato actual.

El propio `ES-001` registra reconciliaciones fechadas contra fuentes reales del repositorio y `ES-013` mantiene los hotspots consolidados. Los 81 archivos `HU-*.md` existentes son evidencia del proyecto, pero no deben atribuirse a la implementación vigente de `storming`: hoy esa responsabilidad corresponde al flujo de `specter`.

## Drift histórico del proyecto

No se encontró un `ES-016-Escenarios-de-Aceptacion.md` en Markdown. El `ES-016` real es una presentación HTML y convive con `ES-017`/`ES-018`, que tampoco pertenecen al catálogo vigente. Deben tratarse como extensiones históricas específicas de OCTO_HR: no se eliminan ni renumeran durante reconciliación, pero tampoco se usan como precedente para ampliar la skill sin una decisión explícita de gobierno.

## Trazabilidad mínima

```text
Fuente CTX/RF/RNF/RT/RD
  → Evento/Regla/Hotspot
  → Comando/Política/Agregado
  → Bounded Context
  → Oportunidad TO-BE
  → Escenario AT (cuando se extraiga)
  → Handoff a archi, specter, iris o ranger según el consumidor
```

No se exige una relación ficticia cuando un elemento fue descubierto directamente en taller; en ese caso se registra `Fuente: taller YYYY-MM-DD — participante/rol`.
