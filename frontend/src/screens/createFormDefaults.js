/**
 * @file frontend/src/screens/createFormDefaults.js
 * @summary Defaults e presets da criacao de formulario.
 * @responsibility Expor opcoes e construtores iniciais sem depender do estado da tela.
 */

import { FORM_MODES, formatDate } from "../lib/forms";

export const FIELD_TYPES = [
  { v: "person_select", l: "Seletor por base" },
  { v: "yes_no", l: "Sim / Não" },
  { v: "number", l: "Numérico" },
  { v: "text", l: "Texto Curto" },
  { v: "grid", l: "Grade / Matriz" },
];

export const FORM_MODE_OPTIONS = [
  {
    id: FORM_MODES.NUCLEO,
    title: "Formulário Presença Núcleo",
    desc: "Ja nasce com o campo Nome da base central. O controle de faltantes pode ficar ligado ou desligado nos resultados.",
    badge: "Base central ativa",
    bullets: ["Campo Nome obrigatorio", "Pode controlar faltantes", "Pode ser usado em formularios opcionais"],
  },
  {
    id: FORM_MODES.GERAL,
    title: "Formulário Geral",
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
