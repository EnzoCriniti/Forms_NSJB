/**
 * @file frontend/src/components/CreateFormLivePreview.jsx
 * @summary Pre-visualizacao do formulario completo em criacao.
 * @responsibility Mostrar ao editor como o formulario publico esta ficando.
 */

import React from "react";
import { COLORS, Icon } from "./ui";
import { getVisibleFields } from "../lib/forms";

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  fontSize: 13,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  background: COLORS.surface,
  color: COLORS.text,
};

const shellStyle = {
  background: COLORS.surface,
  border: `1px solid ${COLORS.borderLight}`,
  borderRadius: 16,
  overflow: "hidden",
};

const renderPresenceField = (field, people) => {
  const label = `${field.label}${field.required ? " *" : ""}`;

  if (field.type === "person_select") {
    return (
      <div key={field.id} style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.borderLight}` }}>
        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 10 }}>{label}</label>
        <select disabled style={{ ...inputStyle, color: COLORS.textMuted }}>
          <option>{people.length ? "Selecione seu nome..." : "Nenhuma pessoa carregada"}</option>
        </select>
      </div>
    );
  }

  if (field.type === "yes_no") {
    return (
      <div key={field.id} style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.borderLight}` }}>
        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 10 }}>{label}</label>
        <div style={{ display: "flex", gap: 10 }}>
          {["Sim", "Não"].map(option => (
            <button
              key={option}
              disabled
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "default",
                fontFamily: "inherit",
                border: `2px solid ${COLORS.borderLight}`,
                background: COLORS.surface,
                color: COLORS.textSecondary,
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div key={field.id} style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.borderLight}` }}>
        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 10 }}>{label}</label>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {[0, 1, 2, 3, 4, 5].map(option => (
            <button
              key={option}
              disabled
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "default",
                fontFamily: "inherit",
                border: `2px solid ${COLORS.borderLight}`,
                background: COLORS.surface,
                color: COLORS.textMuted,
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "grid") {
    const rows = field.gridRows || [];
    const cols = field.gridCols || [];
    return (
      <div key={field.id} style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.borderLight}` }}>
        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 10 }}>{label}</label>
        {rows.length === 0 || cols.length === 0 ? (
          <div style={{ fontSize: 12, color: COLORS.textMuted, fontStyle: "italic" }}>Adicione linhas e colunas para visualizar a matriz.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", paddingBottom: 8 }} />
                  {cols.map(col => <th key={col} style={{ textAlign: "center", paddingBottom: 8 }}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row}>
                    <td style={{ padding: "8px 0", fontWeight: 500 }}>{row}</td>
                    {cols.map(col => (
                      <td key={col} style={{ textAlign: "center" }}>
                        <input type="radio" disabled />
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
  }

  return (
    <div key={field.id} style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.borderLight}` }}>
      <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 10 }}>{label}</label>
      <input disabled placeholder="Digite sua resposta..." style={inputStyle} />
    </div>
  );
};

const ScalePreview = ({ title, description, scaleSections, scaleLimit }) => (
  <div style={shellStyle}>
    <div style={{ background: COLORS.primaryDark, padding: "18px 20px", color: "#fff" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.18)", fontSize: 11, fontWeight: 700, marginBottom: 10 }}>
        <Icon name="clipboard" size={12} />
        Escala da Organ
      </div>
      <h3 style={{ margin: 0, fontSize: 20, lineHeight: 1.15 }}>{title || "Nova escala"}</h3>
      <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.82)", fontSize: 13, lineHeight: 1.5 }}>
        {description || "A descrição da escala aparecerá aqui para orientar os participantes."}
      </p>
    </div>
    <div style={{ padding: 20 }}>
      <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 14 }}>
        Limite por pessoa: <strong style={{ color: COLORS.text }}>{scaleLimit}</strong>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {scaleSections.length === 0 ? (
          <div style={{ fontSize: 12, color: COLORS.textMuted }}>Adicione secoes para visualizar a escala montada.</div>
        ) : (
          scaleSections.map((section, index) => (
            <div key={`${section.title}-${index}`} style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{section.title || `Secao ${index + 1}`}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                <span style={{ fontSize: 12, color: COLORS.textSecondary }}>Responsaveis: {section.responsaveis || 0}</span>
                <span style={{ fontSize: 12, color: COLORS.textSecondary }}>Auxiliares: {section.auxiliares || 0}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

export const CreateFormLivePreview = ({
  format,
  title,
  description,
  closingText,
  fields = [],
  people = [],
  scaleSections = [],
  scaleLimit = 1,
}) => {
  const visibleFields = getVisibleFields({ fieldDefinitions: fields });

  if (format === "escala_organ") {
    return <ScalePreview title={title} description={description} scaleSections={scaleSections} scaleLimit={scaleLimit} />;
  }

  return (
    <div style={shellStyle}>
      <div style={{ background: COLORS.primaryDark, padding: "18px 20px", color: "#fff" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.18)", fontSize: 11, fontWeight: 700, marginBottom: 10 }}>
          <Icon name="eye" size={12} />
          Pré-visualização pública
        </div>
        <h3 style={{ margin: 0, fontSize: 20, lineHeight: 1.15 }}>{title || "Novo formulário"}</h3>
        <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.82)", fontSize: 13, lineHeight: 1.5 }}>
          {description || "A descrição do formulário aparecerá aqui para orientar o preenchimento."}
        </p>
      </div>
      <div style={{ background: COLORS.surface }}>
        {visibleFields.length === 0 ? (
          <div style={{ padding: 20, fontSize: 12, color: COLORS.textMuted }}>
            Nenhum campo visível adicionado ainda.
          </div>
        ) : (
          visibleFields.map(field => renderPresenceField(field, people))
        )}
        <div style={{ padding: "18px 20px 20px" }}>
          <button
            disabled
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 10,
              border: "none",
              background: COLORS.primary,
              color: "#fff",
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "default",
              opacity: 0.8,
            }}
          >
            Enviar resposta
          </button>
          <p style={{ fontSize: 11, color: COLORS.textMuted, margin: "8px 0 0", textAlign: "center" }}>
            {closingText || "Este formulário não está mais aceitando respostas."}
          </p>
        </div>
      </div>
    </div>
  );
};
