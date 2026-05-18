import React from "react";
import { COLORS, Btn, FeedbackBanner, Icon, PublicTopCompact, ScreenHeader } from "../components/ui";

export const PublicResponseSuccessPanel = ({ isInternal, form, onBack, resultsHref, readingControls, editing }) => (
  <div style={{ maxWidth: 680, margin: "0 auto" }}>
    {!isInternal && <PublicTopCompact form={form} onBack={onBack} actionLabel="Resultados" actionHref={resultsHref} readingControls={readingControls} />}
    <div className={isInternal ? "internal-response-card" : "public-response-card"} style={{ background: COLORS.surface, borderRadius: isInternal ? 12 : "0 0 16px 16px", border: `1px solid ${COLORS.borderLight}`, borderTop: isInternal ? `1px solid ${COLORS.borderLight}` : "none", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: COLORS.primary }}>
        <Icon name="check" size={28} />
      </div>
      <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>{editing ? "Resposta atualizada!" : "Resposta enviada!"}</h2>
      <p style={{ margin: 0, fontSize: 13, color: COLORS.textSecondary }}>
        {editing ? "Sua resposta anterior foi substituída com sucesso." : "Obrigado pelo preenchimento."} Se precisar alterar, acesse este mesmo link novamente.
      </p>
    </div>
  </div>
);

export const PublicResponseHeader = ({ isInternal, form, onBack, resultsHref, readingControls, subtitle }) => (
  <>
    {isInternal ? (
      <ScreenHeader
        className="internal-response-header"
        title={form?.title || "Formulario"}
        subtitle={form.description || subtitle || "Preencha o formulario abaixo."}
        titleStyle={{ color: COLORS.text }}
        subtitleStyle={{ color: COLORS.textMuted }}
        marginBottom={14}
      />
    ) : (
      <PublicTopCompact form={form} onBack={onBack} description={form.description || subtitle || "Preencha o formulário abaixo."} actionLabel={resultsHref ? "Resultados" : ""} actionHref={resultsHref} readingControls={readingControls} />
    )}
  </>
);

export const PublicResponseErrorBanner = ({ submitError }) => (
  submitError ? <div style={{ padding: "10px 24px 0" }}><FeedbackBanner tone="error" message={submitError} /></div> : null
);

export const PublicResponseEditingBanner = ({ editing }) => (
  editing ? <div style={{ background: COLORS.warningLight, border: `1px solid ${COLORS.warning}`, padding: "10px 24px", display: "flex", alignItems: "center", gap: 8 }}><Icon name="edit" size={14} /><span style={{ fontSize: 12, fontWeight: 600, color: "#b86e00" }}>Modo de edição - atualizando resposta já enviada</span></div> : null
);

export const PublicResponseEditModal = ({ selectedPerson, onCancel, onConfirm }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
    <div style={{ background: COLORS.surface, borderRadius: 16, padding: 24, width: 400, maxWidth: "90vw", textAlign: "center" }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", background: COLORS.warningLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: COLORS.warning }}>
        <Icon name="warning" size={24} />
      </div>
      <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>Resposta já enviada</h3>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.5 }}>
        Já existe uma resposta registrada para <strong>{selectedPerson?.display}</strong>. Deseja editar a resposta anterior? Os dados atuais serão carregados.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <Btn v="secondary" onClick={onCancel}>Cancelar</Btn>
        <Btn v="warning" icon="edit" onClick={onConfirm}>Editar Resposta</Btn>
      </div>
    </div>
  </div>
);
