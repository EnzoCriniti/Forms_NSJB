/**
 * @file frontend/src/screens/publicFormDomain.js
 * @summary Helpers puros do fluxo publico de resposta.
 * @responsibility Concentrar montagem de seletores e leitura de respostas repetidas.
 */

import { getFieldSelectionSource, getPersonOptionLabel, isExternalBaseSelectionField, isPrimaryPeopleBaseField, resolvePersonBySelectionValue } from "../lib/forms";

export const buildPublicPersonSelectOptions = ({ field, form, people, externalBases }) => {
  if (!field || field.type !== "person_select") {
    return { options: [], placeholder: "" };
  }

  const selectionSource = getFieldSelectionSource(field);
  const isExternal = isExternalBaseSelectionField(field);
  const isPrimary = isPrimaryPeopleBaseField(form, field);
  const options = isExternal
    ? (externalBases || [])
        .find(base => String(base.id) === String(selectionSource?.externalBaseId || ""))
        ?.items || []
    : people.map(person => ({ value: getPersonOptionLabel(person), label: getPersonOptionLabel(person) }));

  return {
    options: options.filter(item => item.active !== false),
    placeholder: isExternal
      ? "Selecione uma opção..."
      : isPrimary
        ? "Selecione seu nome..."
        : "Selecione uma pessoa...",
  };
};

export const findSelectedPublicPerson = (people, value) => resolvePersonBySelectionValue(people, value);

export const findExistingPublicResponse = ({ responses, personName }) => {
  const normalizedName = String(personName || "").trim().toLowerCase();
  if (!normalizedName) return null;
  return (responses || []).find(response => String(response.respondentName || "").trim().toLowerCase() === normalizedName) || null;
};
