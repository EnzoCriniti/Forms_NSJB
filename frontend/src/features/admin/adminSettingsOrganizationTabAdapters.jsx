import React from "react";
import { LabelsPanel, TemplatesPanel } from "./adminOrganizationPanels";

export const renderAdminLabelsTab = ({ organization, shared }) => (
  <LabelsPanel
    labelDraft={organization.labelDraft}
    setLabelDraft={organization.setLabelDraft}
    submitLabel={organization.submitLabel}
    busyAction={shared.busyAction}
    labels={organization.labels}
    requestDelete={shared.requestDelete}
    onDeleteLabel={organization.onDeleteLabel}
  />
);

export const renderAdminPresetsTab = ({ organization, shared }) => (
  <TemplatesPanel
    presets={organization.presets}
    requestDelete={shared.requestDelete}
    onDeletePreset={organization.onDeletePreset}
  />
);
