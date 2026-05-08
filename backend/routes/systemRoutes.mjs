/**
 * @file backend/routes/systemRoutes.mjs
 * @summary Rotas de sistema e autenticacao da API.
 * @responsibility Concentrar health, bootstrap, auth e audit logs em um bloco menor.
 */

import { sendJson } from "../core/http.mjs";
import { extractBearerToken, loginWithCredentials, logoutByToken } from "../services/authService.mjs";
import { getBootstrap } from "../services/bootstrapService.mjs";
import { getFormDeleteKeyStatus } from "../services/adminService.mjs";
import { listAuditLogs } from "../services/auditLogService.mjs";
import { validateAuthLoginPayload } from "../validators/payloadValidators.mjs";
import {
  auditLevelFromError,
  auditStatusFromError,
  getSystemActor,
  readAuditFilters,
  readBody,
  requireAdmin,
  requireAuth,
  writeAudit,
} from "./requestHelpers.mjs";

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
      await writeAudit(req, result, {
        level: "info",
        category: "auth",
        action: "auth_login",
        status: "success",
        screen: "auth",
        entityType: "user",
        entityId: result.user?.id || null,
        entityLabel: result.user?.name || body.username || null,
        message: "Login autenticado com sucesso.",
        metadata: {
          username: result.user?.username || body.username || null,
        },
        actor: result.user || getSystemActor(),
      });
    } catch (error) {
      sendJson(res, error.statusCode || 400, { error: error.message, code: error.code });
      await writeAudit(req, null, {
        level: "warn",
        category: "auth",
        action: "auth_login",
        status: "failure",
        screen: "auth",
        message: error.message,
        metadata: {
          username: body?.username || null,
          code: error.code || null,
        },
      });
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
    await writeAudit(req, auth, {
      level: "info",
      category: "auth",
      action: "auth_logout",
      status: "success",
      screen: "auth",
      entityType: "user",
      entityId: auth.user?.id || null,
      entityLabel: auth.user?.name || null,
      message: "Logout realizado.",
      metadata: { session: "revoked" },
    });
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

  if (req.method === "GET" && url.pathname === "/api/audit-logs") {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    sendJson(res, 200, await listAuditLogs(readAuditFilters(url)));
    return true;
  }

  return false;
};
