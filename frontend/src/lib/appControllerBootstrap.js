/**
 * @file frontend/src/lib/appControllerBootstrap.js
 * @summary Selecao dos blocos do bootstrap usados pelo controller do App.
 */

export const selectAppControllerBootstrapData = (bootstrap = {}) => {
  const {
    users,
    labels,
    presets,
    fieldCatalog,
    scaleTaskCatalog,
    people,
    membersConfig,
    externalBases,
    events,
    eventsPage,
    messageTemplates = [],
    personPresets = [],
    messagingConfig = { whatsappGroupName: "", autoDispatchEnabled: true, publicBaseUrl: "" },
  } = bootstrap;

  return {
    users,
    labels,
    presets,
    fieldCatalog,
    scaleTaskCatalog,
    people,
    membersConfig,
    externalBases,
    events,
    eventsPage,
    messageTemplates,
    personPresets,
    messagingConfig,
  };
};
