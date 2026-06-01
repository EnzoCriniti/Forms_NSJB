/**
 * @file shared/formFieldRules.mjs
 * @summary Regras compartilhadas de campos de formulario.
 */

export const FIELD_TYPES = ["person_select", "yes_no", "number", "text", "grid"];

export const SELECTION_SOURCE_KINDS = {
  MEMBERS: "members",
  EXTERNAL_BASE: "external_base",
};

export const SELECTION_SOURCE_KIND_VALUES = Object.values(SELECTION_SOURCE_KINDS);

export const MEMBER_BINDING_ROLES = {
  PRIMARY: "primary",
  SECONDARY: "secondary",
};

export const MEMBER_BINDING_ROLE_VALUES = Object.values(MEMBER_BINDING_ROLES);

export const getFieldSelectionSource = field => {
  if (!field || field.type !== "person_select") return null;
  if (field?.selectionSource?.kind === SELECTION_SOURCE_KINDS.EXTERNAL_BASE) {
    return {
      kind: SELECTION_SOURCE_KINDS.EXTERNAL_BASE,
      externalBaseId: field.selectionSource.externalBaseId ?? null,
    };
  }
  return { kind: SELECTION_SOURCE_KINDS.MEMBERS };
};

export const isMembersSelectionField = field => getFieldSelectionSource(field)?.kind === SELECTION_SOURCE_KINDS.MEMBERS;

export const isExternalBaseSelectionField = field => getFieldSelectionSource(field)?.kind === SELECTION_SOURCE_KINDS.EXTERNAL_BASE;
