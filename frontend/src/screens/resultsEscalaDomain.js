/**
 * @file frontend/src/screens/resultsEscalaDomain.js
 * @summary Helpers puros dos resultados de escala.
 */

export const buildEscalaMetrics = (sections = []) => {
  const safeSections = Array.isArray(sections) ? sections : [];
  const total = safeSections.reduce((sum, section) => sum + (Array.isArray(section?.slots) ? section.slots.length : 0), 0);
  const filled = safeSections.reduce((sum, section) => {
    const slots = Array.isArray(section?.slots) ? section.slots : [];
    return sum + slots.filter(slot => slot.person).length;
  }, 0);
  return { total, filled };
};

export const buildEscalaNames = (people = []) => (Array.isArray(people) ? people : []).map(person => person.name);

export const patchEscalaSlot = (sections = [], sectionIndex, slotIndex, patch) => sections.map((section, currentSectionIndex) => (
  currentSectionIndex === sectionIndex
    ? {
        ...section,
        slots: section.slots.map((slot, currentSlotIndex) => (
          currentSlotIndex === slotIndex ? { ...slot, ...patch } : slot
        )),
      }
    : section
));

export const assignEscalaSlotPerson = (sections, sectionIndex, slotIndex, person) => patchEscalaSlot(
  sections,
  sectionIndex,
  slotIndex,
  { person },
);

export const clearEscalaSlotPerson = (sections, sectionIndex, slotIndex) => patchEscalaSlot(
  sections,
  sectionIndex,
  slotIndex,
  { person: "" },
);

export const addEscalaSlot = (sections = [], sectionIndex, slot = { role: "Auxiliar", person: "" }) => sections.map((section, currentSectionIndex) => (
  currentSectionIndex === sectionIndex
    ? { ...section, slots: [...section.slots, slot] }
    : section
));
