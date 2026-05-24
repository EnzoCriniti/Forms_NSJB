/**
 * @file frontend/src/AppShellFormFlows.jsx
 * @summary Adapters dos fluxos internos de formulario no shell autenticado.
 * @responsibility Montar resultados e resposta interna sem inflar AppShellContent.
 */

import React from "react";
import { buildPublicFormResultsPath } from "./lib/appPublicRoutes";
import { selectFormResponses, selectFormSections } from "./lib/appShellContentSelectors";
import { ResultsScreen } from "./screens/ResultsScreen";
import { PublicFormScreen } from "./screens/PublicFormScreen";
import { PublicEscalaScreen } from "./screens/PublicEscalaScreen";

export const InternalResultsFlow = ({
  app,
  activeForm,
  currentUser,
  labels,
  people,
  onNavigate,
  onSaveEscala,
}) => {
  if (!activeForm) return null;

  return (
    <ResultsScreen
      onNavigate={onNavigate}
      form={activeForm}
      responses={selectFormResponses(app.responsesByForm, activeForm.id)}
      sections={selectFormSections(app.escalaByForm, activeForm.id)}
      people={people}
      user={currentUser}
      labels={labels}
      onSaveSections={sections => onSaveEscala(activeForm.id, sections)}
    />
  );
};

export const InternalRespondFlow = ({
  app,
  activeForm,
  externalBases,
  people,
  onClaimEscalaSlot,
  onNavigate,
  onSaveEscala,
}) => {
  if (!activeForm) return null;

  if (activeForm.type === "presenca") {
    return (
      <PublicFormScreen
        form={activeForm}
        responses={selectFormResponses(app.responsesByForm, activeForm.id)}
        onSaveResponse={app.handleSaveResponse}
        onBack={() => onNavigate("list")}
        people={people}
        externalBases={externalBases}
        resultsHref={activeForm.resultsConfig?.publicResultsEnabled ? buildPublicFormResultsPath(activeForm) : ""}
        variant="internal"
      />
    );
  }

  if (activeForm.type === "escala_organ") {
    return (
      <PublicEscalaScreen
        form={activeForm}
        onBack={() => onNavigate("list")}
        people={people}
        sections={selectFormSections(app.escalaByForm, activeForm.id)}
        onSaveSections={sections => onSaveEscala(activeForm.id, sections)}
        onClaimSlot={(sectionIndex, slotIndex, person) => onClaimEscalaSlot(activeForm.id, sectionIndex, slotIndex, person)}
        variant="internal"
      />
    );
  }

  return null;
};
