/**
 * @file backend/routes/adminRoutes.mjs
 * @summary Rotas administrativas da API.
 * @responsibility Concentrar usuarios, classificacoes, presets e catalogos em um modulo proprio.
 */

import { sendJson } from "../core/http.mjs";
import {
  sendAdminMutationError,
  writeAdminMutationAudit,
} from "./adminRouteHelpers.mjs";
import { handleAdminCatalogRoutes } from "./adminCatalogRoutes.mjs";
import { handleAdminExternalBaseRoutes } from "./adminExternalBaseRoutes.mjs";
import {
  saveUser,
  deleteUser,
  saveLabel,
  deleteLabel,
  savePreset,
  deletePreset,
  savePeople,
  saveMembersConfig,
  syncMembersFromSource,
} from "../services/adminService.mjs";
import {
  validateDeleteId,
  validateLabelPayload,
  validateMembersConfigPayload,
  validatePeoplePayload,
  validatePresetPayload,
  validateUserPayload,
} from "../validators/payloadValidators.mjs";
import {
  readBody,
  requireAdmin,
} from "./requestHelpers.mjs";

export const handleAdminRoutes = async (req, res, url) => {
  if (await handleAdminCatalogRoutes(req, res, url)) {
    return true;
  }
  if (await handleAdminExternalBaseRoutes(req, res, url)) {
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/users") {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    const body = await readBody(req);
    try {
      validateUserPayload(body);
      const users = await saveUser(body);
      sendJson(res, 200, { users });
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_create_user",
        screen: "configuracoes",
        entityType: "user",
        entityId: body.id || null,
        entityLabel: body.name || body.username || null,
        message: "Usuario gravado.",
        metadata: {
          userId: body.id || null,
          username: body.username || null,
          role: body.role || null,
        },
      });
    } catch (error) {
      sendAdminMutationError(res, error);
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_create_user",
        screen: "configuracoes",
        entityType: "user",
        entityId: body?.id || null,
        entityLabel: body?.name || body?.username || null,
        message: "Usuario gravado.",
        metadata: {
          userId: body?.id || null,
          username: body?.username || null,
          role: body?.role || null,
        },
      }, error);
    }
    return true;
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/users/")) {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    const userId = validateDeleteId(url.pathname.split("/").pop(), "Id do usuario");
    try {
      const users = await deleteUser(userId);
      sendJson(res, 200, { users });
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_delete_user",
        screen: "configuracoes",
        entityType: "user",
        entityId: userId,
        entityLabel: null,
        message: "Usuario excluido.",
        metadata: { userId },
      });
    } catch (error) {
      sendAdminMutationError(res, error);
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_delete_user",
        screen: "configuracoes",
        entityType: "user",
        entityId: userId,
        entityLabel: null,
        message: "Usuario excluido.",
        metadata: { userId },
      }, error);
    }
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/labels") {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    const body = await readBody(req);
    try {
      validateLabelPayload(body);
      const labels = await saveLabel(body);
      sendJson(res, 200, { labels });
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_create_label",
        screen: "configuracoes",
        entityType: "label",
        entityId: body.id || null,
        entityLabel: body.name || null,
        message: "Classificacao gravada.",
        metadata: {
          labelId: body.id || null,
          name: body.name || null,
          color: body.color || null,
        },
      });
    } catch (error) {
      sendAdminMutationError(res, error);
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_create_label",
        screen: "configuracoes",
        entityType: "label",
        entityId: body?.id || null,
        entityLabel: body?.name || null,
        message: "Classificacao gravada.",
        metadata: {
          labelId: body?.id || null,
          name: body?.name || null,
          color: body?.color || null,
        },
      }, error);
    }
    return true;
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/labels/")) {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    const labelId = validateDeleteId(url.pathname.split("/").pop(), "Id da classificacao");
    try {
      const labels = await deleteLabel(labelId);
      sendJson(res, 200, { labels });
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_delete_label",
        screen: "configuracoes",
        entityType: "label",
        entityId: labelId,
        entityLabel: null,
        message: "Classificacao excluida.",
        metadata: { labelId },
      });
    } catch (error) {
      sendAdminMutationError(res, error);
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_delete_label",
        screen: "configuracoes",
        entityType: "label",
        entityId: labelId,
        entityLabel: null,
        message: "Classificacao excluida.",
        metadata: { labelId },
      }, error);
    }
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/presets") {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    const body = await readBody(req);
    try {
      validatePresetPayload(body);
      const presets = await savePreset(body);
      sendJson(res, 200, { presets });
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_create_preset",
        screen: "configuracoes",
        entityType: "preset",
        entityId: body.id || null,
        entityLabel: body.name || null,
        message: "Template gravado.",
        metadata: {
          presetId: body.id || null,
          name: body.name || null,
          type: body.type || null,
        },
      });
    } catch (error) {
      sendAdminMutationError(res, error);
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_create_preset",
        screen: "configuracoes",
        entityType: "preset",
        entityId: body?.id || null,
        entityLabel: body?.name || null,
        message: "Template gravado.",
        metadata: {
          presetId: body?.id || null,
          name: body?.name || null,
          type: body?.type || null,
        },
      }, error);
    }
    return true;
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/presets/")) {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    const presetId = validateDeleteId(url.pathname.split("/").pop(), "Id do preset");
    try {
      const presets = await deletePreset(presetId);
      sendJson(res, 200, { presets });
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_delete_preset",
        screen: "configuracoes",
        entityType: "preset",
        entityId: presetId,
        entityLabel: null,
        message: "Template excluido.",
        metadata: { presetId },
      });
    } catch (error) {
      sendAdminMutationError(res, error);
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_delete_preset",
        screen: "configuracoes",
        entityType: "preset",
        entityId: presetId,
        entityLabel: null,
        message: "Template excluido.",
        metadata: { presetId },
      }, error);
    }
    return true;
  }

  if (req.method === "PUT" && url.pathname === "/api/people") {
    const auth = await requireAdmin(req, res);
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
    const auth = await requireAdmin(req, res);
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
    const auth = await requireAdmin(req, res);
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
