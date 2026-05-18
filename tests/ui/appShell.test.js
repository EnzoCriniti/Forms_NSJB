/**
 * @file tests/ui/appShell.test.js
 * @summary Testes dos helpers de shell do frontend.
 * @responsibility Cobrir rotas publicas canonicas.
 */

import { describe, it, expect } from "vitest";
import { buildPublicEventFormPath, getPublicRouteFromLocation, resolveAppNavigation } from "../../frontend/src/lib/appShell.js";

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
