/**
 * @file frontend/src/screens/publicScaleDomain.js
 * @summary Helpers puros do fluxo publico da escala.
 * @responsibility Concentrar limite de vagas, contagem de atribuicoes e montagem da proxima versao das secoes.
 */

import { getScalePersonLimit } from "../lib/forms";

export const buildPublicScaleLimitMessage = limit => (
  limit === 1
    ? "Este nome ja esta em uma vaga desta escala."
    : "Este nome ja atingiu o limite de vagas desta escala."
);

export const countPublicScaleAssignments = (sections, personName) => {
  const normalizedName = String(personName || "").trim().toLowerCase();
  if (!normalizedName) return 0;
  return (Array.isArray(sections) ? sections : []).reduce((sum, section) => sum + (Array.isArray(section?.slots) ? section.slots : []).filter(slot => String(slot?.person || "").trim().toLowerCase() === normalizedName).length, 0);
};

export const buildPublicScaleNextSections = (sections, sectionIndex, slotIndex, personName) => (
  (Array.isArray(sections) ? sections : []).map((section, currentSectionIndex) => (
    currentSectionIndex === sectionIndex
      ? {
          ...section,
          slots: (Array.isArray(section?.slots) ? section.slots : []).map((slot, currentSlotIndex) => (
            currentSlotIndex === slotIndex ? { ...slot, person: personName } : slot
          )),
        }
      : section
  ))
);

export const resolvePublicScaleLimit = form => getScalePersonLimit(form);
