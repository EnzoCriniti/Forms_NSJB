import { auditLevelFromError, auditStatusFromError, getSystemActor, writeAudit } from "./requestHelpers.mjs";

export const writeAuthLoginAudit = (req, { result = null, body = null, error = null }) => {
  if (error) {
    return writeAudit(req, null, {
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

  return writeAudit(req, result, {
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
};

export const writeAuthLogoutAudit = (req, auth) => (
  writeAudit(req, auth, {
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
  })
);

export const writeSecurityKeyAudit = (req, auth, { error = null, message = null, success = false }) => (
  writeAudit(req, auth, {
    level: success ? "info" : (error ? auditLevelFromError(error) : "error"),
    category: "security",
    action: "security_master_key_update",
    status: success ? "success" : (error ? auditStatusFromError(error) : "failure"),
    screen: "seguranca",
    entityType: "security",
    entityId: "formDeleteKey",
    entityLabel: "Chave mestra",
    message: error?.message || message || (success ? "Chave mestra atualizada." : "Falha ao atualizar chave mestra."),
    metadata: {
      status: success ? "success" : (error ? auditStatusFromError(error) : "failure"),
    },
  })
);
