/**
 * @file frontend/src/lib/appConstants.js
 * @summary Constantes globais do frontend.
 * @responsibility Concentrar chaves de storage e defaults locais.
 */

export const STORAGE_KEYS = {
  responses: "nsjb_forms_mvp_responses",
  escala: "nsjb_forms_mvp_escala",
  users: "nsjb_forms_mvp_users",
  session: "nsjb_forms_mvp_session",
  theme: "nsjb_forms_mvp_theme",
  fontScale: "nsjb_forms_mvp_font_scale",
  pinnedForms: "nsjb_forms_mvp_pinned_forms",
  pinnedEvents: "nsjb_forms_mvp_pinned_events",
  people: "nsjb_forms_mvp_people",
  membersConfig: "nsjb_forms_mvp_members_config",
  labels: "nsjb_forms_mvp_labels",
  presets: "nsjb_forms_mvp_presets",
};

export const DEFAULT_MEMBERS_CONFIG = {
  sourceType: "google_sheets",
  sheetUrl: "",
  nameColumn: "B",
  grauColumn: "A",
  phoneColumn: "",
  externalIdColumn: "",
  activeColumn: "",
  range: "Socios!A:B",
  syncEnabled: true,
  syncFrequencyHours: 24,
  lastSyncedAt: null,
};
