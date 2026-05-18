/**
 * @file frontend/src/features/admin/adminSecurityPanels.jsx
 * @summary Painel compartilhado da seguranca administrativa.
 * @responsibility Conter a UI da chave mestra fora do modal principal.
 */

import React from "react";
import { Btn, COLORS, FeedbackBanner, FieldControl, SplitSection, SurfacePanel } from "../../components/ui";

const inputStyle = {
  width: "100%",
  minHeight: 42,
  padding: "10px 12px",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 10,
  background: COLORS.surface,
  color: COLORS.text,
  boxShadow: "var(--shadow-sm)",
};

export const SecurityPanel = ({
  formDeleteKeyConfigured,
  securityDraft,
  setSecurityDraft,
  submitSecurity,
  busyAction,
  onCancelSecurity,
}) => (
  <SplitSection
    leftTitle={formDeleteKeyConfigured ? "Alterar chave mestra" : "Cadastrar chave mestra"}
    rightTitle="Status da seguranca"
    left={(
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
              style={inputStyle}
            />
          </FieldControl>
        )}
        <FieldControl label="Nova chave mestra">
          <input
            type="password"
            value={securityDraft.newMasterKey}
            onChange={e => setSecurityDraft({ ...securityDraft, newMasterKey: e.target.value })}
            placeholder="Nova chave mestra"
            style={inputStyle}
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
    )}
    right={(
      <SurfacePanel background={COLORS.surfaceAlt} border={COLORS.borderLight} radius={8} padding={12} style={{ fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.55 }}>
        <div style={{ fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>
          {formDeleteKeyConfigured === null
            ? "Carregando..."
            : formDeleteKeyConfigured
              ? "Chave mestra configurada"
              : "Nenhuma chave mestra configurada"}
        </div>
        <div>A exclusao de formularios exige validacao no backend antes de remover respostas, response_values e escala associados.</div>
      </SurfacePanel>
    )}
  />
);
