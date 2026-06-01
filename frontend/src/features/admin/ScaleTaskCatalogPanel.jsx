import React from "react";
import { SplitSection } from "../../components/ui";
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
  <SplitSection
    leftTitle={scaleTaskDraft.id ? "Editar tarefa base" : "Nova tarefa base"}
    rightTitle="Tarefas cadastradas"
    left={(
      <ScaleTaskCatalogEditorPanel
        scaleTaskDraft={scaleTaskDraft}
        setScaleTaskDraft={setScaleTaskDraft}
        submitScaleTask={submitScaleTask}
        busyAction={busyAction}
        onCancelScaleTask={onCancelScaleTask}
      />
    )}
    right={(
      <ScaleTaskCatalogListPanel
        onDeleteScaleTaskCatalogItem={onDeleteScaleTaskCatalogItem}
        requestDelete={requestDelete}
        scaleTaskCatalog={scaleTaskCatalog}
        setScaleTaskDraft={setScaleTaskDraft}
      />
    )}
  />
);
