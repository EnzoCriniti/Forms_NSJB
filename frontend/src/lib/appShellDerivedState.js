/**
 * @file frontend/src/lib/appShellDerivedState.js
 * @summary Seletores derivados do shell principal do app.
 */

export const getPinnedIdsForUser = (pinnedByUser, userId) => {
  if (!userId) return [];
  const value = pinnedByUser?.[String(userId)];
  return Array.isArray(value) ? value : [];
};

export const buildAppShellDerivedState = ({
  bootstrap,
  responseDetails = {},
  escalaDetails = {},
  currentUser,
  pinnedFormsByUser = {},
  pinnedEventsByUser = {},
  activeFormId = null,
  activeEventId = null,
  editingFormId = null,
  draftForm = null,
  publicRoute = null,
}) => {
  const forms = bootstrap?.forms || [];
  const events = bootstrap?.events || [];
  const responsesByForm = { ...(bootstrap?.responsesByForm || {}), ...responseDetails };
  const escalaByForm = { ...(bootstrap?.escalaByForm || {}), ...escalaDetails };
  const publicIdentifier = publicRoute?.identifier;
  const publicForm = publicIdentifier
    ? forms.find(form => String(form.id) === String(publicIdentifier) || form.slug === publicIdentifier) || null
    : null;
  const publicEventIdentifier = publicRoute?.eventIdentifier;
  const publicEvent = publicForm
    ? events.find(event => {
      if (publicEventIdentifier) {
        return String(event.id) === String(publicEventIdentifier) || event.slug === publicEventIdentifier;
      }
      return (event.formIds || []).some(formId => String(formId) === String(publicForm.id));
    }) || null
    : null;

  return {
    forms,
    events,
    responsesByForm,
    escalaByForm,
    pinnedFormIds: getPinnedIdsForUser(pinnedFormsByUser, currentUser?.id),
    pinnedEventIds: getPinnedIdsForUser(pinnedEventsByUser, currentUser?.id),
    activeForm: forms.find(form => form.id === activeFormId) || null,
    activeEvent: events.find(event => event.id === activeEventId) || null,
    editingForm: draftForm || forms.find(form => form.id === editingFormId) || null,
    publicEvent,
    publicForm,
    publicResultsEnabled: publicForm?.type === "presenca" && publicForm?.resultsConfig?.publicResultsEnabled === true,
    publicResultsView: publicRoute?.view === "results",
  };
};
