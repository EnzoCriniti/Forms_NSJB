import React from "react";
import { Btn } from "../../components/ui";
import { PaginatedList } from "./adminPaginatedList";

export const TemplatesPanel = ({
  presets,
  requestDelete,
  onDeletePreset,
}) => (
  <section className="msg-card">
    <header className="msg-card__head">
      <h3 className="msg-card__title">Templates de formulário</h3>
      <p className="msg-card__hint">
        Templates são criados na tela de criação de formulário. Aqui você acompanha os existentes e pode remover o que não faz mais sentido.
      </p>
    </header>
    <div className="msg-split">
      <div>
        <h4 className="msg-subtitle">Como os templates funcionam</h4>
        <span className="msg-hint">
          Para salvar um novo template, use a ação <strong style={{ color: "var(--text)" }}>Salvar como Template</strong> dentro do builder do formulário.
        </span>
      </div>
      <div>
        <h4 className="msg-subtitle">Templates de formulário existentes</h4>
        <PaginatedList
          items={presets}
          emptyText="Nenhum template cadastrado."
          renderItem={preset => {
            const count = preset.type === "escala_organ"
              ? `${preset.scaleSections?.length ?? 0} seções`
              : `${preset.fieldDefinitions?.length ?? 0} campos`;
            const modeLabel = preset.type === "escala_organ"
              ? "Escala da Organ"
              : (preset.resultsConfig?.formMode === "nucleo" ? "Presença do núcleo" : "Formulário geral");
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
      </div>
    </div>
  </section>
);
