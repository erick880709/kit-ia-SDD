# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

`kit-ia` is not an application codebase. The repository is a kit of Claude Code skills
(`.claude/skills/`) that implements an AI-assisted software delivery pipeline, from an RFP
document to a working code scaffold in the client's own repository. `resources/` is the shared,
file-based state that the skills read from and write to as work moves through the pipeline.
Skills can include scripts, templates, contracts, and validation tests.
Read each skill's `SKILL.md` before changing it. For QA checks, see the
[Ranger validation guide](.claude/doc/ranger/validacion.md).

Everything the skills produce is written **in Spanish** by convention, regardless of the source
document's language (technical terms like "API"/"SLA" are kept in English where that's industry
standard).

## Pipeline and skill responsibilities

The skills are meant to be used roughly in this order, each one consuming files the previous one
produced. Each skill's own `SKILL.md` (under `.claude/skills/<name>/`) is the source of truth for its
detailed behavior — read it before modifying that skill.

| Stage | Skill | Input | Output |
|---|---|---|---|
| 1. Extraction | `janus` | RFP document (PDF/DOCX/PPTX/XLSX/HTML/TXT/MD) | One `.md` per requirement in `resources/functional/requests/` (RF-###), `resources/architecture/definitions/` (RNF-###/RT-###), `resources/design/models/` (RD-###), plus `resources/summary/executive-summary.md` |
| 2. Refinement | `epicureo` | Free-text need, or a janus RF/RNF/RT file, iterated until its computed "Índice de Ambigüedad" (IA) ≤ 15 | `resources/functional/reqs/NNN-slug.md`, and/or a Jira Epic via MCP |
| 3. Breakdown | `specter` | Jira Epic key or a `resources/functional/reqs/*.md` file | User stories / technical tasks as `resources/functional/hu/hu-##-*.md` / `tt-##-*.md` with contract-validated YAML frontmatter (`contracts/*.schema.json`), a deterministic Quality Gate (`scripts/quality_gate.mjs`) and an evaluation harness (`evaluations/run.mjs`); and/or Jira issues via MCP |
| 4. Architecture | `archi` | A spec `.md` (greenfield) and/or an existing code repo | `resources/architecture/Documento_Arquitectura_*.md` with embedded Mermaid C4 + sequence diagrams, plus `.drawio` deployment diagrams with official cloud iconography (AWS/Azure/GCP) — three modes: Caso A (greenfield proposal, with a multi-cloud diagram + cost comparison when no provider is specified), Caso B (AS-IS docs of existing code, deployment diagram derived from Terraform when no prior doc exists), Caso C (AS-IS → TO-BE gap analysis + migration roadmap) |
| 5. Baseline | `solution-baseline` | An approved `archi` architecture and the target repo (`create` for an empty repo, `reconcile` for existing code, `upgrade` for an archetype version change) | The initialized or reconciled repository, `.solution-baseline/receipt.yaml`, and a handoff for Vulcano |
| 6. Build | `builder` | Free text, Jira/Azure DevOps work item, or `resources/functional/hu/*.md` | Code and tests in the target repo, following its real patterns (with Go, Angular, Java/Spring and Bancolombia Scaffold profiles); for standard/reinforced rigor, a change record in `docs/changes/<id>/` |
| 7. Review | `code-review` | A diff, PR, branch or Builder change, plus its spec/AC | `docs/changes/<id>/review.md` or `docs/reviews/CR-NNN-*.md` with verified findings and a verdict |
| 8. QA | `ranger` | Test plan / runbook / codebase | Test strategy and plans, automated tests, execution reports with evidence and a GO/NO-GO verdict |

Ranger uses the `qa-ranger-*` specialists for test plans, Playwright, Karate, Selenium, Robot Framework,
JMeter, and unit tests; all eight QA skills are registered in the common output contract
(`.claude/contracts/output/validators.json`).
See the [QA guide](.claude/doc/ranger/README.md) for their responsibilities and output contracts.

`genesis` was retired (commit `93e9800`); for a greenfield repo use `solution-baseline` in `create`
mode between `archi` and `builder` — `builder` assumes an existing codebase to detect the ecosystem
from and a reference module to imitate. For existing code, `solution-baseline` runs in `reconcile`
mode or is skipped. `builder` uses `code-review` as an independent reviewer (recommended for
standard rigor, mandatory for reinforced). `builder`, `code-review` and `ranger` optionally offer,
once at start, to connect a Jira or Azure DevOps board over MCP.

`aegis` is the defensive AppSec/DevSecOps specialist: it advises controls before `builder` implements,
audits code, IaC, pipelines, containers, dependencies and AI components, acts as a security gate for
reinforced changes, and only proposes (never edits) new threats for `archi`'s `19.1`. It is read-only
unless asked to `fix`, never prints secrets, and does no offensive work.

`terragrunt-iac` designs, generates, reviews and migrates Terragrunt 1.x IaC (OpenTofu/Terraform) and its
plan/apply pipelines. `code-review` reviews its output with `scripts/terragrunt_check.py` and
`references/terragrunt-iac.md`; `aegis` audits its security in `iac`/`pipeline` mode.

Transversal skills `docx`, `pdf`, `pptx`, `xlsx`, and `cronos` provide reusable
capabilities. Check the applicable transversal skill before writing ad hoc document
or presentation logic. For visual identity and editorial style, follow the templates,
assets, and instructions supplied by the user; do not treat repository defaults as approved
corporate policy.

`memoria` is the transversal memory/context skill: every skill records a progress node in the
project's `.memoria/` knowledge graph when it finishes a task (payload in `.memoria/pending/` or
`node .claude/skills/memoria/scripts/memoria.mjs record ...`), and the Stop hook in
`.claude/settings.json` consolidates pending nodes without blocking the session. The kit's GitHub
workflow validates `.memoria/graph.json`, runs the kit tests, and verifies that the thin Copilot
agent mirror (`.github/agents/`) stays in sync with `.claude/agents/`
(`test/validate-github-agents-sync.mjs`); `memoria init` installs the hook and a per-project
workflow. See `.claude/skills/memoria/SKILL.md`.

