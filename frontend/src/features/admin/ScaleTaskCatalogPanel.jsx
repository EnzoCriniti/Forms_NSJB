import React from "react";
import { Btn, COLORS, FieldControl, NotePanel, SplitSection } from "../../components/ui";
import { PaginatedList } from "./adminPaginatedList";
import { ADMIN_INPUT_STYLE, normalizeIdentifier, taskCategoryLabels } from "./adminSettingsConstants";

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
      <div style={{ display: "grid", gap: 10 }}>
        <NotePanel>
          Use esta biblioteca para reaproveitar tarefas recorrentes. O identificador tecnico pode ficar em branco e sera gerado ao salvar.
        </NotePanel>
        <FieldControl label="Identificador tecnico">
          <input value={scaleTaskDraft.key} onChange={e => setScaleTaskDraft({ ...scaleTaskDraft, key: e.target.value })} placeholder="Opcional. Ex: preparo_jantar" style={ADMIN_INPUT_STYLE} />
        </FieldControl>
        <FieldControl label="Nome administrativo">
          <input value={scaleTaskDraft.name} onChange={e => setScaleTaskDraft({ ...scaleTaskDraft, name: e.target.value })} placeholder="Ex: Preparo do jantar" style={ADMIN_INPUT_STYLE} />
        </FieldControl>
        <FieldControl label="Nome exibido na escala">
          <input value={scaleTaskDraft.defaultLabel} onChange={e => setScaleTaskDraft({ ...scaleTaskDraft, defaultLabel: e.target.value })} placeholder="Ex: Preparacao do jantar" style={ADMIN_INPUT_STYLE} />
        </FieldControl>
        <FieldControl label="Grupo">
          <select value={scaleTaskDraft.category} onChange={e => setScaleTaskDraft({ ...scaleTaskDraft, category: e.target.value })} style={ADMIN_INPUT_STYLE}>
            {Object.entries(taskCategoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </FieldControl>
        <FieldControl label="Observacoes internas">
          <textarea value={scaleTaskDraft.description} onChange={e => setScaleTaskDraft({ ...scaleTaskDraft, description: e.target.value })} placeholder="Quando usar esta tarefa ou como ela costuma aparecer na escala" rows={3} style={ADMIN_INPUT_STYLE} />
        </FieldControl>
        <div style={{ fontSize: 11, color: COLORS.textMuted }}>
          Identificador previsto: <strong style={{ color: COLORS.text }}>{normalizeIdentifier(scaleTaskDraft.key || scaleTaskDraft.name || scaleTaskDraft.defaultLabel) || "sera gerado ao preencher o nome"}</strong>
        </div>
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: COLORS.textSecondary }}>
          <input type="checkbox" checked={scaleTaskDraft.active !== false} onChange={e => setScaleTaskDraft({ ...scaleTaskDraft, active: e.target.checked })} /> Ativa para novas escalas
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn onClick={submitScaleTask} loading={busyAction === "scaleTask"}>{scaleTaskDraft.id ? "Salvar tarefa" : "Criar tarefa"}</Btn>
          {scaleTaskDraft.id && <Btn v="ghost" onClick={onCancelScaleTask}>Cancelar</Btn>}
        </div>
      </div>
    )}
    right={(
      <PaginatedList
        items={scaleTaskCatalog}
        emptyText="Nenhuma tarefa base cadastrada."
        renderItem={item => (
          <div key={item.id} className="settings-row catalog-row">
            <div>
              <strong>{item.name}</strong>
              <div>{item.defaultLabel || item.name} â€¢ {taskCategoryLabels[item.category]} â€¢ {item.active ? "Ativa" : "Inativa"}</div>
              <div>Id: {item.key}</div>
              {item.description && <div>{item.description}</div>}
            </div>
            <Btn
              v="secondary"
              sz="sm"
              onClick={() => setScaleTaskDraft({
                key: item.key || "",
                name: item.name || "",
                category: item.category || "cozinha",
                defaultLabel: item.defaultLabel || "",
                description: item.description || "",
                active: item.active !== false,
                id: item.id,
              })}
            >
              Editar
            </Btn>
            <Btn v="danger" sz="sm" onClick={() => requestDelete(
              "Excluir tarefa base",
              `Tem certeza que deseja excluir a tarefa base ${item.name}?`,
              "Excluir",
              () => onDeleteScaleTaskCatalogItem(item.id),
            )}>Remover</Btn>
          </div>
        )}
      />
    )}
  />
);
