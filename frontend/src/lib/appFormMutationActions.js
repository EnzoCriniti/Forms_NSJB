/**
 * @file frontend/src/lib/appFormMutationActions.js
 * @summary Acoes de mutacao de formularios, respostas e escala usadas pelo shell principal.
 * @responsibility Concentrar exclusao segura, persistencia de respostas e atualizacao de escala.
 */

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
