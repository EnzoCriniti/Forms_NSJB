/**
 * @file backend/routes/systemRoutes.mjs
 * @summary Rotas de sistema e autenticacao da API.
 * @responsibility Concentrar health, bootstrap, auth e audit logs em um bloco menor.
 */

import { sendJson } from "../core/http.mjs";
import { extractBearerToken, loginWithCredentials, logoutByToken } from "../services/authService.mjs";
import { getBootstrap } from "../services/bootstrapService.mjs";
import { getFormDeleteKeyStatus, saveFormDeleteKey } from "../services/formDeleteKeyService.mjs";
import { listAuditLogs } from "../services/auditLogService.mjs";
import { validateAuthLoginPayload, validateFormDeleteKeyUpdatePayload } from "../validators/payloadValidators.mjs";
import {
  readAuditFilters,
  readBody,
  requireAdmin,
  requireAuth,
  sendKnownError,
} from "./requestHelpers.mjs";
import { writeAuthLoginAudit, writeAuthLogoutAudit, writeSecurityKeyAudit } from "./systemRouteAudit.mjs";

export const handleSystemRoutes = async (req, res, url) => {
  if (req.method === "POST" && url.pathname === "/api/auth/login") {
    const body = await readBody(req);
    if (!body) {
      sendJson(res, 400, { error: "Payload JSON invalido." });
      return true;
    }
    try {
      validateAuthLoginPayload(body);
      const result = await loginWithCredentials(body);
      sendJson(res, 200, result);
      await writeAuthLoginAudit(req, { result, body });
    } catch (error) {
      sendJson(res, error.statusCode || 400, { error: error.message, code: error.code });
      await writeAuthLoginAudit(req, { body, error });
    }
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/auth/logout") {
    const auth = await requireAuth(req);
    if (!auth) {
      sendJson(res, 401, { error: "Nao autenticado." });
      return true;
    }
    await logoutByToken(extractBearerToken(req.headers));
    sendJson(res, 200, { ok: true });
    await writeAuthLogoutAudit(req, auth);
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/auth/me") {
    const auth = await requireAuth(req);
    if (!auth) {
      sendJson(res, 401, { error: "Nao autenticado." });
      return true;
    }
    sendJson(res, 200, { user: auth.user, expiresAt: auth.expiresAt });
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/bootstrap") {
    sendJson(res, 200, await getBootstrap());
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/security/form-delete-key/status") {
    sendJson(res, 200, await getFormDeleteKeyStatus());
    return true;
  }

  if (req.method === "PUT" && url.pathname === "/api/security/form-delete-key") {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    const body = await readBody(req);
    if (!body) {
      sendJson(res, 400, { error: "Payload JSON invalido." });
      writeSecurityKeyAudit(req, auth, { message: "Payload JSON invalido." });
      return true;
    }
    try {
      validateFormDeleteKeyUpdatePayload(body);
      const result = await saveFormDeleteKey(body);
      sendJson(res, 200, result);
      await writeSecurityKeyAudit(req, auth, { success: true });
    } catch (error) {
      if (sendKnownError(res, error)) {
        await writeSecurityKeyAudit(req, auth, { error });
        return true;
      }
      await writeSecurityKeyAudit(req, auth, { error });
      throw error;
    }
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/audit-logs") {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    sendJson(res, 200, await listAuditLogs(readAuditFilters(url)));
    return true;
  }

  return false;
};
