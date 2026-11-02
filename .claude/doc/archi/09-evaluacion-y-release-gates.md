# Evaluación y release gates

## Capacidades pendientes por construir

No hay una sección de backlog/roadmap propio del skill que declare capacidades pendientes de construir. Ni `SKILL.md` ni `release.md` contienen una lista de "próximos pasos" o funcionalidad faltante del skill en sí.

Lo que sí existe, declarado explícitamente en `release.md` §"Limitaciones y condiciones", son **condiciones operativas permanentes** (no huecos a cerrar):

- la aprobación de arquitecturas generadas sigue siendo humana, registrada solo en `26`;
- los `.drawio` requieren un editor compatible, y sus exportaciones SVG/PNG para presentación son derivados;
- la presentación requiere Python 3 (generador/validador) y un navegador moderno;
- los costos siguen siendo estimaciones dependientes de región, fecha, moneda, dimensionamiento y precios del proveedor;
- un AS-IS sin código/configuración/IaC suficiente limita el nivel de certeza y debe declararse como restricción, no inventarse.

El único elemento parecido a "pendiente" es un estado de control de versiones, no una brecha funcional: el encabezado de `release.md` indica que, a la fecha de ese documento (2026-08-04), la evaluación/diseño de Microfrontends, el gobierno de APIs, el handoff de seguridad Archi/Vulcano y el gobierno visual de `.drawio` ya estaban implementados localmente pero **pendientes de commit** — es decir, funcionalidad ya construida a la espera de confirmarse en git, no trabajo por hacer.

**Conclusión: sin brechas declaradas explícitamente en la skill a la fecha.**

## Estado honesto de madurez

| Nivel | Estado | Qué demuestra |
|---|---|---|
| Persona, numeración canónica y Paso 0 (`SKILL.md`) | Listo | Escenarios A/B/C definidos, reglas de diagramación y ubicación de salida |
| Gate DR-01 de preparación del dominio | Listo como mecanismo | Casos A/C exigen Event Storming para dominios complejos o evidencia equivalente para dominios simples; el validador rechaza ausencia, bloqueo u handoff pendiente |
| Plantillas y assets (`assets/`, plantilla documental) | Listo | 7 assets y la plantilla `00`-`26` en uso, con al menos un ejemplo real generado en este repositorio |
| Scripts de generación/validación (`scripts/`) | Listo como herramientas, evidencia mixta de ejecución real | Autopruebas del 2026-08-04 pasan para los 5; solo 2 de 5 tienen evidencia fechada de ejecución real sobre este repositorio |
| Catálogo curado de iconos y validación `.drawio` | Listo | Ejecución real con resultado `OK` (`validate_drawio_catalog.py`) |
| Auditoría de coherencia (`25` + `validate_architecture_coherence.py`) | Listo como mecanismo, en fallo abierto sobre este proyecto | Ejecución real del 2026-08-11 devuelve `FAIL: 43 errores`, no recerrado |
| Ejecución real de `validate_architecture_presentation.py` | Sin evidencia | No se encontró comando/fecha/resultado registrado en este repositorio |
| Ejecución real de `extract_postman_inventory.py` | Sin evidencia | Solo mencionado como paso futuro condicionado a un insumo externo (`INC-17`) |

`archi` no define gates de publicación/versionamiento equivalentes a los Gates A-D de `solution-baseline`, porque no publica arquetipos con digest. Sí define gates de entrega arquitectónica: **DR-01** como precondición de entrada para Casos A/C, criterios de cierre por documento (`Cumple` / `Cumple con observaciones` / `No cumple` / `No aplica`), checkpoints de auditoría (`CP-01`-`CP-04`) y aprobación humana final. DR-01 bloquea la generación de arquitectura objetivo cuando un dominio complejo no tiene Event Storming aceptable o conserva hotspots arquitectónicos bloqueantes.

## Aprobación humana como único gate final declarado

El único punto de control que la skill trata explícitamente como bloqueante e infranqueable por el agente es la aprobación en `26-Validacion-y-Aprobacion.md`: "el agente puede recomendar, pero no autoaprobar `10` ni `26`". Mientras `25` no recierre en `Cumple` o `Cumple con observaciones` sin criterios pendientes, y mientras `26` no registre una decisión humana explícita, la arquitectura de un proyecto no puede considerarse aprobada — independientemente de que los scripts de soporte funcionen correctamente.

En este repositorio, ese estado es observable de forma concreta: el dictamen de `25` para el snapshot de la ronda 12 es `Cumple con observaciones` / `approvalEligible=true` (elegibilidad técnica), pero las rondas 14-15 reabrieron el documento a `No cumple` sin recierre, y `26` permanece pendiente. Hasta que eso se resuelva, la documentación de este proceso debe describirse como "flujo implementado y validado como herramienta", no como "arquitectura aprobada".

## Gate de costos por ambiente — 2026-09-14

El nuevo sexto CLI se evalúa con `python -m unittest discover -s .claude/skills/archi/tests -v`; 15 casos pasan. Para cambios de pricing, exigir cobertura de ambientes/recursos de `17`, repartos que sumen 1, ausencia de medidores duplicados, unidades y cantidades válidas, evidencia vigente, separación de costos únicos y bloques sincronizados.

La revisión de tarifas oficiales/contractuales y del consumo observado es una evidencia distinta. Revisar manualmente los cargos omitidos del inventario, legitimidad de exclusiones, detalle narrativo, descuentos, moneda, calidad/latencia de modelos y ajuste de cantidades. No convertir el éxito del script en aprobación presupuestaria. Para regresión del flujo general ejecutar también la autoprueba del validador de coherencia.
