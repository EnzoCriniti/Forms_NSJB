/**
 * @file backend/services/formsService.mjs
 * @summary Regras de negocio de formularios.
 * @responsibility Validar e persistir formularios dinamicos e suas escalas iniciais.
 */

import { buildScaleSections, normalizeSlug } from "../core/forms.mjs";
import { database } from "../database/index.mjs";
import {
  deleteFormRecordWithDependencies,
  findConflictingFormBySlug,
  findFormById,
  upsertFormRecord,
} from "../repositories/formsRepository.mjs";
import { getEscalaByFormId, upsertEscalaRecord } from "../repositories/escalaRepository.mjs";
import { getFormDeleteKeyStatus, verifyFormDeleteKey } from "./adminService.mjs";
import {
  assertPresenceFormModeFields,
  normalizeResultsConfig,
  resolveFormMode,
} from "./formModeRules.mjs";

const makeError = (message, statusCode, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const isPastClosingDate = closing => {
  const text = String(closing || "").trim();
  if (!text) return false;
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.getTime() <= Date.now();
};

export const saveForm = async payload => {
  const slug = normalizeSlug(payload.slug || payload.title);
  if (!slug) throw new Error("Slug ou titulo invalido.");

  const duplicate = await findConflictingFormBySlug(slug, payload.id);
  if (duplicate) throw new Error("Ja existe um formulario com este identificador. Escolha outro nome ou ajuste o link.");

  const existingForm = payload.id ? await findFormById(payload.id) : null;

  const formMode = resolveFormMode(payload.type, payload.resultsConfig, payload.fieldDefinitions);
  const values = {
    id: payload.id,
    slug,
    type: payload.type,
    status: payload.status,
    title: payload.title,
    sessionName: payload.sessionName || "",
    description: payload.description || "",
    date: payload.date || null,
    closing: payload.closing || null,
    closingText: payload.closingText || "",
    totalExpected: Number(payload.totalExpected || 0),
    labels: payload.labels || [],
    fieldDefinitions: payload.fieldDefinitions || [],
    resultsConfig: normalizeResultsConfig(payload.resultsConfig, formMode),
    scaleSections: payload.scaleSections || [],
  };

  if (!values.title?.trim()) throw new Error("Titulo e obrigatorio.");
  if (!["presenca", "escala_organ"].includes(values.type)) throw new Error("Tipo de formulario invalido.");
  if (!["rascunho", "aberto", "fechado", "arquivado"].includes(values.status)) throw new Error("Status invalido.");
  assertPresenceFormModeFields(values, formMode);

  // Reabrir um formulario vencido deve prevalecer sobre o fechamento antigo.
  if (existingForm && existingForm.status !== "aberto" && values.status === "aberto" && isPastClosingDate(values.closing)) {
    values.closing = null;
  }

  const formId = await upsertFormRecord(values);

  if (values.type === "escala_organ") {
    const currentSections = await getEscalaByFormId(formId);
    await upsertEscalaRecord(formId, currentSections.length ? currentSections : buildScaleSections(values.scaleSections));
  }

  return findFormById(formId);
};

export const deleteForm = async (formId, masterKey) => {
  if (!String(masterKey || "").trim()) throw makeError("Chave mestra obrigatoria.", 400, "MASTER_KEY_REQUIRED");

  return database.withTransaction(async () => {
    const form = await findFormById(formId);
    if (!form) throw makeError("Formulario nao encontrado.", 404, "FORM_NOT_FOUND");

    const keyStatus = await getFormDeleteKeyStatus();
    if (!keyStatus.configured) {
      throw makeError("Nenhuma chave mestra configurada. Configure em Operacoes criticas antes de excluir formularios.", 409, "MASTER_KEY_NOT_CONFIGURED");
    }

    if (!(await verifyFormDeleteKey(masterKey))) {
      throw makeError("Chave mestra incorreta.", 403, "MASTER_KEY_INVALID");
    }

    await deleteFormRecordWithDependencies(formId);
    return { ok: true };
  });
};
