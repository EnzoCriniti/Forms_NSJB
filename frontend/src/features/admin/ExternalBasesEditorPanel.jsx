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
  <>
    <ExternalBasesCoreEditorPanel externalBaseDraft={externalBaseDraft} setExternalBaseDraft={setExternalBaseDraft} />
    <ExternalBasesSyncEditorPanel
      externalBaseDraft={externalBaseDraft}
      setExternalBaseDraft={setExternalBaseDraft}
      submitExternalBase={submitExternalBase}
      submitExternalBaseSync={submitExternalBaseSync}
      busyAction={busyAction}
    />
  </>
);
