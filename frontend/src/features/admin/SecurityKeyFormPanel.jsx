import React from "react";
import { Btn, FeedbackBanner } from "../../components/ui";

export const SecurityKeyFormPanel = ({
  formDeleteKeyConfigured,
  securityDraft,
  setSecurityDraft,
  submitSecurity,
  busyAction,
  onCancelSecurity,
}) => (
  <>
    <FeedbackBanner
      tone={formDeleteKeyConfigured === null ? "loading" : "info"}
      message={formDeleteKeyConfigured === null
        ? "Carregando status da chave mestra..."
        : formDeleteKeyConfigured
          ? "A chave mestra está configurada. Para alterar, informe a chave atual e a nova chave."
          : "Nenhuma chave mestra configurada. Cadastre uma nova chave para liberar exclusões seguras."}
    />
    {formDeleteKeyConfigured && (
      <label className="msg-field">
        <span className="msg-label">Chave mestra atual</span>
        <input
          className="msg-input"
          type="password"
          value={securityDraft.currentMasterKey}
          onChange={e => setSecurityDraft({ ...securityDraft, currentMasterKey: e.target.value })}
          placeholder="Chave mestra atual"
        />
      </label>
    )}
    <label className="msg-field">
      <span className="msg-label">Nova chave mestra</span>
      <input
        className="msg-input"
        type="password"
        value={securityDraft.newMasterKey}
        onChange={e => setSecurityDraft({ ...securityDraft, newMasterKey: e.target.value })}
        placeholder="Nova chave mestra"
      />
    </label>
    <div className="msg-actions" style={{ flexWrap: "wrap" }}>
      <Btn
        onClick={submitSecurity}
        loading={busyAction === "security"}
        disabled={!securityDraft.newMasterKey.trim() || (formDeleteKeyConfigured && !securityDraft.currentMasterKey.trim())}
      >
        {formDeleteKeyConfigured ? "Salvar alteração" : "Cadastrar chave"}
      </Btn>
      {(securityDraft.currentMasterKey || securityDraft.newMasterKey) && <Btn v="ghost" onClick={onCancelSecurity}>Cancelar</Btn>}
    </div>
  </>
);
