/**
 * @file frontend/src/screens/createFormMemberBindings.js
 * @summary Normalizacao dos campos ligados a base central de socios.
 * @responsibility Preservar o campo principal e limpar bindings fora do fluxo de membros.
 */

import { FORM_MODES, isMembersSelectionField } from "../lib/forms";
import { createDefaultMemberField } from "./createFormDefaults";

export const stripMemberBinding = field => {
  const { memberBinding, ...rest } = field || {};
  return rest;
};

export const removeMembersBaseFields = fields => (fields || []).filter(field => !isMembersSelectionField(field));

export const ensurePrimaryMembersField = fields => {
  const nextFields = Array.isArray(fields) ? [...fields] : [];
  if (nextFields.some(isMembersSelectionField)) return nextFields;
  return [createDefaultMemberField(), ...nextFields];
};

export const normalizePeopleBaseBindings = nextFields => {
  const personFields = nextFields.filter(isMembersSelectionField);
  if (personFields.length === 0) return nextFields.map(stripMemberBinding);

  const explicitPrimary = personFields.find(field => field?.memberBinding?.role === "primary");
  const fallbackPrimary = explicitPrimary || personFields[0];

  return nextFields.map(field => {
    if (field.type !== "person_select" || !isMembersSelectionField(field)) return stripMemberBinding(field);
    return {
      ...field,
      memberBinding: {
        source: "members",
        role: String(field.id) === String(fallbackPrimary.id) ? "primary" : "secondary",
      },
    };
  });
};

export const normalizePresenceFieldsForMode = (fields, formMode) => (
  formMode === FORM_MODES.NUCLEO
    ? normalizePeopleBaseBindings(ensurePrimaryMembersField(fields))
    : normalizePeopleBaseBindings(removeMembersBaseFields(fields))
);
