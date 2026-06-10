import React from "react";
import { ExternalBasesEditorPanel } from "./ExternalBasesEditorPanel";
import { ExternalBasesListPanel } from "./ExternalBasesListPanel";

export const ExternalBasesPanel = ({
  externalBaseDraft,
  setExternalBaseDraft,
  submitExternalBase,
  submitExternalBaseSync,
  busyAction,
  externalBases,
  requestDelete,
  onDeleteExternalBase,
}) => (
  <section className="msg-card">
    <header className="msg-card__head">
      <h3 className="msg-card__title">Bases externas</h3>
      <p className="msg-card__hint">
        Listas sincronizadas de uma planilha para usar como opções em campos do formulário.
      </p>
    </header>
    <div className="msg-split">
      <div className="msg-form">
        <h4 className="msg-subtitle">{externalBaseDraft.id ? "Editar base externa" : "Nova base externa"}</h4>
        <ExternalBasesEditorPanel
          externalBaseDraft={externalBaseDraft}
          setExternalBaseDraft={setExternalBaseDraft}
          submitExternalBase={submitExternalBase}
          submitExternalBaseSync={submitExternalBaseSync}
          busyAction={busyAction}
        />
      </div>
      <div>
        <h4 className="msg-subtitle">Bases cadastradas</h4>
        <ExternalBasesListPanel
          externalBases={externalBases}
          requestDelete={requestDelete}
          onDeleteExternalBase={onDeleteExternalBase}
          setExternalBaseDraft={setExternalBaseDraft}
        />
      </div>
    </div>
  </section>
);
