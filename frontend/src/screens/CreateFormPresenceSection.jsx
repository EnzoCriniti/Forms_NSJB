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
  activeSelectionSource,
  addField,
  addGridCol,
  addGridRow,
  addOpen,
  applyFieldCatalog,
  applyScalePreset,
  availableTotals,
  currentFieldSourceLabel,
  externalBaseMap,
  fieldLabel,
  fields,
  filteredFieldCatalog,
  filteredFieldTypes,
  formMode,
  handleAddTotalField,
  handleMoveTotalLayout,
  handleRemoveField,
  handleToggleFieldShow,
  hasPrimaryLinkedField,
  inp,
  inpSm,
  isEditingField,
  isFieldSaveDisabled,
  linkedPeopleField,
  nCatalogId,
  nFieldMode,
  nGridCols,
  nGridRows,
  nLabel,
  nRequired,
  nType,
  nValidation,
  openNewFieldDraft,
  people,
  removeGridCol,
  removeGridRow,
  resetFieldDraft,
  resultsConfig,
  setFieldMode,
  setFieldType,
  setNLabel,
  setNRequired,
  setNValidation,
  setResultsConfig,
  startEditField,
  totalizableFields,
  updateGridCol,
  updateGridRow,
}) => (
  <>
    <PresenceFieldsPanel
      fields={fields}
      FIELD_TYPES={FIELD_TYPES}
      formMode={formMode}
      isMembersSelectionField={isMembersSelectionField}
      getPeopleBaseFieldRole={getPeopleBaseFieldRole}
      summarizeFieldValidation={summarizeFieldValidation}
      externalBaseMap={externalBaseMap}
      onStartEditField={startEditField}
      onToggleFieldShow={handleToggleFieldShow}
      onRemoveField={handleRemoveField}
      onOpenNewFieldDraft={openNewFieldDraft}
      addOpen={addOpen}
      fieldEditor={(
        <FieldEditorPanel
          addOpen={addOpen}
          inp={inp}
          inpSm={inpSm}
          nType={nType}
          nFieldMode={nFieldMode}
          nCatalogId={nCatalogId}
          nLabel={nLabel}
          nRequired={nRequired}
          nValidation={nValidation}
          nGridRows={nGridRows}
          nGridCols={nGridCols}
          formMode={formMode}
          filteredFieldCatalog={filteredFieldCatalog}
          filteredFieldTypes={filteredFieldTypes}
          currentFieldSourceLabel={currentFieldSourceLabel}
          activeSelectionSource={activeSelectionSource}
          externalBaseMap={externalBaseMap}
          hasPrimaryLinkedField={hasPrimaryLinkedField}
          fieldLabel={fieldLabel}
          people={people}
          onSetFieldMode={setFieldMode}
          onApplyFieldCatalog={applyFieldCatalog}
          onSetNType={setFieldType}
          onSetNLabel={setNLabel}
          onSetNRequired={setNRequired}
          onSetNValidation={setNValidation}
          onUpdateGridRow={updateGridRow}
          onRemoveGridRow={removeGridRow}
          onAddGridRow={addGridRow}
          onUpdateGridCol={updateGridCol}
          onRemoveGridCol={removeGridCol}
          onAddGridCol={addGridCol}
          onApplyScalePreset={applyScalePreset}
          scalePresets={SCALE_PRESETS}
          onAddField={addField}
          onOpenNewFieldDraft={openNewFieldDraft}
          onResetFieldDraft={resetFieldDraft}
          isFieldSaveDisabled={isFieldSaveDisabled}
          isEditingField={isEditingField}
        />
      )}
    />

    <ResultsConfigPanel
      resultsConfig={resultsConfig}
      linkedPeopleField={linkedPeopleField}
      totalizableFields={totalizableFields}
      availableTotals={availableTotals}
      FIELD_TYPES={FIELD_TYPES}
      onChangeResultsConfig={setResultsConfig}
      onMoveTotalLayout={handleMoveTotalLayout}
      onAddTotalField={handleAddTotalField}
    />
  </>
);
