/**
 * @file frontend/src/lib/appHeaderTitle.js
 * @summary Resolve o titulo contextual exibido no header global.
 */

import { formatDate } from "./formFormatting";

const STATIC_TITLES = {
  settings: "Configura\u00e7\u00f5es",
};

const eventTitleWithDate = event => (event?.date ? `${event.title} - ${formatDate(event.date)}` : event?.title || "");

export const resolveAppHeaderTitle = ({
  screen,
  nav = [],
  activeEvent = null,
  activeForm = null,
  editingForm = null,
}) => {
  if (screen === "events") return activeEvent ? eventTitleWithDate(activeEvent) : "Eventos";
  if (["respond", "results"].includes(screen)) return activeForm?.title || "";
  if (screen === "create") return editingForm?.title || (activeEvent?.title ? `Novo formul\u00e1rio - ${activeEvent.title}` : "Novo formul\u00e1rio");
  if (["eventMessageEditor", "eventMessageDetail"].includes(screen)) {
    return activeEvent?.title ? `Mensagem - ${activeEvent.title}` : "Mensagem";
  }
  return nav.find(item => item.key === screen)?.label || STATIC_TITLES[screen] || "";
};

const SCREEN_SUBTITLES = {
  dashboard: "Indicadores de presença, escalas e participação dos sócios.",
  events: "Organize encontros, acompanhe seus formulários e centralize as comunicações de cada evento.",
  teams: "Cadastre as equipes do Mestre Assistente e da Organ para controlar dispensas por período.",
  messages: "Configure o envio, os modelos de mensagem e os grupos de destinatários.",
  guide: "Consulte os fluxos, possibilidades e detalhes técnicos do NSJB Forms.",
  settings: "Área administrativa do sistema.",
};

export const resolveAppHeaderSubtitle = ({ screen, activeEvent = null, activeForm = null }) => {
  if (screen === "events" && activeEvent) return "";
  if (["respond", "results"].includes(screen)) return activeForm?.description || "";
  return SCREEN_SUBTITLES[screen] || "";
};
