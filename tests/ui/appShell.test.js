/**
 * @file tests/ui/appShell.test.js
 * @summary Testes dos helpers de shell do frontend.
 * @responsibility Cobrir rotas publicas canonicas.
 */

import { describe, it, expect } from "vitest";
import { buildAppShellDerivedState, buildPublicEventFormPath, getPublicRouteFromLocation, resolveAppNavigation } from "../../frontend/src/lib/appShell.js";

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
