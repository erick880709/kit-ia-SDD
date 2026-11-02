# Plan mínimo para contratos QA y runners

Rama: `contrato-v4`, creada desde `main` después del PR #8142.
Este documento define el alcance. Los pasos 1 a 5 están implementados para
`qa-ranger-playwright`, sin commit; las demás especialistas del paso 3 siguen pendientes.

## Objetivo

Ordenar ubicaciones, nombres y documentación, conservar el funcionamiento actual
y garantizar que los runners entreguen CTRF con evidencias bien encarpetadas.

## Responsabilidades

| Componente | Qué hace |
|---|---|
| Runner y reporter | Ejecutar pruebas y producir CTRF real y evidencias. |
| Agente siguiendo la skill | Escribir el contrato global de entrega, referenciando CTRF cuando hubo ejecución. |
| Hook del harness | Validar la entrega nueva o modificada: formato, referencias y reglas de la skill, incluidos CTRF y cobertura cuando corresponden. No ejecutar pruebas. |
| Host | Reutilizar esas validaciones y contrastar las condiciones explícitas de su encargo. |

El contrato de la skill y el reporte CTRF son archivos distintos.
Se conserva la validación completa del hook. Una entrega válida puede recomendar
NO-GO; su validez no significa que las pruebas hayan pasado.

## 1. Mover y renombrar solo lo necesario

### 1a. Validaciones y política

- Mover las validaciones de la entrega (`qa.mjs`, `ctrf.mjs`, `coverage.mjs`) de
  `ranger/scripts/` a `.claude/contracts/output/validators/qa/`.
- Ubicar la política compartida de aceptación con los contratos y actualizar sus referencias.
- Mantener los `output-contract.json` particulares en cada skill como configuración.
- Actualizar imports, registro, comandos, tests y enlaces afectados.
- Conservar reglas y formatos existentes. No reemplazar validadores por `null`.

**Verificación:** mismas decisiones y métricas antes y después del movimiento;
API y CLI operativas desde un proyecto con el paquete y las skills necesarias.

### 1b. Helpers operativos

- Ubicar los helpers operativos con la especialista a la que sirven.
  Revisar los compartidos antes de moverlos; no duplicarlos automáticamente.
- Renombrar únicamente cuando el nombre no describa su función.
- Conservar helpers existentes y actualizar sus referencias.

**Verificación:** los tests de cada helper pasan desde su nueva ubicación.

## 2. READMEs claros

Explicar en `contracts/output/`, sus validadores y sus tests:

- Qué produce la skill y qué comprueba el harness al cerrar el turno.
- Para qué sirve cada helper y quién lo ejecuta.
- Que los lectores CTRF y cobertura comprueban resultados existentes, no ejecutan pruebas.
- Que `tests/` prueba el mecanismo de contratos, no la aplicación ni el desempeño del agente.
- Que las evaluaciones de skills y utilidades como `evaluate.mjs` tienen otro propósito.
- Qué valida el hook, su límite de avisos y cómo difiere de un gate de CI.

Actualizar las referencias de las skills para que todos los comandos apunten a rutas reales.
Las rutas del freno de CI se corrigen en el paso 5.

## 3. Runners con CTRF

Empezar por `qa-ranger-playwright` y continuar con las otras especialistas,
una por una según las indicaciones del usuario.

- Preferir un reporter nativo que produzca CTRF de la ejecución real.
- Si hace falta conversión, partir del reporte real y ubicar la herramienta
  en la especialista o usar una del proyecto; conservar el reporte original.
- Mantener runner, gestor de paquetes y reportes existentes.
- El contrato global referencia CTRF sin duplicar sus pruebas. El reporte Markdown
  sí puede listarlas y debe usar el veredicto derivado por las reglas del consumidor.
- Una tarea sin ejecución no necesita inventar CTRF.

**Verificación:** salida CTRF real en ejecuciones exitosa y fallida, con errores
globales, reintentos y varios proyectos cuando correspondan.

## 4. Encarpetamiento de evidencias

Para `qa-ranger-playwright`, mantener la idea de Erick: una carpeta por caso,
con corrida, navegador e intento separados para no sobrescribir archivos.

```text
resources/qa/
├── TC-01/<runId>/<proyecto>/attempt-<n>/
│   ├── video.webm
│   ├── trace.zip
│   └── screenshot-0.png
└── reports/<runId>/
    ├── ctrf.json
    └── execution-report.md
```

Aquí `<proyecto>` distingue el navegador o configuración del runner.
El helper o reporter de organización pertenece a `qa-ranger-playwright`.
Reutilizar lo existente y adaptar solo lo necesario para copiar los adjuntos reales
y mantener en CTRF los enlaces de cada caso, proyecto e intento.
Los contratos globales conservan su carpeta aparte: `resources/qa/contracts/<runId>/`.

**Verificación:** enlaces a archivos existentes, intentos y navegadores sin
sobrescrituras, evidencia anterior conservada y faltantes explícitos.

## 5. Conservar el freno de CI

Conservar `generate-execution-report.mjs --fail-on-no-go` y su comportamiento.
Ubicarlo, con `render-report.mjs`, en `.claude/contracts/output/`: deriva el veredicto
de las reglas del consumidor y lo usan todas las especialistas. No es obligatorio
para producir una entrega; solo lo invoca el CI. Corregir las rutas que lo invocan;
no crear un `ci-gate.mjs` nuevo por defecto. Conservar también los fallos del runner.

**Verificación:** NO-GO sigue fallando el pipeline. Un contrato válido no convierte
NO-GO en GO. La CLI del validador mantiene su significado: contrato válido no es
autorización de release.

## Forma de avanzar

- Primero solo el paso 1; revisar antes de continuar. Un cambio pequeño cada vez.
- Mantener contrato `0.1.0` y validaciones actuales; no rediseñar el flujo.
- No eliminar helpers por defecto ni añadir generadores globales obligatorios.
- Documentación y comprobaciones correspondientes acompañan cada cambio.
- Commit y push cuando se soliciten.
- Fuera de este alcance: endurecer reglas de auditoría, cambiar esquemas o políticas,
  migrar herramientas, PAP, telemetría, Eco, Apolo, marca, presentaciones y Cronos.
  Mover la política no cambia su contenido ni sus condiciones.

Respaldo de consulta: `backup/contrato-v3-antes-reinicio-20261007-1791366535327`.
`bbcb189` sirve de referencia para `evidence-ctrf.ts` y la organización de evidencias;
`8f64f6d`, para pruebas del CTRF real. No recuperar commits en bloque.
No aplicar `520f54c`: limitaba el hook a estructura y decidimos conservar su validación completa.
