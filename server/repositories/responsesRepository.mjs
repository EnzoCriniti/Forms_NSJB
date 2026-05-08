/**
 * @file server/repositories/responsesRepository.mjs
 * @summary Acesso a dados de respostas de formularios.
 * @responsibility Persistir respostas dinamicas em JSON por formulario e valores normalizados.
 */

import { db, nowIso, parseJson, stringifyJson } from "../db.mjs";

const isFilledValue = value => {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
};

const normalizeBoolean = value => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["sim", "true", "1", "yes", "y"].includes(normalized)) return true;
    if (["nao", "não", "false", "0", "no", "n"].includes(normalized)) return false;
  }
  return null;
};

const compareFieldIds = (left, right) => {
  const leftNumber = Number(left);
  const rightNumber = Number(right);
  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) return leftNumber - rightNumber;
  return String(left).localeCompare(String(right), "pt-BR");
};

const getTextValue = value => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return null;
};

const buildNormalizedValue = ({ formId, fieldId, fieldType, value, now = nowIso() }) => {
  if (!isFilledValue(value)) return null;
  const normalizedBoolean = (fieldType === "yes_no" || fieldType === null)
    ? normalizeBoolean(value)
    : typeof value === "boolean"
      ? value
      : null;
  const normalizedNumber = (fieldType === "number" || fieldType === null)
    && (
      typeof value === "number"
      || (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value)))
    )
    ? Number(value)
    : null;

  return {
    formId,
    fieldId: String(fieldId),
    fieldType: fieldType || null,
    valueText: getTextValue(value),
    valueNumber: normalizedNumber,
    valueBoolean: normalizedBoolean === null ? null : (normalizedBoolean ? 1 : 0),
    valueJson: stringifyJson(value),
    createdAt: now,
    updatedAt: now,
  };
};

