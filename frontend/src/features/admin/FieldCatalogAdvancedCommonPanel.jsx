import React from "react";
import { Btn, COLORS } from "../../components/ui";
import { ADMIN_INPUT_STYLE, normalizeIdentifier } from "./adminSettingsConstants";
import { FieldCatalogPreview } from "./adminFieldPreview";

export const FieldCatalogAdvancedCommonPanel = ({
  fieldCatalogDraft,
  setFieldCatalogDraft,
  externalBases,
  submitFieldCatalog,
  busyAction,
  onCancelFieldCatalog,
}) => (
  <div style={{ display: "grid", gap: 10 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Observacoes internas</label>
    <textarea
      value={fieldCatalogDraft.description}
      onChange={event => setFieldCatalogDraft({ ...fieldCatalogDraft, description: event.target.value })}
      placeholder="Quando usar este campo ou o que a equipe precisa lembrar"
      rows={3}
      style={ADMIN_INPUT_STYLE}
    />
    <div style={{ fontSize: 11, color: COLORS.textMuted }}>
      Identificador previsto: <strong style={{ color: COLORS.text }}>{normalizeIdentifier(fieldCatalogDraft.key || fieldCatalogDraft.name || fieldCatalogDraft.defaultLabel) || "será gerado ao preencher o nome"}</strong>
    </div>
    <FieldCatalogPreview draft={fieldCatalogDraft} externalBases={externalBases} />
    <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: COLORS.textSecondary }}>
      <input
        type="checkbox"
        checked={fieldCatalogDraft.active !== false}
        onChange={event => setFieldCatalogDraft({ ...fieldCatalogDraft, active: event.target.checked })}
      /> Ativo para novos formularios
    </label>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Btn onClick={submitFieldCatalog} loading={busyAction === "fieldCatalog"}>{fieldCatalogDraft.id ? "Salvar campo" : "Criar campo"}</Btn>
      {fieldCatalogDraft.id && <Btn v="ghost" onClick={onCancelFieldCatalog}>Cancelar</Btn>}
    </div>
  </div>
);
