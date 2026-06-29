/**
 * @file frontend/src/lib/formFormatting.js
 * @summary Formatacao e busca textual de formularios.
 */

import { FORM_MODES, getFormMode } from "./formFieldAccess";

export const formatDate = value => {
  if (!value) return "";
  const [year, month, day] = value.split("T")[0].split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
};

export const formatDateTime = value => {
  if (!value) return "";
  const [date, time] = value.split("T");
  if (!date) return value;
  const formattedDate = formatDate(date);
  return time ? `${formattedDate} ${time.slice(0, 5)}` : formattedDate;
};

export const normalizeSearchText = value => String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .trim();

export const buildFormSearchIndex = (form, labels = []) => {
  const labelText = [...new Set(form?.labels || [])]
    .map(labelId => labels.find(label => label.id === labelId)?.name || "")
    .filter(Boolean)
    .join(" ");
  const modeText = getFormMode(form) === FORM_MODES.NUCLEO ? "com base de socios presenca do nucleo nucleo" : "formulario geral geral";
  return normalizeSearchText([
    form?.title,
    form?.description,
    form?.status,
    form?.type === "escala_organ" ? "escala da organ" : "presenca",
    modeText,
    labelText,
    form?.closing,
    form?.date,
  ].join(" "));
};
