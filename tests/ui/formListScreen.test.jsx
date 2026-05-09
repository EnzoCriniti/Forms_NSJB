/**
 * @file tests/ui/formListScreen.test.jsx
 * @summary Testes de UI da listagem de formularios.
 * @responsibility Validar renderizacao, filtros e paginação basica da tela de listagem.
 */

import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FormListScreen } from "../../frontend/src/screens/FormListScreen.jsx";

const labels = [
  { id: 1, name: "Sessao de Escala", color: "#2e7d32" },
  { id: 2, name: "Evento", color: "#1565c0" },
];

const forms = [
  {
    id: 1,
    slug: "aberto-1",
    type: "presenca",
    status: "aberto",
    title: "Presenca Sessao de Escala",
    labels: [1],
    closing: "2026-05-01T23:59",
    metrics: { responses: 2, total: 10 },
    date: "2026-05-02",
  },
  {
    id: 2,
    slug: "fechado-1",
    type: "presenca",
    status: "fechado",
    title: "Presenca Evento Beneficente",
    labels: [2],
    closing: "2026-04-25T18:00",
    metrics: { responses: 5, total: 10 },
    date: "2026-04-26",
  },
  {
    id: 3,
    slug: "arquivado-1",
    type: "presenca",
    status: "arquivado",
    title: "Formulario Arquivado",
    labels: [],
    closing: "2026-04-20T18:00",
    metrics: { responses: 1, total: 8 },
    date: "2026-04-18",
  },
];

