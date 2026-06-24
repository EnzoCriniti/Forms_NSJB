/**
 * @file backend/routes/adminExternalBaseRoutes.mjs
 * @summary Rotas administrativas de bases externas.
 * @responsibility Salvar, excluir e sincronizar bases externas da configuracao.
 */

import { sendJson } from "../core/http.mjs";
import {
  deleteExternalBase,
  saveExternalBase,
  syncExternalBase,
} from "../services/adminService.mjs";
import {
  validateDeleteId,
  validateExternalBasePayload,
} from "../validators/payloadValidators.mjs";
import {
  sendAdminMutationError,
  writeAdminMutationAudit,
} from "./adminRouteHelpers.mjs";
import { readBody, requireCapability } from "./requestHelpers.mjs";

export const handleAdminExternalBaseRoutes = async (req, res, url) => {
  if (req.method === "POST" && url.pathname === "/api/external-bases") {
    const auth = await requireCapability(req, res, "settings.bases");
    if (!auth) return true;
    const body = await readBody(req);
    try {
      validateExternalBasePayload(body);
      const externalBases = await saveExternalBase(body);
      sendJson(res, 200, { externalBases });
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_save_external_base",
        screen: "configuracoes",
        entityType: "external-base",
        entityId: body.id || null,
        entityLabel: body.name || null,
        message: "Base externa gravada.",
        metadata: {
          baseId: body.id || null,
          name: body.name || null,
          sourceType: body.sourceType || null,
        },
      });
    } catch (error) {
      sendAdminMutationError(res, error);
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_save_external_base",
        screen: "configuracoes",
        entityType: "external-base",
        entityId: body?.id || null,
        entityLabel: body?.name || null,
        message: "Base externa gravada.",
        metadata: {
          baseId: body?.id || null,
          name: body?.name || null,
          sourceType: body?.sourceType || null,
        },
      }, error);
    }
    return true;
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/external-bases/")) {
    const auth = await requireCapability(req, res, "settings.bases");
    if (!auth) return true;
    const baseId = validateDeleteId(url.pathname.split("/").pop(), "Id da base externa");
    try {
      const externalBases = await deleteExternalBase(baseId);
      sendJson(res, 200, { externalBases });
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_delete_external_base",
        screen: "configuracoes",
        entityType: "external-base",
        entityId: baseId,
        entityLabel: null,
        message: "Base externa excluida.",
        metadata: { baseId },
      });
    } catch (error) {
      sendAdminMutationError(res, error);
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_delete_external_base",
        screen: "configuracoes",
        entityType: "external-base",
        entityId: baseId,
        entityLabel: null,
        message: "Base externa excluida.",
        metadata: { baseId },
      }, error);
    }
    return true;
  }

  if (req.method === "POST" && /\/api\/external-bases\/\d+\/sync$/.test(url.pathname)) {
    const auth = await requireCapability(req, res, "settings.bases");
    if (!auth) return true;
    const baseId = validateDeleteId(url.pathname.split("/")[3], "Id da base externa");
    try {
      const result = await syncExternalBase(baseId);
      sendJson(res, 200, result);
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_sync_external_base",
        screen: "configuracoes",
        entityType: "external-base",
        entityId: baseId,
        entityLabel: result.externalBase?.name || null,
        message: "Base externa sincronizada.",
        metadata: {
          baseId,
          importedCount: result.importedCount,
        },
      });
    } catch (error) {
      sendAdminMutationError(res, error);
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_sync_external_base",
        screen: "configuracoes",
        entityType: "external-base",
        entityId: baseId,
        entityLabel: null,
        message: "Base externa sincronizada.",
        metadata: { baseId },
      }, error);
    }
    return true;
  }

  return false;
};
