/**
 * @file frontend/src/lib/appNavigation.js
 * @summary Decisao pura de navegacao interna do shell autenticado.
 */

import { can } from "./auth";

const canAccessSettings = user => can(user, "settings.security") || can(user, "settings.catalogs")
  || can(user, "settings.bases") || can(user, "users.manage") || can(user, "layers.manage") || can(user, "members.manage");

export const resolveAppNavigation = ({
  nextScreen,
  form = null,
  activeForm = null,
  currentUser = null,
  canCreateForms,
  canViewForm,
}) => {
  const screenGuards = {
    dashboard: () => can(currentUser, "reports.view"),
    teams: () => can(currentUser, "teams.view"),
    messages: () => can(currentUser, "messages.view"),
    create: () => canCreateForms(currentUser),
    settings: () => canAccessSettings(currentUser),
  };
  const guard = screenGuards[nextScreen];
  if (guard && !guard()) {
    return { screen: "list", clearDraft: false };
  }

  if (nextScreen === "list" && currentUser) {
    return { screen: "events", clearDraft: false };
  }

  if (nextScreen === "events" && currentUser) {
    return { screen: "events", clearDraft: true, activeEventId: null };
  }

  const targetForm = form || activeForm;
  if (nextScreen === "results" && targetForm && !canViewForm(currentUser, targetForm)) {
    return { screen: "list", clearDraft: false };
  }

  if (nextScreen === "create") {
    return {
      screen: nextScreen,
      clearDraft: true,
      editingFormId: form?.id || null,
      activeFormId: form?.id,
    };
  }

  return {
    screen: nextScreen,
    clearDraft: true,
    activeFormId: form?.id,
  };
};
