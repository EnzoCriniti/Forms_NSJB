import React from "react";
import { COLORS, Btn, Icon } from "../components/ui";
import { PublicScreenFrame, PublicScreenHeader, PublicScreenLayout } from "./publicScreenFrame";

export const PublicResponseSuccessPanel = ({ isInternal, form, onBack, resultsHref, readingControls, editing }) => (
  <PublicScreenLayout maxWidth={680}>
    {!isInternal && (
      <PublicScreenHeader
        isInternal={isInternal}
        form={form}
        onBack={onBack}
        actionLabel="Ver resultados"
        actionHref={resultsHref}
        readingControls={readingControls}
      />
    )}
    <PublicScreenFrame isInternal={isInternal} cardStyle={{ padding: "40px 24px", textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: COLORS.primary }}>
        <Icon name="check" size={28} />
      </div>
      <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>{editing ? "Resposta atualizada!" : "Resposta enviada!"}</h2>
      <p style={{ margin: 0, fontSize: 13, color: COLORS.textSecondary }}>
        {editing ? "Sua resposta anterior foi substituída com sucesso." : "Obrigado pelo preenchimento."} Se precisar alterar, acesse este mesmo link novamente.
      </p>
    </PublicScreenFrame>
  </PublicScreenLayout>
);

export const PublicResponseHeader = ({ isInternal, form, onBack, resultsHref, readingControls, subtitle }) => (
  <PublicScreenHeader
    isInternal={isInternal}
    form={form}
    onBack={onBack}
    titleFallback="Formulário"
    internalSubtitle={form.description || subtitle || "Preencha o formulário abaixo."}
    publicDescription={form.description || subtitle || "Preencha o formulário abaixo."}
    actionLabel={resultsHref ? "Ver resultados" : ""}
    actionHref={resultsHref}
    readingControls={readingControls}
  />
);

export const PublicResponseErrorPopup = ({ submitError, onClose }) => (
  submitError ? (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="public-response-error-title"
      aria-describedby="public-response-error-message"
      style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.42)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 140, padding: 16 }}
    >
      <div style={{ width: "min(380px, 100%)", background: COLORS.surface, border: `1px solid ${COLORS.danger}`, borderRadius: 14, boxShadow: "0 20px 50px rgba(15, 23, 42, 0.28)", padding: 22, textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: COLORS.dangerLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: COLORS.danger }}>
          <Icon name="warning" size={24} />
        </div>
        <h3 id="public-response-error-title" style={{ margin: "0 0 8px", fontSize: 17, color: COLORS.text }}>Revise o preenchimento</h3>
        <p id="public-response-error-message" style={{ margin: "0 0 18px", fontSize: 13, lineHeight: 1.5, color: COLORS.textSecondary }}>
          {submitError}
        </p>
        <Btn v="danger" onClick={onClose} style={{ minWidth: 120, justifyContent: "center" }}>Entendi</Btn>
      </div>
    </div>
  ) : null
);

export const PublicResponseEditingBanner = ({ editing }) => (
  editing ? <div style={{ background: COLORS.warningLight, border: `1px solid ${COLORS.warning}`, padding: "10px 24px", display: "flex", alignItems: "center", gap: 8 }}><Icon name="edit" size={14} /><span style={{ fontSize: 12, fontWeight: 600, color: "var(--on-warning)" }}>Modo de edição - atualizando resposta já enviada</span></div> : null
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

export const PublicResponseFieldPanel = ({
  field,
  value,
  isInternal,
  editing,
  colorTokens,
  validationSummary,
  personSelectNode,
  onTextChange,
  onYesNoChange,
  onNumberChange,
  onGridChange,
}) => (
  <div className="public-form-field" style={{ padding: "18px 24px", borderBottom: `1px solid ${COLORS.borderLight}` }}>
    <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 12 }}>{field.label}{field.required ? " *" : ""}</label>
    {validationSummary && <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: -6, marginBottom: 10 }}>{validationSummary}</div>}
    {personSelectNode}
    {field.type === "yes_no" && (
      <div style={{ display: "flex", gap: 10 }}>
        {["Sim", "Não"].map(option => (
          <button
            key={option}
            onClick={() => onYesNoChange(option)}
            style={{
              flex: 1,
              minHeight: 46,
              padding: "10px 16px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
              border: `1.5px solid ${value === option ? (option === "Sim" ? colorTokens.accent : colorTokens.danger) : COLORS.borderLight}`,
              background: value === option ? (option === "Sim" ? colorTokens.primaryLight : colorTokens.dangerLight) : COLORS.surface,
              color: value === option ? (option === "Sim" ? colorTokens.accent : colorTokens.danger) : COLORS.textSecondary,
            }}
          >
            {option}
          </button>
        ))}
      </div>
    )}
    {field.type === "number" && (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[0, 1, 2, 3, 4, 5].map(option => (
          <button
            key={option}
            onClick={() => onNumberChange(option)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              border: `1.5px solid ${value === option ? colorTokens.primary : COLORS.borderLight}`,
              background: value === option ? colorTokens.primaryLight : COLORS.surface,
              color: value === option ? colorTokens.primary : COLORS.textMuted,
            }}
          >
            {option}
          </button>
        ))}
      </div>
    )}
    {field.type === "text" && <input value={value} onChange={event => onTextChange(event.target.value)} placeholder="Digite sua resposta..." style={{ width: "100%", minHeight: 46, padding: "11px 13px", border: `1px solid ${COLORS.border}`, borderRadius: 12 }} />}
    {field.type === "grid" && (
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", paddingBottom: 8 }} />
              {(field.gridCols || []).map(col => <th key={col} style={{ textAlign: "center", paddingBottom: 8 }}>{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {(field.gridRows || []).map(row => (
              <tr key={row}>
                <td style={{ padding: "8px 0", fontWeight: 500 }}>{row}</td>
                {(field.gridCols || []).map(col => (
                  <td key={col} style={{ textAlign: "center" }}>
                    <input type="radio" checked={value?.[row] === col} onChange={() => onGridChange(row, col)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
