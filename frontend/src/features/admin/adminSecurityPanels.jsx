/**
 * @file frontend/src/features/admin/adminSecurityPanels.jsx
 * @summary Painel compartilhado da seguranca administrativa.
 * @responsibility Conter a UI da chave mestra fora do modal principal.
 */

import React from "react";
import { SecurityKeyFormPanel } from "./SecurityKeyFormPanel";
import { SecurityStatusPanel } from "./SecurityStatusPanel";

export const SecurityPanel = ({
  formDeleteKeyConfigured,
  securityDraft,
  setSecurityDraft,
  submitSecurity,
  busyAction,
  onCancelSecurity,
}) => (
  <section className="msg-card">
    <header className="msg-card__head">
      <h3 className="msg-card__title">Exclusão segura</h3>
      <p className="msg-card__hint">
        Defina a chave mestra exigida para excluir formulários e os dados associados.
      </p>
    </header>
    <div className="msg-split">
      <div className="msg-form">
        <h4 className="msg-subtitle">{formDeleteKeyConfigured ? "Alterar chave mestra" : "Cadastrar chave mestra"}</h4>
        <SecurityKeyFormPanel
          formDeleteKeyConfigured={formDeleteKeyConfigured}
          securityDraft={securityDraft}
          setSecurityDraft={setSecurityDraft}
          submitSecurity={submitSecurity}
          busyAction={busyAction}
          onCancelSecurity={onCancelSecurity}
        />
      </div>
      <div>
        <h4 className="msg-subtitle">Status da segurança</h4>
        <SecurityStatusPanel formDeleteKeyConfigured={formDeleteKeyConfigured} />
      </div>
    </div>
  </section>
);
