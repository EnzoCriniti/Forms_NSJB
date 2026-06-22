/**
 * @file tests/ui/appSaveFlow.test.jsx
 * @summary Teste integrado do fluxo principal do App.
 * @responsibility Validar edicao de formulario, refresh silencioso e uso da configuracao salva nos resultados.
 */

import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../frontend/src/App.jsx";
import { STORAGE_KEYS } from "../../frontend/src/lib/appConstants.js";

const admin = {
  user: { id: 1, name: "Admin", username: "admin", role: "admin" },
  token: "session-token",
  expiresAt: "2026-05-05T00:00:00.000Z",
};

const originalForm = {
  id: 10,
  slug: "presenca-edicao",
  type: "presenca",
  status: "aberto",
  title: "Presenca Edicao",
  sessionName: "",
  description: "",
  date: "2026-05-04",
  closing: "2026-05-05T20:00",
  closingText: "",
  totalExpected: 0,
  labels: [],
  fieldDefinitions: [
    { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
    { id: 2, type: "yes_no", label: "Vai?", required: true, show: true, total: true },
  ],
  resultsConfig: {
    searchEnabled: true,
    showLinkedRoster: true,
    totalsLayout: [{ fieldId: 2, style: "bar" }],
  },
  scaleSections: [],
  metrics: { responses: 1, total: 2 },
};

const event = form => ({
  id: 100,
  title: "Evento Teste",
  description: "",
  date: "2026-05-04",
  opening: "",
  closing: "",
  status: "pronto",
  formIds: [form.id],
  messageConfig: {},
});

const bootstrap = form => ({
  forms: [form],
  events: [event(form)],
  responsesByForm: {},
  escalaByForm: {},
  users: [admin.user],
  labels: [],
  presets: [],
  people: [
    { name: "Maria", grau: "QS" },
    { name: "Joao", grau: "QM" },
  ],
  membersConfig: {},
});

const openTestEvent = async () => {
  const eventCard = await screen.findByText("Evento Teste - 04/05/2026");
  fireEvent.click(eventCard);
};

describe("App save flow", () => {
  beforeEach(() => {
    window.location.hash = "";
    window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(admin));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.location.hash = "";
    window.localStorage.clear();
  });

  it("mantem a tela montada apos editar e usa resultsConfig atualizado nos resultados", async () => {
    let savedForm = originalForm;
    const fetchMock = vi.fn(async (url, options = {}) => {
      if (url === "/api/auth/me") {
        return jsonResponse({ user: admin.user, expiresAt: admin.expiresAt });
      }
      if (url === "/api/bootstrap") {
        return jsonResponse(bootstrap(savedForm));
      }
      if (url === "/api/security/form-delete-key/status") {
        return jsonResponse({ configured: false });
      }
      if (url === "/api/forms" && options.method === "POST") {
        const payload = JSON.parse(options.body);
        savedForm = {
          ...originalForm,
          ...payload,
          id: originalForm.id,
          resultsConfig: payload.resultsConfig,
        };
        return jsonResponse({ form: savedForm });
      }
      if (url === `/api/forms/${originalForm.id}/responses`) {
        return jsonResponse({
          responses: [
            { id: 1, respondentName: "Maria", respondentGrau: "QS", values: { "1": "QS - Maria", "2": "Sim" } },
          ],
        });
      }
      if (url === "/api/auth/logout") {
        return jsonResponse({ ok: true });
      }
      return jsonResponse({}, false);
    });
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(<App />);

    await openTestEvent();
    await screen.findByText(/Presenca Edicao/i);

    const actions = container.querySelector(".card-actions");
    fireEvent.click(actions.querySelector('[aria-label="Editar formulário"]'));

    await screen.findByText("Editar Formulário");
    fireEvent.click(screen.getByLabelText("Habilitar pesquisa na planilha de respostas"));
    fireEvent.click(screen.getByLabelText("Exibir lista da base vinculada e destacar faltantes"));
    fireEvent.click(screen.getByText("Salvar Formulário"));

    await waitFor(() => expect(screen.getByText("Formulário alterado com sucesso")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Voltar para o evento"));
    await openTestEvent();
    fireEvent.click(screen.getByText("Ver resultados"));

    await screen.findByText("Resultado do preenchimento");
    expect(screen.queryByText("Use a lupinha ao lado do nome de cada coluna para filtrar.")).not.toBeInTheDocument();
    expect(screen.queryByText("Joao")).not.toBeInTheDocument();
  }, 10000);

  it("abre uma copia como novo formulario em rascunho e salva sem reutilizar id ou slug", async () => {
    let savedForm = originalForm;
    const fetchMock = vi.fn(async (url, options = {}) => {
      if (url === "/api/auth/me") {
        return jsonResponse({ user: admin.user, expiresAt: admin.expiresAt });
      }
      if (url === "/api/bootstrap") {
        return jsonResponse(bootstrap(savedForm));
      }
      if (url === "/api/security/form-delete-key/status") {
        return jsonResponse({ configured: false });
      }
      if (url === "/api/forms" && options.method === "POST") {
        const payload = JSON.parse(options.body);
        expect(payload.id).toBeFalsy();
        expect(payload.slug).toBeFalsy();
        expect(payload.status).toBe("rascunho");
        expect(payload.title).toBe("Presenca Edicao (Copia)");
        savedForm = {
          ...originalForm,
          ...payload,
          id: 22,
          slug: "presenca-edicao-copia",
        };
        return jsonResponse({ form: savedForm });
      }
      if (url === "/api/auth/logout") {
        return jsonResponse({ ok: true });
      }
      return jsonResponse({}, false);
    });
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(<App />);

    await openTestEvent();
    await screen.findByText(/Presenca Edicao/i);

    const actions = container.querySelector(".card-actions");
    fireEvent.click(within(actions).getByRole("button", { name: "Duplicar" }));

    await screen.findByText("Novo Formulário");
    expect(screen.getByDisplayValue("Presenca Edicao (Copia)")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Rascunho")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Publicar Formulário" }));

    await waitFor(() => expect(screen.getByText("Formulário salvo com sucesso")).toBeInTheDocument());
  });

  it("abre resposta pelo fluxo interno quando usuario esta logado", async () => {
    const fetchMock = vi.fn(async url => {
      if (url === "/api/auth/me") {
        return jsonResponse({ user: admin.user, expiresAt: admin.expiresAt });
      }
      if (url === "/api/bootstrap") {
        return jsonResponse(bootstrap(originalForm));
      }
      if (url === "/api/security/form-delete-key/status") {
        return jsonResponse({ configured: false });
      }
      if (url === `/api/forms/${originalForm.id}/responses`) {
        return jsonResponse({ responses: [] });
      }
      return jsonResponse({}, false);
    });
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(<App />);

    await openTestEvent();
    await screen.findByText(/Presenca Edicao/i);
    fireEvent.click(screen.getByRole("button", { name: "Responder" }));

    await screen.findByText("Nome *");
    expect(container.querySelector(".internal-response-card")).toBeInTheDocument();
    expect(container.querySelector(".app-root.public-root")).toBeNull();
    expect(window.location.hash).toBe("");
  });
});

const jsonResponse = (payload, ok = true) => ({
  ok,
  json: async () => payload,
});
