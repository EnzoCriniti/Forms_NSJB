/**
 * @file tests/ui/appShell.test.js
 * @summary Testes dos helpers de shell do frontend.
 * @responsibility Cobrir rotas publicas canonicas.
 */

import { describe, it, expect, vi } from "vitest";
import { resolveAppNavigation } from "../../frontend/src/lib/appNavigation.js";
import { buildPublicEventFormPath, getPublicRouteFromLocation } from "../../frontend/src/lib/appPublicRoutes.js";
import { normalizeStoredSession } from "../../frontend/src/lib/appSession.js";
import { buildAppShellDerivedState } from "../../frontend/src/lib/appShellDerivedState.js";
import {
  buildAppShellActions,
  buildAppShellData,
  buildAppShellPermissions,
  buildAppShellRuntimeState,
  buildAppShellSetters,
  buildAppShellState,
} from "../../frontend/src/lib/appShellBuilder.js";
import { buildAppViewportProps } from "../../frontend/src/lib/appViewportProps.js";
import { resolveAppDetailLoadRequest, resolveAppViewportTargetState } from "../../frontend/src/lib/appDetailTarget.js";
import { selectEventForms, selectEventMessage, selectFormResponses, selectFormSections } from "../../frontend/src/lib/appShellContentSelectors.js";
import { buildAppNavItems } from "../../frontend/src/lib/appNav.js";
import { resetPublicRouteNavigation } from "../../frontend/src/lib/appViewportNavigation.js";
import { resolveAppShellRoute } from "../../frontend/src/AppShellRouteRegistry.jsx";
import { APP_VIEWPORT_MODES, resolveAppViewportMode } from "../../frontend/src/lib/appViewportState.js";

describe("appShell public routes", () => {
  it("monta e resolve link publico de formulario dentro de evento", () => {
    const path = buildPublicEventFormPath({ id: "evento maio" }, { id: 12 });
    expect(path).toBe("#/eventos/evento%20maio/12");

    window.location.hash = path;
    expect(getPublicRouteFromLocation()).toEqual({
      identifier: "12",
      eventIdentifier: "evento maio",
      view: "form",
      isLegacySlug: false,
    });
  });

  it("ignora hash publico de evento sem formulario", () => {
    window.location.hash = "#/eventos/10";
    expect(getPublicRouteFromLocation()).toBeNull();
  });
});

describe("appShell session storage", () => {
  it("descarta sessao antiga sem token", () => {
    expect(normalizeStoredSession({ username: "admin", password: "admin123" })).toBeNull();
  });

  it("preserva apenas dados publicos do usuario salvo", () => {
    expect(normalizeStoredSession({
      token: "abc",
      user: { id: 1, name: "Admin", username: "admin", role: "admin", password: "secret" },
    })).toEqual({
      token: "abc",
      expiresAt: null,
      user: { id: 1, name: "Admin", username: "admin", role: "admin", layerId: null, layerName: null, permissions: [] },
    });
  });
});

describe("appShell navigation", () => {
  const canCreateForms = user => user?.role === "admin";
  const canViewForm = (user, form) => user?.role === "admin" || form?.status === "aberto";

  it("bloqueia telas administrativas para usuario sem permissao", () => {
    expect(resolveAppNavigation({
      nextScreen: "settings",
      currentUser: { role: "viewer" },
      canCreateForms,
      canViewForm,
    })).toEqual({ screen: "list", clearDraft: false });
  });

  it("manda usuarios logados da lista para eventos", () => {
    expect(resolveAppNavigation({
      nextScreen: "list",
      currentUser: { role: "admin" },
      canCreateForms,
      canViewForm,
    })).toEqual({ screen: "events", clearDraft: false });
  });

  it("prepara edicao ao navegar para criacao com formulario", () => {
    expect(resolveAppNavigation({
      nextScreen: "create",
      form: { id: 7 },
      currentUser: { role: "admin" },
      canCreateForms,
      canViewForm,
    })).toEqual({
      screen: "create",
      clearDraft: true,
      editingFormId: 7,
      activeFormId: 7,
    });
  });

  it("bloqueia resultados sem permissao de visualizar formulario", () => {
    expect(resolveAppNavigation({
      nextScreen: "results",
      activeForm: { id: 3, status: "rascunho" },
      currentUser: { role: "viewer" },
      canCreateForms,
      canViewForm,
    })).toEqual({ screen: "list", clearDraft: false });
  });
});

