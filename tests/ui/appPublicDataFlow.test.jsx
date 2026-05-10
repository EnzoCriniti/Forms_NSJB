/**
 * @file tests/ui/appPublicDataFlow.test.jsx
 * @summary Teste integrado do App para fluxos publicos com dados carregados sob demanda.
 * @responsibility Validar abertura de formulario publico e escala publica sem depender do bootstrap completo.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../../frontend/src/App.jsx";

const bootstrap = forms => ({
  forms,
  responsesByForm: {},
  escalaByForm: {},
  users: [],
  labels: [],
  presets: [],
  fieldCatalog: [],
  scaleTaskCatalog: [],
  people: [
    { name: "Maria", grau: "QS" },
    { name: "Joao", grau: "QM" },
  ],
  membersConfig: {},
});

describe("App public data flow", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    window.location.hash = "";
    window.history.pushState(null, "", "/");
  });

  it("carrega respostas do formulario publico sob demanda", async () => {
    window.location.hash = "#/formularios/presenca-teste";
    vi.stubGlobal("fetch", vi.fn(async url => {
      if (url === "/api/bootstrap") {
        return jsonResponse(bootstrap([
          {
            id: 1,
            slug: "presenca-teste",
            type: "presenca",
            status: "aberto",
            title: "Formulario Publico",
            sessionName: "Sessao Publica",
            description: "",
            closing: "2026-05-05T20:00",
            fieldDefinitions: [
              { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
              { id: 2, type: "yes_no", label: "Vai?", required: true, show: true, total: true },
            ],
            resultsConfig: {},
            labels: [],
          },
        ]));
      }
      if (url === "/api/forms/1/responses") {
        return jsonResponse({
          responses: [
            { id: 10, respondentName: "Maria", respondentGrau: "QS", values: { "1": "QS - Maria", "2": "Sim" } },
          ],
        });
      }
      return jsonResponse({}, false);
    }));

    render(<App />);

    await screen.findByText("Nome *");
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Maria" } });

    expect(await screen.findByRole("heading", { name: /resposta/i })).toBeInTheDocument();
  });

  it("nao mostra voltar para visitante no link publico", async () => {
    window.location.hash = "#/formularios/presenca-teste";
    vi.stubGlobal("fetch", vi.fn(async url => {
      if (url === "/api/bootstrap") {
        return jsonResponse(bootstrap([
          {
            id: 1,
            slug: "presenca-teste",
            type: "presenca",
            status: "aberto",
            title: "Formulario Publico",
            sessionName: "Sessao Publica",
            description: "",
            closing: "2026-05-05T20:00",
            fieldDefinitions: [
              { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
              { id: 2, type: "yes_no", label: "Vai?", required: true, show: true, total: true },
            ],
            resultsConfig: {},
            labels: [],
          },
        ]));
      }
      if (url === "/api/forms/1/responses") {
        return jsonResponse({ responses: [] });
      }
      return jsonResponse({}, false);
    }));

    render(<App />);

    await screen.findByText("Nome *");
    expect(screen.queryByRole("button", { name: "Voltar" })).not.toBeInTheDocument();
  });

  it("abre formulario publico usando o novo caminho /formularios/slug", async () => {
    window.history.pushState(null, "", "/formularios/presenca-teste");
    vi.stubGlobal("fetch", vi.fn(async url => {
      if (url === "/api/bootstrap") {
        return jsonResponse(bootstrap([
          {
            id: 1,
            slug: "presenca-teste",
            type: "presenca",
            status: "aberto",
            title: "Formulario Publico",
            sessionName: "Sessao Publica",
            description: "",
            closing: "2026-05-05T20:00",
            fieldDefinitions: [
              { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
              { id: 2, type: "yes_no", label: "Vai?", required: true, show: true, total: true },
            ],
            resultsConfig: {},
            labels: [],
          },
        ]));
      }
      if (url === "/api/forms/1/responses") {
        return jsonResponse({ responses: [] });
      }
      return jsonResponse({}, false);
    }));

    render(<App />);

    expect(await screen.findByText("Nome *")).toBeInTheDocument();
  });

  it("abre a tela publica de resultados pelo caminho /formularios/slug/resultados", async () => {
    window.history.pushState(null, "", "/formularios/presenca-teste/resultados");
    vi.stubGlobal("fetch", vi.fn(async url => {
      if (url === "/api/bootstrap") {
        return jsonResponse(bootstrap([
          {
            id: 1,
            slug: "presenca-teste",
            type: "presenca",
            status: "aberto",
            title: "Formulario Publico",
            sessionName: "Sessao Publica",
            description: "",
            closing: "2026-05-05T20:00",
            fieldDefinitions: [
              { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
              { id: 2, type: "yes_no", label: "Vai?", required: true, show: true, total: true },
            ],
            resultsConfig: { publicResultsEnabled: true },
            labels: [],
          },
        ]));
      }
      if (url === "/api/forms/1/responses") {
        return jsonResponse({
          responses: [
            { id: 10, respondentName: "Maria", respondentGrau: "QS", values: { "1": "Maria", "2": "Sim" } },
          ],
        });
      }
      return jsonResponse({}, false);
    }));

    render(<App />);

    expect(await screen.findByRole("button", { name: "Ver formulário" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Todos" })).toBeInTheDocument();
  });

  it("bloqueia a tela publica de resultados quando a opcao nao esta habilitada", async () => {
    window.history.pushState(null, "", "/formularios/presenca-teste/resultados");
    vi.stubGlobal("fetch", vi.fn(async url => {
      if (url === "/api/bootstrap") {
        return jsonResponse(bootstrap([
          {
            id: 1,
            slug: "presenca-teste",
            type: "presenca",
            status: "fechado",
            title: "Formulario Publico",
            sessionName: "Sessao Publica",
            description: "",
            closing: "2026-05-05T20:00",
            fieldDefinitions: [
              { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
              { id: 2, type: "yes_no", label: "Vai?", required: true, show: true, total: true },
            ],
            resultsConfig: { publicResultsEnabled: false },
            labels: [],
          },
        ]));
      }
      if (url === "/api/forms/1/responses") {
        return jsonResponse({ responses: [] });
      }
      return jsonResponse({}, false);
    }));

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Resultados públicos indisponíveis" })).toBeInTheDocument();
    expect(screen.getByText("Este formulário não está configurado para exibir resultados publicamente.")).toBeInTheDocument();
  });

  it("carrega a escala publica sob demanda", async () => {
    window.location.hash = "#/formularios/escala-teste";
    vi.stubGlobal("fetch", vi.fn(async url => {
      if (url === "/api/bootstrap") {
        return jsonResponse(bootstrap([
          {
            id: 2,
            slug: "escala-teste",
            type: "escala_organ",
            status: "aberto",
            title: "Escala Publica",
            sessionName: "Sessao Escala",
            description: "",
            closing: "2026-05-05T20:00",
            fieldDefinitions: [],
            resultsConfig: {},
            labels: [],
          },
        ]));
      }
      if (url === "/api/forms/2/escala") {
        return jsonResponse({
          sections: [
            {
              title: "Cozinha",
              color: "#ffcdd2",
              slots: [
                { role: "Responsavel", person: "Maria" },
                { role: "Auxiliar", person: "" },
              ],
            },
          ],
        });
      }
      return jsonResponse({}, false);
    }));

    render(<App />);

    await screen.findByText("Cozinha");
    expect(screen.getByText("Maria")).toBeInTheDocument();
  });

  it("mostra erro de inicio quando o bootstrap falha", async () => {
    vi.stubGlobal("fetch", vi.fn(async url => {
      if (url === "/api/bootstrap") {
        return jsonResponse({ error: "Falha de comunicacao com a API. Verifique a conexao e tente novamente." }, false);
      }
      return jsonResponse({}, false);
    }));

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Erro ao iniciar" })).toBeInTheDocument();
    expect(screen.getByText("Falha de comunicacao com a API. Verifique a conexao e tente novamente.")).toBeInTheDocument();
  });
});

const jsonResponse = (payload, ok = true) => ({
  ok,
  json: async () => payload,
});
