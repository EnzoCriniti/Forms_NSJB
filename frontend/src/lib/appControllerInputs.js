/**
 * @file frontend/src/lib/appControllerInputs.js
 * @summary Montagem dos inputs internos do controller do App.
 */

const pick = (source, keys) => keys.reduce((picked, key) => ({
  ...picked,
  [key]: source[key],
}), {});

const CONTROLLER_DERIVED_VALUE_KEYS = [
  "bootstrap",
  "responseDetails",
  "escalaDetails",
  "currentUser",
  "pinnedFormsByUser",
  "pinnedEventsByUser",
  "activeFormId",
  "activeEventId",
  "editingFormId",
  "draftForm",
  "publicRoute",
];

const CONTROLLER_LOADERS_VALUE_KEYS = [
  "activeFormId",
  "bootstrap",
  "currentUser",
  "detailLoading",
  "escalaDetails",
  "responseDetails",
];

const CONTROLLER_LOADERS_SETTER_KEYS = [
  "setActiveFormId",
  "setBootstrap",
  "setDetailLoading",
  "setError",
  "setEscalaDetails",
  "setFormDeleteKeyConfigured",
  "setLoading",
  "setResponseDetails",
];

const CONTROLLER_HANDLER_SETTER_KEYS = [
  "setActiveEventId",
  "setActiveFormId",
  "setActiveMessageId",
  "setBootstrap",
  "setDraftForm",
  "setEditingFormId",
  "setEscalaDetails",
  "setFontScale",
  "setFormDeleteKeyConfigured",
  "setPinnedEventsByUser",
  "setPinnedFormsByUser",
  "setResponseDetails",
  "setScreen",
  "setSession",
];

const CONTROLLER_LIFECYCLE_VALUE_KEYS = [
  "authToken",
  "currentUser",
  "detailLoading",
  "error",
  "fontScale",
  "pinnedEventsByUser",
  "pinnedFormsByUser",
  "screen",
  "session",
  "theme",
];

const CONTROLLER_LIFECYCLE_SETTER_KEYS = [
  "setFontScale",
  "setPublicRoute",
  "setScreen",
  "setSession",
  "setTheme",
];

const CONTROLLER_VIEWMODEL_VALUE_KEYS = [
  "activeEventId",
  "activeMessageId",
  "currentUser",
  "draftForm",
  "error",
  "fontScale",
  "formDeleteKeyConfigured",
  "loading",
  "publicRoute",
  "screen",
  "theme",
];

const CONTROLLER_VIEWMODEL_SETTER_KEYS = [
  "setActiveEventId",
  "setActiveFormId",
  "setActiveMessageId",
  "setDraftForm",
  "setEditingFormId",
  "setPublicRoute",
  "setScreen",
  "setTheme",
];

export const buildAppControllerDerivedInput = values => pick(values, CONTROLLER_DERIVED_VALUE_KEYS);

export const buildAppControllerLoadersInput = ({ values, setters }) => ({
  ...pick(values, CONTROLLER_LOADERS_VALUE_KEYS),
  ...pick(setters, CONTROLLER_LOADERS_SETTER_KEYS),
});

export const buildAppControllerHandlersInput = ({
  bootstrapData,
  derived,
  loaders,
  setters,
  values,
}) => ({
  activeForm: derived.activeForm,
  activeEventId: values.activeEventId,
  currentUser: values.currentUser,
  events: bootstrapData.events,
  refreshBootstrap: loaders.refreshBootstrap,
  refreshEscalaForForm: loaders.refreshEscalaForForm,
  ...pick(setters, CONTROLLER_HANDLER_SETTER_KEYS),
});

export const buildAppControllerLifecycleInput = ({
  derived,
  loaders,
  sessionHandlers,
  setters,
  values,
}) => ({
  activeForm: derived.activeForm,
  escalaByForm: derived.escalaByForm,
  invalidateSession: sessionHandlers.invalidateSession,
  loadEscalaForForm: loaders.loadEscalaForForm,
  loadResponsesForForm: loaders.loadResponsesForForm,
  publicForm: derived.publicForm,
  publicResultsView: derived.publicResultsView,
  refreshBootstrap: loaders.refreshBootstrap,
  refreshFormDeleteKeyStatus: loaders.refreshFormDeleteKeyStatus,
  responsesByForm: derived.responsesByForm,
  ...pick(values, CONTROLLER_LIFECYCLE_VALUE_KEYS),
  ...pick(setters, CONTROLLER_LIFECYCLE_SETTER_KEYS),
});

export const buildAppControllerViewModelInput = ({
  bootstrapData,
  canCreateForms,
  derived,
  handlers,
  loaders,
  navigate,
  sessionHandlers,
  setters,
  values,
}) => ({
  adminHandlers: handlers.adminHandlers,
  activeEvent: derived.activeEvent,
  activeForm: derived.activeForm,
  canCreateForms,
  editingForm: derived.editingForm,
  escalaByForm: derived.escalaByForm,
  eventHandlers: handlers.eventHandlers,
  events: bootstrapData.events,
  externalBases: bootstrapData.externalBases,
  fieldCatalog: bootstrapData.fieldCatalog,
  formHandlers: handlers.formHandlers,
  forms: derived.forms,
  labels: bootstrapData.labels,
  membersConfig: bootstrapData.membersConfig,
  messageTemplates: bootstrapData.messageTemplates,
  messagingConfig: bootstrapData.messagingConfig,
  navigate,
  people: bootstrapData.people,
  personPresets: bootstrapData.personPresets,
  pinnedEventIds: derived.pinnedEventIds,
  pinnedFormIds: derived.pinnedFormIds,
  presets: bootstrapData.presets,
  publicForm: derived.publicForm,
  publicResultsEnabled: derived.publicResultsEnabled,
  publicResultsView: derived.publicResultsView,
  refreshBootstrap: loaders.refreshBootstrap,
  responsesByForm: derived.responsesByForm,
  scaleTaskCatalog: bootstrapData.scaleTaskCatalog,
  sessionHandlers,
  users: bootstrapData.users,
  ...pick(values, CONTROLLER_VIEWMODEL_VALUE_KEYS),
  ...pick(setters, CONTROLLER_VIEWMODEL_SETTER_KEYS),
});
