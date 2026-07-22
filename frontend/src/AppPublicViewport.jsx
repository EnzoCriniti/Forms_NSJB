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
import { getShellActions, getShellData, getShellState } from "./lib/appShellObject";

const PublicRoot = ({ children }) => (
  <div className="app-root public-root" style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", minHeight: "100vh", background: COLORS.surfaceAlt, color: COLORS.text, padding: "24px 16px" }}>
    {children}
  </div>
);

export const AppPublicViewport = ({ app, onBack }) => {
  const state = getShellState(app);
  const data = getShellData(app);
  const actions = getShellActions(app);
  const {
    currentUser,
    publicEvent,
    publicForm,
    publicResultsEnabled,
    publicResultsView,
  } = state;
  const {
    responsesByForm,
    escalaByForm,
    people,
    labels,
    externalBases,
  } = data;
  const publicOnBack = currentUser ? onBack : null;
  const publicEventClosed = publicEvent?.status === "encerrado";
  const publicScaleReadOnly = publicForm?.type === "escala_organ" && (publicEventClosed || isFormClosedForPublic(publicForm));
  const publicPresenceClosed = publicForm?.type !== "escala_organ" && (publicEventClosed || isFormClosedForPublic(publicForm));

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
          publicView
        />
      </PublicRoot>
    );
  }

  return (
    <PublicRoot>
      {publicPresenceClosed
        ? <ClosedPublicScreen form={publicForm} onBack={publicOnBack} actionLabel={publicResultsEnabled ? "Ver resultados" : ""} actionHref={publicResultsEnabled ? buildPublicFormResultsPath(publicForm) : ""} title="Formulário fechado" message={publicResultsEnabled ? "Este formulário não está mais aceitando respostas, mas os resultados continuam disponíveis para consulta." : "Este formulário não está mais aceitando respostas."} />
        : publicForm.type === "escala_organ"
          ? <PublicEscalaScreen form={publicForm} onBack={publicOnBack} people={people} sections={escalaByForm[publicForm.id] || []} onSaveSections={sections => actions.handleSaveEscala(publicForm.id, sections)} onClaimSlot={(sectionIndex, slotIndex, person) => actions.handleClaimEscalaSlot(publicForm.id, sectionIndex, slotIndex, person)} readOnly={publicScaleReadOnly} readOnlyMessage={publicEventClosed ? "Evento encerrado. A escala esta disponivel apenas para consulta." : "Esta escala esta disponivel apenas para consulta."} />
          : <PublicFormScreen form={publicForm} responses={responsesByForm[publicForm.id] || []} onSaveResponse={actions.handleSaveResponse} onBack={publicOnBack} people={people} externalBases={externalBases} resultsHref={publicResultsEnabled ? buildPublicFormResultsPath(publicForm) : ""} />}
    </PublicRoot>
  );
};
