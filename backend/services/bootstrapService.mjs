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
import { listEvents } from "../repositories/eventsRepository.mjs";
import { listEventMessages } from "../repositories/eventMessagesRepository.mjs";
import { listMessageTemplates } from "../repositories/messageTemplatesRepository.mjs";
import { listPersonPresets } from "../repositories/personPresetsRepository.mjs";
import { getJsonSetting } from "../repositories/settingsRepository.mjs";
import { listFieldCatalog, listScaleTaskCatalog } from "../repositories/catalogRepository.mjs";
import { refreshFormLifecycle } from "../orchestrator/formLifecycleOrchestrator.mjs";
import { DEFAULT_MEMBERS_CONFIG } from "../data/seedData.mjs";
import { listExternalBases } from "./externalBasesService.mjs";
import { getMessagingConfig } from "./messagingConfigService.mjs";

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

  const events = await listEvents();
  const allEventMessages = await listEventMessages();
  const messagesByEventId = allEventMessages.reduce((acc, message) => {
    const list = acc.get(message.eventId) || [];
    list.push(message);
    acc.set(message.eventId, list);
    return acc;
  }, new Map());
  const eventsWithMessages = events.map(event => ({
    ...event,
    messages: messagesByEventId.get(event.id) || [],
  }));

  return {
    forms: mappedForms,
    events: eventsWithMessages,
    responsesByForm: {},
    escalaByForm: {},
    users: await listUsers(),
    labels: await listLabels(),
    presets: await listPresets(),
    fieldCatalog: await listFieldCatalog(),
    scaleTaskCatalog: await listScaleTaskCatalog(),
    people: await listPeople(),
    membersConfig: await getJsonSetting("membersConfig", DEFAULT_MEMBERS_CONFIG),
    externalBases: await listExternalBases(),
    messageTemplates: await listMessageTemplates(),
    personPresets: await listPersonPresets(),
    messagingConfig: await getMessagingConfig(),
    storage: databaseInfo,
  };
};
