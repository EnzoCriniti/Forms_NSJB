import React from "react";
import { Btn } from "../../components/ui";
import { PaginatedList } from "./adminPaginatedList";

export const LabelsPanel = ({
  labelDraft,
  setLabelDraft,
  submitLabel,
  busyAction,
  labels,
  requestDelete,
  onDeleteLabel,
}) => (
  <section className="msg-card">
    <header className="msg-card__head">
      <h3 className="msg-card__title">Classificações</h3>
      <p className="msg-card__hint">
        Etiquetas coloridas para organizar os formulários.
      </p>
    </header>
    <div className="msg-split">
      <div className="msg-form">
        <h4 className="msg-subtitle">{labelDraft.id ? "Editar classificação" : "Nova classificação"}</h4>
        <label className="msg-field">
          <span className="msg-label">Nome da classificação</span>
          <input className="msg-input" value={labelDraft.name} onChange={e => setLabelDraft({ ...labelDraft, name: e.target.value })} placeholder="Nome da classificação" />
        </label>
        <label className="msg-field">
          <span className="msg-label">Cor</span>
          <input className="msg-input" value={labelDraft.color} onChange={e => setLabelDraft({ ...labelDraft, color: e.target.value })} type="color" style={{ padding: 4, height: 44, minHeight: 44, boxSizing: "border-box", overflow: "hidden" }} />
        </label>
        <div className="msg-actions">
          <Btn onClick={submitLabel} loading={busyAction === "label"}>{labelDraft.id ? "Salvar classificação" : "Criar classificação"}</Btn>
          {labelDraft.id && <Btn v="ghost" onClick={() => setLabelDraft({ name: "", color: "#2e7d32" })}>Cancelar</Btn>}
        </div>
      </div>
      <div>
        <h4 className="msg-subtitle">Classificações existentes</h4>
        <PaginatedList
          items={labels}
          emptyText="Nenhuma classificação cadastrada."
          renderItem={label => (
            <div key={label.id} className="settings-row">
              <div><strong><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 99, background: label.color, marginRight: 8 }} />{label.name}</strong><div>Criado por {label.createdBy || "Sistema"}</div></div>
              <Btn v="secondary" sz="sm" onClick={() => setLabelDraft(label)}>Editar</Btn>
              <Btn v="danger" sz="sm" onClick={() => requestDelete(
                "Excluir classificação",
                `Tem certeza que deseja excluir a classificação ${label.name}?`,
                "Excluir",
                () => onDeleteLabel(label.id),
              )}>Remover</Btn>
            </div>
          )}
        />
      </div>
    </div>
  </section>
);
