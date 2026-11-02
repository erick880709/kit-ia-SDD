# Validación y estado

## Ausencia de validador automatizado

La implementación actual de `storming` no contiene una carpeta `scripts/` ni una suite automática. La verificación se realiza con los gates de facilitación definidos en `SKILL.md` y el checklist de cierre de `references/artifact-contract.md`.

## Gates de facilitación

| Gate | Formato | Condición para pasar |
|---|---|---|
| Gate A | Todos (Etapa 0) | Propósito, alcance, participantes, fuentes y formato están claros antes de modelar. |
| Gate B | Big Picture | Línea de tiempo principal, pivotes y eventos faltantes se contrastaron con las fuentes o expertos disponibles. |
| Gate C | Process Modelling | Cada camino termina en un estado estable; se respetan eventos, comandos, políticas y read models; las excepciones tienen resultado, compensación o hotspot. |
| Gate D | Software Design | Los agregados y bounded contexts expresan límites de dominio; no se confunden con servicios desplegables y se entregan a `archi` como insumo, no como arquitectura resuelta. |

## Checklist contractual de cierre

- Alcance, fuentes, formato y estado de validación explícitos en `ES-001`.
- AS-IS y TO-BE distinguibles sin depender del contexto de conversación.
- Eventos expresados en pasado y ordenados.
- En Big Picture: personas o sistemas, pivotes y narrativa recorrida.
- En Process Modelling: comandos, políticas, read models, excepciones y caminos estables.
- En Software Design: agregados por comportamiento, límites visibles y lenguaje ubicuo.
- Hotspots consolidados con responsable y efecto del bloqueo.
- IDs estables, referencias internas y fuentes trazables.
- Cuando se generan escenarios de aceptación opcionales: comportamiento observable en Dado/Cuando/Entonces y trazabilidad válida.
- Siguiente handoff identificado.
- No se generaron archivos ajenos al perfil solo para completar el catálogo.

La skill no tiene hoy una extensión contractual para derivar Historias de Usuario ni un artefacto `ES-018`; esos contenidos encontrados en OCTO-HR son material del proyecto, no criterios de validación de la implementación vigente.

## Estados posibles

- `borrador-documental`
- `validacion-parcial`
- `validado-dominio`
- `bloqueado-por-hotspots`

## Regla de `validado-dominio`

`validado-dominio` requiere confirmación explícita de expertos de dominio identificables. El análisis documental, aun si es extenso, solo permite declarar `borrador-documental` o `validacion-parcial`. Una sesión sin expertos de dominio tampoco puede elevar el estado.

## Evidencia en OCTO-HR

El repositorio contiene artefactos posteriores y específicos del proyecto —incluidos `ES-017`, `ES-018` e Historias de Usuario— que exceden el contrato actual de `storming`. Su existencia no permite atribuirlos automáticamente a la skill ni declarar el dominio validado. Deben evaluarse por sus propios criterios y conservar su estado documental real.

## Límite de la validación

Los gates verifican estructura, trazabilidad y disciplina de facilitación. No prueban que el contenido represente correctamente el negocio: esa validación depende de fuentes confiables y de la participación efectiva de expertos identificables.
