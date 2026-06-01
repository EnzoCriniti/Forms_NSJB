import React from "react";
import { COLORS, NotePanel } from "../../components/ui";
import { AdminField } from "./adminField";
import { ADMIN_INPUT_STYLE, fieldCategoryLabels, fieldTypeLabels } from "./adminSettingsConstants";

export const FieldCatalogCoreEditorPanel = ({
  fieldCatalogDraft,
  setFieldCatalogDraft,
}) => (
  <>
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
  </>
);
