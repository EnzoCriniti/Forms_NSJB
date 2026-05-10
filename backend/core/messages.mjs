/**
 * @file backend/core/messages.mjs
 * @summary Helpers puros da feature de mensagens (sem acesso a banco).
 * @responsibility Constantes, normalizacoes e renderizacao de placeholders.
 */

export const MESSAGE_TYPES = ["new_scale", "fill_reminder", "open_slots"];
export const MESSAGE_STATUSES = ["rascunho", "agendada", "pronta", "disparada", "cancelada"];
export const DISPATCH_MODES = ["manual", "scheduled"];
export const WINDOW_OPTIONS = ["morning_of_closing", "12h_before", "1h_before"];
export const MESSAGE_DM_TYPES = ["fill_reminder", "open_slots"];
export const MESSAGE_GROUP_TYPES = ["new_scale"];

export const ELIGIBLE_FORM_TYPES = ["presenca", "escala_organ"];

export const TYPE_TO_FORM_TYPE = {
  new_scale: ["presenca", "escala_organ"],
  fill_reminder: ["presenca"],
  open_slots: ["escala_organ"],
};

export const personKeyOf = person => (person?.id !== undefined && person?.id !== null) ? String(person.id) : "";

export const normalizePhone = value => String(value || "").replace(/\D+/g, "");

export const buildWaLink = (phone, text) => {
  const digits = normalizePhone(phone);
  if (!digits) return "";
  const encoded = encodeURIComponent(text || "");
  return `https://wa.me/${digits}${encoded ? `?text=${encoded}` : ""}`;
};

export const buildPublicFormLink = (form, baseUrl) => {
  if (!form) return "";
  const trimmed = String(baseUrl || "").trim().replace(/\/+$/, "");
  const slug = form.slug || form.id;
  const path = `#/formularios/${encodeURIComponent(slug)}`;
  return trimmed ? `${trimmed}/${path}` : path;
};

const formatDateTime = value => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
};

const formatDate = value => {
  if (!value) return "";
  const text = String(value).split("T")[0];
  const [year, month, day] = text.split("-");
  if (!year || !month || !day) return text;
  return `${day}/${month}/${year}`;
};

const renderFormsList = (forms, baseUrl) => (forms || [])
  .map(form => `- ${form.title}: ${buildPublicFormLink(form, baseUrl)}`)
  .join("\n");

const placeholderValue = (path, ctx) => {
  const [head, ...rest] = path.split(".");
  if (head === "event" && ctx.event) {
    if (rest[0] === "title") return ctx.event.title || "";
    if (rest[0] === "date") return formatDate(ctx.event.date);
    if (rest[0] === "opening") return formatDateTime(ctx.event.opening);
    if (rest[0] === "closing") return formatDateTime(ctx.event.closing);
  }
  if (head === "forms" && rest[0] === "list") {
    return renderFormsList(ctx.forms, ctx.publicBaseUrl);
  }
  if (head === "form" && ctx.form) {
    if (rest[0] === "title") return ctx.form.title || "";
    if (rest[0] === "publicLink") return buildPublicFormLink(ctx.form, ctx.publicBaseUrl);
    if (rest[0] === "closing") return formatDateTime(ctx.form.closing);
  }
  if (head === "person" && ctx.person) {
    if (rest[0] === "name") return ctx.person.name || "";
    if (rest[0] === "grau") return ctx.person.grau || "";
  }
  if (head === "group" && ctx.group) {
    if (rest[0] === "name") return ctx.group.name || "";
  }
  return "";
};

export const renderTemplate = (body, ctx) => String(body || "")
  .replace(/\{\{\s*([^}\s]+)\s*\}\}/g, (_, path) => placeholderValue(path.trim(), ctx || {}));

export const computeScheduledFor = (windowOption, formClosingIso) => {
  if (!windowOption || !formClosingIso) return null;
  const closing = new Date(formClosingIso);
  if (Number.isNaN(closing.getTime())) return null;
  if (windowOption === "morning_of_closing") {
    const morning = new Date(closing);
    morning.setHours(7, 0, 0, 0);
    return morning.toISOString();
  }
  if (windowOption === "12h_before") {
    return new Date(closing.getTime() - 12 * 60 * 60 * 1000).toISOString();
  }
  if (windowOption === "1h_before") {
    return new Date(closing.getTime() - 60 * 60 * 1000).toISOString();
  }
  return null;
};
