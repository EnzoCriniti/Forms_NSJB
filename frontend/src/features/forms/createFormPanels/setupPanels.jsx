/**
 * @file frontend/src/features/forms/createFormPanels/setupPanels.jsx
 * @summary Paineis iniciais reutilizaveis da tela de criacao de formulario.
 * @responsibility Conter o topo, a escolha de tipo, o modo estrutural e os dados basicos do formulario.
 */

import React from "react";
import { COLORS, Btn, Icon } from "../../../components/ui";
import { PageBack } from "../../../components/PageBack";

export const FormModePanel = ({ activeModeOption, formMode, membersFieldsCount, options, onSelectMode }) => (
  <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>Modo do formulario</div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>Escolha a estrutura antes de continuar montando os campos.</div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.primary, background: COLORS.primaryLight, borderRadius: 999, padding: "6px 10px" }}>
        {activeModeOption.badge}
      </div>
    </div>
    <div className="create-form-type-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
      {options.map(option => (
        <button
          key={option.id}
          onClick={() => onSelectMode(option.id)}
          style={{ textAlign: "left", padding: 14, borderRadius: 12, border: `2px solid ${formMode === option.id ? COLORS.primary : COLORS.borderLight}`, background: formMode === option.id ? COLORS.primaryLight : COLORS.surface, color: COLORS.text, cursor: "pointer", display: "grid", gap: 10 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <div>
              <strong style={{ fontSize: 14 }}>{option.title}</strong>
              <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.4 }}>{option.badge}</div>
            </div>
            {formMode === option.id && <Icon name="check" size={16} />}
          </div>
          <p style={{ margin: "7px 0 0", fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.45 }}>{option.desc}</p>
          <div style={{ display: "grid", gap: 5 }}>
            {option.bullets.map(item => (
              <div key={item} style={{ fontSize: 11, color: COLORS.textSecondary, display: "flex", alignItems: "center", gap: 6 }}>
                <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: 999, background: formMode === option.id ? COLORS.primary : COLORS.textMuted, flex: "0 0 auto" }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </button>
      ))}
    </div>
    <div style={{ marginTop: 12, borderRadius: 12, border: `1px solid ${COLORS.borderLight}`, background: COLORS.surfaceAlt, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.text }}>Modo ativo: {activeModeOption.title}</div>
          <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 3 }}>{activeModeOption.desc}</div>
        </div>
        <div style={{ fontSize: 11, color: COLORS.textMuted }}>
          {formMode === "nucleo" ? `${membersFieldsCount} campo(s) ligado(s) à base central` : "Base central desativada neste formulário"}
        </div>
      </div>
    </div>
  </div>
);

