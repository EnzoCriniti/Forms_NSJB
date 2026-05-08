/**
 * @file backend/routes/apiRouter.mjs
 * @summary Roteador HTTP da API local.
 * @responsibility Traduzir requests em chamadas de servico e respostas JSON.
 */

import { sendJson } from "../core/http.mjs";
import { extractBearerToken, loginWithCredentials, logoutByToken } from "../services/authService.mjs";
import { getBootstrap } from "../services/bootstrapService.mjs";
import { saveForm, deleteForm } from "../services/formsService.mjs";
import { saveResponse, getResponsesByFormId } from "../services/responsesService.mjs";
import { claimEscalaSlot, saveEscala, getEscalaForForm } from "../services/escalaService.mjs";
import { findFormById } from "../repositories/formsRepository.mjs";
import { listAuditLogs, summarizeResponseAuditMetadata, summarizeSecurityAuditMetadata } from "../services/auditLogService.mjs";
import {
  validateDeleteId,
  validateAuthLoginPayload,
  validateEscalaClaimPayload,
  validateEscalaPayload,
  validateFormPayload,
  validateFormDeleteKeyPayload,
  validateFormDeleteKeyUpdatePayload,
  validateFieldCatalogPayload,
  validateLabelPayload,
  validateMembersConfigPayload,
  validatePeoplePayload,
  validatePresetPayload,
  validateResponsePayload,
  validateScaleTaskCatalogPayload,
  validateUserPayload,
} from "../validators/payloadValidators.mjs";
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
  getFormDeleteKeyStatus,
  saveFormDeleteKey,
} from "../services/adminService.mjs";
import {
  auditLevelFromError,
  auditStatusFromError,
  getSystemActor,
  getVisitorActor,
  readAuditFilters,
  readBody,
  requireAdmin,
  requireAuth,
  sendEscalaError,
  sendKnownError,
  writeAudit,
} from "./requestHelpers.mjs";