## `resources/` conventions

`resources/` is shared state, not scratch space — treat existing files as input to the next stage, not
disposable output.

- **Anti-collision numbering:** before creating a new file, list the destination folder and continue
  numbering from the highest existing ID/prefix; never restart at 1 if files already exist.
- **ID prefixes:** `RF-###` functional requirement, `RNF-###` non-functional requirement, `RT-###`
  technical requirement, `RD-###` design info (all from `janus`); `NNN-slug.md` refined specs (from
  `epicureo`); `HU-##` / `TT-##` user stories / technical tasks (from `specter`). `RD-###` is a valid
  refinement source for `epicureo` too (not just `RF`/`RNF`/`RT`) — a vague design guideline extracted by
  `janus` can and should go through the same ambiguity-reduction cycle before `archi` relies on it.
- **File naming:** `{ID}-{short-kebab-slug}.md`, slug derived from the title, lowercase, no accents,
  max ~6 words.
- Folders are created on demand by the skill that first needs them — an empty/missing
  `resources/<subfolder>` is expected on a fresh checkout (see the `.gitkeep` files) and is not a bug.
- `builder` reuses each component's real contracts (OpenAPI, GraphQL, AsyncAPI, event schemas…) where
  they already live, instead of centralizing them. When `resources/design/openapi.yaml` and `api.md` exist
  from earlier runs, it keeps them as inputs if they are still canonical and updates them per
  operation/schema without replacing other content (`builder/references/contracts-and-data.md`).
- When `builder` touches a shared contract, it checks route/method, operationId and name collisions and
  evaluates compatibility before persisting an incompatible change (see the "Evaluar compatibilidad"
  section of `builder/references/contracts-and-data.md`).
- `archi` (Caso A/C, Paso 0.5) reads `RNF-###`/`RT-###`/`RD-###` files individually and cites their ID
  when a decision traces back to one, instead of treating the folder as generic context — and (Paso 0.6)
  reads `resources/functional/hu/*.md` for any "Recurso de datos involucrado" section `specter` already
  resolved, using it as an authoritative starting point for the Modelo de Datos section rather than
  redesigning entities `specter` already committed to business.
- `resources/architecture/` holds `archi`'s numbered per-run artifacts (`00-Documento_Arquitectura_*.md`
  through `26-Validacion-y-Aprobacion.md`, `.drawio` deployment diagrams and, in multi-cloud mode, pricing
  and cost reports), or `resources/architecture/<Proyecto>/` when the repo holds several initiatives.
  Source material in `resources/architecture/definitions/` stays where it is.

## Jira / MCP integration

`epicureo`, `specter`, and `builder` can all read from or write to Jira issues when an Atlassian-compatible
MCP server is connected in the session; all fall back to the Markdown files in `resources/` when it isn't.
Don't assume Jira is available — check for the MCP tools first and offer the Markdown path if absent.

## Cloud deployment diagrams and MCP tooling in `archi`

Before generating any diagram, `archi` checks whether the `excalidraw-remoto` and `drawio-remoto` MCP
servers are connected; if not, it adds them to the user's MCP configuration and falls back to hand-authored
Mermaid/`.drawio` for that run rather than blocking (a freshly-added MCP server needs a client
reload/restart before its tools appear — see `archi/references/guia-mcp-diagramacion.md`).

- **Caso A, no cloud provider specified:** `archi` generates three deployment diagrams (AWS, Azure, GCP)
  in `.drawio` with each provider's official icon set, estimates cost per provider from currently
  published pricing (never hardcoded), and produces a comparison `Pricing_*.md` plus an
  `Arquitectura_Costos_*.html` report — see `archi/references/guia-multi-cloud-deployment.md` and
  `archi/references/guia-pricing-cloud.md`.
- **Caso B/C, no existing deployment doc:** `archi` looks for Terraform (`.tf`) in the target repo and
  derives the deployment diagram from the actual declared resources instead of guessing — see
  `archi/references/guia-terraform-a-diagrama.md`. Never invent a component that isn't backed by an `.md`
  doc or IaC.

## Producer/consumer changes in `builder`

Before splitting producers and consumers (e.g. backend and frontend), `builder` identifies a durable
revision of the shared contract and who may change it — even when only one side changes. Delegation
to sub-agents is optional: it requires available tools, authorization and truly independent tasks,
with one writer per file/zone and isolated worktrees; otherwise it works sequentially. Don't require
two sub-agents just because a change has a frontend and a backend
(`builder/references/resume-and-coordination.md`).
