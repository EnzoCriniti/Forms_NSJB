/**
 * @file server/services/auditLogService.mjs
 * @summary Regras de auditoria administrativa.
 * @responsibility Sanitizar metadata e registrar eventos com o actor resolvido no backend.
 */

import { nowIso } from "../db.mjs";
import { insertAuditLogRecord, listAuditLogRecords } from "../repositories/auditLogRepository.mjs";

const SENSITIVE_KEYS = new Set([
  "password",
  "masterKey",
  "currentMasterKey",
  "newMasterKey",
  "token",
  "sessionToken",
  "secret",
  "hash",
  "salt",
]);

const DEFAULT_VISITOR_ACTOR = {
  id: null,
  name: "Visitante",
  role: "visitor",
};

const DEFAULT_SYSTEM_ACTOR = {
  id: null,
  name: "Sistema",
  role: "system",
};

const normalizeText = value => String(value ?? "").trim();

const sanitizeString = value => {
  const text = String(value ?? "");
  if (text.length <= 500) return text;
  return `${text.slice(0, 500)}...`;
};

const countObjectKeys = value => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return 0;
  return Object.keys(value).length;
};

const sanitizeValue = (value, depth = 0) => {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return sanitizeString(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) {
    if (depth >= 4) return `[array:${value.length}]`;
    return value.map(item => sanitizeValue(item, depth + 1));
  }
  if (typeof value === "object") {
    if (depth >= 4) return "[object]";
    const output = {};
    for (const [key, child] of Object.entries(value)) {
      if (SENSITIVE_KEYS.has(String(key))) continue;
      if (String(key) === "values" && child && typeof child === "object" && !Array.isArray(child)) {
        output.values = {
          fieldCount: countObjectKeys(child),
        };
        continue;
      }
      output[key] = sanitizeValue(child, depth + 1);
    }
    return output;
  }
  return sanitizeString(value);
};

const levelFromStatus = status => {
  if (status === "success") return "info";
  if (status === "denied" || status === "conflict") return "warn";
  return "error";
};

const normalizeActor = actor => {
  if (!actor) return DEFAULT_VISITOR_ACTOR;
  return {
    id: actor.id ?? null,
    name: normalizeText(actor.name) || DEFAULT_VISITOR_ACTOR.name,
    role: normalizeText(actor.role) || DEFAULT_VISITOR_ACTOR.role,
  };
};

const toStoredActor = actor => {
  const normalized = normalizeActor(actor);
  return {
    actorId: normalized.id,
    actorName: normalized.name,
    actorRole: normalized.role,
  };
};

export const buildAuditActorFromAuth = (auth, fallbackActor = DEFAULT_VISITOR_ACTOR) => (
  auth?.user
    ? normalizeActor(auth.user)
    : fallbackActor
);

export const getSystemAuditActor = () => DEFAULT_SYSTEM_ACTOR;

export const summarizeResponseAuditMetadata = ({ formId, responseId, values, mode }) => ({
  formId,
  responseId,
  fieldCount: countObjectKeys(values),
  mode,
});

export const summarizeSecurityAuditMetadata = ({ status }) => ({
  status,
});

export const sanitizeAuditMetadata = metadata => sanitizeValue(metadata ?? {});

export const recordAuditLog = ({
  level,
  category,
  action,
  status,
  screen = null,
  actor = null,
  entityType = null,
  entityId = null,
  entityLabel = null,
  message = null,
  metadata = {},
  requestId = null,
  ipAddress = null,
  userAgent = null,
}) => {
  try {
    insertAuditLogRecord({
      createdAt: nowIso(),
      level: level || levelFromStatus(status),
      category,
      action,
      status,
      screen,
      ...toStoredActor(actor),
      entityType,
      entityId,
      entityLabel,
      message,
      metadata: sanitizeAuditMetadata(metadata),
      requestId,
      ipAddress,
      userAgent,
    });
    return true;
  } catch {
    return false;
  }
};

export const listAuditLogs = filters => listAuditLogRecords(filters);
