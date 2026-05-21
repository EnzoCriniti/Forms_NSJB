/**
 * @file frontend/src/screens/createFormModeTransition.js
 * @summary Transicao do modo estrutural na criacao de formulario.
 * @responsibility Ajustar campos, resultados e rascunho do campo ao trocar entre nucleo e geral.
 */

import { FORM_MODES } from "../lib/forms";
import {
  ensurePrimaryMembersField,
  normalizePeopleBaseBindings,
  removeMembersBaseFields,
} from "./createFormMemberBindings";
import { syncResultsConfigWithFields } from "./createFormResultsConfig";

export const buildCreateFormModeTransition = ({
  nextMode,
  fields,
  currentNFieldMode,
  currentNType,
  currentNCatalogId,
  currentResultsConfig,
  filteredFieldCatalog = [],
}) => {
  const normalizedFields = nextMode === FORM_MODES.NUCLEO
    ? normalizePeopleBaseBindings(ensurePrimaryMembersField(fields))
    : normalizePeopleBaseBindings(removeMembersBaseFields(fields));

  let nextType = currentNType;
  let nextCatalogId = currentNCatalogId;

  if (nextMode === FORM_MODES.GERAL && currentNFieldMode === "local" && currentNType === "person_select") {
    nextType = "yes_no";
  }

  if (nextMode === FORM_MODES.GERAL && currentNFieldMode === "catalog") {
    const selectedCatalogItem = filteredFieldCatalog.find(item => String(item.id) === String(currentNCatalogId));
    if (selectedCatalogItem?.type === "person_select" && selectedCatalogItem?.selectionSource?.kind !== "external_base") {
      nextCatalogId = "";
      nextType = "yes_no";
    }
  }

  return {
    fields: normalizedFields,
    resultsConfig: syncResultsConfigWithFields({
      ...currentResultsConfig,
      formMode: nextMode,
      showLinkedRoster: nextMode === FORM_MODES.NUCLEO ? currentResultsConfig.showLinkedRoster : false,
    }, normalizedFields),
    nextType,
    nextCatalogId,
    totalExpected: nextMode === FORM_MODES.GERAL ? "" : undefined,
  };
};
