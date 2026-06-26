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
import { summarizeResponseAuditMetadata } from "../services/auditLogService.mjs";
import {
  validateDeleteId,
  validateEscalaClaimPayload,
  validateEscalaPayload,
  validateFormDeleteKeyPayload,
  validateFormPayload,
  validateResponsePayload,
} from "../validators/payloadValidators.mjs";
import {
  auditLevelFromError,
  auditStatusFromError,
  enforceRateLimit,
  getSystemActor,
  getVisitorActor,
  readBody,
  requireCapability,
  sendEscalaError,
  sendKnownError,
  writeAudit,
} from "./requestHelpers.mjs";
import { createRateLimiter } from "../core/rateLimiter.mjs";

// Rotas publicas sem autenticacao: protege contra flood/abuso por IP.
const publicResponseLimiter = createRateLimiter({ name: "public-response", windowMs: 60_000, max: 20 });
const publicClaimLimiter = createRateLimiter({ name: "public-escala-claim", windowMs: 60_000, max: 30 });

/** Honeypot: bots costumam preencher campos ocultos; humanos deixam vazio. */
const isHoneypotTripped = body => Boolean(String(body?.hp ?? body?.website ?? "").trim());
import {
  writeEscalaClaimAudit,
  writeEscalaUpdateAudit,
  writeFormDeleteAudit,
  writeFormSaveAudit,
} from "./formRouteAudit.mjs";

export const handleFormRoutes = async (req, res, url) => {
  if (req.method === "POST" && url.pathname === "/api/forms") {
    const body = await readBody(req);
    const typeKey = body?.type === "escala_organ" ? "escala" : "presenca";
    const auth = await requireCapability(req, res, `forms.${typeKey}.${body?.id ? "edit" : "create"}`);
    if (!auth) return true;
    try {
      validateFormPayload(body);
      const form = await saveForm(body);
      writeFormSaveAudit(req, auth, { body, form });
      sendJson(res, 200, { form });
    } catch (error) {
      writeFormSaveAudit(req, auth, { body, error });
      if (!error?.statusCode) {
        sendJson(res, 400, { error: error.message });
      } else {
        sendJson(res, error.statusCode, { error: error.message, code: error.code || undefined });
      }
    }
    return true;
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/forms/")) {
    const formId = validateDeleteId(url.pathname.split("/").pop(), "Id do formulario");
    const existingForm = await findFormById(formId);
    const typeKey = existingForm?.type === "escala_organ" ? "escala" : "presenca";
    const auth = await requireCapability(req, res, `forms.${typeKey}.delete`);
    if (!auth) return true;
    const body = await readBody(req);
    if (!body) {
      sendJson(res, 400, { error: "Payload JSON invalido." });
      writeFormDeleteAudit(req, auth, { formId, message: "Payload JSON invalido." });
      return true;
    }
    try {
      validateFormDeleteKeyPayload(body);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      writeFormDeleteAudit(req, auth, { formId, error });
      return true;
    }
    try {
      const form = await findFormById(formId);
      await deleteForm(formId, body.masterKey);
      sendJson(res, 200, { ok: true });
      writeFormDeleteAudit(req, auth, { formId, form, deleted: true });
    } catch (error) {
      if (sendKnownError(res, error)) {
        writeFormDeleteAudit(req, auth, { formId, error });
        return true;
      }
      writeFormDeleteAudit(req, auth, { formId, error });
      throw error;
    }
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/responses") {
    if (enforceRateLimit(req, res, publicResponseLimiter)) return true;
    const body = await readBody(req);
    // Bot detectado pelo honeypot: responde sucesso silencioso sem gravar nada.
    if (isHoneypotTripped(body)) {
      sendJson(res, 200, { ok: true, ignored: true });
      return true;
    }
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
    const auth = await requireCapability(req, res, "forms.escala.edit");
    if (!auth) return true;
    const body = await readBody(req);
    const formId = validateDeleteId(url.pathname.split("/").pop(), "formId da escala");
    try {
      validateEscalaPayload(formId, body);
      const sections = await saveEscala(formId, body.sections || []);
      sendJson(res, 200, { sections });
      writeEscalaUpdateAudit(req, auth, { formId, sections });
    } catch (error) {
      if (sendEscalaError(res, error)) return true;
      writeEscalaUpdateAudit(req, auth, { formId, body, error });
      throw error;
    }
    return true;
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/forms/") && url.pathname.endsWith("/escala/claim")) {
    if (enforceRateLimit(req, res, publicClaimLimiter)) return true;
    const body = await readBody(req);
    const formId = validateDeleteId(url.pathname.split("/")[3], "Id do formulario");
    try {
      validateEscalaClaimPayload(body);
      const sections = await claimEscalaSlot(formId, Number(body.sectionIndex), Number(body.slotIndex), body.person);
      sendJson(res, 200, { sections });
      writeEscalaClaimAudit(req, { formId, body });
    } catch (error) {
      if (sendEscalaError(res, error)) {
        writeEscalaClaimAudit(req, { formId, body, error });
        return true;
      }
      writeEscalaClaimAudit(req, { formId, body, error });
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
