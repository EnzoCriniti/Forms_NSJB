import React from "react";
import { ExternalBasesCoreEditorPanel } from "./ExternalBasesCoreEditorPanel";
import { ExternalBasesSyncEditorPanel } from "./ExternalBasesSyncEditorPanel";

export const ExternalBasesEditorPanel = ({
  externalBaseDraft,
  setExternalBaseDraft,
  submitExternalBase,
  submitExternalBaseSync,
  busyAction,
}) => (
  <div style={{ display: "grid", gap: 10 }}>
    <ExternalBasesCoreEditorPanel externalBaseDraft={externalBaseDraft} setExternalBaseDraft={setExternalBaseDraft} />
    <ExternalBasesSyncEditorPanel
      externalBaseDraft={externalBaseDraft}
      setExternalBaseDraft={setExternalBaseDraft}
      submitExternalBase={submitExternalBase}
      submitExternalBaseSync={submitExternalBaseSync}
      busyAction={busyAction}
    />
  </div>
);
