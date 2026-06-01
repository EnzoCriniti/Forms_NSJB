import React from "react";
import { CatalogManagementPanel } from "./adminCatalogPanels";

export const renderAdminCatalogTab = ({ access, catalog, shared }) => (
  <CatalogManagementPanel
    catalogMode={catalog.catalogMode}
    setCatalogMode={catalog.setCatalogMode}
    fieldCatalogDraft={catalog.fieldCatalogDraft}
    setFieldCatalogDraft={catalog.setFieldCatalogDraft}
    externalBases={access.externalBases}
    fieldCatalog={catalog.fieldCatalog}
    submitFieldCatalog={catalog.submitFieldCatalog}
    busyAction={shared.busyAction}
    onDeleteFieldCatalogItem={catalog.onDeleteFieldCatalogItem}
    requestDelete={shared.requestDelete}
    onCancelFieldCatalog={catalog.onCancelFieldCatalog}
    scaleTaskDraft={catalog.scaleTaskDraft}
    setScaleTaskDraft={catalog.setScaleTaskDraft}
    scaleTaskCatalog={catalog.scaleTaskCatalog}
    submitScaleTask={catalog.submitScaleTask}
    onDeleteScaleTaskCatalogItem={catalog.onDeleteScaleTaskCatalogItem}
    onCancelScaleTask={catalog.onCancelScaleTask}
  />
);
