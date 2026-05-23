/**
 * @file frontend/src/lib/appFormDrafts.js
 * @summary Helpers puros para duplicacao e payload de formulario existente.
 */

export const cloneFormDraft = form => JSON.parse(JSON.stringify(form));

export const buildDuplicateFormDraft = form => {
  const copy = cloneFormDraft(form);
  return {
    ...copy,
    id: null,
    slug: "",
    status: "rascunho",
    title: copy.title ? `${copy.title} (Copia)` : "Formulario (Copia)",
  };
};

export const buildSaveFormPayloadFromExisting = (form, status = form?.status) => ({
  id: form?.id,
  slug: form?.slug,
  type: form?.type,
  status,
  title: form?.title || "",
  sessionName: form?.sessionName || "",
  description: form?.description || "",
  labels: form?.labels || [],
  date: form?.date || "",
  closing: form?.closing || "",
  closingText: form?.closingText || "",
  totalExpected: form?.totalExpected || 0,
  fieldDefinitions: form?.fieldDefinitions || [],
  resultsConfig: form?.resultsConfig || {},
  scaleSections: form?.scaleSections || [],
});