describe("appShell route registry", () => {
  it("resolve somente rotas com dependencias atendidas", () => {
    expect(resolveAppShellRoute({ screen: "events", currentUser: null })).toBeNull();
    expect(resolveAppShellRoute({ screen: "events", currentUser: { id: 1 } })?.screen).toBe("events");
    expect(resolveAppShellRoute({ screen: "results", activeForm: null })).toBeNull();
    expect(resolveAppShellRoute({ screen: "results", activeForm: { id: 2 } })?.screen).toBe("results");
    expect(resolveAppShellRoute({ screen: "eventMessageDetail", currentUser: { id: 1 }, activeEvent: { id: 3 }, activeMessageId: null })).toBeNull();
  });
});

describe("appShell derived state", () => {
  it("monta blocos de data e state usados pelo shell app", () => {
    expect(buildAppShellData({
      escalaByForm: { 2: [] },
      events: [{ id: 9 }],
      externalBases: [{ id: 4 }],
      fieldCatalog: [{ key: "nome" }],
      forms: [{ id: 1 }],
      labels: ["A"],
      membersConfig: { phoneColumn: "telefone" },
      messageTemplates: [{ id: 3 }],
      messagingConfig: { publicBaseUrl: "https://app.local" },
      people: [{ id: "p1" }],
      personPresets: [{ id: 5 }],
      presets: [{ id: 6 }],
      responsesByForm: { 1: [] },
      scaleTaskCatalog: [{ key: "som" }],
      users: [{ id: 7 }],
    })).toMatchObject({
      forms: [{ id: 1 }],
      events: [{ id: 9 }],
      messageTemplates: [{ id: 3 }],
      responsesByForm: { 1: [] },
      escalaByForm: { 2: [] },
    });

    expect(buildAppShellState({
      activeEvent: { id: 9 },
      activeEventId: 9,
      activeForm: { id: 1 },
      activeMessageId: 3,
      draftForm: { title: "Novo" },
      editingForm: { id: 2 },
      fontScale: 1,
      pinnedEventIds: [9],
      pinnedFormIds: [1],
      publicForm: null,
      publicResultsEnabled: false,
      publicResultsView: false,
      publicRoute: null,
      screen: "events",
    })).toEqual({
      screen: "events",
      fontScale: 1,
      publicForm: null,
      publicRoute: null,
      publicResultsEnabled: false,
      publicResultsView: false,
      pinnedEventIds: [9],
      pinnedFormIds: [1],
      activeEventId: 9,
      activeMessageId: 3,
      activeEvent: { id: 9 },
      activeForm: { id: 1 },
      editingForm: { id: 2 },
      draftForm: { title: "Novo" },
    });
  });

  it("monta blocos runtime de state, actions, setters e permissoes do shell", () => {
    const canCreateForms = user => user?.role === "admin";
    const navigate = vi.fn();
    const setTheme = vi.fn();
    const setScreen = vi.fn();
    const sessionHandlers = {
      increaseFontScale: vi.fn(),
      decreaseFontScale: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    };
    const state = buildAppShellState({
      activeEvent: { id: 9 },
      activeEventId: 9,
      activeForm: { id: 1 },
      activeMessageId: 3,
      draftForm: { title: "Novo" },
      editingForm: { id: 2 },
      fontScale: 1,
      pinnedEventIds: [9],
      pinnedFormIds: [1],
      publicForm: null,
      publicResultsEnabled: false,
      publicResultsView: false,
      publicRoute: null,
      screen: "events",
    });

    expect(buildAppShellRuntimeState({
      canCreateForms,
      currentUser: { role: "admin" },
      formDeleteKeyConfigured: true,
      state,
      theme: "dark",
    })).toMatchObject({
      nav: [
        { key: "dashboard", icon: "chart", label: "Dashboard" },
        { key: "events", icon: "calendar", label: "Eventos" },
        { key: "teams", icon: "users", label: "Equipes" },
      ],
      screen: "events",
      theme: "dark",
      formDeleteKeyConfigured: true,
    });

    const actions = buildAppShellActions({
      adminHandlers: { onSaveUser: vi.fn() },
      eventHandlers: { onSaveEvent: vi.fn() },
      formHandlers: { onSaveForm: vi.fn() },
      navigate,
      sessionHandlers,
      setTheme,
      theme: "dark",
    });

    actions.onOpenSettings();
    actions.onToggleTheme();

    expect(navigate).toHaveBeenCalledWith("settings");
    expect(setTheme).toHaveBeenCalledWith("light");
    expect(actions.onLogin).toBe(sessionHandlers.login);
    expect(actions.onSaveUser).toBeTypeOf("function");
    expect(actions.onSaveEvent).toBeTypeOf("function");
    expect(actions.onSaveForm).toBeTypeOf("function");

    const setters = buildAppShellSetters({
      setActiveEventId: vi.fn(),
      setActiveFormId: vi.fn(),
      setActiveMessageId: vi.fn(),
      setDraftForm: vi.fn(),
      setEditingFormId: vi.fn(),
      setScreen,
    });

    expect(setters).toHaveProperty("setActiveMessageId");
    expect(setters.setScreen).toBe(setScreen);
    expect(buildAppShellPermissions({ canCreateForms }).canCreateForms({ role: "admin" })).toBe(true);
  });

  it("monta seletores derivados do shell", () => {
    const state = buildAppShellDerivedState({
      bootstrap: {
        forms: [
          { id: 1, slug: "form-um", type: "presenca", resultsConfig: { publicResultsEnabled: true } },
          { id: 2, slug: "form-dois", type: "escala_organ" },
        ],
        events: [{ id: 9, title: "Evento" }],
        responsesByForm: { 1: [{ id: 1 }] },
        escalaByForm: {},
      },
      responseDetails: { 2: [{ id: 2 }] },
      escalaDetails: { 2: [{ title: "Sala" }] },
      currentUser: { id: 5 },
      pinnedFormsByUser: { 5: [2] },
      pinnedEventsByUser: { 5: [9] },
      activeFormId: 2,
      activeEventId: 9,
      editingFormId: 1,
      publicRoute: { identifier: "form-um", view: "results" },
    });

    expect(state.pinnedFormIds).toEqual([2]);
    expect(state.pinnedEventIds).toEqual([9]);
    expect(state.activeForm.id).toBe(2);
    expect(state.activeEvent.id).toBe(9);
    expect(state.editingForm.id).toBe(1);
    expect(state.publicForm.id).toBe(1);
    expect(state.publicResultsEnabled).toBe(true);
    expect(state.publicResultsView).toBe(true);
    expect(state.responsesByForm[2]).toEqual([{ id: 2 }]);
    expect(state.escalaByForm[2]).toEqual([{ title: "Sala" }]);
  });
});

