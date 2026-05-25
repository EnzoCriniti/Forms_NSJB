/**
 * @file frontend/src/lib/appControllerDerived.js
 * @summary Dados derivados do controller do App.
 */

import { useMemo } from "react";
import { buildAppShellDerivedState } from "./appShellDerivedState";

export const useAppControllerDerivedState = ({
  activeEventId,
  activeFormId,
  bootstrap,
  currentUser,
  draftForm,
  editingFormId,
  escalaDetails,
  pinnedEventsByUser,
  pinnedFormsByUser,
  publicRoute,
  responseDetails,
}) => useMemo(() => buildAppShellDerivedState({
  bootstrap,
  responseDetails,
  escalaDetails,
  currentUser,
  pinnedFormsByUser,
  pinnedEventsByUser,
  activeFormId,
  activeEventId,
  editingFormId,
  draftForm,
  publicRoute,
}), [
  bootstrap,
  responseDetails,
  escalaDetails,
  currentUser,
  pinnedFormsByUser,
  pinnedEventsByUser,
  activeFormId,
  activeEventId,
  editingFormId,
  draftForm,
  publicRoute,
]);
