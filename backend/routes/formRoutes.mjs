/**
 * @file backend/routes/formRoutes.mjs
 * @summary Rotas de formulários, respostas e escala.
 * @responsibility Concentrar o fluxo de CRUD e fluxos publicos de forms.
 */

import { sendJson } from "../core/http.mjs";
import { claimEscalaSlot, saveEscala, getEscalaForForm } from "../services/escalaService.mjs";
import { saveForm, deleteForm } from "../services/formsService.mjs";
import { saveResponse, getResponsesByFormId } from "../services/responsesService.mjs";
import { findFormById } from "../repositories/formsRepository.mjs";
import { summarizeResponseAuditMetadata, summarizeSecurityAuditMetadata } from "../services/auditLogService.mjs";
import {
  validateDeleteId,
  validateEscalaClaimPayload,
  validateEscalaPayload,
  validateFormDeleteKeyPayload,
  validateFormDeleteKeyUpdatePayload,
  validateFormPayload,
  validateResponsePayload,
} from "../validators/payloadValidators.mjs";
import {
  auditLevelFromError,
  auditStatusFromError,
  getSystemActor,
  getVisitorActor,
  readBody,
  requireAdmin,
  sendEscalaError,
  sendKnownError,
  writeAudit,
} from "./requestHelpers.mjs";

export const handleFormRoutes = async (req, res, url) => {
  if (req.method === "PUT" && url.pathname === "/api/security/form-delete-key") {
    return false;
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

  return false;
};
