/**
 * @file frontend/src/features/admin/adminCatalogPanels.jsx
 * @summary Painel reutilizavel da aba de catalogos administrativos.
 * @responsibility Alternar entre catalogos de campos e tarefas sem concentrar a UI de cada editor.
 */

import React from "react";
import { Btn } from "../../components/ui";
import { FieldCatalogPanel } from "./FieldCatalogPanel";
import { ScaleTaskCatalogPanel } from "./ScaleTaskCatalogPanel";

export const CatalogManagementPanel = ({
  catalogMode,
  setCatalogMode,
  fieldCatalogDraft,
  setFieldCatalogDraft,
  externalBases,
  fieldCatalog,
  submitFieldCatalog,
  busyAction,
  onDeleteFieldCatalogItem,
  requestDelete,
  onCancelFieldCatalog,
  scaleTaskDraft,
  setScaleTaskDraft,
  scaleTaskCatalog,
  submitScaleTask,
  onDeleteScaleTaskCatalogItem,
  onCancelScaleTask,
}) => (
  <section>
    <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
      {[
        { key: "fields", label: "Campos de formulario" },
        { key: "tasks", label: "Tarefas da escala" },
      ].map(item => (
        <Btn
          key={item.key}
          v={catalogMode === item.key ? "primary" : "secondary"}
          sz="sm"
          onClick={() => setCatalogMode(item.key)}
          style={{ borderRadius: 10, padding: "8px 10px", fontWeight: 800 }}
        >
          {item.label}
        </Btn>
      ))}
    </div>

    {catalogMode === "fields" && (
      <FieldCatalogPanel
        fieldCatalogDraft={fieldCatalogDraft}
        setFieldCatalogDraft={setFieldCatalogDraft}
        externalBases={externalBases}
        fieldCatalog={fieldCatalog}
        submitFieldCatalog={submitFieldCatalog}
        busyAction={busyAction}
        onDeleteFieldCatalogItem={onDeleteFieldCatalogItem}
        requestDelete={requestDelete}
        onCancelFieldCatalog={onCancelFieldCatalog}
      />
    )}

    {catalogMode === "tasks" && (
      <ScaleTaskCatalogPanel
        scaleTaskDraft={scaleTaskDraft}
        setScaleTaskDraft={setScaleTaskDraft}
        scaleTaskCatalog={scaleTaskCatalog}
        submitScaleTask={submitScaleTask}
        busyAction={busyAction}
        onDeleteScaleTaskCatalogItem={onDeleteScaleTaskCatalogItem}
        requestDelete={requestDelete}
        onCancelScaleTask={onCancelScaleTask}
      />
    )}
  </section>
);

export { FieldCatalogPanel } from "./FieldCatalogPanel";
export { ScaleTaskCatalogPanel } from "./ScaleTaskCatalogPanel";