describe("appViewport props", () => {
  it("monta props do viewport a partir dos handlers de sessao", () => {
    const sessionHandlers = {
      login: vi.fn(),
      logout: vi.fn(),
      increaseFontScale: vi.fn(),
      decreaseFontScale: vi.fn(),
    };
    const props = buildAppViewportProps({
      app: { screen: "events" },
      error: "",
      fontScale: 1,
      loading: false,
      refreshBootstrap: vi.fn(),
      sessionHandlers,
      setPublicRoute: vi.fn(),
      setScreen: vi.fn(),
      setTheme: vi.fn(),
      theme: "light",
    });

    expect(props).toMatchObject({
      app: { screen: "events" },
      loading: false,
      error: "",
      fontScale: 1,
      theme: "light",
      login: sessionHandlers.login,
      logout: sessionHandlers.logout,
      increaseFontScale: sessionHandlers.increaseFontScale,
      decreaseFontScale: sessionHandlers.decreaseFontScale,
    });
    expect(props).not.toHaveProperty("setActiveMessageId");
  });
});

describe("appShell viewport target state", () => {
  it("espera respostas de formulario de presenca interno", () => {
    expect(resolveAppViewportTargetState({
      screen: "respond",
      activeForm: { id: 7, type: "presenca" },
      responsesByForm: {},
      escalaByForm: {},
    })).toMatchObject({
      targetForm: { id: 7, type: "presenca" },
      waitingForTarget: true,
    });
  });

  it("espera secoes de escala publica", () => {
    expect(resolveAppViewportTargetState({
      publicForm: { id: 8, type: "escala_organ", status: "aberto" },
      responsesByForm: {},
      escalaByForm: {},
    }).waitingForTarget).toBe(true);
  });

  it("nao espera dados de formulario publico fechado fora da tela de resultados", () => {
    expect(resolveAppViewportTargetState({
      publicForm: { id: 9, type: "presenca", status: "fechado", closing: "2000-01-01T00:00" },
      publicResultsView: false,
      responsesByForm: {},
      escalaByForm: {},
    }).waitingForTarget).toBe(false);
  });
});

