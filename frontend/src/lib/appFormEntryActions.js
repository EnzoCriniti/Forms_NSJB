/**
 * @file frontend/src/lib/appFormEntryActions.js
 * @summary Acoes de entrada e ciclo de vida inicial de formularios usadas pelo shell principal.
 * @responsibility Concentrar criacao, duplicacao, salvamento e arquivamento de formularios.
 */

export const startEventFormCreation = ({
  event,
  currentUser,
  canCreateForms,
  setActiveEventId,
  setDraftForm,
  setEditingFormId,
  setScreen,
}) => {
  if (!event || !canCreateForms(currentUser)) return;
  setActiveEventId(event.id);
  setDraftForm(null);
  setEditingFormId(null);
  setScreen("create");
};

export const startDuplicateForm = ({
  form,
  currentUser,
  canCreateForms,
  buildDuplicateFormDraft,
  setActiveFormId,
  setDraftForm,
  setEditingFormId,
  setScreen,
}) => {
  if (!form || !canCreateForms(currentUser)) return;
  setDraftForm(buildDuplicateFormDraft(form));
  setEditingFormId(null);
  setActiveFormId(form.id);
  setScreen("create");
};

export const saveAppForm = async ({
  payload,
  activeEventId,
  events,
  saveForm,
  saveEvent,
  refreshBootstrap,
  setActiveFormId,
  setBootstrap,
  setDraftForm,
  setEditingFormId,
  replaceBootstrapList,
}) => {
  const response = await saveForm(payload);
  const refreshed = await refreshBootstrap({ silent: true, rethrow: true });
  if (activeEventId) {
    const targetEvent = (refreshed?.events || events).find(event => event.id === activeEventId);
    if (targetEvent && !targetEvent.formIds.includes(response.form.id)) {
      const eventResponse = await saveEvent({
        ...targetEvent,
        formIds: [...targetEvent.formIds, response.form.id],
      });
      setBootstrap(prev => replaceBootstrapList(prev, "events", (prev.events || []).map(event => event.id === eventResponse.event.id ? eventResponse.event : event)));
    }
  }
  setDraftForm(null);
  setEditingFormId(response.form.id);
  setActiveFormId(response.form.id);
  return response.form;
};

export const archiveAppForm = async ({
  form,
  nextStatus,
  currentUser,
  canCreateForms,
  buildSaveFormPayloadFromExisting,
  saveForm,
  refreshBootstrap,
  setActiveFormId,
  setDraftForm,
  setEditingFormId,
}) => {
  if (!form || !canCreateForms(currentUser)) return null;
  const response = await saveForm(buildSaveFormPayloadFromExisting(form, nextStatus));
  await refreshBootstrap({ silent: true, rethrow: true });
  setDraftForm(null);
  setEditingFormId(null);
  setActiveFormId(response.form.id);
  return response.form;
};
