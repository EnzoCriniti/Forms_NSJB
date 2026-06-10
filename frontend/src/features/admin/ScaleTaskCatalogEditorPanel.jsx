import React from "react";
import { Btn } from "../../components/ui";
import { normalizeIdentifier, taskCategoryLabels } from "./adminSettingsConstants";

export const ScaleTaskCatalogEditorPanel = ({
  scaleTaskDraft,
  setScaleTaskDraft,
  submitScaleTask,
  busyAction,
  onCancelScaleTask,
}) => (
  <>
    <span className="msg-hint">
      Use esta biblioteca para reaproveitar tarefas recorrentes. O identificador técnico pode ficar em branco e será gerado ao salvar.
    </span>
    <label className="msg-field">
      <span className="msg-label">Identificador técnico</span>
      <input className="msg-input" value={scaleTaskDraft.key} onChange={event => setScaleTaskDraft({ ...scaleTaskDraft, key: event.target.value })} placeholder="Opcional. Ex.: preparo_jantar" />
    </label>
    <label className="msg-field">
      <span className="msg-label">Nome administrativo</span>
      <input className="msg-input" value={scaleTaskDraft.name} onChange={event => setScaleTaskDraft({ ...scaleTaskDraft, name: event.target.value })} placeholder="Ex.: Preparo do jantar" />
    </label>
    <label className="msg-field">
      <span className="msg-label">Nome exibido na escala</span>
      <input className="msg-input" value={scaleTaskDraft.defaultLabel} onChange={event => setScaleTaskDraft({ ...scaleTaskDraft, defaultLabel: event.target.value })} placeholder="Ex.: Preparação do jantar" />
    </label>
    <label className="msg-field">
      <span className="msg-label">Grupo</span>
      <select className="msg-input" value={scaleTaskDraft.category} onChange={event => setScaleTaskDraft({ ...scaleTaskDraft, category: event.target.value })}>
        {Object.entries(taskCategoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    </label>
    <label className="msg-field">
      <span className="msg-label">Observações internas</span>
      <textarea className="msg-input" value={scaleTaskDraft.description} onChange={event => setScaleTaskDraft({ ...scaleTaskDraft, description: event.target.value })} placeholder="Quando usar esta tarefa ou como ela costuma aparecer na escala" rows={3} />
    </label>
    <span className="msg-hint">
      Identificador previsto: <strong style={{ color: "var(--text)" }}>{normalizeIdentifier(scaleTaskDraft.key || scaleTaskDraft.name || scaleTaskDraft.defaultLabel) || "será gerado ao preencher o nome"}</strong>
    </span>
    <label className="msg-check">
      <input type="checkbox" checked={scaleTaskDraft.active !== false} onChange={event => setScaleTaskDraft({ ...scaleTaskDraft, active: event.target.checked })} /> Ativa para novas escalas
    </label>
    <div className="msg-actions" style={{ flexWrap: "wrap" }}>
      <Btn onClick={submitScaleTask} loading={busyAction === "scaleTask"}>{scaleTaskDraft.id ? "Salvar tarefa" : "Criar tarefa"}</Btn>
      {scaleTaskDraft.id && <Btn v="ghost" onClick={onCancelScaleTask}>Cancelar</Btn>}
    </div>
  </>
);
