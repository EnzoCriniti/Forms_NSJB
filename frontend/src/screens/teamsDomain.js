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
  organPersonId: "",
  directAssistantPersonId: "",
  organDirectAssistantPersonId: "",
  assistantMemberIds: [],
  organMemberIds: [],
  notes: "",
};

export const buildTeamPeriodDraft = period => ({
  ...emptyTeamPeriodDraft,
  ...period,
  assistantMasterPersonId: period?.assistantMasterPersonId ? String(period.assistantMasterPersonId) : "",
  organPersonId: period?.organPersonId ? String(period.organPersonId) : "",
  directAssistantPersonId: period?.directAssistantPersonId ? String(period.directAssistantPersonId) : "",
  organDirectAssistantPersonId: period?.organDirectAssistantPersonId ? String(period.organDirectAssistantPersonId) : "",
  assistantMemberIds: Array.isArray(period?.assistantMemberIds) ? period.assistantMemberIds.map(String) : [],
  organMemberIds: Array.isArray(period?.organMemberIds) ? period.organMemberIds.map(String) : [],
});

export const buildTeamPeriodPayload = draft => ({
  id: draft.id || null,
  title: String(draft.title || "").trim(),
  startDate: draft.startDate,
  endDate: draft.endDate,
  assistantMasterPersonId: Number(draft.assistantMasterPersonId),
  organPersonId: Number(draft.organPersonId),
  directAssistantPersonId: Number(draft.directAssistantPersonId),
  organDirectAssistantPersonId: Number(draft.organDirectAssistantPersonId),
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

export const normalizeTeamGrau = value => String(value || "")
  .trim()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toUpperCase();

export const isAssistantMasterPerson = person => {
  const grau = normalizeTeamGrau(person?.grau);
  return grau === "QM";
};

export const isOrganPerson = person => normalizeTeamGrau(person?.grau).includes("CDC");

export const filterAssistantMasterPeople = people => (people || []).filter(isAssistantMasterPerson);

export const filterOrganPeople = people => (people || []).filter(isOrganPerson);

export const togglePersonId = (ids, id) => {
  const text = String(id || "");
  if (!text) return ids || [];
  const current = Array.isArray(ids) ? ids.map(String) : [];
  return current.includes(text) ? current.filter(item => item !== text) : [...current, text];
};
