/**
 * @file frontend/src/lib/appControllerState.js
 * @summary Estado global do controller do App agrupado por blocos.
 */

import { useAppControllerBootstrapState } from "./appControllerBootstrapState";
import { useAppControllerPreferenceState } from "./appControllerPreferenceState";
import { useAppControllerRoutingState } from "./appControllerRoutingState";

export const useAppControllerState = () => {
  const routing = useAppControllerRoutingState();
  const preferences = useAppControllerPreferenceState();
  const bootstrapState = useAppControllerBootstrapState();

  const currentUser = preferences.values.session?.user || null;
  const authToken = preferences.values.session?.token || null;

  return {
    values: {
      ...routing.values,
      ...preferences.values,
      ...bootstrapState.values,
      authToken,
      currentUser,
    },
    setters: {
      ...routing.setters,
      ...preferences.setters,
      ...bootstrapState.setters,
    },
  };
};
