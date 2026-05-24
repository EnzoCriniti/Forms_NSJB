/**
 * @file frontend/src/features/admin/adminOrganizationPanels.jsx
 * @summary Paineis compartilhados de classificacoes e templates administrativos.
 * @responsibility Conter a UI de listas e formulários de organizacao fora do modal principal.
 */

import React from "react";
import { Btn, COLORS, FieldControl, NotePanel, SplitSection, SurfacePanel } from "../../components/ui";
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

export const TemplatesPanel = ({
  presets,
  requestDelete,
  onDeletePreset,
}) => (
  <SplitSection
    leftTitle="Como os templates funcionam"
    rightTitle="Templates de formulario existentes"
    left={(
      <div style={{ display: "grid", gap: 10 }}>
        <NotePanel>
          Templates sao criados na tela de criacao de formulario. Aqui voce acompanha os existentes e pode remover o que nao faz mais sentido.
        </NotePanel>
        <SurfacePanel style={{ fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.55, borderRadius: 10, padding: 12 }}>
          Para salvar um novo template, use a acao <strong style={{ color: COLORS.text }}>Salvar como Template</strong> dentro do builder do formulario.
        </SurfacePanel>
      </div>
    )}
    right={(
      <PaginatedList
        items={presets}
        emptyText="Nenhum template cadastrado."
        renderItem={preset => {
          const count = preset.type === "escala_organ"
            ? `${preset.scaleSections?.length ?? 0} secoes`
            : `${preset.fieldDefinitions?.length ?? 0} campos`;
          const modeLabel = preset.type === "escala_organ"
            ? "Escala da Organ"
            : (preset.resultsConfig?.formMode === "nucleo" ? "Presenca do nucleo" : "Formulario geral");
          return (
            <div key={preset.id} className="settings-row">
              <div>
                <strong>{preset.name}</strong>
                <div>{modeLabel} - {count} - Criado por {preset.createdBy || "Sistema"}</div>
              </div>
              <Btn v="danger" sz="sm" onClick={() => requestDelete(
                "Excluir template",
                `Tem certeza que deseja excluir o template ${preset.name}?`,
                "Excluir",
                () => onDeletePreset(preset.id),
              )}>Remover</Btn>
            </div>
          );
        }}
      />
    )}
  />
);
