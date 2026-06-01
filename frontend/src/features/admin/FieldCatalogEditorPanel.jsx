import React from "react";
import { FieldCatalogAdvancedEditorPanel } from "./FieldCatalogAdvancedEditorPanel";
import { FieldCatalogCoreEditorPanel } from "./FieldCatalogCoreEditorPanel";

export const FieldCatalogEditorPanel = ({
  fieldCatalogDraft,
  setFieldCatalogDraft,
  externalBases,
  submitFieldCatalog,
  busyAction,
  onCancelFieldCatalog,
}) => (
  <div style={{ display: "grid", gap: 10 }}>
    <FieldCatalogCoreEditorPanel fieldCatalogDraft={fieldCatalogDraft} setFieldCatalogDraft={setFieldCatalogDraft} />
    <FieldCatalogAdvancedEditorPanel
      fieldCatalogDraft={fieldCatalogDraft}
      setFieldCatalogDraft={setFieldCatalogDraft}
      externalBases={externalBases}
      submitFieldCatalog={submitFieldCatalog}
      busyAction={busyAction}
      onCancelFieldCatalog={onCancelFieldCatalog}
    />
  </div>
);
