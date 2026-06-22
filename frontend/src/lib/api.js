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

export const saveEvent = event => requestJson("/api/events", {
  method: "POST",
  body: JSON.stringify(event),
});

export const publishEvent = id => requestJson(`/api/events/${id}/publish`, {
  method: "POST",
  body: JSON.stringify({}),
});

export const deleteEvent = id => requestJson(`/api/events/${id}`, { method: "DELETE" });

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

export const saveExternalBase = base => requestJson("/api/external-bases", {
  method: "POST",
  body: JSON.stringify(base),
});

export const deleteExternalBase = id => requestJson(`/api/external-bases/${id}`, { method: "DELETE" });

export const syncExternalBase = id => requestJson(`/api/external-bases/${id}/sync`, {
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

export const fetchMessagingConfig = () => requestJson("/api/messaging-config");

export const saveMessagingConfig = config => requestJson("/api/messaging-config", {
  method: "PUT",
  body: JSON.stringify(config),
});

export const fetchMessageTemplates = () => requestJson("/api/message-templates");

export const saveMessageTemplate = template => requestJson("/api/message-templates", {
  method: "POST",
  body: JSON.stringify(template),
});

export const deleteMessageTemplate = id => requestJson(`/api/message-templates/${id}`, { method: "DELETE" });

export const fetchPersonPresets = () => requestJson("/api/person-presets");

export const savePersonPreset = preset => requestJson("/api/person-presets", {
  method: "POST",
  body: JSON.stringify(preset),
});

export const deletePersonPreset = id => requestJson(`/api/person-presets/${id}`, { method: "DELETE" });

export const fetchEventMessages = eventId => requestJson(`/api/events/${eventId}/messages`);

export const saveEventMessage = (eventId, message) => requestJson(`/api/events/${eventId}/messages`, {
  method: "POST",
  body: JSON.stringify(message),
});

export const fetchEventMessage = (eventId, messageId) => requestJson(`/api/events/${eventId}/messages/${messageId}`);

export const fetchEventMessagePreview = (eventId, messageId) => requestJson(`/api/events/${eventId}/messages/${messageId}/preview`);

export const dispatchEventMessage = (eventId, messageId) => requestJson(`/api/events/${eventId}/messages/${messageId}/dispatch`, {
  method: "POST",
  body: JSON.stringify({}),
});

export const cancelEventMessage = (eventId, messageId) => requestJson(`/api/events/${eventId}/messages/${messageId}/cancel`, {
  method: "POST",
  body: JSON.stringify({}),
});

export const deleteEventMessage = (eventId, messageId) => requestJson(`/api/events/${eventId}/messages/${messageId}`, {
  method: "DELETE",
});

export const fetchEventMessageLogs = (eventId, messageId) => requestJson(`/api/events/${eventId}/messages/${messageId}/logs`);

export const fetchMemberParticipationReport = () => requestJson("/api/reports/members");
