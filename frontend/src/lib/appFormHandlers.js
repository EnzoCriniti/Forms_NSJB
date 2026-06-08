/**
 * @file frontend/src/lib/appFormHandlers.js
 * @summary Agregador historico dos handlers de formularios usados pelo App principal.
 * @responsibility Manter compatibilidade enquanto os handlers por dominio vivem em modulos menores.
 */

import { buildAppFormCreateHandlers } from "./appFormCreateHandlers";
import { buildAppFormInteractionHandlers } from "./appFormInteractionHandlers";
import {
  claimEscalaSlot as apiClaimEscalaSlot,
  deleteForm as apiDeleteForm,
  saveEscala as apiSaveEscala,
  saveEvent as apiSaveEvent,
  saveForm as apiSaveForm,
  saveResponse as apiSaveResponse,
} from "./api";

export const buildAppFormHandlers = params => {
  const normalizedParams = {
    claimEscalaSlot: apiClaimEscalaSlot,
    deleteForm: apiDeleteForm,
    saveEscala: apiSaveEscala,
    saveEvent: apiSaveEvent,
    saveForm: apiSaveForm,
    saveResponse: apiSaveResponse,
    ...params,
  };

  return {
    ...buildAppFormCreateHandlers(normalizedParams),
    ...buildAppFormInteractionHandlers(normalizedParams),
  };
};

export * from "./appFormCreateHandlers";
export * from "./appFormInteractionHandlers";
