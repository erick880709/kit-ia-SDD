// RFC 3986 permits an empty hier-part (e.g. custom: or custom:?query).
// La alternativa de ruta vacía complementa los formatos RFC admitidos por el contrato.
import formats from "ajv-formats/dist/formats.js";
const standard = formats.fullFormats.uri;
const emptyPath =
  /^[a-zA-Z][a-zA-Z0-9+.-]*:(?:\?(?:[a-zA-Z0-9_.~\-!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*)?(?:#(?:[a-zA-Z0-9_.~\-!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*)?$/;
export function uri(value) {
  return standard(value) || emptyPath.test(value);
}
