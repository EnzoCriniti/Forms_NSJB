/**
 * @file frontend/src/lib/appControllerLoaders.js
 * @summary Montagem dos carregadores de dados usados pelo controller do App.
 */

import { visibleFormsFor } from "./auth";
import { normalizeBootstrap, pickActiveFormIdAfterBootstrap } from "./appBootstrap";
import { buildAppDataHandlers } from "./appDataHandlers";

export const buildAppControllerLoaders = ({
  activeFormId,
  bootstrap,
  currentUser,
  detailLoading,
  escalaDetails,
  responseDetails,
  setActiveFormId,
  setBootstrap,
  setDetailLoading,
  setError,
  setEscalaDetails,
  setFormDeleteKeyConfigured,
  setLoading,
  setResponseDetails,
}) => buildAppDataHandlers({
  activeFormId,
  bootstrap,
  currentUser,
  detailLoading,
  escalaDetails,
  normalizeBootstrap,
  pickActiveFormIdAfterBootstrap,
  responseDetails,
  setActiveFormId,
  setBootstrap,
  setDetailLoading,
  setError,
  setEscalaDetails,
  setFormDeleteKeyConfigured,
  setLoading,
  setResponseDetails,
  visibleFormsFor,
});
