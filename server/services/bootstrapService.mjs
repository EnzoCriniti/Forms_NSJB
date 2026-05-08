/**
 * @file server/services/bootstrapService.mjs
 * @summary Montagem do bootstrap inicial da aplicacao.
 * @responsibility Agregar dados da API para o frontend iniciar em uma chamada.
 */

import { storagePath } from "../db.mjs";
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

export const getBootstrap = () => {
  refreshFormLifecycle();
  const forms = listForms().map(form => {
    if (form.type === "escala_organ") {
      const sections = getEscalaByFormId(form.id);
      const total = sections.reduce((sum, section) => sum + section.slots.length, 0);
      const filled = sections.reduce((sum, section) => sum + section.slots.filter(slot => slot.person).length, 0);
      return { ...form, metrics: { responses: filled, total, filled, pending: total - filled } };
    }
    const responses = countResponsesByFormId(form.id);
    return { ...form, metrics: { responses, total: form.totalExpected || responses || 0 } };
  });

  return {
    forms,
    responsesByForm: {},
    escalaByForm: {},
    users: listUsers(),
    labels: listLabels(),
    presets: listPresets(),
    fieldCatalog: listFieldCatalog(),
    scaleTaskCatalog: listScaleTaskCatalog(),
    people: listPeople(),
    membersConfig: getJsonSetting("membersConfig", {}),
    storage: { driver: "sqlite", path: storagePath },
  };
};
