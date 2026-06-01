import React from "react";
import { Btn, COLORS, NotePanel } from "../../components/ui";
import { AdminField } from "./adminField";
import { FieldCatalogPreview } from "./adminFieldPreview";
import { FieldCatalogSelectionSourcePanel } from "./FieldCatalogSelectionSourcePanel";
import { GridSchemaEditor } from "./adminGridSchemaEditor";
import { ADMIN_INPUT_STYLE, fieldCategoryLabels, fieldTypeLabels, normalizeIdentifier } from "./adminSettingsConstants";

export const FieldCatalogEditorPanel = ({
  fieldCatalogDraft,
  setFieldCatalogDraft,
  externalBases,
  submitFieldCatalog,
  busyAction,
  onCancelFieldCatalog,
}) => (
  <div style={{ display: "grid", gap: 10 }}>
    <NotePanel>
      Preencha o nome exibido no formulario e ajuste o tipo. O identificador tecnico pode ser informado manualmente ou sera gerado automaticamente ao salvar.
    </NotePanel>
    <AdminField>
      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Identificador tecnico</label>
      <input value={fieldCatalogDraft.key} onChange={event => setFieldCatalogDraft({ ...fieldCatalogDraft, key: event.target.value })} placeholder="Opcional. Ex: presenca_sessao" style={ADMIN_INPUT_STYLE} />
    </AdminField>
    <AdminField>
      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Nome administrativo</label>
      <input value={fieldCatalogDraft.name} onChange={event => setFieldCatalogDraft({ ...fieldCatalogDraft, name: event.target.value })} placeholder="Ex: Presenca em sessao" style={ADMIN_INPUT_STYLE} />
    </AdminField>
    <AdminField>
      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Nome exibido no formulario</label>
      <input value={fieldCatalogDraft.defaultLabel} onChange={event => setFieldCatalogDraft({ ...fieldCatalogDraft, defaultLabel: event.target.value })} placeholder="Ex: Sessao" style={ADMIN_INPUT_STYLE} />
    </AdminField>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      <AdminField>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Tipo do campo</label>
        <select
          value={fieldCatalogDraft.type}
          onChange={event => setFieldCatalogDraft({
            ...fieldCatalogDraft,
            type: event.target.value,
            selectionSource: event.target.value === "person_select"
              ? (fieldCatalogDraft.selectionSource || { kind: "members" })
              : fieldCatalogDraft.selectionSource,
          })}
          style={ADMIN_INPUT_STYLE}
        >
          {Object.entries(fieldTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </AdminField>
      <AdminField>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Grupo</label>
        <select value={fieldCatalogDraft.category} onChange={event => setFieldCatalogDraft({ ...fieldCatalogDraft, category: event.target.value })} style={ADMIN_INPUT_STYLE}>
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
      <FieldCatalogSelectionSourcePanel
        draft={fieldCatalogDraft}
        externalBases={externalBases}
        onChangeDraft={setFieldCatalogDraft}
      />
    )}
    <AdminField>
      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Observacoes internas</label>
      <textarea value={fieldCatalogDraft.description} onChange={event => setFieldCatalogDraft({ ...fieldCatalogDraft, description: event.target.value })} placeholder="Quando usar este campo ou o que a equipe precisa lembrar" rows={3} style={ADMIN_INPUT_STYLE} />
    </AdminField>
    <div style={{ fontSize: 11, color: COLORS.textMuted }}>
      Identificador previsto: <strong style={{ color: COLORS.text }}>{normalizeIdentifier(fieldCatalogDraft.key || fieldCatalogDraft.name || fieldCatalogDraft.defaultLabel) || "sera gerado ao preencher o nome"}</strong>
    </div>
    <FieldCatalogPreview draft={fieldCatalogDraft} externalBases={externalBases} />
    <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: COLORS.textSecondary }}>
      <input type="checkbox" checked={fieldCatalogDraft.active !== false} onChange={event => setFieldCatalogDraft({ ...fieldCatalogDraft, active: event.target.checked })} /> Ativo para novos formularios
    </label>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Btn onClick={submitFieldCatalog} loading={busyAction === "fieldCatalog"}>{fieldCatalogDraft.id ? "Salvar campo" : "Criar campo"}</Btn>
      {fieldCatalogDraft.id && <Btn v="ghost" onClick={onCancelFieldCatalog}>Cancelar</Btn>}
    </div>
  </div>
);
