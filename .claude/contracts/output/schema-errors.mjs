// Diagnósticos estables del contrato. Ajv generado decide la aceptación.
// All rules and traversal order come from the schema, including composed schemas.
import { equal, isObject, repr, formatList, unicodeNonspace } from "./rules.mjs";
import { uriSchema } from "./schemas/result.validate.mjs";
export function schemaErrors(schema, value, root = schema, at = "$") {
  const errors = [];
  const add = (message) => errors.push({ path: at, message });
  const matches = (v, t) =>
    ({
      object: isObject(v),
      array: Array.isArray(v),
      string: typeof v === "string",
      null: v === null,
      boolean: typeof v === "boolean",
      integer: Number.isInteger(v),
      number: typeof v === "number" && Number.isFinite(v),
    })[t];
  for (const [key, rule] of Object.entries(schema)) {
    if (key === "$ref") {
      const target = rule
        .slice(2)
        .split("/")
        .reduce((s, k) => s[k], root);
      errors.push(...schemaErrors(target, value, root, at));
    }
    if (
      key === "type" &&
      !(Array.isArray(rule) ? rule : [rule]).some((t) => matches(value, t))
    )
      add(
        `${repr(value)} is not of type ${Array.isArray(rule) ? rule.map(repr).join(", ") : repr(rule)}`,
      );
    if (key === "const" && !equal(value, rule))
      add(`${repr(rule)} was expected`);
    if (key === "enum" && !rule.some((v) => equal(v, value)))
      add(`${repr(value)} is not one of ${formatList(rule)}`);
    if (key === "required" && isObject(value))
      for (const k of rule)
        if (!Object.hasOwn(value, k)) add(`${repr(k)} is a required property`);
    if (key === "additionalProperties" && rule === false && isObject(value)) {
      const extras = Object.keys(value)
        .filter((k) => !Object.hasOwn(schema.properties ?? {}, k))
        .sort();
      if (extras.length)
        add(
          `Additional properties are not allowed (${extras.map(repr).join(", ")} ${extras.length === 1 ? "was" : "were"} unexpected)`,
        );
    }
    if (key === "properties" && isObject(value))
      for (const [k, sub] of Object.entries(rule))
        if (Object.hasOwn(value, k))
          errors.push(
            ...schemaErrors(
              sub,
              value[k],
              root,
              `${at}${/^[A-Za-z_][A-Za-z0-9_]*$/.test(k) ? `.${k}` : `[${repr(k)}]`}`,
            ),
          );
    if (key === "items" && Array.isArray(value))
      value.forEach((v, i) =>
        errors.push(...schemaErrors(rule, v, root, `${at}[${i}]`)),
      );
    if (
      key === "minLength" &&
      typeof value === "string" &&
      [...value].length < rule
    )
      add(
        value === "" && rule === 1
          ? "'' should be non-empty"
          : `${repr(value)} is too short`,
      );
    if (
      key === "pattern" &&
      typeof value === "string" &&
      !new RegExp(rule.replaceAll("\\S", unicodeNonspace), "u").test(value)
    )
      add(`${repr(value)} does not match ${repr(rule)}`);
    if (key === "minimum" && typeof value === "number" && value < rule)
      add(`${value} is less than the minimum of ${rule}`);
    if (
      key === "uniqueItems" &&
      rule &&
      Array.isArray(value) &&
      value.some((v, i) => value.slice(0, i).some((x) => equal(x, v)))
    )
      add(`${repr(value)} has non-unique elements`);
    if (key === "dependentRequired" && isObject(value))
      for (const [k, dependencies] of Object.entries(rule))
        if (Object.hasOwn(value, k))
          for (const d of dependencies)
            if (!Object.hasOwn(value, d))
              add(`${repr(d)} is a dependency of ${repr(k)}`);
    if (
      key === "format" &&
      rule === "uri" &&
      typeof value === "string" &&
      !uriSchema(value)
    )
      add(`${repr(value)} is not a 'uri'`);
    if (key === "oneOf") {
      const valid = rule.filter(
        (sub) => !schemaErrors(sub, value, root, at).length,
      );
      if (!valid.length)
        add(`${repr(value)} is not valid under any of the given schemas`);
      else if (valid.length > 1) {
        // jsonschema lists the remaining passing schemas before the first match.
        const ordered = [...valid.slice(1), valid[0]];
        add(
          `${repr(value)} is valid under each of ${ordered.map(repr).join(", ")}`,
        );
      }
    }
  }
  return errors;
}
export function diagnostic(schema, value, withPath = true) {
  return schemaErrors(schema, value)
    .slice(0, 20)
    .map((e) => (withPath ? `${e.path}: ${e.message}` : e.message))
    .join("; ");
}
