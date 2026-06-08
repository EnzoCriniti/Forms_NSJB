import { CONTROLLER_LOADERS_SETTER_KEYS, CONTROLLER_LOADERS_VALUE_KEYS } from "./appControllerInputKeys";

const pick = (source, keys) => keys.reduce((picked, key) => ({
  ...picked,
  [key]: source[key],
}), {});

export const buildAppControllerLoadersInput = ({ values, setters }) => ({
  ...pick(values, CONTROLLER_LOADERS_VALUE_KEYS),
  ...pick(setters, CONTROLLER_LOADERS_SETTER_KEYS),
});
