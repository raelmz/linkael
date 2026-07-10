// Códigos que não podem ser usados como slug personalizado,
// pois colidem com rotas internas da aplicação.
export const RESERVED_CODES = ["api", "style.css", "script.js", "stats", "favicon.ico", ""];

/**
 * Valida se a string é uma URL http(s) minimamente bem formada.
 */
export function isValidUrl(url) {
  if (!url) return false;
  return /^https?:\/\/.+/.test(url);
}

/**
 * Valida o formato de um código curto personalizado:
 * entre 3 e 20 caracteres, apenas letras, números e hífen.
 */
export function isValidCode(code) {
  if (!code) return false;
  return /^[a-zA-Z0-9-]{3,20}$/.test(code);
}
