/**
 * @file frontend/src/screens/eventsDomain.js
 * @summary Helpers puros da tela de eventos.
 * @responsibility Centralizar seletores, drafts e paginacao usados por EventsScreen.
 */

export const EVENT_PAGE_SIZE = 4;

export const ELIGIBLE_FORM_TYPES_FOR_MESSAGES = ["presenca", "escala_organ"];

export const emptyEventDraft = {
  title: "",
  description: "",
  date: "",
  opening: "",
  closing: "",
  status: "rascunho",
  formIds: [],
  messageConfig: {},
};

export const isEventEligibleForMessages = forms =>
  forms.some(form => ELIGIBLE_FORM_TYPES_FOR_MESSAGES.includes(form.type));

export const buildEventDraft = event => ({
  ...emptyEventDraft,
  ...(event || {}),
  formIds: Array.isArray(event?.formIds) ? event.formIds : [],
  date: event?.date || "",
  opening: event?.opening || "",
  closing: event?.closing || "",
});

export const sortEvents = (events, pinnedSet) => [...events].sort((a, b) => {
  const aPinned = pinnedSet.has(a.id);
  const bPinned = pinnedSet.has(b.id);
  if (aPinned !== bPinned) return aPinned ? -1 : 1;
  return String(b.date || "").localeCompare(String(a.date || "")) || Number(b.id || 0) - Number(a.id || 0);
});

export const visibleEventFormsFor = (user, eventForms) => {
  if (user?.role === "admin") return eventForms;
  return eventForms.filter(form => form.status !== "arquivado");
};

export const selectEventForms = ({ forms, selectedEvent, user }) => {
  const ids = new Set(selectedEvent?.formIds || []);
  return visibleEventFormsFor(user, forms.filter(form => ids.has(form.id)));
};

export const paginateItems = ({ items, page, pageSize = EVENT_PAGE_SIZE }) => {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    totalPages,
    safePage,
    pageItems: items.slice((safePage - 1) * pageSize, safePage * pageSize),
    rangeStart: items.length === 0 ? 0 : (safePage - 1) * pageSize + 1,
    rangeEnd: Math.min(safePage * pageSize, items.length),
  };
};
