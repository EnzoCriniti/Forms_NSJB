/**
 * @file backend/services/personPresetsService.mjs
 * @summary CRUD de presets de selecao de pessoas.
 * @responsibility Validar payloads e delegar persistencia ao repositorio.
 */

import {
  deletePersonPresetRecord,
  findPersonPresetById,
  listPersonPresets,
  upsertPersonPresetRecord,
} from "../repositories/personPresetsRepository.mjs";

const makeError = (message, statusCode, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const sanitize = payload => {
  const name = String(payload?.name || "").trim();
  if (!name) throw makeError("Nome do preset e obrigatorio.", 400, "PRESET_NAME_REQUIRED");
  const personKeys = Array.isArray(payload?.personKeys)
    ? [...new Set(payload.personKeys.map(value => String(value || "").trim()).filter(Boolean))]
    : [];
  return { name, personKeys };
};

export const getPersonPresets = () => listPersonPresets();

export const savePersonPreset = async payload => {
  const sanitized = sanitize(payload);
  if (payload?.id) {
    const existing = await findPersonPresetById(Number(payload.id));
    if (!existing) throw makeError("Preset nao encontrado.", 404, "PRESET_NOT_FOUND");
    await upsertPersonPresetRecord({ id: existing.id, ...sanitized });
    return findPersonPresetById(existing.id);
  }
  const id = await upsertPersonPresetRecord(sanitized);
  return findPersonPresetById(id);
};

export const deletePersonPreset = async presetId => {
  const id = Number(presetId);
  const existing = await findPersonPresetById(id);
  if (!existing) throw makeError("Preset nao encontrado.", 404, "PRESET_NOT_FOUND");
  await deletePersonPresetRecord(id);
  return { ok: true, preset: existing };
};
