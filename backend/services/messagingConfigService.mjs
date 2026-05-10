/**
 * @file backend/services/messagingConfigService.mjs
 * @summary Configuracao global da feature de mensagens.
 * @responsibility Ler e atualizar whatsappGroupName, autoDispatchEnabled e publicBaseUrl.
 */

import { DEFAULT_MESSAGING_CONFIG } from "../data/seedData.mjs";
import { getJsonSetting, saveJsonSetting } from "../repositories/settingsRepository.mjs";

const SETTING_KEY = "messagingConfig";

const normalize = config => ({
  whatsappGroupName: String(config?.whatsappGroupName ?? "").trim(),
  autoDispatchEnabled: config?.autoDispatchEnabled !== false,
  publicBaseUrl: String(config?.publicBaseUrl ?? "").trim(),
});

export const getMessagingConfig = async () => {
  const stored = await getJsonSetting(SETTING_KEY, DEFAULT_MESSAGING_CONFIG);
  return normalize({ ...DEFAULT_MESSAGING_CONFIG, ...stored });
};

export const updateMessagingConfig = async payload => {
  const next = normalize({ ...DEFAULT_MESSAGING_CONFIG, ...(payload || {}) });
  await saveJsonSetting(SETTING_KEY, next);
  return next;
};
