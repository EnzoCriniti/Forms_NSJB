import React from "react";
import { Btn, ScreenHeader } from "../../../components/ui";
import { EventEditorFieldsPanel } from "./eventEditorFieldsPanel";

export const EventEditorPanel = ({ draft, onChangeDraft, onCancel, onSave, saving, title, people }) => (
  <div>
    <ScreenHeader
      className="settings-top-card"
      leading={<Btn v="ghost" icon="back" onClick={onCancel} aria-label="Voltar" />}
      title={title}
      titleSize={20}
    />
    <EventEditorFieldsPanel
      draft={draft}
      onCancel={onCancel}
      onChangeDraft={onChangeDraft}
      onSave={onSave}
      saving={saving}
      people={people}
    />
  </div>
);
