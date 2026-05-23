/**
 * @file frontend/src/AppPublicViewport.jsx
 * @summary Renderizacao das rotas publicas do app.
 * @responsibility Montar formularios, escalas e resultados publicos fora do gate principal.
 */

import React from "react";
import { COLORS } from "./components/ui";
import { ClosedPublicScreen } from "./components/publicUi";
import { ResultsScreen } from "./screens/ResultsScreen";
import { PublicFormScreen } from "./screens/PublicFormScreen";
import { PublicEscalaScreen } from "./screens/PublicEscalaScreen";
import { isFormClosedForPublic } from "./lib/forms";
import { buildPublicFormPath, buildPublicFormResultsPath } from "./lib/appPublicRoutes";

const PublicRoot = ({ children }) => (
  <div className="app-root public-root" style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", minHeight: "100vh", background: COLORS.surfaceAlt, color: COLORS.text, padding: "24px 16px" }}>
    {children}
  </div>
);

export const AppPublicViewport = ({ app, onBack }) => {
  const {
    currentUser,
    publicForm,
    publicResultsEnabled,
    publicResultsView,
    responsesByForm,
    escalaByForm,
    people,
    labels,
    externalBases,
  } = app;
  const publicOnBack = currentUser ? onBack : null;

  if (publicResultsView) {
    if (!publicResultsEnabled) {
      return (
        <PublicRoot>
          <ClosedPublicScreen
            form={publicForm}
            onBack={publicOnBack}
            title="Resultados públicos indisponíveis"
            message="Este formulário não está configurado para exibir resultados publicamente."
          />
        </PublicRoot>
      );
    }
    return (
      <PublicRoot>
        <ResultsScreen
          onNavigate={publicOnBack}
          form={publicForm}
          responses={responsesByForm[publicForm.id] || []}
          sections={escalaByForm[publicForm.id] || []}
          people={people}
          user={null}
          labels={labels}
          onSaveSections={() => {}}
          publicFormHref={buildPublicFormPath(publicForm)}
        />
      </PublicRoot>
    );
  }

  return (
    <PublicRoot>
      {isFormClosedForPublic(publicForm)
        ? <ClosedPublicScreen form={publicForm} onBack={publicOnBack} actionLabel={publicResultsEnabled ? "Resultados" : ""} actionHref={publicResultsEnabled ? buildPublicFormResultsPath(publicForm) : ""} title="Formulário fechado" message={publicResultsEnabled ? undefined : "Este formulário não está mais aceitando respostas."} />
        : publicForm.type === "escala_organ"
          ? <PublicEscalaScreen form={publicForm} onBack={publicOnBack} people={people} sections={escalaByForm[publicForm.id] || []} onSaveSections={sections => app.handleSaveEscala(publicForm.id, sections)} onClaimSlot={(sectionIndex, slotIndex, person) => app.handleClaimEscalaSlot(publicForm.id, sectionIndex, slotIndex, person)} />
          : <PublicFormScreen form={publicForm} responses={responsesByForm[publicForm.id] || []} onSaveResponse={app.handleSaveResponse} onBack={publicOnBack} people={people} externalBases={externalBases} resultsHref={publicResultsEnabled ? buildPublicFormResultsPath(publicForm) : ""} />}
    </PublicRoot>
  );
};
