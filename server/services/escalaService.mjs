/**
 * @file server/services/escalaService.mjs
 * @summary Regras de negocio da escala da Organ.
 * @responsibility Persistir secoes e vagas preenchidas por formulario.
 */

import { buildScaleSections } from "../core/forms.mjs";
import { db } from "../db.mjs";
import { findFormById } from "../repositories/formsRepository.mjs";
import { getEscalaByFormId, upsertEscalaRecord } from "../repositories/escalaRepository.mjs";
import { getScalePersonLimit } from "../../src/lib/forms.js";

const cleanPerson = value => String(value || "").trim();
const personKey = value => cleanPerson(value).toLowerCase();

const makeError = (message, statusCode, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const withTransaction = callback => {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = callback();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      // ignore rollback failures; original error is more important
    }
    throw error;
  }
};

const ensureScaleForm = formId => {
  const form = findFormById(formId);
  if (!form) throw makeError("Formulario nao encontrado.", 404, "FORM_NOT_FOUND");
  if (form.type !== "escala_organ") throw makeError("Formulario nao e de escala.", 400, "INVALID_FORM_TYPE");
  return form;
};

const validateUniquePeople = sections => {
  const seen = new Map();
  for (const section of sections || []) {
    for (const slot of section.slots || []) {
      const key = personKey(slot.person);
      if (!key) continue;
      if (seen.has(key)) {
        throw makeError("Cada nome so pode ocupar uma vaga na mesma escala.", 409, "ESCALA_CONFLICT");
      }
      seen.set(key, true);
    }
  }
};

const countPersonAssignments = (sections, targetKey) => {
  let count = 0;
  for (const section of sections || []) {
    for (const slot of section.slots || []) {
      if (personKey(slot.person) === targetKey) count += 1;
    }
  }
  return count;
};

const validatePersonAssignmentLimit = (sections, limit) => {
  if (limit <= 1) {
    validateUniquePeople(sections);
    return;
  }
  const counts = new Map();
  for (const section of sections || []) {
    for (const slot of section.slots || []) {
      const key = personKey(slot.person);
      if (!key) continue;
      const nextCount = (counts.get(key) || 0) + 1;
      if (nextCount > limit) {
        throw makeError("Cada nome so pode ocupar o limite definido de vagas nesta escala.", 409, "ESCALA_LIMIT_REACHED");
      }
      counts.set(key, nextCount);
    }
  }
};

const cloneSections = sections => sections.map(section => ({
  ...section,
  slots: (section.slots || []).map(slot => ({ ...slot })),
}));

const getScaleBaseSections = formId => {
  const currentSections = getEscalaByFormId(formId);
  if (currentSections.length > 0) return currentSections;

  const form = findFormById(formId);
  if (!form) return [];
  return buildScaleSections(form.scaleSections || []);
};

export const saveEscala = (formId, sections) => {
  const form = ensureScaleForm(formId);
  validatePersonAssignmentLimit(sections, getScalePersonLimit(form));

  return withTransaction(() => {
    upsertEscalaRecord(formId, sections);
    return getEscalaByFormId(formId);
  });
};

export const claimEscalaSlot = (formId, sectionIndex, slotIndex, person) => {
  const form = ensureScaleForm(formId);
  const limit = getScalePersonLimit(form);
  const nextPerson = cleanPerson(person);

  return withTransaction(() => {
    const currentSections = getScaleBaseSections(formId);
    const section = currentSections[sectionIndex];
    const slot = section?.slots?.[slotIndex];

    if (!section || !slot) {
      throw makeError("A vaga escolhida nao existe mais. Recarregue a escala e tente novamente.", 409, "ESCALA_CONFLICT");
    }

    const currentPersonKey = personKey(slot.person);
    const nextPersonKey = personKey(nextPerson);

    if (!nextPersonKey) {
      throw makeError("Nome da inscricao invalido.", 400, "INVALID_PERSON");
    }

    if (currentPersonKey && currentPersonKey !== nextPersonKey) {
      throw makeError("Esta vaga ja foi preenchida por outra pessoa. Recarregue a escala e tente novamente.", 409, "ESCALA_CONFLICT");
    }

    if (currentPersonKey === nextPersonKey) {
      return currentSections;
    }

    const assignmentCount = countPersonAssignments(currentSections, nextPersonKey);
    if (assignmentCount >= limit) {
      throw makeError(limit === 1
        ? "Este nome ja esta em outra vaga desta escala."
        : "Este nome ja atingiu o limite de vagas desta escala.", 409, "ESCALA_LIMIT_REACHED");
    }

    const nextSections = cloneSections(currentSections);
    nextSections[sectionIndex].slots[slotIndex] = {
      ...nextSections[sectionIndex].slots[slotIndex],
      person: nextPerson,
    };
    upsertEscalaRecord(formId, nextSections);
    return getEscalaByFormId(formId);
  });
};

export const getEscalaForForm = formId => getEscalaByFormId(formId);
