/**
 * @file frontend/src/screens/ResultsScreen.jsx
 * @summary Tela de resultados.
 * @responsibility Escolher entre resultados de presenca e escala.
 */

import React from "react";
import { EscalaResultsScreen } from "./EscalaResultsScreen";
import { PresenceResultsScreen } from "./PresenceResultsScreen";

export const ResultsScreen = ({ responses, form, sections, people, user, onSaveSections, publicFormHref, readingControls }) => (
  form?.type === "escala_organ"
    ? <EscalaResultsScreen people={people} user={user} form={form} sections={sections} onSaveSections={onSaveSections} />
    : <PresenceResultsScreen responses={responses} form={form} people={people} publicFormHref={publicFormHref} readingControls={readingControls} />
);
