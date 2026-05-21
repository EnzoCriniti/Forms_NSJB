/**
 * @file backend/validators/payloadValidatorPrimitives.mjs
 * @summary Predicados basicos compartilhados pelos validadores de payload.
 * @responsibility Manter checagens estruturais simples sem conhecer dominios da API.
 */

export const assertPayload = (condition, message) => {
  if (!condition) throw new Error(message);
};

export const isObject = value => value !== null && typeof value === "object" && !Array.isArray(value);
export const isNonEmptyString = value => typeof value === "string" && value.trim().length > 0;
export const isOptionalString = value => value === undefined || value === null || typeof value === "string";
export const isOptionalBoolean = value => value === undefined || value === null || typeof value === "boolean";
export const isOptionalNumberLike = value => value === undefined || value === null || value === "" || Number.isFinite(Number(value));
export const isIdLike = value => value === undefined || value === null || Number.isInteger(Number(value));
export const isOptionalPositiveIntegerLike = value => value === undefined || value === null || value === "" || (Number.isInteger(Number(value)) && Number(value) > 0);
