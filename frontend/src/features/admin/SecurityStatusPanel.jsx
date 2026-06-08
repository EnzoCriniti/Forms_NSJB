import React from "react";
import { COLORS, SurfacePanel } from "../../components/ui";

export const SecurityStatusPanel = ({ formDeleteKeyConfigured }) => (
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
);
