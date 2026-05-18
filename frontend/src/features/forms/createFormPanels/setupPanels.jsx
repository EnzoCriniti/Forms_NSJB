/**
 * @file frontend/src/features/forms/createFormPanels/setupPanels.jsx
 * @summary Paineis iniciais reutilizaveis da tela de criacao de formulario.
 * @responsibility Conter o topo, a escolha de tipo, o modo estrutural e os dados basicos do formulario.
 */

import React from "react";
import { COLORS, Btn, Icon, FieldControl, SurfacePanel } from "../../../components/ui";

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
          {formMode === "nucleo" ? `${membersFieldsCount} campo(s) ligado(s) a base central` : "Base central desativada neste formulario"}
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
        { id: "presenca", title: "Presenca", desc: "Perguntas, acompanhantes, totalizacao e controle de envio." },
        { id: "escala_organ", title: "Escala da Organ", desc: "Planilha de tarefas com responsaveis e auxiliares." },
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
  <div className="create-form-header create-form-mobile-hero" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
    <Btn v="ghost" icon="back" onClick={onBack} aria-label="Voltar" />
    <div className="create-form-mobile-hero__swatch" aria-hidden="true" />
    <div>
      <h2 style={{ margin: 0, fontSize: 22 }}>{title}</h2>
      <p style={{ margin: "2px 0 0", fontSize: 13, color: COLORS.textMuted }}>{subtitle}</p>
    </div>
  </div>
);

export const FormContextPanel = ({ title, body, footer }) => (
  <SurfacePanel style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 4 }}>{title}</div>
    <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.text }}>{body}</div>
    <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>{footer}</div>
  </SurfacePanel>
);

export const FormBasicsPanel = ({
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
  <>
    <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
        <FieldControl label="Titulo" required>
          <input
            value={formTitle}
            onChange={onTitleChange}
            readOnly={shouldPresetTitle}
            placeholder={shouldPresetTitle ? "Titulo padronizado pelo evento" : "Ex: Presenca Sessao de Escala - 02/05/2026"}
            aria-readonly={shouldPresetTitle}
            style={{
              ...inp,
              fontSize: 14,
              background: shouldPresetTitle ? COLORS.surfaceAlt : COLORS.surface,
              cursor: shouldPresetTitle ? "not-allowed" : "text",
            }}
          />
          <div style={{ fontSize: 11, color: COLORS.textMuted }}>
            {shouldPresetTitle
              ? "O nome deste formulario e padronizado pelo evento."
              : "O nome pode ser editado nesta tela."}
          </div>
        </FieldControl>
      </div>
      <FieldControl label="Descricao / Instrucoes">
        <textarea value={previewDescription} onChange={onDescriptionChange} rows={3} placeholder="Prezada Irmandade..." style={{ ...inp, resize: "vertical" }} />
      </FieldControl>
      <div className="create-form-meta-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <FieldControl label="Abertura programada" hint="O formulario vai para aberto automaticamente nesta data.">
          <input type="date" value={eventDate} onChange={onEventDateChange} style={inp} />
        </FieldControl>
        <FieldControl label="Fechamento automatico" hint="Quando chegar este horario, o formulario fecha sozinho.">
          <input type="datetime-local" value={closingDate} onChange={onClosingDateChange} style={inp} />
        </FieldControl>
        <FieldControl label="Status">
          <select value={status} onChange={onStatusChange} style={inp}>
            <option value="rascunho">Rascunho</option>
            <option value="aberto">Aberto</option>
            <option value="fechado">Fechado</option>
            <option value="arquivado">Arquivado</option>
          </select>
        </FieldControl>
      </div>
      <div className="create-form-meta-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FieldControl label="Total esperado" hint={linkedPeopleField
          ? `Se deixar em branco, o total sera assumido pela base carregada (${peopleCount} pessoas).`
          : formMode === "geral"
            ? "Formulario geral nao usa a base central, entao o sistema nao controla faltantes esperados."
            : "Sem vinculo com a base completa, o sistema nao controla faltantes esperados."}>
          <input
            type="number"
            min="0"
            value={linkedPeopleField ? totalExpected : ""}
            onChange={onTotalExpectedChange}
            placeholder={linkedPeopleField ? String(peopleCount || "") : "Disponivel apenas com campo de pessoa vinculada"}
            disabled={!linkedPeopleField}
            style={{ ...inp, opacity: linkedPeopleField ? 1 : 0.7 }}
          />
        </FieldControl>
        <FieldControl label="Texto de fechamento">
          <input value={closingText} onChange={onClosingTextChange} style={inp} />
        </FieldControl>
      </div>
    </div>

    <FieldControl label="Classificacoes" style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {labels.map(label => (
          <button key={label.id} onClick={() => onToggleLabel(label.id)} style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, border: "2px solid", cursor: "pointer", transition: "all 0.15s", borderColor: selectedLabels.includes(label.id) ? label.color : COLORS.borderLight, background: selectedLabels.includes(label.id) ? label.color : "transparent", color: selectedLabels.includes(label.id) ? "#fff" : label.color }}>{label.name}</button>
        ))}
      </div>
    </FieldControl>

    <div className="create-form-people-bar" style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 10, padding: "10px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
      <Icon name="user" size={14} />
      <span style={{ fontSize: 12, color: COLORS.textMuted }}>
        <strong style={{ color: COLORS.text }}>{peopleCount} pessoas</strong> carregadas. {peopleConfigLabel}
      </span>
    </div>
  </>
);