describe("FormListScreen", () => {
  it("mostra apenas formularios abertos para visitante sem login", () => {
    render(<FormListScreen onNavigate={vi.fn()} user={null} labels={labels} forms={forms} />);

    expect(screen.getByText("Presenca Sessao de Escala")).toBeInTheDocument();
    expect(screen.getByText("02/05/2026")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Responder" })).toBeInTheDocument();
    expect(screen.queryByText("Preenchimento")).not.toBeInTheDocument();
    expect(document.querySelector(".fill-summary")).toBeNull();
    expect(screen.queryByText("Presenca Evento Beneficente")).not.toBeInTheDocument();
    expect(screen.queryByText("26/04/2026")).not.toBeInTheDocument();
    expect(screen.queryByText("Formulario Arquivado")).not.toBeInTheDocument();
    expect(screen.queryByText("18/04/2026")).not.toBeInTheDocument();
  });

  it("mantem os filtros administrativos em uma faixa propria", () => {
    const { container } = render(<FormListScreen onNavigate={vi.fn()} user={{ role: "admin", name: "Admin" }} labels={labels} forms={forms} />);

    const filterRow = container.querySelector(".form-list-toolbar__filters");
    expect(filterRow).toBeInTheDocument();
    expect(filterRow.querySelectorAll("select").length).toBeGreaterThan(2);
    expect(screen.getByDisplayValue("Mais recentes")).toBeInTheDocument();
  });

  it("filtra formularios pelo campo de busca", () => {
    render(<FormListScreen onNavigate={vi.fn()} user={{ role: "admin", name: "Admin" }} labels={labels} forms={forms} />);

    fireEvent.change(screen.getByPlaceholderText("Buscar por titulo, data, classificacao ou status..."), {
      target: { value: "Beneficente" },
    });

    expect(screen.getByText("Presenca Evento Beneficente")).toBeInTheDocument();
    expect(screen.getByText("26/04/2026")).toBeInTheDocument();
    expect(screen.queryByText("Presenca Sessao de Escala")).not.toBeInTheDocument();
  });

  it("busca por classificacao, status e descricao do formulario", () => {
    const extendedForms = [
      {
        ...forms[0],
        id: 11,
        slug: "aberto-1-copia",
        description: "Reuniao de abertura",
      },
      ...forms,
    ];

    render(<FormListScreen onNavigate={vi.fn()} user={{ role: "admin", name: "Admin" }} labels={labels} forms={extendedForms} />);

    fireEvent.change(screen.getByPlaceholderText("Buscar por titulo, data, classificacao ou status..."), {
      target: { value: "evento" },
    });

    expect(screen.getByText("Presenca Evento Beneficente")).toBeInTheDocument();
    expect(screen.getByText("26/04/2026")).toBeInTheDocument();
    expect(screen.queryByText("Presenca Sessao de Escala")).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Buscar por titulo, data, classificacao ou status..."), {
      target: { value: "reuniao" },
    });

    expect(screen.getByText("Presenca Sessao de Escala")).toBeInTheDocument();
    expect(screen.getByText("02/05/2026")).toBeInTheDocument();
    expect(screen.queryByText("Presenca Evento Beneficente")).not.toBeInTheDocument();
  });

  it("abre nova pagina quando passa de 6 formularios", () => {
    const extendedForms = Array.from({ length: 7 }, (_, index) => ({
      id: index + 1,
      slug: `form-${index + 1}`,
      type: "presenca",
      status: "aberto",
      title: `Formulario ${index + 1}`,
      labels: [],
      closing: "2026-05-01T23:59",
      metrics: { responses: index, total: 10 },
      date: `2026-05-${String(index + 1).padStart(2, "0")}`,
    }));

    render(<FormListScreen onNavigate={vi.fn()} user={{ role: "admin", name: "Admin" }} labels={labels} forms={extendedForms} />);

    expect(screen.getByText("Formulario 7")).toBeInTheDocument();
    expect(screen.getByText("07/05/2026")).toBeInTheDocument();
    expect(screen.queryByText("Formulario 1")).not.toBeInTheDocument();
    expect(screen.getByText("Pagina 1 de 2")).toBeInTheDocument();
  });

  it("deduplica classificacoes repetidas no card", () => {
    const { container } = render(
      <FormListScreen
        onNavigate={vi.fn()}
        user={{ role: "admin", name: "Admin" }}
        labels={labels}
        forms={[{ ...forms[0], labels: [1, 1, 2, 2] }]}
      />,
    );

    const card = container.querySelector(".form-card");
    expect(within(card).getAllByText("Sessao de Escala")).toHaveLength(1);
    expect(within(card).getAllByText("Evento")).toHaveLength(1);
  });

  it("oculta arquivados por padrao para usuario autenticado e exibe quando filtrado", () => {
    render(<FormListScreen onNavigate={vi.fn()} user={{ role: "admin", name: "Admin" }} labels={labels} forms={forms} />);

    expect(screen.queryByText("Formulario Arquivado")).not.toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue("Todos os status"), {
      target: { value: "arquivado" },
    });

    expect(screen.getByText("Formulario Arquivado")).toBeInTheDocument();
    expect(screen.getByText("18/04/2026")).toBeInTheDocument();
    expect(screen.queryByText("Presenca Sessao de Escala")).not.toBeInTheDocument();
  });

  it("abre o link publico ao clicar no card", () => {
    window.location.hash = "";
    render(<FormListScreen onNavigate={vi.fn()} user={null} labels={labels} forms={forms} />);

    fireEvent.click(document.querySelector(".form-card"));

    expect(window.location.hash).toBe("#/f/aberto-1");
  });

  it("mantem resultados como acao explicita no card", () => {
    const onNavigate = vi.fn();
    render(<FormListScreen onNavigate={onNavigate} user={{ role: "viewer", name: "Viewer" }} labels={labels} forms={forms} />);

    window.location.hash = "";
    fireEvent.click(screen.getAllByRole("button", { name: "Ver resultados" })[0]);

    expect(onNavigate).toHaveBeenCalledWith("results", forms[0]);
    expect(window.location.hash).toBe("");
  });

  it("nao mostra fixar formulario para usuario apenas de visualizacao", () => {
    render(<FormListScreen onNavigate={vi.fn()} user={{ role: "viewer", name: "Viewer" }} labels={labels} forms={forms} />);

    expect(screen.queryByRole("button", { name: "Fixar formulario" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Desfixar formulario" })).not.toBeInTheDocument();
  });

  it("move as acoes de edicao para baixo quando o card nao tem base vinculada", () => {
    const { container } = render(
      <FormListScreen
        onNavigate={vi.fn()}
        onDuplicateForm={vi.fn()}
        onTogglePinnedForm={vi.fn()}
        user={{ id: 7, role: "admin", name: "Admin" }}
        labels={labels}
        forms={[forms[0]]}
      />,
    );

    const card = container.querySelector(".form-card");
    expect(card.querySelector(".form-card-side")).toBeNull();
    expect(card.querySelector(".card-secondary-actions--bottom")).toBeTruthy();
  });

  it("mostra exclusao segura apenas para admin e confirma com chave mestra", async () => {
    let resolveDelete;
    const onDeleteForm = vi.fn(() => new Promise(resolve => {
      resolveDelete = resolve;
    }));

    render(<FormListScreen onNavigate={vi.fn()} user={{ role: "admin", name: "Admin" }} labels={labels} forms={forms} onDeleteForm={onDeleteForm} formDeleteKeyConfigured={true} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Excluir" })[0]);
    const modal = screen.getByRole("heading", { name: "Excluir formulario" }).closest(".modal-card");
    expect(modal).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Chave mestra"), { target: { value: "segredo" } });
    fireEvent.click(within(modal).getByRole("button", { name: "Excluir" }));

    await waitFor(() => expect(onDeleteForm).toHaveBeenCalledWith(1, "segredo"));
    expect(within(modal).getByRole("button", { name: "Excluir" })).toBeDisabled();

    resolveDelete();
    await waitFor(() => expect(screen.getByText("Excluido com sucesso.")).toBeInTheDocument());
  });

  it("dispara duplicacao para admin com o formulario selecionado", () => {
    const onDuplicateForm = vi.fn();

    render(
      <FormListScreen
        onNavigate={vi.fn()}
        onDuplicateForm={onDuplicateForm}
        user={{ role: "admin", name: "Admin" }}
        labels={labels}
        forms={forms}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Duplicar" })[0]);

    expect(onDuplicateForm).toHaveBeenCalledWith(forms[0]);
  });

  it("prioriza formularios fixados no topo e permite alternar o estado", () => {
    const onTogglePinnedForm = vi.fn();

    const { container, rerender } = render(
      <FormListScreen
        onNavigate={vi.fn()}
        onTogglePinnedForm={onTogglePinnedForm}
        pinnedFormIds={[2]}
        user={{ id: 7, role: "admin", name: "Admin" }}
        labels={labels}
        forms={forms}
      />,
    );

    let cards = Array.from(container.querySelectorAll(".form-card"));
    expect(within(cards[0]).getByText("Presenca Evento Beneficente")).toBeInTheDocument();
    expect(within(cards[0]).getByText("26/04/2026")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Desfixar formulario" })[0]);
    expect(onTogglePinnedForm).toHaveBeenCalledWith(2);

    rerender(
      <FormListScreen
        onNavigate={vi.fn()}
        onTogglePinnedForm={onTogglePinnedForm}
        pinnedFormIds={[]}
        user={{ id: 7, role: "admin", name: "Admin" }}
        labels={labels}
        forms={forms}
      />,
    );

    cards = Array.from(container.querySelectorAll(".form-card"));
    expect(within(cards[0]).getByText("Presenca Sessao de Escala")).toBeInTheDocument();
    expect(within(cards[0]).getByText("02/05/2026")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Fixar formulario" })[0]);
    expect(onTogglePinnedForm).toHaveBeenCalledWith(1);
  });

  it("orienta quando a chave mestra nao esta configurada", () => {
    render(<FormListScreen onNavigate={vi.fn()} user={{ role: "admin", name: "Admin" }} labels={labels} forms={forms} onDeleteForm={vi.fn()} formDeleteKeyConfigured={false} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Excluir" })[0]);

    expect(screen.getByText("Nenhuma chave mestra configurada. Configure em Configuracoes > Operacoes criticas antes de excluir formularios.")).toBeInTheDocument();
    expect(screen.getByLabelText("Chave mestra")).toBeDisabled();
  });
});
