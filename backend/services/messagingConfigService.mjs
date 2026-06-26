/**
 * @file backend/services/messagingConfigService.mjs
 * @summary Configuracao global da feature de mensagens.
 * @responsibility Ler/atualizar config de mensagens e o vinculo do Twilio. O
 * `twilioAuthToken` e um segredo write-only: nunca volta para o frontend (so a
 * flag `twilioConfigured`); o dispatcher le o valor cru via getMessagingSecrets.
 */

import { DEFAULT_MESSAGING_CONFIG } from "../data/seedData.mjs";
import { getJsonSetting, saveJsonSetting } from "../repositories/settingsRepository.mjs";

const SETTING_KEY = "messagingConfig";

const PROVIDERS = ["log", "twilio"];
const CHANNELS = ["whatsapp", "sms"];

const pick = (value, options, fallback) => (options.includes(value) ? value : fallback);

/** Versao publica (sem o token) — vai para o bootstrap/frontend. */
const toPublicConfig = config => ({
  whatsappGroupName: String(config?.whatsappGroupName ?? "").trim(),
  autoDispatchEnabled: config?.autoDispatchEnabled !== false,
  publicBaseUrl: String(config?.publicBaseUrl ?? "").trim(),
  provider: pick(config?.provider, PROVIDERS, "log"),
  channel: pick(config?.channel, CHANNELS, "whatsapp"),
  twilioAccountSid: String(config?.twilioAccountSid ?? "").trim(),
  twilioFrom: String(config?.twilioFrom ?? "").trim(),
  twilioConfigured: Boolean(String(config?.twilioAuthToken ?? "").trim()),
});

export const getMessagingConfig = async () => {
  const stored = await getJsonSetting(SETTING_KEY, DEFAULT_MESSAGING_CONFIG);
  return toPublicConfig({ ...DEFAULT_MESSAGING_CONFIG, ...stored });
};

/** Segredos crus para o dispatcher (uso interno, nunca exposto ao frontend). */
export const getMessagingSecrets = async () => {
  const stored = await getJsonSetting(SETTING_KEY, DEFAULT_MESSAGING_CONFIG);
  const config = { ...DEFAULT_MESSAGING_CONFIG, ...stored };
  return {
    provider: pick(config.provider, PROVIDERS, "log"),
    channel: pick(config.channel, CHANNELS, "whatsapp"),
    accountSid: String(config.twilioAccountSid ?? "").trim(),
    from: String(config.twilioFrom ?? "").trim(),
    authToken: String(config.twilioAuthToken ?? "").trim(),
  };
};

export const updateMessagingConfig = async payload => {
  const stored = await getJsonSetting(SETTING_KEY, DEFAULT_MESSAGING_CONFIG);
  const incomingToken = String(payload?.twilioAuthToken ?? "").trim();
  const next = {
    whatsappGroupName: String(payload?.whatsappGroupName ?? "").trim(),
    autoDispatchEnabled: payload?.autoDispatchEnabled !== false,
    publicBaseUrl: String(payload?.publicBaseUrl ?? "").trim(),
    provider: pick(payload?.provider, PROVIDERS, "log"),
    channel: pick(payload?.channel, CHANNELS, "whatsapp"),
    twilioAccountSid: String(payload?.twilioAccountSid ?? "").trim(),
    twilioFrom: String(payload?.twilioFrom ?? "").trim(),
    // token e write-only: mantem o atual se nao vier um novo
    twilioAuthToken: incomingToken || String(stored?.twilioAuthToken ?? ""),
  };
  await saveJsonSetting(SETTING_KEY, next);
  return toPublicConfig(next);
};
