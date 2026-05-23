/**
 * @file frontend/src/lib/appBootstrap.js
 * @summary Helpers puros do bootstrap principal do frontend.
 * @responsibility Normalizar dados iniciais e decidir selecao padrao de formularios.
 */

export * from "./appBootstrapLists";
export * from "./appBootstrapMetrics";
export * from "./appPinning";

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

export const pickActiveFormIdAfterBootstrap = ({
  currentFormId,
  currentUser,
  forms,
  visibleForms = [],
  preserveSelection = true,
}) => {
  const nextForms = Array.isArray(forms) ? forms : [];
  const nextVisibleForms = Array.isArray(visibleForms) ? visibleForms : [];

  if (!preserveSelection) {
    return nextVisibleForms[0]?.id || null;
  }

  if (currentFormId && !nextForms.some(form => form.id === currentFormId)) {
    return nextForms[0]?.id || null;
  }

  if (!currentFormId) {
    return nextVisibleForms[0]?.id || null;
  }

  if (!currentUser?.id && nextForms.length === 0) {
    return null;
  }

  return currentFormId;
};
