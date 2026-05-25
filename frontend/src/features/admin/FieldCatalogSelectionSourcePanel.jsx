import React from "react";
import { COLORS, SurfacePanel } from "../../components/ui";
import { ADMIN_INPUT_STYLE, getExternalBaseName } from "./adminSettingsConstants";

export const FieldCatalogSelectionSourcePanel = ({
  draft,
  externalBases,
  onChangeDraft,
}) => {
  const selectionSource = draft.selectionSource || { kind: "members" };
  const firstActiveExternalBaseId = externalBases.find(base => base.active !== false)?.id || "";

  const setMembersSource = () => {
    onChangeDraft({ ...draft, selectionSource: { kind: "members" } });
  };

  const setExternalBaseSource = () => {
    onChangeDraft({
      ...draft,
      selectionSource: {
        kind: "external_base",
        externalBaseId: selectionSource.externalBaseId || firstActiveExternalBaseId,
      },
    });
  };

  const setExternalBaseId = externalBaseId => {
    onChangeDraft({ ...draft, selectionSource: { kind: "external_base", externalBaseId } });
  };

  return (
    <SurfacePanel style={{ display: "grid", gap: 10 }}>
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, display: "block", marginBottom: 6 }}>Vinculo do campo</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <button
            onClick={setMembersSource}
            style={{ border: `1px solid ${selectionSource.kind !== "external_base" ? COLORS.primary : COLORS.border}`, background: selectionSource.kind !== "external_base" ? COLORS.primaryLight : COLORS.surface, color: selectionSource.kind !== "external_base" ? COLORS.primary : COLORS.textSecondary, borderRadius: 10, padding: "10px 12px", textAlign: "left", minHeight: 72 }}
          >
            <strong style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Base central de socios</strong>
            <span style={{ fontSize: 11 }}>Usa a base central como origem.</span>
          </button>
          <button
            onClick={setExternalBaseSource}
            style={{ border: `1px solid ${selectionSource.kind === "external_base" ? COLORS.primary : COLORS.border}`, background: selectionSource.kind === "external_base" ? COLORS.primaryLight : COLORS.surface, color: selectionSource.kind === "external_base" ? COLORS.primary : COLORS.textSecondary, borderRadius: 10, padding: "10px 12px", textAlign: "left", minHeight: 72 }}
          >
            <strong style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Base externa sincronizada</strong>
            <span style={{ fontSize: 11 }}>Aponta para uma lista sincronizada.</span>
          </button>
        </div>
        {selectionSource.kind === "external_base" && (
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Base externa vinculada</label>
            <select
              value={selectionSource.externalBaseId || ""}
              onChange={event => setExternalBaseId(event.target.value)}
              style={ADMIN_INPUT_STYLE}
            >
              <option value="">Selecione uma base externa</option>
              {externalBases.filter(base => base.active !== false).map(base => <option key={base.id} value={base.id}>{base.name}</option>)}
            </select>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>
              O campo vai usar as opcoes sincronizadas desta base como origem.
            </div>
          </div>
        )}
        {selectionSource.kind !== "external_base" && (
          <div style={{ fontSize: 11, color: COLORS.textMuted }}>
            O campo usa a base central de socios como origem.
          </div>
        )}
        <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 10, border: `1px solid ${COLORS.borderLight}`, background: COLORS.surfaceAlt }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4, color: COLORS.textMuted, marginBottom: 4 }}>
            Resumo do vinculo
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>
            {selectionSource.kind === "external_base"
              ? `Base externa sincronizada: ${getExternalBaseName(externalBases, selectionSource.externalBaseId)}`
              : "Base central de socios"}
          </div>
        </div>
      </div>
    </SurfacePanel>
  );
};
