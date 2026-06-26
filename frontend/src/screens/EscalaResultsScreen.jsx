/**
 * @file frontend/src/screens/EscalaResultsScreen.jsx
 * @summary Tela de edição da escala da Organ (preencher/ajustar vagas).
 * @responsibility Não é uma tela de "resultados": é onde se gerencia quem faz
 * cada vaga. Mantém o nome do arquivo por compatibilidade com a rota "results".
 */

import React from "react";
import { ScreenHeader } from "../components/ui";
import { formatDate } from "../lib/forms";
import { EscalaResultsPanel } from "./EscalaResultsPanel";
import { useEscalaResultsController } from "./escalaResultsController";

export const EscalaResultsScreen = ({ people, user, form, sections, onSaveSections }) => {
  const panelProps = useEscalaResultsController({ people, user, form, sections, onSaveSections });
  const subtitle = form?.title
    ? `${form.title}${form.date ? ` · ${formatDate(form.date)}` : ""}`
    : "Preencha e ajuste quem faz cada vaga da escala da Organ.";

  return (
    <div>
      <ScreenHeader className="settings-top-card" title="Editar escala" subtitle={subtitle} titleSize={20} />
      <EscalaResultsPanel {...panelProps} />
    </div>
  );
};
