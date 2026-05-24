/**
 * @file frontend/src/features/admin/adminSettingsPayloads.js
 * @summary Payloads da central administrativa.
 * @responsibility Montar payloads puros de submit usados pelo AdminSettingsModal.
 */

import { normalizeFieldSelectionSource, normalizeIdentifier } from "./adminSettingsShared";

export const buildAdminUserPayload = userDraft => ({
  ...userDraft,
  name: userDraft.name.trim() || userDraft.username.trim(),
  username: userDraft.username.trim(),
});

export const buildAdminLabelPayload = (labelDraft, currentUser) => ({
  ...labelDraft,
  name: labelDraft.name.trim(),
  createdBy: labelDraft.createdBy || currentUser?.name || "Admin",
});

export const buildExternalBasePayload = externalBaseDraft => ({
  ...externalBaseDraft,
  name: externalBaseDraft.name.trim(),
  description: String(externalBaseDraft.description || "").trim(),
});

export const buildFieldCatalogPayload = fieldCatalogDraft => {
  const key = normalizeIdentifier(fieldCatalogDraft.key || fieldCatalogDraft.name || fieldCatalogDraft.defaultLabel);
  const selectionSource = normalizeFieldSelectionSource(fieldCatalogDraft);
  return {
    payload: { ...fieldCatalogDraft, key, ...(selectionSource ? { selectionSource } : {}) },
    key,
    selectionSource,
  };
};

export const buildScaleTaskCatalogPayload = scaleTaskDraft => {
  const key = normalizeIdentifier(scaleTaskDraft.key || scaleTaskDraft.name || scaleTaskDraft.defaultLabel);
  return {
    payload: { ...scaleTaskDraft, key },
    key,
  };
};

export const buildSecurityPayload = ({ securityDraft, formDeleteKeyConfigured }) => ({
  currentMasterKey: formDeleteKeyConfigured ? securityDraft.currentMasterKey : undefined,
  newMasterKey: securityDraft.newMasterKey,
});
