import { CONTROLLER_HANDLER_SETTER_KEYS } from "./appControllerInputKeys";

const pick = (source, keys) => keys.reduce((picked, key) => ({
  ...picked,
  [key]: source[key],
}), {});

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
