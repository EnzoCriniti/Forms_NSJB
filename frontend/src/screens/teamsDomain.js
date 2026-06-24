/**
 * @file frontend/src/screens/teamsDomain.js
 * @summary Helpers puros da tela de equipes.
 */

export const emptyTeamPeriodDraft = {
  id: null,
  title: "",
  startDate: "",
  endDate: "",
  assistantMasterPersonId: "",
  directAssistantPersonId: "",
  assistantMemberIds: [],
  organMemberIds: [],
  notes: "",
};

export const buildTeamPeriodDraft = period => ({
  ...emptyTeamPeriodDraft,
  ...period,
  assistantMasterPersonId: period?.assistantMasterPersonId ? String(period.assistantMasterPersonId) : "",
  directAssistantPersonId: period?.directAssistantPersonId ? String(period.directAssistantPersonId) : "",
  assistantMemberIds: Array.isArray(period?.assistantMemberIds) ? period.assistantMemberIds.map(String) : [],
  organMemberIds: Array.isArray(period?.organMemberIds) ? period.organMemberIds.map(String) : [],
});

export const buildTeamPeriodPayload = draft => ({
  id: draft.id || null,
  title: String(draft.title || "").trim(),
  startDate: draft.startDate,
  endDate: draft.endDate,
  assistantMasterPersonId: Number(draft.assistantMasterPersonId),
  directAssistantPersonId: Number(draft.directAssistantPersonId),
  assistantMemberIds: (draft.assistantMemberIds || []).map(Number),
  organMemberIds: (draft.organMemberIds || []).map(Number),
  notes: String(draft.notes || "").trim(),
});

export const sortTeamPeriods = periods => [...(Array.isArray(periods) ? periods : [])].sort(
  (left, right) => String(right?.startDate || "").localeCompare(String(left?.startDate || "")) || Number(right?.id || 0) - Number(left?.id || 0),
);

export const findPersonName = (people, id) => {
  const person = (people || []).find(item => String(item.id) === String(id));
  return person?.name || "Pessoa nao encontrada";
};

export const togglePersonId = (ids, id) => {
  const text = String(id || "");
  if (!text) return ids || [];
  const current = Array.isArray(ids) ? ids.map(String) : [];
  return current.includes(text) ? current.filter(item => item !== text) : [...current, text];
};
