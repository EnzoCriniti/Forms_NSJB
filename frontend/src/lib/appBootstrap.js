/**
 * @file frontend/src/lib/appBootstrap.js
 * @summary Helpers puros do bootstrap principal do frontend.
 * @responsibility Normalizar dados iniciais e decidir selecao padrao de formularios.
 */

export const createEmptyBootstrap = () => ({
  forms: [],
  events: [],
  responsesByForm: {},
  escalaByForm: {},
  users: [],
  labels: [],
  presets: [],
  fieldCatalog: [],
  scaleTaskCatalog: [],
  people: [],
  membersConfig: {},
  externalBases: [],
  messageTemplates: [],
  personPresets: [],
  messagingConfig: { whatsappGroupName: "", autoDispatchEnabled: true, publicBaseUrl: "" },
});

export const normalizeBootstrap = bootstrap => ({
  ...createEmptyBootstrap(),
  ...(bootstrap || {}),
});

export const replaceBootstrapList = (bootstrap, key, list) => ({
  ...bootstrap,
  [key]: list,
});

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
