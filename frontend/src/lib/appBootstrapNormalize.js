/**
 * @file frontend/src/lib/appBootstrapNormalize.js
 * @summary Normalizacao do bootstrap inicial do frontend.
 */

export const createEmptyBootstrap = () => ({
  forms: [],
  events: [],
  responsesByForm: {},
  escalaByForm: {},
  users: [],
  labels: [],
  presets: [],
  fieldCatalog: [],
  scaleTaskCatalog: [],
  people: [],
  membersConfig: {},
  externalBases: [],
  messageTemplates: [],
  personPresets: [],
  messagingConfig: { whatsappGroupName: "", autoDispatchEnabled: true, publicBaseUrl: "" },
});

const ARRAY_KEYS = [
  "forms",
  "events",
  "users",
  "labels",
  "presets",
  "fieldCatalog",
  "scaleTaskCatalog",
  "people",
  "externalBases",
  "messageTemplates",
  "personPresets",
];

const OBJECT_KEYS = ["responsesByForm", "escalaByForm", "membersConfig"];

const isPlainObject = value => Boolean(value && typeof value === "object" && !Array.isArray(value));

export const normalizeBootstrap = bootstrap => {
  const empty = createEmptyBootstrap();
  const source = isPlainObject(bootstrap) ? bootstrap : {};
  const normalized = { ...empty, ...source };

  for (const key of ARRAY_KEYS) {
    normalized[key] = Array.isArray(source[key]) ? source[key] : empty[key];
  }
  for (const key of OBJECT_KEYS) {
    normalized[key] = isPlainObject(source[key]) ? source[key] : empty[key];
  }
  normalized.messagingConfig = {
    ...empty.messagingConfig,
    ...(isPlainObject(source.messagingConfig) ? source.messagingConfig : {}),
  };

  return normalized;
};
