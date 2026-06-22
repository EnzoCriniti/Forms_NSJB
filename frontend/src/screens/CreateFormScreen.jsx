/**
 * @file frontend/src/screens/CreateFormScreen.jsx
 * @summary Tela de criacao e edicao de formularios.
 * @responsibility Compor os paineis visuais do editor de formulario.
 */

import React from "react";
import { Btn } from "../components/ui";
import { CreateFormTemplateBar } from "../components/CreateFormTemplateBar";
import { FormBasicsPanel, FormContextPanel, FormHeaderPanel, FormModePanel, FormTypeSetupPanel } from "../features/forms/createFormPanels/setupPanels";
import { FormFooterPanel, FormPreviewPanel, ScaleEditorPanel } from "../features/forms/createFormPanels/finalPanels";
import { CreateFormPresenceSection } from "./CreateFormPresenceSection";
import { useCreateFormController } from "./createFormController";

export const CreateFormScreen = ({
  onBack,
  onNavigate,
  people = [],
  membersConfig = {},
  externalBases = [],
  labels = [],
  presets = [],
  fieldCatalog = [],
  scaleTaskCatalog = [],
  onSavePreset = () => {},
  onSaveForm = () => {},
  form,
  event = null,
  isDuplicateMode = false,
}) => {
  const controller = useCreateFormController({
    event,
    externalBases,
    fieldCatalog,
    form,
    isDuplicateMode,
    labels,
    membersConfig,
    onBack,
    onNavigate,
    onSaveForm,
    onSavePreset,
    people,
    presets,
    scaleTaskCatalog,
  });

  return (
    <div>
      <FormHeaderPanel {...controller.headerProps} />

      {controller.showTypeSetup && (
        <FormTypeSetupPanel {...controller.typeSetupProps} />
      )}

      {!controller.showTypeSetup && (
        <>
          {controller.isEditingExistingForm && (
            <FormContextPanel {...controller.contextProps} />
          )}

          {!controller.isEditingExistingForm && controller.format === "presenca" && (
            <FormModePanel {...controller.modePanelProps} />
          )}

          {!controller.isEditingExistingForm && (
            <CreateFormTemplateBar {...controller.templateBarProps} />
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <Btn
              v={controller.previewToggleProps.variant}
              icon="eye"
              onClick={controller.previewToggleProps.onClick}
            >
              {controller.previewToggleProps.label}
            </Btn>
          </div>

          <FormBasicsPanel {...controller.basicsProps} />
          <FormPreviewPanel {...controller.previewProps} />

          {controller.format === "escala_organ" && (
            <ScaleEditorPanel {...controller.scaleEditorProps} />
          )}

          {controller.format === "presenca" && (
            <CreateFormPresenceSection {...controller.presenceSectionProps} />
          )}

          <FormFooterPanel {...controller.footerProps} />
        </>
      )}
    </div>
  );
};
