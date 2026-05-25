/**
 * @file frontend/src/lib/appBootstrapSelection.js
 * @summary Selecao ativa apos atualizar o bootstrap do frontend.
 */

export const pickActiveFormIdAfterBootstrap = ({
  currentFormId,
  currentUser,
  forms,
  visibleForms = [],
  preserveSelection = true,
}) => {
  const nextForms = Array.isArray(forms) ? forms : [];
  const nextVisibleForms = Array.isArray(visibleForms) ? visibleForms : [];

  if (!preserveSelection) {
    return nextVisibleForms[0]?.id || null;
  }

  if (currentFormId && !nextForms.some(form => form.id === currentFormId)) {
    return nextForms[0]?.id || null;
  }

  if (!currentFormId) {
    return nextVisibleForms[0]?.id || null;
  }

  if (!currentUser?.id && nextForms.length === 0) {
    return null;
  }

  return currentFormId;
};
