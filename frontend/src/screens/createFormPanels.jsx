/**
 * @file frontend/src/screens/createFormPanels.jsx
 * @summary Paineis reutilizaveis da tela de criacao de formulario.
 * @responsibility Funcionar como ponte para os paineis divididos por area.
 */

import React from "react";
import { COLORS, SurfacePanel } from "../components/ui";
import { CreateFormLivePreview } from "../components/CreateFormLivePreview";
export { FormBasicsPanel, FormContextPanel, FormHeaderPanel, FormModePanel, FormTypeSetupPanel } from "../features/forms/createFormPanels/setupPanels";
export { FieldEditorActions, FieldEditorDefinitionPanel, FieldEditorExtrasPanel, FieldEditorPanel, FieldEditorSourcePanel, FormFieldRow, PresenceFieldsPanel } from "../features/forms/createFormPanels/fieldPanels";
export { FormFooterPanel, ResultsConfigPanel, ResultsTotalRow, ScaleEditorPanel } from "../features/forms/createFormPanels/finalPanels";

export const FormPreviewPanel = ({
  showPreview,
  format,
  previewTitle,
  previewDescription,
  previewClosingText,
  fields,
  people,
  scaleDraft,
  scaleLimit,
}) => {
  if (!showPreview) return null;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.4 }}>
            Pre-visualizacao do formulario
          </div>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
            Esta area mostra como o link publico esta ficando com base no rascunho atual.
          </div>
        </div>
      </div>
      <CreateFormLivePreview
        format={format}
        title={previewTitle}
        description={previewDescription}
        closingText={previewClosingText}
        fields={fields}
        people={people}
        scaleSections={scaleDraft}
        scaleLimit={scaleLimit}
      />
    </div>
  );
};
