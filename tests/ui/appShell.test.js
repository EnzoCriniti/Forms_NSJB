/**
 * @file tests/ui/appShell.test.js
 * @summary Testes dos helpers de shell do frontend.
 * @responsibility Cobrir rotas publicas canonicas.
 */

import { describe, it, expect } from "vitest";
import { buildAppShellDerivedState, resolveAppDetailLoadRequest, resolveAppNavigation, resolveAppViewportTargetState } from "../../frontend/src/lib/appShell.js";
import { buildPublicEventFormPath, getPublicRouteFromLocation } from "../../frontend/src/lib/appPublicRoutes.js";
import { normalizeStoredSession } from "../../frontend/src/lib/appSession.js";

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
      user: { id: 1, name: "Admin", username: "admin", role: "admin" },
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

describe("appShell derived state", () => {
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
