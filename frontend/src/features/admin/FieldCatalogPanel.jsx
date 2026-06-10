import React from "react";
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
  <div className="msg-split">
    <div>
      <h4 className="msg-subtitle">{fieldCatalogDraft.id ? "Editar campo base" : "Novo campo base"}</h4>
      <FieldCatalogEditorPanel
        fieldCatalogDraft={fieldCatalogDraft}
        setFieldCatalogDraft={setFieldCatalogDraft}
        externalBases={externalBases}
        submitFieldCatalog={submitFieldCatalog}
        busyAction={busyAction}
        onCancelFieldCatalog={onCancelFieldCatalog}
      />
    </div>
    <div>
      <h4 className="msg-subtitle">Campos cadastrados</h4>
      <FieldCatalogListPanel
        externalBases={externalBases}
        fieldCatalog={fieldCatalog}
        onDeleteFieldCatalogItem={onDeleteFieldCatalogItem}
        requestDelete={requestDelete}
        setFieldCatalogDraft={setFieldCatalogDraft}
      />
    </div>
  </div>
);
