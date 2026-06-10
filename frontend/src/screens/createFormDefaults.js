/**
 * @file frontend/src/screens/createFormDefaults.js
 * @summary Defaults e presets da criacao de formulario.
 * @responsibility Expor opcoes e construtores iniciais sem depender do estado da tela.
 */

import { FORM_MODES, formatDate } from "../lib/forms";

export const FIELD_TYPES = [
  { v: "person_select", l: "Seletor por base" },
  { v: "yes_no", l: "Sim / Nao" },
  { v: "number", l: "Numerico" },
  { v: "text", l: "Texto Curto" },
  { v: "grid", l: "Grade / Matriz" },
];

export const FORM_MODE_OPTIONS = [
  {
    id: FORM_MODES.NUCLEO,
    title: "Presenca do nucleo",
    desc: "Já nasce com o campo Nome da base central e habilita faltantes, resumo e filtro por grau.",
    badge: "Base central ativa",
    bullets: ["Campo Nome obrigatório", "Resumo e faltantes liberados", "Filtro por grau nos resultados"],
  },
  {
    id: FORM_MODES.GERAL,
    title: "Formulario geral",
    desc: "Não usa a base central de sócios. Permite campos livres e bases externas.",
    badge: "Fluxo livre",
    bullets: ["Sem nome fixo da base central", "Aceita bases externas no catálogo", "Sem lógica de faltantes do núcleo"],
  },
];

export const createDefaultMemberField = () => ({
  id: Date.now(),
  type: "person_select",
  label: "Nome",
  required: true,
  show: true,
  total: false,
  selectionSource: { kind: "members" },
  memberBinding: { source: "members", role: "primary" },
});

export const createDefaultPresenceFields = formMode => formMode === FORM_MODES.NUCLEO
  ? [createDefaultMemberField()]
  : [];

export const buildPresetTitle = (format, event) => {
  const eventDate = event?.date ? ` - ${formatDate(event.date)}` : "";
  if (format === "presenca") {
    const eventTitle = String(event?.title || "").trim();
    return `Presenca${eventTitle ? ` ${eventTitle}` : ""}${eventDate}`;
  }
  if (format === "escala_organ") {
    return `Escala da Organ${eventDate}`;
  }
  return "";
};
