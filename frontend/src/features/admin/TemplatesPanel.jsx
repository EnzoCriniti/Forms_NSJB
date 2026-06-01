import React from "react";
import { Btn, COLORS, NotePanel, SplitSection, SurfacePanel } from "../../components/ui";
import { PaginatedList } from "./adminPaginatedList";

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
