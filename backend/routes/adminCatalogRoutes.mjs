/**
 * @file backend/routes/adminCatalogRoutes.mjs
 * @summary Rotas administrativas dos catalogos base.
 * @responsibility Salvar e excluir campos e tarefas base da configuracao.
 */

import { sendJson } from "../core/http.mjs";
import {
  deleteFieldCatalogItem,
  deleteScaleTaskCatalogItem,
  saveFieldCatalogItem,
  saveScaleTaskCatalogItem,
} from "../services/adminService.mjs";
import {
  validateDeleteId,
  validateFieldCatalogPayload,
  validateScaleTaskCatalogPayload,
} from "../validators/payloadValidators.mjs";
import {
  sendAdminMutationError,
  writeAdminMutationAudit,
} from "./adminRouteHelpers.mjs";
import { readBody, requireAdmin } from "./requestHelpers.mjs";

export const handleAdminCatalogRoutes = async (req, res, url) => {
  if (req.method === "POST" && url.pathname === "/api/field-catalog") {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    const body = await readBody(req);
    try {
      validateFieldCatalogPayload(body);
      const fieldCatalog = await saveFieldCatalogItem(body);
      sendJson(res, 200, { fieldCatalog });
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_create_field_catalog",
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
      sendAdminMutationError(res, error);
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_create_field_catalog",
        screen: "configuracoes",
        entityType: "field-catalog",
        entityId: body?.id || null,
        entityLabel: body?.name || null,
        message: "Campo base gravado.",
        metadata: {
          fieldId: body?.id || null,
          key: body?.key || null,
          name: body?.name || null,
          type: body?.type || null,
          category: body?.category || null,
        },
      }, error);
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
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_delete_field_catalog",
        screen: "configuracoes",
        entityType: "field-catalog",
        entityId: fieldId,
        entityLabel: null,
        message: "Campo base excluido.",
        metadata: { fieldId },
      });
    } catch (error) {
      sendAdminMutationError(res, error);
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_delete_field_catalog",
        screen: "configuracoes",
        entityType: "field-catalog",
        entityId: fieldId,
        entityLabel: null,
        message: "Campo base excluido.",
        metadata: { fieldId },
      }, error);
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
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_create_scale_task_catalog",
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
      sendAdminMutationError(res, error);
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_create_scale_task_catalog",
        screen: "configuracoes",
        entityType: "scale-task-catalog",
        entityId: body?.id || null,
        entityLabel: body?.name || null,
        message: "Tarefa base gravada.",
        metadata: {
          taskId: body?.id || null,
          key: body?.key || null,
          name: body?.name || null,
          category: body?.category || null,
        },
      }, error);
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
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_delete_scale_task_catalog",
        screen: "configuracoes",
        entityType: "scale-task-catalog",
        entityId: taskId,
        entityLabel: null,
        message: "Tarefa base excluida.",
        metadata: { taskId },
      });
    } catch (error) {
      sendAdminMutationError(res, error);
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_delete_scale_task_catalog",
        screen: "configuracoes",
        entityType: "scale-task-catalog",
        entityId: taskId,
        entityLabel: null,
        message: "Tarefa base excluida.",
        metadata: { taskId },
      }, error);
    }
    return true;
  }

  return false;
};
