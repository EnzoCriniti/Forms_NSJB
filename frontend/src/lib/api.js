/**
 * @file frontend/src/lib/api.js
 * @summary Cliente HTTP do frontend.
 * @responsibility Centralizar chamadas para a API local.
 */

let authToken = null;

export const setAuthToken = token => {
  authToken = token || null;
};

const requestJson = async (url, options = {}) => {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (authToken && !headers.Authorization && !headers.authorization) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  const response = await fetch(url, {
    ...options,
    headers,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || "Erro na API.");
    error.status = response.status;
    if (payload.code) error.code = payload.code;
    throw error;
  }
  return payload;
};

export const fetchBootstrap = () => requestJson("/api/bootstrap");

export const fetchAuthMe = () => requestJson("/api/auth/me");

export const loginWithCredentials = credentials => requestJson("/api/auth/login", {
  method: "POST",
  body: JSON.stringify(credentials),
});

export const logoutAuth = () => requestJson("/api/auth/logout", {
  method: "POST",
});

export const fetchAuditLogs = filters => {
  const query = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    const normalized = String(value).trim();
    if (!normalized) return;
    query.set(key, normalized);
  });
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return requestJson(`/api/audit-logs${suffix}`);
};

export const fetchFormResponses = formId => requestJson(`/api/forms/${formId}/responses`);

export const fetchFormEscala = formId => requestJson(`/api/forms/${formId}/escala`);

export const fetchFormDeleteKeyStatus = () => requestJson("/api/security/form-delete-key/status");

export const saveForm = form => requestJson("/api/forms", {
  method: "POST",
  body: JSON.stringify(form),
});

export const saveFormDeleteKey = payload => requestJson("/api/security/form-delete-key", {
  method: "PUT",
  body: JSON.stringify(payload),
});

export const deleteForm = (id, masterKey) => requestJson(`/api/forms/${id}`, {
  method: "DELETE",
  body: JSON.stringify({ masterKey }),
});

export const saveResponse = payload => requestJson("/api/responses", {
  method: "POST",
  body: JSON.stringify(payload),
});

export const saveEscala = (formId, sections) => requestJson(`/api/escala/${formId}`, {
  method: "PUT",
  body: JSON.stringify({ sections }),
});

export const claimEscalaSlot = (formId, sectionIndex, slotIndex, person) => requestJson(`/api/forms/${formId}/escala/claim`, {
  method: "POST",
  body: JSON.stringify({ sectionIndex, slotIndex, person }),
});

export const saveUser = user => requestJson("/api/users", {
  method: "POST",
  body: JSON.stringify(user),
});

export const deleteUser = id => requestJson(`/api/users/${id}`, { method: "DELETE" });

export const saveLabel = label => requestJson("/api/labels", {
  method: "POST",
  body: JSON.stringify(label),
});

export const deleteLabel = id => requestJson(`/api/labels/${id}`, { method: "DELETE" });

export const savePreset = preset => requestJson("/api/presets", {
  method: "POST",
  body: JSON.stringify(preset),
});

export const deletePreset = id => requestJson(`/api/presets/${id}`, { method: "DELETE" });

export const savePeople = people => requestJson("/api/people", {
  method: "PUT",
  body: JSON.stringify({ people }),
});

export const saveMembersConfig = config => requestJson("/api/members-config", {
  method: "PUT",
  body: JSON.stringify(config),
});

export const syncMembersConfig = () => requestJson("/api/members-config/sync", {
  method: "POST",
  body: JSON.stringify({}),
});

export const saveFieldCatalogItem = item => requestJson("/api/field-catalog", {
  method: "POST",
  body: JSON.stringify(item),
});

export const deleteFieldCatalogItem = id => requestJson(`/api/field-catalog/${id}`, { method: "DELETE" });

export const saveScaleTaskCatalogItem = item => requestJson("/api/scale-task-catalog", {
  method: "POST",
  body: JSON.stringify(item),
});

export const deleteScaleTaskCatalogItem = id => requestJson(`/api/scale-task-catalog/${id}`, { method: "DELETE" });
