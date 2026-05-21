/**
 * @file backend/routes/adminRouteHelpers.mjs
 * @summary Helpers especificos das rotas administrativas.
 * @responsibility Padronizar erro e auditoria de mutacoes admin sem misturar regra de negocio.
 */

import { sendJson } from "../core/http.mjs";
import {
  auditLevelFromError,
  auditStatusFromError,
  sendKnownError,
  writeAudit,
} from "./requestHelpers.mjs";

export const sendAdminMutationError = (res, error) => {
  if (sendKnownError(res, error)) return;
  sendJson(res, 400, { error: error.message });
};

export const writeAdminMutationAudit = (req, auth, auditEvent, error = null) => writeAudit(req, auth, {
  ...auditEvent,
  level: error ? auditLevelFromError(error) : "info",
  status: error ? auditStatusFromError(error) : "success",
  message: error ? error.message : auditEvent.message,
});
