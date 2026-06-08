import React from "react";
import { Btn, FieldControl, FeedbackBanner } from "../../components/ui";
import { ADMIN_INPUT_STYLE } from "./adminSettingsConstants";

export const SecurityKeyFormPanel = ({
  formDeleteKeyConfigured,
  securityDraft,
  setSecurityDraft,
  submitSecurity,
  busyAction,
  onCancelSecurity,
}) => (
  <div style={{ display: "grid", gap: 10 }}>
    <FeedbackBanner
      tone={formDeleteKeyConfigured === null ? "loading" : "info"}
      message={formDeleteKeyConfigured === null
        ? "Carregando status da chave mestra..."
        : formDeleteKeyConfigured
          ? "A chave mestra esta configurada. Para alterar, informe a chave atual e a nova chave."
          : "Nenhuma chave mestra configurada. Cadastre uma nova chave para liberar exclusoes seguras."}
    />
    {formDeleteKeyConfigured && (
      <FieldControl label="Chave mestra atual">
        <input
          type="password"
          value={securityDraft.currentMasterKey}
          onChange={e => setSecurityDraft({ ...securityDraft, currentMasterKey: e.target.value })}
          placeholder="Chave mestra atual"
          style={ADMIN_INPUT_STYLE}
        />
      </FieldControl>
    )}
    <FieldControl label="Nova chave mestra">
      <input
        type="password"
        value={securityDraft.newMasterKey}
        onChange={e => setSecurityDraft({ ...securityDraft, newMasterKey: e.target.value })}
        placeholder="Nova chave mestra"
        style={ADMIN_INPUT_STYLE}
      />
    </FieldControl>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Btn
        onClick={submitSecurity}
        loading={busyAction === "security"}
        disabled={!securityDraft.newMasterKey.trim() || (formDeleteKeyConfigured && !securityDraft.currentMasterKey.trim())}
      >
        {formDeleteKeyConfigured ? "Salvar alteracao" : "Cadastrar chave"}
      </Btn>
      {(securityDraft.currentMasterKey || securityDraft.newMasterKey) && <Btn v="ghost" onClick={onCancelSecurity}>Cancelar</Btn>}
    </div>
  </div>
);
