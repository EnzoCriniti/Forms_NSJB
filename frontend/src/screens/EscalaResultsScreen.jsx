/**
 * @file frontend/src/screens/EscalaResultsScreen.jsx
 * @summary Tela ponte dos resultados de escala.
 */

import React from "react";
import { EscalaResultsPanel } from "./EscalaResultsPanel";
import { useEscalaResultsController } from "./escalaResultsController";

export const EscalaResultsScreen = ({ people, user, form, sections, onSaveSections }) => {
  const panelProps = useEscalaResultsController({ people, user, form, sections, onSaveSections });

  return <EscalaResultsPanel {...panelProps} />;
};
