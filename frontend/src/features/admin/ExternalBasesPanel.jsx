import React from "react";
import { SplitSection } from "../../components/ui";
import { ExternalBasesEditorPanel } from "./ExternalBasesEditorPanel";
import { ExternalBasesListPanel } from "./ExternalBasesListPanel";

export const ExternalBasesPanel = ({
  externalBaseDraft,
  setExternalBaseDraft,
  submitExternalBase,
  submitExternalBaseSync,
  busyAction,
  externalBases,
  requestDelete,
  onDeleteExternalBase,
}) => (
  <SplitSection
    leftTitle={externalBaseDraft.id ? "Editar base externa" : "Nova base externa"}
    rightTitle="Bases cadastradas"
    left={(
      <ExternalBasesEditorPanel
        externalBaseDraft={externalBaseDraft}
        setExternalBaseDraft={setExternalBaseDraft}
        submitExternalBase={submitExternalBase}
        submitExternalBaseSync={submitExternalBaseSync}
        busyAction={busyAction}
      />
    )}
    right={(
      <ExternalBasesListPanel
        externalBases={externalBases}
        requestDelete={requestDelete}
        onDeleteExternalBase={onDeleteExternalBase}
        setExternalBaseDraft={setExternalBaseDraft}
      />
    )}
  />
);