describe("appShell detail load request", () => {
  it("pede respostas quando formulario ativo ainda nao tem dados", () => {
    expect(resolveAppDetailLoadRequest({
      screen: "results",
      activeForm: { id: 4, type: "presenca" },
      responsesByForm: {},
      escalaByForm: {},
      detailLoading: null,
    })).toEqual({ kind: "responses", formId: 4 });
  });

  it("pede escala quando formulario publico de escala ainda nao tem secoes", () => {
    expect(resolveAppDetailLoadRequest({
      publicForm: { id: 5, type: "escala_organ", status: "aberto" },
      responsesByForm: {},
      escalaByForm: {},
      detailLoading: null,
    })).toEqual({ kind: "escala", formId: 5 });
  });

  it("nao pede detalhe quando ja existe carregamento equivalente em andamento", () => {
    expect(resolveAppDetailLoadRequest({
      screen: "respond",
      activeForm: { id: 6, type: "presenca" },
      responsesByForm: {},
      escalaByForm: {},
      detailLoading: { kind: "responses", formId: 6 },
    })).toBeNull();
  });
});

describe("appViewport navigation", () => {
  it("limpa rota publica e volta visitantes para lista", () => {
    const setPublicRoute = vi.fn();
    const setScreen = vi.fn();
    const windowRef = {
      location: { pathname: "/formularios/abc", hash: "#/formularios/abc" },
      history: { pushState: vi.fn() },
    };

    resetPublicRouteNavigation({ setPublicRoute, setScreen, windowRef });

    expect(windowRef.history.pushState).toHaveBeenCalledWith(null, "", "/");
    expect(windowRef.location.hash).toBe("");
    expect(setPublicRoute).toHaveBeenCalledWith(null);
    expect(setScreen).toHaveBeenCalledWith("list");
  });

  it("limpa rota publica e volta usuarios logados para eventos", () => {
    const setPublicRoute = vi.fn();
    const setScreen = vi.fn();
    const windowRef = {
      location: { pathname: "/", hash: "#/formularios/abc" },
      history: { pushState: vi.fn() },
    };

    resetPublicRouteNavigation({ currentUser: { id: 1 }, setPublicRoute, setScreen, windowRef });

    expect(windowRef.history.pushState).not.toHaveBeenCalled();
    expect(windowRef.location.hash).toBe("");
    expect(setPublicRoute).toHaveBeenCalledWith(null);
    expect(setScreen).toHaveBeenCalledWith("events");
  });
});

describe("appViewport mode", () => {
  it("prioriza loading, erro, detalhe, publico, login e shell", () => {
    expect(resolveAppViewportMode({ loading: true })).toBe(APP_VIEWPORT_MODES.loading);
    expect(resolveAppViewportMode({ loading: false, error: "Falha" })).toBe(APP_VIEWPORT_MODES.error);
    expect(resolveAppViewportMode({
      loading: false,
      error: "",
      publicForm: { id: 1, type: "presenca" },
      publicResultsView: true,
      responsesByForm: {},
      escalaByForm: {},
    })).toBe(APP_VIEWPORT_MODES.detailLoading);
    expect(resolveAppViewportMode({
      loading: false,
      error: "",
      publicForm: { id: 1, type: "presenca" },
      publicResultsView: true,
      responsesByForm: { 1: [] },
      escalaByForm: {},
    })).toBe(APP_VIEWPORT_MODES.public);
    expect(resolveAppViewportMode({ loading: false, error: "", currentUser: null })).toBe(APP_VIEWPORT_MODES.login);
    expect(resolveAppViewportMode({ loading: false, error: "", currentUser: { id: 1 } })).toBe(APP_VIEWPORT_MODES.shell);
  });
});

describe("appShell content selectors", () => {
  it("seleciona formularios e mensagem vinculados ao evento ativo", () => {
    const forms = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const event = { formIds: [2, 3], messages: [{ id: 10 }, { id: 11 }] };

    expect(selectEventForms(forms, event)).toEqual([{ id: 2 }, { id: 3 }]);
    expect(selectEventMessage(event, 11)).toEqual({ id: 11 });
  });

  it("retorna listas vazias para detalhes de formulario ainda ausentes", () => {
    expect(selectFormResponses({}, 1)).toEqual([]);
    expect(selectFormSections({}, 1)).toEqual([]);
  });
});

describe("app navigation items", () => {
  it("monta navegacao conforme permissao do usuario", () => {
    const canCreateForms = user => user?.role === "admin";

    expect(buildAppNavItems({ currentUser: null, canCreateForms })).toEqual([]);
    expect(buildAppNavItems({ currentUser: { role: "viewer" }, canCreateForms })).toEqual([
      { key: "events", icon: "calendar", label: "Eventos" },
    ]);
    expect(buildAppNavItems({ currentUser: { role: "admin" }, canCreateForms })).toEqual([
      { key: "dashboard", icon: "chart", label: "Dashboard" },
      { key: "events", icon: "calendar", label: "Eventos" },
      { key: "teams", icon: "users", label: "Equipes" },
    ]);
  });
});
