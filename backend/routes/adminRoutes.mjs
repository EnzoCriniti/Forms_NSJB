/**
 * @file backend/routes/adminRoutes.mjs
 * @summary Rotas administrativas da API.
 * @responsibility Agregar rotas administrativas ainda mantidas juntas e encaminhar subdominios extraidos.
 */

import { sendJson } from "../core/http.mjs";
import {
  sendAdminMutationError,
  writeAdminMutationAudit,
} from "./adminRouteHelpers.mjs";
import { handleAdminCatalogRoutes } from "./adminCatalogRoutes.mjs";
import { handleAdminExternalBaseRoutes } from "./adminExternalBaseRoutes.mjs";
import { handleAdminMemberRoutes } from "./adminMemberRoutes.mjs";
import {
  saveUser,
  deleteUser,
  saveLabel,
  deleteLabel,
  savePreset,
  deletePreset,
} from "../services/adminService.mjs";
import { getAccessLayers, saveAccessLayer, deleteAccessLayer } from "../services/accessLayersService.mjs";
import {
  validateDeleteId,
  validateLabelPayload,
  validatePresetPayload,
  validateUserPayload,
} from "../validators/payloadValidators.mjs";
import { validateAccessLayerPayload } from "../validators/adminPayloadValidators.mjs";
import {
  readBody,
  requireCapability,
} from "./requestHelpers.mjs";

export const handleAdminRoutes = async (req, res, url) => {
  if (await handleAdminCatalogRoutes(req, res, url)) {
    return true;
  }
  if (await handleAdminExternalBaseRoutes(req, res, url)) {
    return true;
  }
  if (await handleAdminMemberRoutes(req, res, url)) {
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/users") {
    const auth = await requireCapability(req, res, "users.manage");
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
    const auth = await requireCapability(req, res, "users.manage");
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
    const auth = await requireCapability(req, res, "settings.catalogs");
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
    const auth = await requireCapability(req, res, "settings.catalogs");
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
    const auth = await requireCapability(req, res, "settings.catalogs");
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

  if (req.method === "GET" && url.pathname === "/api/access-layers") {
    const auth = await requireCapability(req, res, "layers.manage");
    if (!auth) return true;
    sendJson(res, 200, { layers: await getAccessLayers() });
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/access-layers") {
    const auth = await requireCapability(req, res, "layers.manage");
    if (!auth) return true;
    const body = await readBody(req);
    try {
      validateAccessLayerPayload(body);
      const layer = await saveAccessLayer(body);
      sendJson(res, 200, { layer, layers: await getAccessLayers() });
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_save_access_layer",
        screen: "configuracoes",
        entityType: "access_layer",
        entityId: layer.id,
        entityLabel: layer.name,
        message: "Camada de acesso gravada.",
        metadata: { layerId: layer.id, name: layer.name },
      });
    } catch (error) {
      sendAdminMutationError(res, error);
    }
    return true;
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/access-layers/")) {
    const auth = await requireCapability(req, res, "layers.manage");
    if (!auth) return true;
    const layerId = validateDeleteId(url.pathname.split("/").pop(), "Id da camada");
    try {
      const result = await deleteAccessLayer(layerId);
      sendJson(res, 200, { ok: true, layers: await getAccessLayers() });
      writeAdminMutationAudit(req, auth, {
        category: "admin",
        action: "admin_delete_access_layer",
        screen: "configuracoes",
        entityType: "access_layer",
        entityId: layerId,
        entityLabel: result.layer?.name || null,
        message: "Camada de acesso excluída.",
        metadata: { layerId },
      });
    } catch (error) {
      sendAdminMutationError(res, error);
    }
    return true;
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/presets/")) {
    const auth = await requireCapability(req, res, "settings.catalogs");
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

  return false;
};
