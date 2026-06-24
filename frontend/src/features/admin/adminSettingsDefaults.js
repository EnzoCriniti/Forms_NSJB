/**
 * @file frontend/src/features/admin/adminSettingsDefaults.js
 * @summary Defaults da central administrativa.
 * @responsibility Centralizar drafts vazios e tabs do AdminSettingsModal.
 */

import { DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS } from "../../lib/gridDefaults";

export const emptyUserDraft = { name: "", username: "", password: "", layerId: null };

export const emptyLabelDraft = { name: "", color: "#16448c" };

export const emptyFieldCatalogDraft = {
  key: "",
  name: "",
  type: "yes_no",
  category: "presenca",
  defaultLabel: "",
  gridSchema: { rows: DEFAULT_GRID_ROWS, cols: DEFAULT_GRID_COLS },
  selectionSource: { kind: "members" },
  description: "",
  active: true,
};

export const emptyScaleTaskCatalogDraft = {
  key: "",
  name: "",
  category: "cozinha",
  defaultLabel: "",
  description: "",
  active: true,
};

export const emptyExternalBaseDraft = {
  name: "",
  description: "",
  sourceType: "google_sheets",
  sheetUrl: "",
  range: "Itens!A:B",
  valueColumn: "A",
  labelColumn: "B",
  descriptionColumn: "",
  activeColumn: "",
  syncEnabled: true,
  syncFrequencyHours: 24,
  active: true,
  items: [],
};

export const emptySecurityDraft = { currentMasterKey: "", newMasterKey: "" };

export const buildAdminSettingsTabs = currentUser => [
  { key: "users", label: "Acessos", description: "Usuários e perfis" },
  { key: "members", label: "Base de sócios", description: "Fonte sincronizada e mapeamento" },
  { key: "external-bases", label: "Bases externas", description: "Listas sincronizadas para campos do formulário" },
  { key: "catalog", label: "Campos e tarefas", description: "Biblioteca reutilizável" },
  { key: "labels", label: "Classificações", description: "Etiquetas dos formulários" },
  { key: "presets", label: "Templates", description: "Templates de formulário" },
  { key: "messages", label: "Mensagens", description: "Modelos, presets e disparo" },
  { key: "security", label: "Exclusão segura", description: "Chave mestra" },
  ...(currentUser?.role === "admin" ? [{ key: "audit", label: "Histórico", description: "Auditoria do sistema" }] : []),
];
