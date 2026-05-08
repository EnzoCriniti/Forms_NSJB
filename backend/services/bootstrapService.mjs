/**
 * @file backend/services/bootstrapService.mjs
 * @summary Montagem do bootstrap inicial da aplicacao.
 * @responsibility Agregar dados da API para o frontend iniciar em uma chamada.
 */

import { databaseInfo } from "../database/index.mjs";
import { listForms } from "../repositories/formsRepository.mjs";
import { countResponsesByFormId } from "../repositories/responsesRepository.mjs";
import { getEscalaByFormId } from "../repositories/escalaRepository.mjs";
import { listUsers } from "../repositories/usersRepository.mjs";
import { listLabels } from "../repositories/labelsRepository.mjs";
import { listPresets } from "../repositories/presetsRepository.mjs";
import { listPeople } from "../repositories/peopleRepository.mjs";
import { getJsonSetting } from "../repositories/settingsRepository.mjs";
import { listFieldCatalog, listScaleTaskCatalog } from "../repositories/catalogRepository.mjs";
import { refreshFormLifecycle } from "../orchestrator/formLifecycleOrchestrator.mjs";

export const getBootstrap = async () => {
  await refreshFormLifecycle();
  const forms = await listForms();
  const mappedForms = await Promise.all(forms.map(async form => {
    if (form.type === "escala_organ") {
      const sections = await getEscalaByFormId(form.id);
      const total = sections.reduce((sum, section) => sum + section.slots.length, 0);
      const filled = sections.reduce((sum, section) => sum + section.slots.filter(slot => slot.person).length, 0);
      return { ...form, metrics: { responses: filled, total, filled, pending: total - filled } };
    }
    const responses = await countResponsesByFormId(form.id);
    return { ...form, metrics: { responses, total: form.totalExpected || responses || 0 } };
  }));

  return {
    forms: mappedForms,
    responsesByForm: {},
    escalaByForm: {},
    users: await listUsers(),
    labels: await listLabels(),
    presets: await listPresets(),
    fieldCatalog: await listFieldCatalog(),
    scaleTaskCatalog: await listScaleTaskCatalog(),
    people: await listPeople(),
    membersConfig: await getJsonSetting("membersConfig", {}),
    storage: databaseInfo,
  };
};
