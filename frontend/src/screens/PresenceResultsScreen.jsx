/**
 * @file frontend/src/screens/PresenceResultsScreen.jsx
 * @summary Controller da planilha de resultados de presenca.
 */

import React from "react";
import { PresenceResultsPanel } from "./PresenceResultsPanel";
import { usePresenceResultsController } from "./presenceResultsController";

export const PresenceResultsScreen = ({ responses, form, people, publicFormHref, readingControls }) => {
  const panelProps = usePresenceResultsController({ responses, form, people });

  return (
    <PresenceResultsPanel
      publicFormHref={publicFormHref}
      readingControls={readingControls}
      {...panelProps}
    />
  );
};
