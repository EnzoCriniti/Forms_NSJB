/**
 * @file frontend/src/lib/appHeaderTitle.js
 * @summary Resolve o titulo contextual exibido no header global.
 */

export const resolveAppHeaderTitle = ({
  screen,
  nav = [],
  activeEvent = null,
  activeForm = null,
  editingForm = null,
}) => {
  if (screen === "events") return activeEvent?.title || "";
  if (["respond", "results"].includes(screen)) return activeForm?.title || "";
  if (screen === "create") return editingForm?.title || (activeEvent?.title ? `Novo formul\u00e1rio - ${activeEvent.title}` : "Novo formul\u00e1rio");
  if (["eventMessageEditor", "eventMessageDetail"].includes(screen)) {
    return activeEvent?.title ? `Mensagem - ${activeEvent.title}` : "Mensagem";
  }
  return nav.find(item => item.key === screen)?.label || "";
};
