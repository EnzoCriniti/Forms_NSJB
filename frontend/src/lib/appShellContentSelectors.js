/**
 * @file frontend/src/lib/appShellContentSelectors.js
 * @summary Seletores pequenos usados pela composicao das telas internas do shell.
 */

export const selectEventForms = (forms = [], event = null) => {
  const formIds = Array.isArray(event?.formIds) ? event.formIds : [];
  return (Array.isArray(forms) ? forms : []).filter(form => formIds.includes(form.id));
};

export const selectEventMessage = (event = null, messageId = null) => {
  if (!messageId) return null;
  const messages = Array.isArray(event?.messages) ? event.messages : [];
  return messages.find(item => item.id === messageId) || null;
};

export const selectFormResponses = (responsesByForm = {}, formId = null) => responsesByForm?.[formId] || [];

export const selectFormSections = (escalaByForm = {}, formId = null) => escalaByForm?.[formId] || [];
