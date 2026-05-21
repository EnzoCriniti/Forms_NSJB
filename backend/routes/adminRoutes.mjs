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
  saveExternalBase,
  deleteExternalBase,
  syncExternalBase,
  saveFieldCatalogItem,
  deleteFieldCatalogItem,
  saveScaleTaskCatalogItem,
  deleteScaleTaskCatalogItem,
} from "../services/adminService.mjs";
import {
  validateDeleteId,
  validateExternalBasePayload,
  validateFieldCatalogPayload,
  validateLabelPayload,
  validateMembersConfigPayload,
  validatePeoplePayload,
  validatePresetPayload,
  validateScaleTaskCatalogPayload,
  validateUserPayload,
} from "../validators/payloadValidators.mjs";
import {
  auditLevelFromError,
  auditStatusFromError,
  readBody,
  requireAdmin,
  sendKnownError,
  writeAudit,
} from "./requestHelpers.mjs";

export const handleAdminRoutes = async (req, res, url) => {
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

  if (req.method === "POST" && url.pathname === "/api/external-bases") {
    const auth = await requireAdmin(req, res);
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
    const auth = await requireAdmin(req, res);
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
    const auth = await requireAdmin(req, res);
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

  if (req.method === "POST" && url.pathname === "/api/field-catalog") {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    const body = await readBody(req);
    try {
      validateFieldCatalogPayload(body);
      const fieldCatalog = await saveFieldCatalogItem(body);
      sendJson(res, 200, { fieldCatalog });
      writeAudit(req, auth, {
        level: "info",
        category: "admin",
        action: "admin_create_field_catalog",
        status: "success",
        screen: "configuracoes",
        entityType: "field-catalog",
        entityId: body.id || null,
        entityLabel: body.name || null,
        message: "Campo base gravado.",
        metadata: {
          fieldId: body.id || null,
          key: body.key || null,
          name: body.name || null,
          type: body.type || null,
          category: body.category || null,
        },
      });
    } catch (error) {
      sendKnownError(res, error);
      writeAudit(req, auth, {
        level: auditLevelFromError(error),
        category: "admin",
        action: "admin_create_field_catalog",
        status: auditStatusFromError(error),
        screen: "configuracoes",
        entityType: "field-catalog",
        entityId: body?.id || null,
        entityLabel: body?.name || null,
        message: error.message,
        metadata: {
          fieldId: body?.id || null,
          key: body?.key || null,
          name: body?.name || null,
          type: body?.type || null,
          category: body?.category || null,
        },
      });
    }
    return true;
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/field-catalog/")) {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    const fieldId = validateDeleteId(url.pathname.split("/").pop(), "Id do campo base");
    try {
      const fieldCatalog = await deleteFieldCatalogItem(fieldId);
      sendJson(res, 200, { fieldCatalog });
      writeAudit(req, auth, {
        level: "info",
        category: "admin",
        action: "admin_delete_field_catalog",
        status: "success",
        screen: "configuracoes",
        entityType: "field-catalog",
        entityId: fieldId,
        entityLabel: null,
        message: "Campo base excluido.",
        metadata: { fieldId },
      });
    } catch (error) {
      sendKnownError(res, error);
      writeAudit(req, auth, {
        level: auditLevelFromError(error),
        category: "admin",
        action: "admin_delete_field_catalog",
        status: auditStatusFromError(error),
        screen: "configuracoes",
        entityType: "field-catalog",
        entityId: fieldId,
        entityLabel: null,
        message: error.message,
        metadata: { fieldId },
      });
    }
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/scale-task-catalog") {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    const body = await readBody(req);
    try {
      validateScaleTaskCatalogPayload(body);
      const scaleTaskCatalog = await saveScaleTaskCatalogItem(body);
      sendJson(res, 200, { scaleTaskCatalog });
      writeAudit(req, auth, {
        level: "info",
        category: "admin",
        action: "admin_create_scale_task_catalog",
        status: "success",
        screen: "configuracoes",
        entityType: "scale-task-catalog",
        entityId: body.id || null,
        entityLabel: body.name || null,
        message: "Tarefa base gravada.",
        metadata: {
          taskId: body.id || null,
          key: body.key || null,
          name: body.name || null,
          category: body.category || null,
        },
      });
    } catch (error) {
      sendKnownError(res, error);
      writeAudit(req, auth, {
        level: auditLevelFromError(error),
        category: "admin",
        action: "admin_create_scale_task_catalog",
        status: auditStatusFromError(error),
        screen: "configuracoes",
        entityType: "scale-task-catalog",
        entityId: body?.id || null,
        entityLabel: body?.name || null,
        message: error.message,
        metadata: {
          taskId: body?.id || null,
          key: body?.key || null,
          name: body?.name || null,
          category: body?.category || null,
        },
      });
    }
    return true;
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/scale-task-catalog/")) {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    const taskId = validateDeleteId(url.pathname.split("/").pop(), "Id da tarefa base");
    try {
      const scaleTaskCatalog = await deleteScaleTaskCatalogItem(taskId);
      sendJson(res, 200, { scaleTaskCatalog });
      writeAudit(req, auth, {
        level: "info",
        category: "admin",
        action: "admin_delete_scale_task_catalog",
        status: "success",
        screen: "configuracoes",
        entityType: "scale-task-catalog",
        entityId: taskId,
        entityLabel: null,
        message: "Tarefa base excluida.",
        metadata: { taskId },
      });
    } catch (error) {
      sendKnownError(res, error);
      writeAudit(req, auth, {
        level: auditLevelFromError(error),
        category: "admin",
        action: "admin_delete_scale_task_catalog",
        status: auditStatusFromError(error),
        screen: "configuracoes",
        entityType: "scale-task-catalog",
        entityId: taskId,
        entityLabel: null,
        message: error.message,
        metadata: { taskId },
      });
    }
    return true;
  }

  return false;
};
