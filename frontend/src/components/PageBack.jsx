/**
 * @file frontend/src/components/PageBack.jsx
 * @summary Botão "Voltar" padronizado no topo da tela.
 * @responsibility Posicionar o voltar acima do título (não dentro dele), de forma
 * consistente em todas as telas internas.
 */

import React from "react";
import { Icon } from "./uiIcons";

export const PageBack = ({ onBack, label = "Voltar" }) => (
  <div className="page-back-row">
    <button type="button" className="page-back" onClick={onBack} aria-label={label}>
      <Icon name="back" size={16} />
      <span>{label}</span>
    </button>
  </div>
);
