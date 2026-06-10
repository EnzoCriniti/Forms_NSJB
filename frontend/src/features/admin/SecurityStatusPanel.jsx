import React from "react";

export const SecurityStatusPanel = ({ formDeleteKeyConfigured }) => (
  <div className="msg-empty" style={{ textAlign: "left" }}>
    <div style={{ fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>
      {formDeleteKeyConfigured === null
        ? "Carregando..."
        : formDeleteKeyConfigured
          ? "Chave mestra configurada"
          : "Nenhuma chave mestra configurada"}
    </div>
    <div style={{ lineHeight: 1.55 }}>
      A exclusão de formulários exige validação no backend antes de remover respostas, response_values e escala associados.
    </div>
  </div>
);
