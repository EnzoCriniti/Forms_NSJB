import React from "react";
import { SplitSection } from "../../components/ui";
import { FieldCatalogEditorPanel } from "./FieldCatalogEditorPanel";
import { FieldCatalogListPanel } from "./FieldCatalogListPanel";

export const FieldCatalogPanel = ({
  fieldCatalogDraft,
  setFieldCatalogDraft,
  externalBases,
  fieldCatalog,
  submitFieldCatalog,
  busyAction,
  onDeleteFieldCatalogItem,
  requestDelete,
  onCancelFieldCatalog,
}) => (
  <SplitSection
    leftTitle={fieldCatalogDraft.id ? "Editar campo base" : "Novo campo base"}
    rightTitle="Campos cadastrados"
    left={(
      <FieldCatalogEditorPanel
        fieldCatalogDraft={fieldCatalogDraft}
        setFieldCatalogDraft={setFieldCatalogDraft}
        externalBases={externalBases}
        submitFieldCatalog={submitFieldCatalog}
        busyAction={busyAction}
        onCancelFieldCatalog={onCancelFieldCatalog}
      />
    )}
    right={(
      <FieldCatalogListPanel
        externalBases={externalBases}
        fieldCatalog={fieldCatalog}
        onDeleteFieldCatalogItem={onDeleteFieldCatalogItem}
        requestDelete={requestDelete}
        setFieldCatalogDraft={setFieldCatalogDraft}
      />
    )}
  />
);
