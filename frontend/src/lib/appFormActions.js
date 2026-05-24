/**
 * @file frontend/src/lib/appFormActions.js
 * @summary Acoes de formularios usadas pelo shell principal.
 * @responsibility Concentrar mutacoes de formulario, resposta e escala fora de App.jsx.
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

export const deleteAppForm = async ({
  formId,
  masterKey,
  deleteForm,
  refreshBootstrap,
  setBootstrap,
  setEscalaDetails,
  setResponseDetails,
  removeFormDetail,
  removeFormIdFromEvents,
}) => {
  const result = await deleteForm(formId, masterKey);
  setResponseDetails(prev => removeFormDetail(prev, formId));
  setEscalaDetails(prev => removeFormDetail(prev, formId));
  await refreshBootstrap({ silent: true, rethrow: true });
  setBootstrap(prev => removeFormIdFromEvents(prev, formId));
  return result;
};

export const saveAppResponse = async ({
  payload,
  saveResponse,
  setBootstrap,
  setResponseDetails,
  updateBootstrapFormMetrics,
  upsertFormDetail,
}) => {
  const result = await saveResponse(payload);
  setResponseDetails(prev => upsertFormDetail(prev, payload.formId, result.responses));
  setBootstrap(prev => updateBootstrapFormMetrics(prev, payload.formId, { responses: result.responses.length }));
};

export const saveAppEscala = async ({
  formId,
  sections,
  saveEscala,
  setBootstrap,
  setEscalaDetails,
  buildEscalaMetrics,
  updateBootstrapFormMetrics,
  upsertFormDetail,
}) => {
  const result = await saveEscala(formId, sections);
  setEscalaDetails(prev => upsertFormDetail(prev, formId, result.sections));
  setBootstrap(prev => updateBootstrapFormMetrics(prev, formId, buildEscalaMetrics(result.sections)));
};

export const claimAppEscalaSlot = async ({
  formId,
  sectionIndex,
  slotIndex,
  person,
  claimEscalaSlot,
  refreshEscalaForForm,
  setBootstrap,
  setEscalaDetails,
  buildEscalaMetrics,
  updateBootstrapFormMetrics,
  upsertFormDetail,
}) => {
  try {
    const result = await claimEscalaSlot(formId, sectionIndex, slotIndex, person);
    setEscalaDetails(prev => upsertFormDetail(prev, formId, result.sections));
    setBootstrap(prev => updateBootstrapFormMetrics(prev, formId, buildEscalaMetrics(result.sections)));
    return result.sections;
  } catch (error) {
    if (error?.status === 409 || error?.code === "ESCALA_CONFLICT") {
      await refreshEscalaForForm(formId);
    }
    throw error;
  }
};
