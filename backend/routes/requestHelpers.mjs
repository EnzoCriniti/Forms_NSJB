/**
 * @file backend/routes/requestHelpers.mjs
 * @summary Helpers compartilhados entre handlers HTTP da API.
 * @responsibility Manter leitura de corpo, auth e auditoria fora do roteador principal.
 */

import { parseBody, sendJson } from "../core/http.mjs";
import { extractBearerToken, getAuthenticatedUserFromToken } from "../services/authService.mjs";
import { buildAuditActorFromAuth, getSystemAuditActor, recordAuditLog } from "../services/auditLogService.mjs";

const VISITOR_ACTOR = { id: null, name: "Visitante", role: "visitor" };

export const readBody = async req => {
  try {
    return await parseBody(req);
  } catch {
    return null;
  }
};

export const sendKnownError = (res, error) => {
  if (!error?.statusCode) return false;
  sendJson(res, error.statusCode, { error: error.message, code: error.code || undefined });
  return true;
};

export const sendEscalaError = (res, error) => {
  if (error?.statusCode === 409 || error?.code === "ESCALA_CONFLICT") {
    sendJson(res, 409, { error: error.message, code: error.code || "ESCALA_CONFLICT" });
    return true;
  }

  if (error?.statusCode === 404 || error?.code === "FORM_NOT_FOUND") {
    sendJson(res, 404, { error: error.message, code: error.code || "FORM_NOT_FOUND" });
    return true;
  }

  return false;
};

export const requireAuth = async req => {
  const token = extractBearerToken(req.headers);
  if (!token) return null;
  return getAuthenticatedUserFromToken(token);
};

export const requireAdmin = async (req, res) => {
  const auth = await requireAuth(req);
  if (!auth) {
    sendJson(res, 401, { error: "Nao autenticado." });
    return null;
  }
  if (auth.user?.role !== "admin") {
    sendJson(res, 403, { error: "Permissao insuficiente." });
    return null;
  }
  return auth;
};

export const auditMeta = req => ({
  requestId: req.auditContext?.requestId || null,
  ipAddress: req.auditContext?.ipAddress || null,
  userAgent: req.auditContext?.userAgent || null,
});

export const auditActor = (auth, fallback = VISITOR_ACTOR) => buildAuditActorFromAuth(auth, fallback);

export const getVisitorActor = () => VISITOR_ACTOR;

export const writeAudit = async (req, auth, event) => {
  await recordAuditLog({
    ...event,
    actor: event.actor || auditActor(auth, event.fallbackActor || VISITOR_ACTOR),
    ...auditMeta(req),
  });
};

export const getSystemActor = () => getSystemAuditActor();

export const auditLevelFromError = error => {
  if (error?.code === "ESCALA_CONFLICT" || error?.code === "ESCALA_LIMIT_REACHED" || error?.statusCode === 409) return "warn";
  if (error?.statusCode === 403) return "warn";
  return "error";
};

export const auditStatusFromError = error => {
  if (error?.code === "ESCALA_CONFLICT" || error?.code === "ESCALA_LIMIT_REACHED" || error?.statusCode === 409) return "conflict";
  if (error?.statusCode === 403) return "denied";
  return "failure";
};

const toAuditDate = (value, endOfDay = false) => {
  const text = String(value || "").trim();
  if (!text) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return new Date(`${text}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`).toISOString();
  }
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

export const readAuditFilters = url => ({
  from: toAuditDate(url.searchParams.get("from")),
  to: toAuditDate(url.searchParams.get("to"), true),
  level: url.searchParams.get("level"),
  category: url.searchParams.get("category"),
  action: url.searchParams.get("action"),
  status: url.searchParams.get("status"),
  screen: url.searchParams.get("screen"),
  actor: url.searchParams.get("actor"),
  entityType: url.searchParams.get("entityType"),
  entityId: url.searchParams.get("entityId"),
  search: url.searchParams.get("search"),
  limit: url.searchParams.get("limit"),
  offset: url.searchParams.get("offset"),
});
