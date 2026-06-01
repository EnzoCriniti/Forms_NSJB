/**
 * @file frontend/src/screens/CreateFormPresenceSection.jsx
 * @summary Composicao da secao de campos e resultados do formulario de presenca.
 */

import React from "react";
import { FieldEditorPanel, PresenceFieldsPanel } from "../features/forms/createFormPanels/fieldPanels";
import { ResultsConfigPanel } from "../features/forms/createFormPanels/finalPanels";
import { getPeopleBaseFieldRole, isMembersSelectionField, summarizeFieldValidation } from "../lib/forms";
import { FIELD_TYPES } from "./createFormDefaults";
import { SCALE_PRESETS } from "./createFormFieldDraft";

export const CreateFormPresenceSection = ({
  fieldEditor,
  fieldsPanel,
  resultsConfig,
}) => {
  const {
    addOpen,
    externalBaseMap,
    fields,
    formMode,
    onOpenNewFieldDraft,
    onRemoveField,
    onStartEditField,
    onToggleFieldShow,
  } = fieldsPanel;

  return (
    <>
      <PresenceFieldsPanel
        fields={fields}
        FIELD_TYPES={FIELD_TYPES}
        formMode={formMode}
        isMembersSelectionField={isMembersSelectionField}
        getPeopleBaseFieldRole={getPeopleBaseFieldRole}
        summarizeFieldValidation={summarizeFieldValidation}
        externalBaseMap={externalBaseMap}
        onStartEditField={onStartEditField}
        onToggleFieldShow={onToggleFieldShow}
        onRemoveField={onRemoveField}
        onOpenNewFieldDraft={onOpenNewFieldDraft}
        addOpen={addOpen}
        fieldEditor={(
          <FieldEditorPanel
            {...fieldEditor}
            scalePresets={SCALE_PRESETS}
          />
        )}
      />

      <ResultsConfigPanel
        {...resultsConfig}
        FIELD_TYPES={FIELD_TYPES}
      />
    </>
  );
};
