import React from "react";
import { Btn, COLORS, NotePanel, SplitSection } from "../../components/ui";
import { DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS } from "../../lib/gridDefaults";
import { AdminField } from "./adminField";
import { FieldCatalogPreview } from "./adminFieldPreview";
import { GridSchemaEditor } from "./adminGridSchemaEditor";
import { PaginatedList } from "./adminPaginatedList";
import { ADMIN_INPUT_STYLE, fieldCategoryLabels, fieldTypeLabels, getExternalBaseName, normalizeIdentifier } from "./adminSettingsConstants";
import { FieldCatalogSelectionSourcePanel } from "./FieldCatalogSelectionSourcePanel";

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
          <input value={fieldCatalogDraft.key} onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, key: e.target.value })} placeholder="Opcional. Ex: presenca_sessao" style={ADMIN_INPUT_STYLE} />
        </AdminField>
        <AdminField>
          <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Nome administrativo</label>
          <input value={fieldCatalogDraft.name} onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, name: e.target.value })} placeholder="Ex: Presenca em sessao" style={ADMIN_INPUT_STYLE} />
        </AdminField>
        <AdminField>
          <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Nome exibido no formulario</label>
          <input value={fieldCatalogDraft.defaultLabel} onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, defaultLabel: e.target.value })} placeholder="Ex: Sessao" style={ADMIN_INPUT_STYLE} />
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
            })} style={ADMIN_INPUT_STYLE}>
              {Object.entries(fieldTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </AdminField>
          <AdminField>
            <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Grupo</label>
            <select value={fieldCatalogDraft.category} onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, category: e.target.value })} style={ADMIN_INPUT_STYLE}>
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
          <textarea value={fieldCatalogDraft.description} onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, description: e.target.value })} placeholder="Quando usar este campo ou o que a equipe precisa lembrar" rows={3} style={ADMIN_INPUT_STYLE} />
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
              <div>{item.defaultLabel || item.name} â€¢ {fieldTypeLabels[item.type]} â€¢ {fieldCategoryLabels[item.category]} â€¢ {item.active ? "Ativo" : "Inativo"}</div>
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
