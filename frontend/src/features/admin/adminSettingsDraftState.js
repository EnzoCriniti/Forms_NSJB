import { useState } from "react";
import {
  emptyExternalBaseDraft,
  emptyFieldCatalogDraft,
  emptyLabelDraft,
  emptyScaleTaskCatalogDraft,
  emptySecurityDraft,
  emptyUserDraft,
} from "./adminSettingsDefaults";

export const useAdminSettingsDraftState = () => {
  const [userDraft, setUserDraft] = useState(emptyUserDraft);
  const [labelDraft, setLabelDraft] = useState(emptyLabelDraft);
  const [fieldCatalogDraft, setFieldCatalogDraft] = useState(emptyFieldCatalogDraft);
  const [scaleTaskDraft, setScaleTaskDraft] = useState(emptyScaleTaskCatalogDraft);
  const [externalBaseDraft, setExternalBaseDraft] = useState(emptyExternalBaseDraft);
  const [securityDraft, setSecurityDraft] = useState(emptySecurityDraft);
  const [catalogMode, setCatalogMode] = useState("fields");

  return {
    values: {
      catalogMode,
      externalBaseDraft,
      fieldCatalogDraft,
      labelDraft,
      scaleTaskDraft,
      securityDraft,
      userDraft,
    },
    setters: {
      setCatalogMode,
      setExternalBaseDraft,
      setFieldCatalogDraft,
      setLabelDraft,
      setScaleTaskDraft,
      setSecurityDraft,
      setUserDraft,
    },
    cancelHandlers: {
      onCancelFieldCatalog: () => setFieldCatalogDraft(emptyFieldCatalogDraft),
      onCancelScaleTask: () => setScaleTaskDraft(emptyScaleTaskCatalogDraft),
      onCancelSecurity: () => setSecurityDraft(emptySecurityDraft),
    },
  };
};
