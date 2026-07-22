/**
 * @file frontend/src/screens/PresenceResultsScreen.jsx
 * @summary Controller da planilha de resultados de presenca.
 */

import React from "react";
import { PresenceResultsPanel } from "./PresenceResultsPanel";
import { usePresenceResultsController } from "./presenceResultsController";

export const PresenceResultsScreen = ({ responses, form, people, publicFormHref, readingControls, publicView = false }) => {
  const panelProps = usePresenceResultsController({ responses, form, people, publicView });

  return (
    <PresenceResultsPanel
      publicFormHref={publicFormHref}
      readingControls={readingControls}
      publicView={publicView}
      formTitle={form?.title}
      {...panelProps}
    />
  );
};
