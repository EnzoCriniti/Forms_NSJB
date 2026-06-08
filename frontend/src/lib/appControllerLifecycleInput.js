import { CONTROLLER_LIFECYCLE_SETTER_KEYS, CONTROLLER_LIFECYCLE_VALUE_KEYS } from "./appControllerInputKeys";

const pick = (source, keys) => keys.reduce((picked, key) => ({
  ...picked,
  [key]: source[key],
}), {});

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
