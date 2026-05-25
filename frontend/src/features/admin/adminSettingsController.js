/**
 * @file frontend/src/features/admin/adminSettingsController.js
 * @summary Controller da central administrativa.
 * @responsibility Agrupar estado, tabs e confirmacao usados por AdminSettingsModal.
 */

import { useState } from "react";
import {
  buildAdminSettingsTabs,
  emptyExternalBaseDraft,
  emptyFieldCatalogDraft,
  emptyLabelDraft,
  emptyScaleTaskCatalogDraft,
  emptySecurityDraft,
  emptyUserDraft,
} from "./adminSettingsDefaults";
import { buildAdminSettingsSubmitHandlers } from "./adminSettingsSubmitHandlers";

export const useAdminSettingsController = ({
  currentUser,
  onSaveUser,
  onSaveLabel,
  onSaveFieldCatalogItem,
  onSaveScaleTaskCatalogItem,
  onSaveExternalBase,
  onSyncExternalBase,
  formDeleteKeyConfigured,
  onSaveFormDeleteKey,
}) => {
  const [tab, setTab] = useState("users");
  const [userDraft, setUserDraft] = useState(emptyUserDraft);
  const [labelDraft, setLabelDraft] = useState(emptyLabelDraft);
  const [fieldCatalogDraft, setFieldCatalogDraft] = useState(emptyFieldCatalogDraft);
  const [scaleTaskDraft, setScaleTaskDraft] = useState(emptyScaleTaskCatalogDraft);
  const [externalBaseDraft, setExternalBaseDraft] = useState(emptyExternalBaseDraft);
  const [securityDraft, setSecurityDraft] = useState(emptySecurityDraft);
  const [catalogMode, setCatalogMode] = useState("fields");
  const [feedback, setFeedback] = useState(null);
  const [busyAction, setBusyAction] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const tabs = buildAdminSettingsTabs(currentUser);
  const activeTab = tabs.find(item => item.key === tab) || tabs[0];

  const requestDelete = (title, message, confirmLabel, onConfirm) => {
    setPendingDelete({ title, message, confirmLabel, onConfirm });
  };

  const {
    confirmDelete,
    submitExternalBase,
    submitExternalBaseSync,
    submitFieldCatalog,
    submitLabel,
    submitScaleTask,
    submitSecurity,
    submitUser,
  } = buildAdminSettingsSubmitHandlers({
    currentUser,
    drafts: {
      externalBaseDraft,
      fieldCatalogDraft,
      labelDraft,
      scaleTaskDraft,
      securityDraft,
      userDraft,
    },
    formDeleteKeyConfigured,
    pendingDelete,
    setters: {
      setBusyAction,
      setExternalBaseDraft,
      setFeedback,
      setFieldCatalogDraft,
      setLabelDraft,
      setPendingDelete,
      setScaleTaskDraft,
      setSecurityDraft,
      setUserDraft,
    },
    actions: {
      onSaveExternalBase,
      onSaveFieldCatalogItem,
      onSaveFormDeleteKey,
      onSaveLabel,
      onSaveScaleTaskCatalogItem,
      onSaveUser,
      onSyncExternalBase,
    },
  });

  return {
    tab,
    setTab,
    tabs,
    activeTab,
    userDraft,
    setUserDraft,
    labelDraft,
    setLabelDraft,
    fieldCatalogDraft,
    setFieldCatalogDraft,
    scaleTaskDraft,
    setScaleTaskDraft,
    externalBaseDraft,
    setExternalBaseDraft,
    securityDraft,
    setSecurityDraft,
    catalogMode,
    setCatalogMode,
    feedback,
    busyAction,
    pendingDelete,
    requestDelete,
    submitUser,
    submitLabel,
    submitExternalBase,
    submitExternalBaseSync,
    submitFieldCatalog,
    submitScaleTask,
    submitSecurity,
    onCancelSecurity: () => setSecurityDraft(emptySecurityDraft),
    onCancelFieldCatalog: () => setFieldCatalogDraft(emptyFieldCatalogDraft),
    onCancelScaleTask: () => setScaleTaskDraft(emptyScaleTaskCatalogDraft),
    onCancelDelete: () => setPendingDelete(null),
    confirmDelete,
  };
};
