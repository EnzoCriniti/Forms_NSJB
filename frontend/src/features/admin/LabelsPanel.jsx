import React from "react";
import { Btn, COLORS, FieldControl, SplitSection } from "../../components/ui";
import { PaginatedList } from "./adminPaginatedList";
import { ADMIN_INPUT_STYLE } from "./adminSettingsConstants";

export const LabelsPanel = ({
  labelDraft,
  setLabelDraft,
  submitLabel,
  busyAction,
  labels,
  requestDelete,
  onDeleteLabel,
}) => (
  <SplitSection
    leftTitle={labelDraft.id ? "Editar classificacao" : "Nova classificacao"}
    rightTitle="Classificacoes existentes"
    left={(
      <div style={{ display: "grid", gap: 12 }}>
        <FieldControl label="Nome da classificacao">
          <input value={labelDraft.name} onChange={e => setLabelDraft({ ...labelDraft, name: e.target.value })} placeholder="Nome da classificacao" style={ADMIN_INPUT_STYLE} />
        </FieldControl>
        <FieldControl label="Cor">
          <input value={labelDraft.color} onChange={e => setLabelDraft({ ...labelDraft, color: e.target.value })} type="color" style={{ ...ADMIN_INPUT_STYLE, padding: 4, height: 44, minHeight: 44, boxSizing: "border-box", overflow: "hidden" }} />
        </FieldControl>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={submitLabel} loading={busyAction === "label"}>{labelDraft.id ? "Salvar classificacao" : "Criar classificacao"}</Btn>
          {labelDraft.id && <Btn v="ghost" onClick={() => setLabelDraft({ name: "", color: "#2e7d32" })}>Cancelar</Btn>}
        </div>
      </div>
    )}
    right={(
      <PaginatedList
        items={labels}
        emptyText="Nenhuma classificacao cadastrada."
        renderItem={label => (
          <div key={label.id} className="settings-row">
            <div><strong><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 99, background: label.color, marginRight: 8 }} />{label.name}</strong><div>Criado por {label.createdBy || "Sistema"}</div></div>
            <Btn v="secondary" sz="sm" onClick={() => setLabelDraft(label)}>Editar</Btn>
            <Btn v="danger" sz="sm" onClick={() => requestDelete(
              "Excluir classificacao",
              `Tem certeza que deseja excluir a classificacao ${label.name}?`,
              "Excluir",
              () => onDeleteLabel(label.id),
            )}>Remover</Btn>
          </div>
        )}
      />
    )}
  />
);
