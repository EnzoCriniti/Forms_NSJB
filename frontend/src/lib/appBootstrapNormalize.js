/**
 * @file frontend/src/lib/appBootstrapNormalize.js
 * @summary Normalizacao do bootstrap inicial do frontend.
 */

export const createEmptyBootstrap = () => ({
  forms: [],
  events: [],
  eventsPage: { total: 0, limit: 20, offset: 0, search: "", status: "", sortBy: "date", sortDir: "desc" },
  teamPeriods: [],
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
  "teamPeriods",
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

const OBJECT_KEYS = ["responsesByForm", "escalaByForm", "membersConfig", "eventsPage"];

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
  normalized.eventsPage = {
    ...empty.eventsPage,
    ...(isPlainObject(source.eventsPage) ? source.eventsPage : {}),
  };

  return normalized;
};
