/**
 * @file frontend/src/lib/appNavigation.js
 * @summary Decisao pura de navegacao interna do shell autenticado.
 */

export const resolveAppNavigation = ({
  nextScreen,
  form = null,
  activeForm = null,
  currentUser = null,
  canCreateForms,
  canViewForm,
}) => {
  const canCreate = canCreateForms(currentUser);
  if (["dashboard", "create", "settings", "reports"].includes(nextScreen) && !canCreate) {
    return { screen: "list", clearDraft: false };
  }

  if (nextScreen === "list" && currentUser) {
    return { screen: "events", clearDraft: false };
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
