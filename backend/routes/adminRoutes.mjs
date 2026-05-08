/**
 * @file backend/routes/adminRoutes.mjs
 * @summary Rotas administrativas da API.
 * @responsibility Concentrar usuarios, classificacoes, presets e catalogos em um modulo proprio.
 */

import { sendJson } from "../core/http.mjs";
import {
  saveUser,
  deleteUser,
  saveLabel,
  deleteLabel,
  savePreset,
  deletePreset,
  savePeople,
  saveMembersConfig,
  saveFieldCatalogItem,
  deleteFieldCatalogItem,
  saveScaleTaskCatalogItem,
  deleteScaleTaskCatalogItem,
} from "../services/adminService.mjs";
import {
  validateDeleteId,
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
      writeAudit(req, auth, {
        level: "info",
        category: "admin",
        action: "admin_create_user",
        status: "success",
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
      if (!error?.statusCode) {
        sendJson(res, 400, { error: error.message });
      } else {
        sendKnownError(res, error);
      }
      writeAudit(req, auth, {
        level: auditLevelFromError(error),
        category: "admin",
        action: "admin_create_user",
        status: auditStatusFromError(error),
        screen: "configuracoes",
        entityType: "user",
        entityId: body?.id || null,
        entityLabel: body?.name || body?.username || null,
        message: error.message,
        metadata: {
          userId: body?.id || null,
          username: body?.username || null,
          role: body?.role || null,
        },
      });
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
      writeAudit(req, auth, {
        level: "info",
        category: "admin",
        action: "admin_delete_user",
        status: "success",
        screen: "configuracoes",
        entityType: "user",
        entityId: userId,
        entityLabel: null,
        message: "Usuario excluido.",
        metadata: { userId },
      });
    } catch (error) {
      sendKnownError(res, error);
      writeAudit(req, auth, {
        level: auditLevelFromError(error),
        category: "admin",
        action: "admin_delete_user",
        status: auditStatusFromError(error),
        screen: "configuracoes",
        entityType: "user",
        entityId: userId,
        entityLabel: null,
        message: error.message,
        metadata: { userId },
      });
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
      writeAudit(req, auth, {
        level: "info",
        category: "admin",
        action: "admin_create_label",
        status: "success",
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
      sendKnownError(res, error);
      writeAudit(req, auth, {
        level: auditLevelFromError(error),
        category: "admin",
        action: "admin_create_label",
        status: auditStatusFromError(error),
        screen: "configuracoes",
        entityType: "label",
        entityId: body?.id || null,
        entityLabel: body?.name || null,
        message: error.message,
        metadata: {
          labelId: body?.id || null,
          name: body?.name || null,
          color: body?.color || null,
        },
      });
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
      writeAudit(req, auth, {
        level: "info",
        category: "admin",
        action: "admin_delete_label",
        status: "success",
        screen: "configuracoes",
        entityType: "label",
        entityId: labelId,
        entityLabel: null,
        message: "Classificacao excluida.",
        metadata: { labelId },
      });
    } catch (error) {
      sendKnownError(res, error);
      writeAudit(req, auth, {
        level: auditLevelFromError(error),
        category: "admin",
        action: "admin_delete_label",
        status: auditStatusFromError(error),
        screen: "configuracoes",
        entityType: "label",
        entityId: labelId,
        entityLabel: null,
        message: error.message,
        metadata: { labelId },
      });
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
      writeAudit(req, auth, {
        level: "info",
        category: "admin",
        action: "admin_create_preset",
        status: "success",
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
      sendKnownError(res, error);
      writeAudit(req, auth, {
        level: auditLevelFromError(error),
        category: "admin",
        action: "admin_create_preset",
        status: auditStatusFromError(error),
        screen: "configuracoes",
        entityType: "preset",
        entityId: body?.id || null,
        entityLabel: body?.name || null,
        message: error.message,
        metadata: {
          presetId: body?.id || null,
          name: body?.name || null,
          type: body?.type || null,
        },
      });
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
      writeAudit(req, auth, {
        level: "info",
        category: "admin",
        action: "admin_delete_preset",
        status: "success",
        screen: "configuracoes",
        entityType: "preset",
        entityId: presetId,
        entityLabel: null,
        message: "Template excluido.",
        metadata: { presetId },
      });
    } catch (error) {
      sendKnownError(res, error);
      writeAudit(req, auth, {
        level: auditLevelFromError(error),
        category: "admin",
        action: "admin_delete_preset",
        status: auditStatusFromError(error),
        screen: "configuracoes",
        entityType: "preset",
        entityId: presetId,
        entityLabel: null,
        message: error.message,
        metadata: { presetId },
      });
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
      writeAudit(req, auth, {
        level: "info",
        category: "admin",
        action: "admin_update_members_config",
        status: "success",
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
      sendKnownError(res, error);
      writeAudit(req, auth, {
        level: auditLevelFromError(error),
        category: "admin",
        action: "admin_update_members_config",
        status: auditStatusFromError(error),
        screen: "configuracoes",
        entityType: "people",
        entityId: null,
        entityLabel: "Socios",
        message: error.message,
        metadata: {
          peopleCount: Array.isArray(body?.people) ? body.people.length : 0,
        },
      });
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
      writeAudit(req, auth, {
        level: "info",
        category: "admin",
        action: "admin_update_members_config",
        status: "success",
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
      sendKnownError(res, error);
      writeAudit(req, auth, {
        level: auditLevelFromError(error),
        category: "admin",
        action: "admin_update_members_config",
        status: auditStatusFromError(error),
        screen: "configuracoes",
        entityType: "members-config",
        entityId: "membersConfig",
        entityLabel: "Configuracao de socios",
        message: error.message,
        metadata: {
          sheetUrl: body?.sheetUrl || null,
          range: body?.range || null,
        },
      });
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
