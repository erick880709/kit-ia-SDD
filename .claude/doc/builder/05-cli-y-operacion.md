# CLI y operación

Builder usa los comandos reales de cada proyecto. Sus dos utilidades Python sirven para distribuir y evaluar el skill; no sustituyen build, tests o herramientas del stack.

## Instalación y verificación

```powershell
python .claude/skills/builder/scripts/install_builder.py install `
  --destination <proyecto>/.agents/skills/builder
python .claude/skills/builder/scripts/install_builder.py verify `
  --destination <proyecto>/.agents/skills/builder
```

Requiere Python 3.11+ y biblioteca estándar. `install` exige un destino vacío o una instalación registrada. `--update` rechaza ediciones locales, faltantes, colisiones y retiros implícitos. `verify` compara hashes contra el receipt y la fuente. No instala agentes, hooks ni permisos globales.

## Evaluación

```powershell
python .claude/skills/builder/scripts/evaluate_builder.py --help
python .claude/skills/builder/scripts/evaluate_builder.py prepare bugfix <eval-root>/run-01
python .claude/skills/builder/scripts/evaluate_builder.py check bugfix <eval-root>/run-01
```

El workspace de evaluación debe estar fuera del paquete, ser inexistente y no contener credenciales. El evaluador no es una sandbox de seguridad.

## Operación sobre aplicaciones

Builder descubre scripts, manifiestos y lockfiles antes de ejecutar comandos. Selecciona lint, tipos, build, pruebas, contratos o smoke según el cambio. No ejecuta toda la suite después de cada edición ni inventa éxito cuando falta un runtime o servicio. Consulte [distribución](../../skills/builder/references/distribution.md) y [evaluación conductual](../../skills/builder/references/behavioral-evaluation.md).
