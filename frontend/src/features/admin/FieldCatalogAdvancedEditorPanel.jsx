import React from "react";
import { FieldCatalogSelectionSourcePanel } from "./FieldCatalogSelectionSourcePanel";
import { GridSchemaEditor } from "./adminGridSchemaEditor";
import { FieldCatalogAdvancedCommonPanel } from "./FieldCatalogAdvancedCommonPanel";

export const FieldCatalogAdvancedEditorPanel = ({
  fieldCatalogDraft,
  setFieldCatalogDraft,
  externalBases,
  submitFieldCatalog,
  busyAction,
  onCancelFieldCatalog,
}) => (
  <>
    {fieldCatalogDraft.type === "grid" && (
      <GridSchemaEditor
        value={fieldCatalogDraft.gridSchema}
        onChange={gridSchema => setFieldCatalogDraft({ ...fieldCatalogDraft, gridSchema })}
      />
    )}
    {fieldCatalogDraft.type === "person_select" && (
      <FieldCatalogSelectionSourcePanel
        draft={fieldCatalogDraft}
        externalBases={externalBases}
        onChangeDraft={setFieldCatalogDraft}
      />
    )}
    <FieldCatalogAdvancedCommonPanel
      fieldCatalogDraft={fieldCatalogDraft}
      setFieldCatalogDraft={setFieldCatalogDraft}
      externalBases={externalBases}
      submitFieldCatalog={submitFieldCatalog}
      busyAction={busyAction}
      onCancelFieldCatalog={onCancelFieldCatalog}
    />
  </>
);
