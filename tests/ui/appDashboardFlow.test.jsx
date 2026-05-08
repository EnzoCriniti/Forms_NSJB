/**
 * @file tests/ui/appDashboardFlow.test.jsx
 * @summary Teste integrado do App para navegação no dashboard.
 * @responsibility Garantir que o menu Dashboard aparece para admin e abre a tela certa.
 */

import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../../frontend/src/App.jsx";
import { STORAGE_KEYS } from "../../frontend/src/lib/appConstants.js";

const admin = { id: 1, name: "Admin", username: "admin", role: "admin" };

const bootstrap = {
  forms: [
    {
      id: 1,
      slug: "presenca-dashboard",
      type: "presenca",
      status: "aberto",
      title: "Presenca Dashboard",
      sessionName: "Sessao Dashboard",
      closing: "2026-05-10T20:00",
      labels: [],
      totalExpected: 5,
      fieldDefinitions: [
        { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
        { id: 2, type: "yes_no", label: "Vai?", required: true, show: true, total: true },
      ],
      resultsConfig: {},
      metrics: { responses: 3, total: 5 },
    },
  ],
  responsesByForm: {},
  escalaByForm: {},
  users: [admin],
  labels: [{ id: 1, name: "Evento", color: "#1565c0" }],
  presets: [{ id: 1, name: "Base" }],
  fieldCatalog: [{ id: 1, key: "nome", name: "Nome", type: "person_select", category: "presenca", defaultLabel: "Nome", gridSchema: {}, active: true }],
  scaleTaskCatalog: [{ id: 1, key: "cozinha", name: "Cozinha", category: "cozinha", defaultLabel: "Cozinha", active: true }],
  people: [{ name: "Maria", grau: "QS" }],
  membersConfig: {},
};

describe("App dashboard flow", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    window.localStorage.clear();
    window.location.hash = "";
    window.history.pushState(null, "", "/");
  });

  it("exibe o menu Dashboard para admin e abre a tela", async () => {
    window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({
      user: admin,
      token: "token-admin",
      expiresAt: null,
    }));

    vi.stubGlobal("fetch", vi.fn(async url => {
      if (url === "/api/bootstrap") return jsonResponse(bootstrap);
      if (url === "/api/auth/me") return jsonResponse({ user: admin, expiresAt: null });
      if (url === "/api/security/form-delete-key/status") return jsonResponse({ configured: false });
      return jsonResponse({}, false);
    }));

    render(<App />);

    await screen.findByRole("button", { name: "Dashboard" });
    fireEvent.click(screen.getByRole("button", { name: "Dashboard" }));

    expect(await screen.findByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Resumo operacional da aplicacao sem entrar nas Configuracoes.")).toBeInTheDocument();
  });

  it("mostra apenas o botao Entrar no header quando nao ha sessao", async () => {
    vi.stubGlobal("fetch", vi.fn(async url => {
      if (url === "/api/bootstrap") return jsonResponse(bootstrap);
      if (url === "/api/security/form-delete-key/status") return jsonResponse({ configured: false });
      return jsonResponse({}, false);
    }));

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Acesso restrito" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Formulários" })).not.toBeInTheDocument();
    expect(document.querySelector(".form-card")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByPlaceholderText("Usuário")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fechar" })).toBeInTheDocument();
  });

  it("abre o card da listagem no primeiro clique apos o bootstrap", async () => {
    window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({
      user: admin,
      token: "token-admin",
      expiresAt: null,
    }));

    vi.stubGlobal("fetch", vi.fn(async url => {
      if (url === "/api/bootstrap") return jsonResponse(bootstrap);
      if (url === "/api/auth/me") return jsonResponse({ user: admin, expiresAt: null });
      if (url === "/api/security/form-delete-key/status") return jsonResponse({ configured: false });
      return jsonResponse({}, false);
    }));

    render(<App />);

    expect(await screen.findByText("Presenca Dashboard")).toBeInTheDocument();
    fireEvent.click(document.querySelector(".form-card"));

    expect(window.location.hash).toBe("#/f/presenca-dashboard");
  });

  it("derruba a sessao quando o validador encontra o token revogado", async () => {
    window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({
      user: admin,
      token: "token-admin",
      expiresAt: null,
    }));

    let authMeCalls = 0;
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn(async url => {
      if (url === "/api/bootstrap") return jsonResponse(bootstrap);
      if (url === "/api/auth/me") {
        authMeCalls += 1;
        return authMeCalls === 1
          ? jsonResponse({ user: admin, expiresAt: null })
          : jsonResponse({ error: "Nao autenticado." }, false, 401);
      }
      if (url === "/api/security/form-delete-key/status") return jsonResponse({ configured: false });
      return jsonResponse({}, false);
    }));

    render(<App />);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByRole("button", { name: "Dashboard" })).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
      await Promise.resolve();
    });

    expect(screen.getByRole("heading", { name: "Acesso restrito" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Usuário")).toBeInTheDocument();
    vi.useRealTimers();
  });
});

const jsonResponse = (payload, ok = true, status = ok ? 200 : 400) => ({
  ok,
  status,
  json: async () => payload,
});