const mapStoredResponseValue = row => ({
  id: row.id,
  responseId: row.response_id,
  formId: row.form_id,
  fieldId: row.field_id,
  fieldType: row.field_type,
  valueText: row.value_text,
  valueNumber: row.value_number === null ? null : Number(row.value_number),
  valueBoolean: row.value_boolean === null ? null : Boolean(row.value_boolean),
  valueJson: parseJson(row.value_json, null),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const getStoredRowValue = row => {
  if (row.valueJson !== null && row.valueJson !== undefined) return row.valueJson;
  if (row.valueNumber !== null && row.valueNumber !== undefined) return row.valueNumber;
  if (row.valueBoolean !== null && row.valueBoolean !== undefined) return row.valueBoolean;
  if (row.valueText !== null && row.valueText !== undefined) return row.valueText;
  return null;
};

const buildLegacyValue = (response, fieldId, value) => {
  const normalized = buildNormalizedValue({
    formId: response.form_id,
    fieldId,
    value,
    now: response.updated_at || response.created_at || nowIso(),
  });
  if (!normalized) return null;
  return {
    id: null,
    responseId: response.id,
    formId: response.form_id,
    fieldId: String(fieldId),
    fieldType: null,
    valueText: normalized.valueText,
    valueNumber: normalized.valueNumber,
    valueBoolean: normalized.valueBoolean === null ? null : Boolean(normalized.valueBoolean),
    valueJson: parseJson(normalized.valueJson, null),
    createdAt: response.created_at,
    updatedAt: response.updated_at,
  };
};

const buildLegacyRowsFromResponse = response => {
  const values = parseJson(response.values_json, {});
  return Object.entries(values)
    .sort(([leftFieldId], [rightFieldId]) => compareFieldIds(leftFieldId, rightFieldId))
    .map(([fieldId, value]) => buildLegacyValue(response, fieldId, value))
    .filter(Boolean);
};

const fetchStoredValuesByResponseId = responseId => db.prepare(`
  SELECT id, response_id, form_id, field_id, field_type, value_text, value_number, value_boolean, value_json, created_at, updated_at
  FROM response_values
  WHERE response_id = ?
  ORDER BY id ASC
`).all(responseId).map(mapStoredResponseValue);

const fetchStoredValuesByFormId = formId => db.prepare(`
  SELECT id, response_id, form_id, field_id, field_type, value_text, value_number, value_boolean, value_json, created_at, updated_at
  FROM response_values
  WHERE form_id = ?
  ORDER BY response_id ASC, CAST(field_id AS INTEGER) ASC, id ASC
`).all(formId).map(mapStoredResponseValue);

const fetchResponseById = responseId => db.prepare(`
  SELECT id, form_id, values_json, created_at, updated_at
  FROM responses
  WHERE id = ?
`).get(responseId);

const fetchResponsesByFormId = formId => db.prepare(`
  SELECT id, form_id, values_json, created_at, updated_at
  FROM responses
  WHERE form_id = ?
  ORDER BY id ASC
`).all(formId);

const groupStoredValuesByResponseId = rows => rows.reduce((index, row) => {
  if (!index.has(row.responseId)) index.set(row.responseId, []);
  index.get(row.responseId).push(row);
  return index;
}, new Map());

export const listResponsesByFormId = formId => {
  const responses = db.prepare(`
    SELECT id, respondent_name, respondent_grau, values_json, updated_at
    FROM responses
    WHERE form_id = ?
    ORDER BY lower(respondent_name) ASC
  `).all(formId);
  const storedRows = fetchStoredValuesByFormId(formId);
  const storedByResponseId = groupStoredValuesByResponseId(storedRows);

  return responses.map(row => {
    const normalizedRows = storedByResponseId.get(row.id) || [];
    const values = normalizedRows.length > 0
      ? normalizedRows.reduce((acc, storedRow) => {
        acc[String(storedRow.fieldId)] = getStoredRowValue(storedRow);
        return acc;
      }, {})
      : parseJson(row.values_json, {});

    return {
      id: row.id,
      respondentName: row.respondent_name,
      respondentGrau: row.respondent_grau,
      values,
      updatedAt: row.updated_at,
    };
  });
};

export const countResponsesByFormId = formId => {
  const row = db.prepare("SELECT COUNT(*) AS count FROM responses WHERE form_id = ?").get(formId);
  return Number(row?.count || 0);
};

export const listResponseValuesByResponseId = responseId => {
  const storedRows = fetchStoredValuesByResponseId(responseId);
  if (storedRows.length > 0) return storedRows;
  const response = fetchResponseById(responseId);
  if (!response) return [];
  return buildLegacyRowsFromResponse(response);
};

export const listResponseValuesByFormId = formId => {
  const storedRows = fetchStoredValuesByFormId(formId);
  if (storedRows.length === 0) {
    return fetchResponsesByFormId(formId).flatMap(buildLegacyRowsFromResponse);
  }

  const storedByResponseId = groupStoredValuesByResponseId(storedRows);
  const result = [];

  for (const response of fetchResponsesByFormId(formId)) {
    const rows = storedByResponseId.get(response.id);
    if (rows?.length > 0) {
      result.push(...rows);
      continue;
    }
    result.push(...buildLegacyRowsFromResponse(response));
  }

  return result.sort((left, right) => {
    if (left.responseId !== right.responseId) return left.responseId - right.responseId;
    return compareFieldIds(left.fieldId, right.fieldId);
  });
};

export const upsertResponseRecord = ({ formId, respondentName, respondentGrau, values, fieldDefinitions = [] }) => {
  const now = nowIso();
  const respondentKey = respondentName.trim().toLowerCase();
  const existingResponse = db.prepare("SELECT id FROM responses WHERE form_id = ? AND respondent_key = ?").get(formId, respondentKey);
  const normalizedValues = Object.entries(values || {})
    .map(([key, value]) => {
      const fieldDefinition = fieldDefinitions.find(field => String(field.id) === String(key));
      return buildNormalizedValue({
        formId,
        fieldId: key,
        fieldType: fieldDefinition?.type || null,
        value,
        now,
      });
    })
    .filter(Boolean);

  db.exec("BEGIN IMMEDIATE");

  try {
    db.prepare(`
      INSERT INTO responses (form_id, respondent_name, respondent_grau, respondent_key, values_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(form_id, respondent_key) DO UPDATE SET
        respondent_name = excluded.respondent_name,
        respondent_grau = excluded.respondent_grau,
        values_json = excluded.values_json,
        updated_at = excluded.updated_at
    `).run(
      formId,
      respondentName,
      respondentGrau || "",
      respondentKey,
      stringifyJson(values || {}),
      now,
      now,
    );

    const response = db.prepare("SELECT id FROM responses WHERE form_id = ? AND respondent_key = ?").get(formId, respondentKey);
    if (!response?.id) throw new Error("Nao foi possivel localizar a resposta gravada.");

    db.prepare("DELETE FROM response_values WHERE response_id = ?").run(response.id);
    if (normalizedValues.length > 0) {
      const insertValue = db.prepare(`
        INSERT INTO response_values (
          response_id, form_id, field_id, field_type, value_text, value_number, value_boolean, value_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const item of normalizedValues) {
        insertValue.run(
          response.id,
          item.formId,
          item.fieldId,
          item.fieldType,
          item.valueText,
          item.valueNumber,
          item.valueBoolean,
          item.valueJson,
          item.createdAt,
          item.updatedAt,
        );
      }
    }

    db.exec("COMMIT");
    return {
      responseId: response.id,
      mode: existingResponse?.id ? "update" : "create",
    };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
};
