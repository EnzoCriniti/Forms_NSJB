import React from "react";
import { Btn, COLORS, FieldControl, NotePanel } from "../../components/ui";
import { ADMIN_INPUT_STYLE, normalizeIdentifier, taskCategoryLabels } from "./adminSettingsConstants";

export const ScaleTaskCatalogEditorPanel = ({
  scaleTaskDraft,
  setScaleTaskDraft,
  submitScaleTask,
  busyAction,
  onCancelScaleTask,
}) => (
  <div style={{ display: "grid", gap: 10 }}>
    <NotePanel>
      Use esta biblioteca para reaproveitar tarefas recorrentes. O identificador tecnico pode ficar em branco e sera gerado ao salvar.
    </NotePanel>
    <FieldControl label="Identificador tecnico">
      <input value={scaleTaskDraft.key} onChange={event => setScaleTaskDraft({ ...scaleTaskDraft, key: event.target.value })} placeholder="Opcional. Ex: preparo_jantar" style={ADMIN_INPUT_STYLE} />
    </FieldControl>
    <FieldControl label="Nome administrativo">
      <input value={scaleTaskDraft.name} onChange={event => setScaleTaskDraft({ ...scaleTaskDraft, name: event.target.value })} placeholder="Ex: Preparo do jantar" style={ADMIN_INPUT_STYLE} />
    </FieldControl>
    <FieldControl label="Nome exibido na escala">
      <input value={scaleTaskDraft.defaultLabel} onChange={event => setScaleTaskDraft({ ...scaleTaskDraft, defaultLabel: event.target.value })} placeholder="Ex: Preparacao do jantar" style={ADMIN_INPUT_STYLE} />
    </FieldControl>
    <FieldControl label="Grupo">
      <select value={scaleTaskDraft.category} onChange={event => setScaleTaskDraft({ ...scaleTaskDraft, category: event.target.value })} style={ADMIN_INPUT_STYLE}>
        {Object.entries(taskCategoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    </FieldControl>
    <FieldControl label="Observacoes internas">
      <textarea value={scaleTaskDraft.description} onChange={event => setScaleTaskDraft({ ...scaleTaskDraft, description: event.target.value })} placeholder="Quando usar esta tarefa ou como ela costuma aparecer na escala" rows={3} style={ADMIN_INPUT_STYLE} />
    </FieldControl>
    <div style={{ fontSize: 11, color: COLORS.textMuted }}>
      Identificador previsto: <strong style={{ color: COLORS.text }}>{normalizeIdentifier(scaleTaskDraft.key || scaleTaskDraft.name || scaleTaskDraft.defaultLabel) || "sera gerado ao preencher o nome"}</strong>
    </div>
    <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: COLORS.textSecondary }}>
      <input type="checkbox" checked={scaleTaskDraft.active !== false} onChange={event => setScaleTaskDraft({ ...scaleTaskDraft, active: event.target.checked })} /> Ativa para novas escalas
    </label>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Btn onClick={submitScaleTask} loading={busyAction === "scaleTask"}>{scaleTaskDraft.id ? "Salvar tarefa" : "Criar tarefa"}</Btn>
      {scaleTaskDraft.id && <Btn v="ghost" onClick={onCancelScaleTask}>Cancelar</Btn>}
    </div>
  </div>
);
