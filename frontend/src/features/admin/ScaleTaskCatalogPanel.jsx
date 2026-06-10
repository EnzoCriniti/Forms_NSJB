import React from "react";
import { ScaleTaskCatalogEditorPanel } from "./ScaleTaskCatalogEditorPanel";
import { ScaleTaskCatalogListPanel } from "./ScaleTaskCatalogListPanel";

export const ScaleTaskCatalogPanel = ({
  scaleTaskDraft,
  setScaleTaskDraft,
  scaleTaskCatalog,
  submitScaleTask,
  busyAction,
  onDeleteScaleTaskCatalogItem,
  requestDelete,
  onCancelScaleTask,
}) => (
  <div className="msg-split">
    <div className="msg-form">
      <h4 className="msg-subtitle">{scaleTaskDraft.id ? "Editar tarefa base" : "Nova tarefa base"}</h4>
      <ScaleTaskCatalogEditorPanel
        scaleTaskDraft={scaleTaskDraft}
        setScaleTaskDraft={setScaleTaskDraft}
        submitScaleTask={submitScaleTask}
        busyAction={busyAction}
        onCancelScaleTask={onCancelScaleTask}
      />
    </div>
    <div>
      <h4 className="msg-subtitle">Tarefas cadastradas</h4>
      <ScaleTaskCatalogListPanel
        onDeleteScaleTaskCatalogItem={onDeleteScaleTaskCatalogItem}
        requestDelete={requestDelete}
        scaleTaskCatalog={scaleTaskCatalog}
        setScaleTaskDraft={setScaleTaskDraft}
      />
    </div>
  </div>
);