export const FormTypeSetupPanel = ({ format, onSelectFormat, onContinue }) => (
  <>
    <div className="create-form-start-card">
      <div style={{ fontSize: 11, fontWeight: 900, color: COLORS.primary, textTransform: "uppercase", letterSpacing: 0.6 }}>Etapa inicial</div>
      <h3 style={{ margin: "4px 0 4px", fontSize: 20, color: COLORS.text }}>Qual estrutura voce vai criar?</h3>
      <p style={{ margin: 0, fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.5 }}>
        A escolha define o editor correto e evita carregar configuracoes que nao pertencem ao tipo do formulario.
      </p>
    </div>

    <div className="create-form-type-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 14 }}>
      {[
        { id: "presenca", title: "Presença", desc: "Perguntas, acompanhantes, totalização e controle de envio." },
        { id: "escala_organ", title: "Escala da Organ", desc: "Planilha de tarefas com responsáveis e auxiliares." },
      ].map(option => (
        <button
          className="create-form-type-card"
          key={option.id}
          onClick={() => onSelectFormat(option.id)}
          style={{ textAlign: "left", padding: 16, borderRadius: 12, border: `2px solid ${format === option.id ? COLORS.primary : COLORS.borderLight}`, background: format === option.id ? COLORS.primaryLight : COLORS.surface, color: COLORS.text, cursor: "pointer" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <strong style={{ fontSize: 14 }}>{option.title}</strong>
            {format === option.id && <Icon name="check" size={16} />}
          </div>
          <p style={{ margin: "7px 0 0", fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.45 }}>{option.desc}</p>
        </button>
      ))}
    </div>

    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
      <Btn icon="check" onClick={onContinue}>Continuar para o editor</Btn>
    </div>
  </>
);

export const FormHeaderPanel = ({ onBack, title, subtitle }) => (
  <>
    <PageBack onBack={onBack} />
    <div className="create-form-header create-form-mobile-hero" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
      <div className="create-form-mobile-hero__swatch" aria-hidden="true" />
      <div>
        <h2 style={{ margin: 0, fontSize: 22 }}>{title}</h2>
        <p style={{ margin: "2px 0 0", fontSize: 13, color: COLORS.textMuted }}>{subtitle}</p>
      </div>
    </div>
  </>
);

export const FormContextPanel = ({ title, body, footer }) => (
  <section className="msg-card" style={{ marginBottom: 14 }}>
    <div className="msg-label" style={{ marginBottom: 4 }}>{title}</div>
    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>{body}</div>
    <div className="msg-hint" style={{ marginTop: 4 }}>{footer}</div>
  </section>
);

export const FormBasicsPanel = ({
  format,
  inp,
  formTitle,
  shouldPresetTitle,
  onTitleChange,
  previewDescription,
  onDescriptionChange,
  eventDate,
  onEventDateChange,
  closingDate,
  onClosingDateChange,
  status,
  onStatusChange,
  linkedPeopleField,
  peopleCount,
  onTotalExpectedChange,
  totalExpected,
  formMode,
  closingText,
  onClosingTextChange,
  labels,
  selectedLabels,
  onToggleLabel,
  peopleConfigLabel,
}) => (
  <section className="msg-card" style={{ marginBottom: 20 }}>
    <header className="msg-card__head">
      <h3 className="msg-card__title">Dados do formulário</h3>
      <p className="msg-card__hint">Informações principais que aparecem no link público.</p>
    </header>
    <div className="msg-form">
      <label className="msg-field">
        <span className="msg-label">Título <span style={{ color: COLORS.danger }}>*</span></span>
        <input
          className="msg-input"
          value={formTitle}
          onChange={onTitleChange}
          readOnly={shouldPresetTitle}
          placeholder={shouldPresetTitle ? "Título padronizado pelo evento" : "Ex: Presença Sessão de Escala - 02/05/2026"}
          aria-readonly={shouldPresetTitle}
          style={shouldPresetTitle ? { background: "var(--surface-alt)", cursor: "not-allowed" } : undefined}
        />
        <span className="msg-hint">
          {shouldPresetTitle
            ? "O nome deste formulário é padronizado pelo evento."
            : "O nome pode ser editado nesta tela."}
        </span>
      </label>
      <label className="msg-field">
        <span className="msg-label">Descrição / Instruções</span>
        <textarea className="msg-input" value={previewDescription} onChange={onDescriptionChange} rows={3} placeholder="Prezada Irmandade..." />
      </label>
      <div className="create-form-meta-grid-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr minmax(130px, 0.7fr) minmax(220px, 1.3fr)", gap: 14, alignItems: "start" }}>
        <label className="msg-field">
          <span className="msg-label">Abertura programada</span>
          <input className="msg-input" type="date" value={eventDate} onChange={onEventDateChange} />
          <span className="msg-hint">O formulário vai para aberto automaticamente nesta data.</span>
        </label>
        <label className="msg-field">
          <span className="msg-label">Fechamento automático</span>
          <input className="msg-input" type="datetime-local" value={closingDate} onChange={onClosingDateChange} />
          <span className="msg-hint">Quando chegar este horário, o formulário fecha sozinho.</span>
        </label>
        <label className="msg-field">
          <span className="msg-label">Status</span>
          <select className="msg-input" value={status} onChange={onStatusChange}>
            <option value="rascunho">Rascunho</option>
            <option value="aberto">Aberto</option>
            <option value="fechado">Fechado</option>
            <option value="arquivado">Arquivado</option>
          </select>
        </label>
        <label className="msg-field">
          <span className="msg-label">Texto de fechamento</span>
          <input className="msg-input" value={closingText} onChange={onClosingTextChange} />
        </label>
      </div>
      {format !== "escala_organ" && (
      <div className="create-form-meta-grid-1" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
        <label className="msg-field">
          <span className="msg-label">Total esperado</span>
          <input
            className="msg-input"
            type="number"
            min="0"
            value={linkedPeopleField ? totalExpected : ""}
            onChange={onTotalExpectedChange}
            placeholder={linkedPeopleField ? String(peopleCount || "") : "Disponível apenas com campo de pessoa vinculada"}
            disabled={!linkedPeopleField}
            style={{ opacity: linkedPeopleField ? 1 : 0.7 }}
          />
          <span className="msg-hint">{linkedPeopleField
            ? `Se deixar em branco, o total será assumido pela base carregada (${peopleCount} pessoas).`
            : formMode === "geral"
              ? "Formulário geral não usa a base central, então o sistema não controla faltantes esperados."
              : "Sem vínculo com a base completa, o sistema não controla faltantes esperados."}</span>
        </label>
      </div>
      )}
      <label className="msg-field">
        <span className="msg-label">Classificações</span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {labels.map(label => (
            <button key={label.id} onClick={() => onToggleLabel(label.id)} style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, border: "2px solid", cursor: "pointer", transition: "all 0.15s", borderColor: selectedLabels.includes(label.id) ? label.color : COLORS.borderLight, background: selectedLabels.includes(label.id) ? label.color : "transparent", color: selectedLabels.includes(label.id) ? "#fff" : label.color }}>{label.name}</button>
          ))}
        </div>
      </label>
      <div className="create-form-people-bar" style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name="user" size={14} />
        <span style={{ fontSize: 12, color: COLORS.textMuted }}>
          <strong style={{ color: COLORS.text }}>{peopleCount} pessoas</strong> carregadas. {peopleConfigLabel}
        </span>
      </div>
    </div>
  </section>
);
