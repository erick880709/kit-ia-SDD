// Genera el dataset dorado del Evaluation Harness (cases/*.json).
// Uso: node .claude/skills/specter/evaluations/generate-cases.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "cases");
const now = "2026-11-02T15:00:00Z";

function hu(id, title, over = {}) {
  return {
    id, type: "Historia de Usuario", title, status: "ready",
    schema_version: "0.1.0", artifact_version: "1", created_at: now, updated_at: now,
    business_value: "Valor de negocio.",
    user_story: { role: "usuario", action: "usar la funcionalidad", benefit: "lograr su objetivo" },
    scope: { included: ["alcance"], excluded: [] },
    acceptance_criteria: [{ id: "CA1", scenario: "Dado un contexto, cuando actúa, entonces observa el resultado.", negative: false }],
    main_flow: ["Paso 1"], requirement_ids: [], dependencies: [], priority: "Media", points: 5,
    ...over,
  };
}

function tt(id, parent, over = {}) {
  return {
    id, type: "Tarea Técnica", title: "Tarea técnica", parent_hu_id: parent, status: "ready",
    schema_version: "0.1.0", artifact_version: "1", created_at: now, updated_at: now,
    technical_objective: "Objetivo técnico.", implementation_steps: ["Paso 1"],
    definition_of_done: ["Criterio verificable con detalle"], test_strategy: "Pruebas",
    evidence_requirements: ["Evidencia"], component: "backend", architecture_layer: "api", dependencies: [],
    ...over,
  };
}

const cases = [
  { id: "epic-completa", name: "Épica completa", description: "Épica con alcance claro produce HU y TT listas.",
    input: { epic: "Como usuario quiero iniciar sesión para acceder." },
    requirements: ["RF-001", "RF-002"], ambiguities: [], duplicates_injected: 0,
    artifacts: [
      { kind: "user_story", id: "HU-01", expected_state: "READY", data: hu("HU-01", "Iniciar sesión", { requirement_ids: ["RF-001", "RF-002"], priority: "Alta" }) },
      { kind: "technical_task", id: "TT-01", expected_state: "READY", data: tt("TT-01", "HU-01") },
    ] },
  { id: "epic-ambigua", name: "Épica ambigua", description: "Tecnología sin versión se registra como pregunta abierta; la HU queda incompleta.",
    input: { epic: "El sistema debe usar Spring Boot para la autenticación." },
    requirements: ["RF-003"], ambiguities: ["spring-boot"], duplicates_injected: 0,
    artifacts: [
      { kind: "user_story", id: "HU-02", expected_state: "NEEDS_REFINEMENT",
        data: hu("HU-02", "Autenticar con Spring Boot", { business_value: undefined, requirement_ids: ["RF-003"], open_questions: ["spring-boot: ¿qué versión de Spring Boot se requiere?"] }) },
    ] },
  { id: "requisitos-contradictorios", name: "Requerimientos contradictorios", description: "Contradicción se manifiesta como criterios duplicados: el gate bloquea.",
    input: { epic: "El alta debe permitir y a la vez impedir la edición posterior." },
    requirements: ["RF-004"], ambiguities: [], duplicates_injected: 0,
    artifacts: [
      { kind: "user_story", id: "HU-03", expected_state: "BLOCKED",
        data: hu("HU-03", "Editar registro", { requirement_ids: ["RF-004"],
          acceptance_criteria: [
            { id: "CA1", scenario: "Dado X, cuando Y, entonces Z." },
            { id: "CA1", scenario: "Dado A, cuando B, entonces C." },
          ] }) },
    ] },
  { id: "requisitos-sin-rnf", name: "Requerimientos sin RNF", description: "Sin RNF: no se inventan referencias; nfr_references queda vacío y la HU sigue lista.",
    input: { epic: "CRUD de productos." },
    requirements: ["RF-005"], ambiguities: [], duplicates_injected: 0,
    artifacts: [
      { kind: "user_story", id: "HU-04", expected_state: "READY", data: hu("HU-04", "Crear producto", { requirement_ids: ["RF-005"], nfr_references: [] }) },
    ] },
  { id: "crud", name: "Funcionalidad CRUD", description: "CRUD: HU de creación y TT de migración, ambas listas.",
    input: { epic: "Gestión de productos." },
    requirements: ["RF-006"], ambiguities: [], duplicates_injected: 0,
    artifacts: [
      { kind: "user_story", id: "HU-05", expected_state: "READY", data: hu("HU-05", "Crear producto", { requirement_ids: ["RF-006"] }) },
      { kind: "technical_task", id: "TT-05", expected_state: "READY", data: tt("TT-05", "HU-05") },
    ] },
  { id: "integracion-api-externa", name: "Integración con API externa", description: "Componente no identificado: la TT queda en refinamiento sin inventar el componente.",
    input: { epic: "Integrar pagos con proveedor externo." },
    requirements: [], ambiguities: [], duplicates_injected: 0,
    artifacts: [
      { kind: "technical_task", id: "TT-06", expected_state: "NEEDS_REFINEMENT",
        data: tt("TT-06", "HU-05", { component: null, api_contracts: ["POST /pagos (proveedor externo)"] }) },
    ] },
  { id: "hu-demasiado-grande", name: "HU demasiado grande", description: "HU con 13 puntos no es estimable como pequeña: refinamiento.",
    input: { epic: "Plataforma completa de facturación." },
    requirements: ["RF-007"], ambiguities: [], duplicates_injected: 0,
    artifacts: [
      { kind: "user_story", id: "HU-07", expected_state: "NEEDS_REFINEMENT", data: hu("HU-07", "Facturación completa", { requirement_ids: ["RF-007"], points: 13 }) },
    ] },
  { id: "hu-duplicadas", name: "HU duplicadas", description: "Dos HU con el mismo título: el harness detecta la duplicidad.",
    input: { epic: "Consultar movimientos." },
    requirements: ["RF-008"], ambiguities: [], duplicates_injected: 1,
    artifacts: [
      { kind: "user_story", id: "HU-08a", expected_state: "READY", data: hu("HU-08a", "Consultar movimientos", { requirement_ids: ["RF-008"] }) },
      { kind: "user_story", id: "HU-08b", expected_state: "READY", data: hu("HU-08b", "Consultar movimientos", { requirement_ids: ["RF-008"] }) },
    ] },
  { id: "cambio-sistema-existente", name: "Cambio sobre sistema existente", description: "TT sobre componente existente identificado: lista.",
    input: { epic: "Añadir filtro al listado existente." },
    requirements: [], ambiguities: [], duplicates_injected: 0,
    artifacts: [
      { kind: "technical_task", id: "TT-09", expected_state: "READY", data: tt("TT-09", "HU-04", { component: "modulo-productos", architecture_layer: "backend" }) },
    ] },
  { id: "historia-sin-valor", name: "Historia sin valor de negocio", description: "HU sin business_value: refinamiento.",
    input: { epic: "Exportar datos." },
    requirements: ["RF-009"], ambiguities: [], duplicates_injected: 0,
    artifacts: [
      { kind: "user_story", id: "HU-10", expected_state: "NEEDS_REFINEMENT", data: hu("HU-10", "Exportar datos", { requirement_ids: ["RF-009"], business_value: undefined }) },
    ] },
];

for (const c of cases) {
  fs.writeFileSync(path.join(dir, `${c.id}.json`), JSON.stringify(c, null, 2) + "\n", "utf8");
}
console.log(`${cases.length} casos regenerados en ${dir}`);
