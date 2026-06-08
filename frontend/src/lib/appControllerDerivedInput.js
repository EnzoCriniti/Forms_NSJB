import { CONTROLLER_DERIVED_VALUE_KEYS } from "./appControllerInputKeys";

const pick = (source, keys) => keys.reduce((picked, key) => ({
  ...picked,
  [key]: source[key],
}), {});

export const buildAppControllerDerivedInput = values => pick(values, CONTROLLER_DERIVED_VALUE_KEYS);
