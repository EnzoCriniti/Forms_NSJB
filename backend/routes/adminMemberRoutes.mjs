/**
 * @file backend/routes/adminMemberRoutes.mjs
 * @summary Rotas administrativas de socios.
 * @responsibility Salvar socios, configurar a origem e disparar sincronizacao.
 */

import { sendJson } from "../core/http.mjs";
import {
  saveMembersConfig,
  savePeople,
  syncMembersFromSource,
} from "../services/adminService.mjs";
import {
  validateMembersConfigPayload,
  validatePeoplePayload,
} from "../validators/payloadValidators.mjs";
import {
  sendAdminMutationError,
  writeAdminMutationAudit,
} from "./adminRouteHelpers.mjs";
import { readBody, requireCapability } from "./requestHelpers.mjs";

export const handleAdminMemberRoutes = async (req, res, url) => {
  if (req.method === "PUT" && url.pathname === "/api/people") {
    const auth = await requireCapability(req, res, "members.manage");
    if (!auth) return true;
    const body = await readBody(req);
    try {
      validatePeoplePayload(body);
      const people = await savePeople(body.people || []);
      sendJson(res, 200, { people });
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_update_members_config",
        screen: "configuracoes",
        entityType: "people",
        entityId: null,
        entityLabel: "Socios",
        message: "Lista de socios atualizada.",
        metadata: {
          peopleCount: Array.isArray(body.people) ? body.people.length : 0,
        },
      });
    } catch (error) {
      sendAdminMutationError(res, error);
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_update_members_config",
        screen: "configuracoes",
        entityType: "people",
        entityId: null,
        entityLabel: "Socios",
        message: "Lista de socios atualizada.",
        metadata: {
          peopleCount: Array.isArray(body?.people) ? body.people.length : 0,
        },
      }, error);
    }
    return true;
  }

  if (req.method === "PUT" && url.pathname === "/api/members-config") {
    const auth = await requireCapability(req, res, "members.manage");
    if (!auth) return true;
    const body = await readBody(req);
    try {
      validateMembersConfigPayload(body);
      const membersConfig = await saveMembersConfig(body);
      sendJson(res, 200, { membersConfig });
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_update_members_config",
        screen: "configuracoes",
        entityType: "members-config",
        entityId: "membersConfig",
        entityLabel: "Configuracao de socios",
        message: "Configuracao de socios atualizada.",
        metadata: {
          sheetUrl: body?.sheetUrl || null,
          range: body?.range || null,
        },
      });
    } catch (error) {
      sendAdminMutationError(res, error);
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_update_members_config",
        screen: "configuracoes",
        entityType: "members-config",
        entityId: "membersConfig",
        entityLabel: "Configuracao de socios",
        message: "Configuracao de socios atualizada.",
        metadata: {
          sheetUrl: body?.sheetUrl || null,
          range: body?.range || null,
        },
      }, error);
    }
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/members-config/sync") {
    const auth = await requireCapability(req, res, "members.manage");
    if (!auth) return true;
    try {
      const result = await syncMembersFromSource();
      sendJson(res, 200, result);
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_sync_members",
        screen: "configuracoes",
        entityType: "people",
        entityId: null,
        entityLabel: "Socios",
        message: "Base de socios sincronizada.",
        metadata: {
          importedCount: result.importedCount,
          sourceType: result.membersConfig?.sourceType || null,
        },
      });
    } catch (error) {
      sendAdminMutationError(res, error);
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_sync_members",
        screen: "configuracoes",
        entityType: "people",
        entityId: null,
        entityLabel: "Socios",
        message: "Base de socios sincronizada.",
        metadata: {},
      }, error);
    }
    return true;
  }

  return false;
};
