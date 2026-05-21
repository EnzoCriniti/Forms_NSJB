/**
 * @file backend/services/formScaleInitializer.mjs
 * @summary Inicializacao da escala vinculada ao formulario.
 * @responsibility Criar secoes iniciais de escala sem sobrescrever secoes ja persistidas.
 */

import { buildScaleSections } from "../core/forms.mjs";
import { getEscalaByFormId, upsertEscalaRecord } from "../repositories/escalaRepository.mjs";

export const initializeFormScaleSections = async (formId, values) => {
  if (values.type !== "escala_organ") return;

  const currentSections = await getEscalaByFormId(formId);
  await upsertEscalaRecord(
    formId,
    currentSections.length ? currentSections : buildScaleSections(values.scaleSections),
  );
};