export const handleApiRequest = async (req, res, url) => {
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

  if (req.method === "PUT" && url.pathname === "/api/security/form-delete-key") {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    const body = await readBody(req);
    if (!body) {
      sendJson(res, 400, { error: "Payload JSON invalido." });
      writeAudit(req, auth, {
        level: "error",
        category: "security",
        action: "security_master_key_update",
        status: "failure",
        screen: "seguranca",
        entityType: "security",
        entityId: "formDeleteKey",
        entityLabel: "Chave mestra",
        message: "Payload JSON invalido.",
        metadata: summarizeSecurityAuditMetadata({ status: "failure" }),
      });
      return true;
    }
    try {
      validateFormDeleteKeyUpdatePayload(body);
      const result = await saveFormDeleteKey(body);
      sendJson(res, 200, result);
      await writeAudit(req, auth, {
        level: "info",
        category: "security",
        action: "security_master_key_update",
        status: "success",
        screen: "seguranca",
        entityType: "security",
        entityId: "formDeleteKey",
        entityLabel: "Chave mestra",
        message: "Chave mestra atualizada.",
        metadata: summarizeSecurityAuditMetadata({ status: "success" }),
      });
    } catch (error) {
      if (!error?.statusCode) {
        sendJson(res, 400, { error: error.message });
        await writeAudit(req, auth, {
          level: "error",
          category: "security",
          action: "security_master_key_update",
          status: "failure",
          screen: "seguranca",
          entityType: "security",
          entityId: "formDeleteKey",
          entityLabel: "Chave mestra",
          message: error.message,
          metadata: summarizeSecurityAuditMetadata({ status: "failure" }),
        });
        return true;
      }
      if (sendKnownError(res, error)) return true;
      await writeAudit(req, auth, {
        level: auditLevelFromError(error),
        category: "security",
        action: "security_master_key_update",
        status: auditStatusFromError(error),
        screen: "seguranca",
        entityType: "security",
        entityId: "formDeleteKey",
        entityLabel: "Chave mestra",
        message: error.message,
        metadata: summarizeSecurityAuditMetadata({ status: auditStatusFromError(error) }),
      });
      throw error;
    }
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/forms") {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    const body = await readBody(req);
    try {
      validateFormPayload(body);
      const form = await saveForm(body);
      writeAudit(req, auth, {
        level: "info",
        category: "forms",
        action: body?.id ? "update_form" : "create_form",
        status: "success",
        screen: "formularios",
        entityType: "form",
        entityId: form.id,
        entityLabel: form.title,
        message: body?.id ? "Formulario atualizado." : "Formulario criado.",
        metadata: {
          formId: form.id,
          slug: form.slug,
          type: form.type,
          status: form.status,
          title: form.title,
        },
      });
      sendJson(res, 200, { form });
    } catch (error) {
      writeAudit(req, auth, {
        level: auditLevelFromError(error),
        category: "forms",
        action: body?.id ? "update_form" : "create_form",
        status: auditStatusFromError(error),
        screen: "formularios",
        entityType: "form",
        entityId: body?.id || null,
        entityLabel: body?.title || null,
        message: error.message,
        metadata: {
          formId: body?.id || null,
          slug: body?.slug || null,
          type: body?.type || null,
          status: body?.status || null,
        },
      });
      if (!error?.statusCode) {
        sendJson(res, 400, { error: error.message });
      } else {
        sendJson(res, error.statusCode, { error: error.message, code: error.code || undefined });
      }
    }
    return true;
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/forms/")) {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    const formId = validateDeleteId(url.pathname.split("/").pop(), "Id do formulario");
    const body = await readBody(req);
    if (!body) {
      sendJson(res, 400, { error: "Payload JSON invalido." });
      writeAudit(req, auth, {
        level: "error",
        category: "forms",
        action: "delete_form",
        status: "failure",
        screen: "formularios",
        entityType: "form",
        entityId: formId,
        entityLabel: null,
        message: "Payload JSON invalido.",
        metadata: {
          formId,
          deleted: false,
        },
      });
      return true;
    }
    try {
      validateFormDeleteKeyPayload(body);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      writeAudit(req, auth, {
        level: "error",
        category: "forms",
        action: "delete_form",
        status: "failure",
        screen: "formularios",
        entityType: "form",
        entityId: formId,
        entityLabel: null,
        message: error.message,
        metadata: {
          formId,
          deleted: false,
        },
      });
      return true;
    }
    try {
      const form = await findFormById(formId);
      await deleteForm(formId, body.masterKey);
      sendJson(res, 200, { ok: true });
      writeAudit(req, auth, {
        level: "info",
        category: "forms",
        action: "delete_form",
        status: "success",
        screen: "formularios",
        entityType: "form",
        entityId: formId,
        entityLabel: form?.title || null,
        message: "Formulario excluido.",
        metadata: {
          formId,
          deleted: true,
        },
      });
    } catch (error) {
      if (sendKnownError(res, error)) {
        writeAudit(req, auth, {
          level: auditLevelFromError(error),
          category: "forms",
          action: "delete_form",
          status: auditStatusFromError(error),
          screen: "formularios",
          entityType: "form",
          entityId: formId,
          entityLabel: null,
          message: error.message,
          metadata: {
            formId,
            deleted: false,
          },
        });
        return true;
      }
      writeAudit(req, auth, {
        level: auditLevelFromError(error),
        category: "forms",
        action: "delete_form",
        status: auditStatusFromError(error),
        screen: "formularios",
        entityType: "form",
        entityId: formId,
        entityLabel: null,
        message: error.message,
        metadata: {
          formId,
          deleted: false,
        },
      });
      throw error;
    }
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/responses") {
    const body = await readBody(req);
    try {
      validateResponsePayload(body);
      const result = await saveResponse(body);
      await writeAudit(req, null, {
        level: "info",
        category: "responses",
        action: result.mode === "update" ? "update_response" : "save_response",
        status: "success",
        screen: "public-form",
        actor: getSystemActor(),
        entityType: "response",
        entityId: result.responseId,
        entityLabel: `Formulario ${body.formId}`,
        message: "Resposta gravada.",
        metadata: summarizeResponseAuditMetadata({
          formId: body.formId,
          responseId: result.responseId,
          values: body.values || {},
          mode: result.mode,
        }),
      });
      sendJson(res, 200, result);
    } catch (error) {
      writeAudit(req, null, {
        level: auditLevelFromError(error),
        category: "responses",
        action: "save_response",
        status: auditStatusFromError(error),
        screen: "public-form",
        actor: getVisitorActor(),
        entityType: "response",
        entityId: body?.formId || null,
        entityLabel: body?.respondentName || null,
        message: error.message,
        metadata: summarizeResponseAuditMetadata({
          formId: body?.formId || null,
          responseId: null,
          values: {},
          mode: "create",
        }),
      });
      if (!error?.statusCode) {
        sendJson(res, 400, { error: error.message });
      } else {
        sendJson(res, error.statusCode, { error: error.message, code: error.code || undefined });
      }
    }
    return true;
  }

  if (req.method === "GET" && url.pathname.startsWith("/api/forms/") && url.pathname.endsWith("/responses")) {
    const formId = validateDeleteId(url.pathname.split("/")[3], "Id do formulario");
    if (!(await findFormById(formId))) {
      sendJson(res, 404, { error: "Formulario nao encontrado." });
      return true;
    }
    sendJson(res, 200, { responses: await getResponsesByFormId(formId) });
    return true;
  }

  if (req.method === "PUT" && url.pathname.startsWith("/api/escala/")) {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    const body = await readBody(req);
    const formId = validateDeleteId(url.pathname.split("/").pop(), "formId da escala");
    try {
      validateEscalaPayload(formId, body);
      const sections = await saveEscala(formId, body.sections || []);
      sendJson(res, 200, { sections });
      writeAudit(req, auth, {
        level: "info",
        category: "escala",
        action: "update_escala",
        status: "success",
        screen: "escala",
        entityType: "form",
        entityId: formId,
        entityLabel: `Escala ${formId}`,
        message: "Escala atualizada.",
        metadata: {
          formId,
          sectionCount: sections.length,
        },
      });
    } catch (error) {
      if (sendEscalaError(res, error)) return true;
      writeAudit(req, auth, {
        level: auditLevelFromError(error),
        category: "escala",
        action: "update_escala",
        status: auditStatusFromError(error),
        screen: "escala",
        entityType: "form",
        entityId: formId,
        entityLabel: `Escala ${formId}`,
        message: error.message,
        metadata: {
          formId,
          sectionCount: Array.isArray(body?.sections) ? body.sections.length : 0,
        },
      });
      throw error;
    }
    return true;
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/forms/") && url.pathname.endsWith("/escala/claim")) {
    const body = await readBody(req);
    const formId = validateDeleteId(url.pathname.split("/")[3], "Id do formulario");
    try {
      validateEscalaClaimPayload(body);
      const sections = await claimEscalaSlot(formId, Number(body.sectionIndex), Number(body.slotIndex), body.person);
      sendJson(res, 200, { sections });
      writeAudit(req, null, {
        level: "info",
        category: "escala",
        action: "claim_escala_slot",
        status: "success",
        screen: "public-escala",
        actor: getVisitorActor(),
        entityType: "form",
        entityId: formId,
        entityLabel: `Escala ${formId}`,
        message: "Vaga de escala preenchida.",
        metadata: {
          formId,
          sectionIndex: Number(body.sectionIndex),
          slotIndex: Number(body.slotIndex),
        },
      });
    } catch (error) {
      if (sendEscalaError(res, error)) {
        writeAudit(req, null, {
          level: auditLevelFromError(error),
          category: "escala",
          action: "claim_escala_slot",
          status: auditStatusFromError(error),
          screen: "public-escala",
          actor: getVisitorActor(),
          entityType: "form",
          entityId: formId,
          entityLabel: `Escala ${formId}`,
          message: error.message,
          metadata: {
            formId,
            sectionIndex: body?.sectionIndex,
            slotIndex: body?.slotIndex,
          },
        });
        return true;
      }
      writeAudit(req, null, {
        level: auditLevelFromError(error),
        category: "escala",
        action: "claim_escala_slot",
        status: auditStatusFromError(error),
        screen: "public-escala",
        actor: getVisitorActor(),
        entityType: "form",
        entityId: formId,
        entityLabel: `Escala ${formId}`,
        message: error.message,
        metadata: {
          formId,
          sectionIndex: body?.sectionIndex,
          slotIndex: body?.slotIndex,
        },
      });
      throw error;
    }
    return true;
  }

  if (req.method === "GET" && url.pathname.startsWith("/api/forms/") && url.pathname.endsWith("/escala")) {
    const formId = validateDeleteId(url.pathname.split("/")[3], "Id do formulario");
    if (!(await findFormById(formId))) {
      sendJson(res, 404, { error: "Formulario nao encontrado." });
      return true;
    }
    sendJson(res, 200, { sections: await getEscalaForForm(formId) });
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
