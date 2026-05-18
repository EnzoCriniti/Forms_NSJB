/**
 * @file frontend/src/features/admin/adminCatalogPanels.jsx
 * @summary Paineis reutilizaveis da aba de catalogos administrativos.
 * @responsibility Conter a UI dos catalogos de campos e tarefas.
 */

import React from "react";
import { Btn, COLORS, FieldControl, NotePanel, SplitSection, SurfacePanel } from "../../components/ui";
import { AdminField, DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS, FieldCatalogPreview, GridSchemaEditor, PaginatedList, fieldCategoryLabels, fieldTypeLabels, getExternalBaseName, normalizeIdentifier, taskCategoryLabels } from "./adminSettingsShared";

const inputStyle = {
  width: "100%",
  minHeight: 42,
  padding: "10px 12px",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 10,
  background: COLORS.surface,
  color: COLORS.text,
  boxShadow: "var(--shadow-sm)",
};

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

export const FieldCatalogPanel = ({
  fieldCatalogDraft,
  setFieldCatalogDraft,
  externalBases,
  fieldCatalog,
  submitFieldCatalog,
  busyAction,
  onDeleteFieldCatalogItem,
  requestDelete,
  onCancelFieldCatalog,
}) => (
  <SplitSection
    leftTitle={fieldCatalogDraft.id ? "Editar campo base" : "Novo campo base"}
    rightTitle="Campos cadastrados"
    left={(
      <div style={{ display: "grid", gap: 10 }}>
        <NotePanel>
          Preencha o nome exibido no formulario e ajuste o tipo. O identificador tecnico pode ser informado manualmente ou sera gerado automaticamente ao salvar.
        </NotePanel>
        <AdminField>
          <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Identificador tecnico</label>
          <input value={fieldCatalogDraft.key} onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, key: e.target.value })} placeholder="Opcional. Ex: presenca_sessao" style={inputStyle} />
        </AdminField>
        <AdminField>
          <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Nome administrativo</label>
          <input value={fieldCatalogDraft.name} onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, name: e.target.value })} placeholder="Ex: Presenca em sessao" style={inputStyle} />
        </AdminField>
        <AdminField>
          <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Nome exibido no formulario</label>
          <input value={fieldCatalogDraft.defaultLabel} onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, defaultLabel: e.target.value })} placeholder="Ex: Sessao" style={inputStyle} />
        </AdminField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <AdminField>
            <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Tipo do campo</label>
            <select value={fieldCatalogDraft.type} onChange={e => setFieldCatalogDraft({
              ...fieldCatalogDraft,
              type: e.target.value,
              selectionSource: e.target.value === "person_select"
                ? (fieldCatalogDraft.selectionSource || { kind: "members" })
                : fieldCatalogDraft.selectionSource,
            })} style={inputStyle}>
              {Object.entries(fieldTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </AdminField>
          <AdminField>
            <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Grupo</label>
            <select value={fieldCatalogDraft.category} onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, category: e.target.value })} style={inputStyle}>
              {Object.entries(fieldCategoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </AdminField>
        </div>
        {fieldCatalogDraft.type === "grid" && (
          <GridSchemaEditor
            value={fieldCatalogDraft.gridSchema}
            onChange={gridSchema => setFieldCatalogDraft({ ...fieldCatalogDraft, gridSchema })}
          />
        )}
        {fieldCatalogDraft.type === "person_select" && (
          <SurfacePanel style={{ display: "grid", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, display: "block", marginBottom: 6 }}>Vinculo do campo</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <button
                  onClick={() => setFieldCatalogDraft({ ...fieldCatalogDraft, selectionSource: { kind: "members" } })}
                  style={{ border: `1px solid ${fieldCatalogDraft.selectionSource?.kind !== "external_base" ? COLORS.primary : COLORS.border}`, background: fieldCatalogDraft.selectionSource?.kind !== "external_base" ? COLORS.primaryLight : COLORS.surface, color: fieldCatalogDraft.selectionSource?.kind !== "external_base" ? COLORS.primary : COLORS.textSecondary, borderRadius: 10, padding: "10px 12px", textAlign: "left", minHeight: 72 }}
                >
                  <strong style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Base central de socios</strong>
                  <span style={{ fontSize: 11 }}>Usa a base central como origem.</span>
                </button>
                <button
                  onClick={() => setFieldCatalogDraft({ ...fieldCatalogDraft, selectionSource: { kind: "external_base", externalBaseId: fieldCatalogDraft.selectionSource?.externalBaseId || (externalBases.find(base => base.active !== false)?.id || "") } })}
                  style={{ border: `1px solid ${fieldCatalogDraft.selectionSource?.kind === "external_base" ? COLORS.primary : COLORS.border}`, background: fieldCatalogDraft.selectionSource?.kind === "external_base" ? COLORS.primaryLight : COLORS.surface, color: fieldCatalogDraft.selectionSource?.kind === "external_base" ? COLORS.primary : COLORS.textSecondary, borderRadius: 10, padding: "10px 12px", textAlign: "left", minHeight: 72 }}
                >
                  <strong style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Base externa sincronizada</strong>
                  <span style={{ fontSize: 11 }}>Aponta para uma lista sincronizada.</span>
                </button>
              </div>
              {fieldCatalogDraft.selectionSource?.kind === "external_base" && (
                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Base externa vinculada</label>
                  <select
                    value={fieldCatalogDraft.selectionSource?.externalBaseId || ""}
                    onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, selectionSource: { kind: "external_base", externalBaseId: e.target.value } })}
                    style={inputStyle}
                  >
                    <option value="">Selecione uma base externa</option>
                    {externalBases.filter(base => base.active !== false).map(base => <option key={base.id} value={base.id}>{base.name}</option>)}
                  </select>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                    O campo vai usar as opcoes sincronizadas desta base como origem.
                  </div>
                </div>
              )}
              {fieldCatalogDraft.selectionSource?.kind !== "external_base" && (
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                  O campo usa a base central de socios como origem.
                </div>
              )}
              <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 10, border: `1px solid ${COLORS.borderLight}`, background: COLORS.surfaceAlt }}>
                <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4, color: COLORS.textMuted, marginBottom: 4 }}>
                  Resumo do vinculo
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>
                  {fieldCatalogDraft.selectionSource?.kind === "external_base"
                    ? `Base externa sincronizada: ${getExternalBaseName(externalBases, fieldCatalogDraft.selectionSource?.externalBaseId)}`
                    : "Base central de socios"}
                </div>
              </div>
            </div>
          </SurfacePanel>
        )}
        <AdminField>
          <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Observacoes internas</label>
          <textarea value={fieldCatalogDraft.description} onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, description: e.target.value })} placeholder="Quando usar este campo ou o que a equipe precisa lembrar" rows={3} style={inputStyle} />
        </AdminField>
        <div style={{ fontSize: 11, color: COLORS.textMuted }}>
          Identificador previsto: <strong style={{ color: COLORS.text }}>{normalizeIdentifier(fieldCatalogDraft.key || fieldCatalogDraft.name || fieldCatalogDraft.defaultLabel) || "sera gerado ao preencher o nome"}</strong>
        </div>
        <FieldCatalogPreview draft={fieldCatalogDraft} externalBases={externalBases} />
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: COLORS.textSecondary }}>
          <input type="checkbox" checked={fieldCatalogDraft.active !== false} onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, active: e.target.checked })} /> Ativo para novos formularios
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn onClick={submitFieldCatalog} loading={busyAction === "fieldCatalog"}>{fieldCatalogDraft.id ? "Salvar campo" : "Criar campo"}</Btn>
          {fieldCatalogDraft.id && <Btn v="ghost" onClick={onCancelFieldCatalog}>Cancelar</Btn>}
        </div>
      </div>
    )}
    right={(
      <PaginatedList
        items={fieldCatalog}
        emptyText="Nenhum campo base cadastrado."
        renderItem={item => (
          <div key={item.id} className="settings-row catalog-row">
            <div>
              <strong>{item.name}</strong>
              <div>{item.defaultLabel || item.name} • {fieldTypeLabels[item.type]} • {fieldCategoryLabels[item.category]} • {item.active ? "Ativo" : "Inativo"}</div>
              <div>Id: {item.key}</div>
              {item.type === "person_select" && (
                <div>Vinculo: {item.selectionSource?.kind === "external_base" ? `Base externa ${getExternalBaseName(externalBases, item.selectionSource.externalBaseId)}` : "Base central de socios"}</div>
              )}
              {item.description && <div>{item.description}</div>}
            </div>
            <Btn
              v="secondary"
              sz="sm"
              onClick={() => setFieldCatalogDraft({
                key: item.key || "",
                name: item.name || "",
                type: item.type || "yes_no",
                category: item.category || "presenca",
                defaultLabel: item.defaultLabel || "",
                gridSchema: item.gridSchema || { rows: DEFAULT_GRID_ROWS, cols: DEFAULT_GRID_COLS },
                selectionSource: item.selectionSource || { kind: "members" },
                description: item.description || "",
                active: item.active !== false,
                id: item.id,
              })}
            >
              Editar
            </Btn>
            <Btn v="danger" sz="sm" onClick={() => requestDelete(
              "Excluir campo base",
              `Tem certeza que deseja excluir o campo base ${item.name}?`,
              "Excluir",
              () => onDeleteFieldCatalogItem(item.id),
            )}>Remover</Btn>
          </div>
        )}
      />
    )}
  />
);

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
          <input value={scaleTaskDraft.key} onChange={e => setScaleTaskDraft({ ...scaleTaskDraft, key: e.target.value })} placeholder="Opcional. Ex: preparo_jantar" style={inputStyle} />
        </FieldControl>
        <FieldControl label="Nome administrativo">
          <input value={scaleTaskDraft.name} onChange={e => setScaleTaskDraft({ ...scaleTaskDraft, name: e.target.value })} placeholder="Ex: Preparo do jantar" style={inputStyle} />
        </FieldControl>
        <FieldControl label="Nome exibido na escala">
          <input value={scaleTaskDraft.defaultLabel} onChange={e => setScaleTaskDraft({ ...scaleTaskDraft, defaultLabel: e.target.value })} placeholder="Ex: Preparacao do jantar" style={inputStyle} />
        </FieldControl>
        <FieldControl label="Grupo">
          <select value={scaleTaskDraft.category} onChange={e => setScaleTaskDraft({ ...scaleTaskDraft, category: e.target.value })} style={inputStyle}>
            {Object.entries(taskCategoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </FieldControl>
        <FieldControl label="Observacoes internas">
          <textarea value={scaleTaskDraft.description} onChange={e => setScaleTaskDraft({ ...scaleTaskDraft, description: e.target.value })} placeholder="Quando usar esta tarefa ou como ela costuma aparecer na escala" rows={3} style={inputStyle} />
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
              <div>{item.defaultLabel || item.name} • {taskCategoryLabels[item.category]} • {item.active ? "Ativa" : "Inativa"}</div>
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
