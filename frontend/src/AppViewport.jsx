/**
 * @file frontend/src/AppViewport.jsx
 * @summary Orquestra os estados de alto nivel do app.
 * @responsibility Renderizar loading, erro, login, rotas publicas e o shell autenticado.
 */

import React from "react";
import { COLORS } from "./components/ui";
import { ClosedPublicScreen } from "./components/publicUi";
import { AppStatusScreen } from "./components/AppStatusScreen";
import { AuthPanel } from "./features/auth/AuthPanel";
import { ResultsScreen } from "./screens/ResultsScreen";
import { PublicFormScreen } from "./screens/PublicFormScreen";
import { PublicEscalaScreen } from "./screens/PublicEscalaScreen";
import { AppShellContent } from "./AppShellContent";
import { isFormClosedForPublic } from "./lib/forms";
import { resolveAppViewportTargetState } from "./lib/appDetailTarget";
import { buildPublicFormPath, buildPublicFormResultsPath } from "./lib/appPublicRoutes";

const PublicRoot = ({ children }) => (
  <div className="app-root public-root" style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", minHeight: "100vh", background: COLORS.surfaceAlt, color: COLORS.text, padding: "24px 16px" }}>
    {children}
  </div>
);

export const AppViewport = ({
  app,
  loading,
  error,
  refreshBootstrap,
  login,
  logout,
  theme,
  fontScale,
  increaseFontScale,
  decreaseFontScale,
  setTheme,
  setScreen,
  setPublicRoute,
  setActiveMessageId,
}) => {
  const {
    currentUser,
    publicForm,
    publicRoute,
    publicResultsEnabled,
    publicResultsView,
    responsesByForm,
    escalaByForm,
    people,
    labels,
    externalBases,
    activeForm,
    activeEvent,
    activeMessageId,
    screen,
    nav,
  } = app;

  const backToPanel = () => {
    if (window.location.pathname.startsWith("/formularios/")) {
      window.history.pushState(null, "", "/");
    }
    window.location.hash = "";
    setPublicRoute(null);
    setScreen(currentUser?.id ? "events" : "list");
  };

  if (loading) {
    return <AppStatusScreen loading tone="loading" message="Carregando aplicaÃ§Ã£o..." />;
  }

  if (error) {
    return <AppStatusScreen tone="error" title="Erro ao iniciar" message={error} actionLabel="Tentar novamente" onAction={() => refreshBootstrap({ preserveSelection: false })} />;
  }

  const { waitingForTarget } = resolveAppViewportTargetState({
    publicForm,
    publicResultsView,
    screen,
    activeForm,
    responsesByForm,
    escalaByForm,
  });
  if (waitingForTarget) {
    return <AppStatusScreen loading tone="loading" message="Carregando dados do formulario..." />;
  }

  if (publicForm && publicResultsView) {
    if (!publicResultsEnabled) {
      return (
        <PublicRoot>
          <ClosedPublicScreen
            form={publicForm}
            onBack={currentUser ? backToPanel : null}
            title="Resultados públicos indisponíveis"
            message="Este formulário não está configurado para exibir resultados publicamente."
          />
        </PublicRoot>
      );
    }
    return (
      <PublicRoot>
        <ResultsScreen
          onNavigate={currentUser ? backToPanel : null}
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

  if (publicForm) {
    const publicOnBack = currentUser ? backToPanel : null;
    return (
      <PublicRoot>
        {isFormClosedForPublic(publicForm)
          ? <ClosedPublicScreen form={publicForm} onBack={publicOnBack} actionLabel={publicResultsEnabled ? "Resultados" : ""} actionHref={publicResultsEnabled ? buildPublicFormResultsPath(publicForm) : ""} title={publicResultsEnabled ? "Formulário fechado" : "Formulário fechado"} message={publicResultsEnabled ? undefined : "Este formulário não está mais aceitando respostas."} />
          : publicForm.type === "escala_organ"
            ? <PublicEscalaScreen form={publicForm} onBack={publicOnBack} people={people} sections={escalaByForm[publicForm.id] || []} onSaveSections={sections => app.handleSaveEscala(publicForm.id, sections)} onClaimSlot={(sectionIndex, slotIndex, person) => app.handleClaimEscalaSlot(publicForm.id, sectionIndex, slotIndex, person)} />
            : <PublicFormScreen form={publicForm} responses={responsesByForm[publicForm.id] || []} onSaveResponse={app.handleSaveResponse} onBack={publicOnBack} people={people} externalBases={externalBases} resultsHref={publicResultsEnabled ? buildPublicFormResultsPath(publicForm) : ""} />}
      </PublicRoot>
    );
  }

  if (!currentUser) {
    return (
      <AppStatusScreen width={480} tone="info">
        <div className="login-screen">
          <div className="login-screen__header" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.primary, fontWeight: 800 }}>NF</div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20 }}>Acesso restrito</h2>
              <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 13 }}>Entre com sua conta para acessar a página inicial e os formulários internos.</p>
            </div>
          </div>
          <AuthPanel
            user={null}
            onLogin={login}
            onLogout={logout}
            theme={theme}
            fontScale={fontScale}
            onIncreaseTextSize={increaseFontScale}
            onDecreaseTextSize={decreaseFontScale}
            onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
            onOpenSettings={() => app.onNavigate("settings")}
            variant="sheet"
          />
        </div>
      </AppStatusScreen>
    );
  }

  return <AppShellContent app={app} />;
};
