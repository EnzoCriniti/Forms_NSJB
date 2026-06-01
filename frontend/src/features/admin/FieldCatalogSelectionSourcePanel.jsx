import React from "react";
import { COLORS, SurfacePanel } from "../../components/ui";
import { FieldCatalogSelectionExternalBasePanel } from "./FieldCatalogSelectionExternalBasePanel";
import { FieldCatalogSelectionModePanel } from "./FieldCatalogSelectionModePanel";
import { FieldCatalogSelectionSummaryPanel } from "./FieldCatalogSelectionSummaryPanel";
import { getExternalBaseName } from "./adminSettingsConstants";

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
        <FieldCatalogSelectionModePanel
          selectionSource={selectionSource}
          setMembersSource={setMembersSource}
          setExternalBaseSource={setExternalBaseSource}
        />
        {selectionSource.kind === "external_base" && (
          <FieldCatalogSelectionExternalBasePanel
            selectionSource={selectionSource}
            externalBases={externalBases}
            setExternalBaseId={setExternalBaseId}
          />
        )}
        {selectionSource.kind !== "external_base" && (
          <div style={{ fontSize: 11, color: COLORS.textMuted }}>
            O campo usa a base central de socios como origem.
          </div>
        )}
        <FieldCatalogSelectionSummaryPanel selectionSource={selectionSource} externalBases={externalBases} />
      </div>
    </SurfacePanel>
  );
};
