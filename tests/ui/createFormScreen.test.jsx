/**
 * @file tests/ui/createFormScreen.test.jsx
 * @summary Testes de UI da criacao de formulario.
 * @responsibility Validar template vazio, configuracao de totalizacao e persistencia do submit.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CreateFormScreen } from "../../src/screens/CreateFormScreen.jsx";

const baseProps = {
  onNavigate: vi.fn(),
  people: [{ name: "Maria", grau: "QS" }],
  membersConfig: { sheetUrl: "https://docs.google.com/spreadsheets/d/demo" },
  labels: [],
  presets: [],
  onSavePreset: vi.fn(),
  onSaveForm: vi.fn(),
};

describe("CreateFormScreen", () => {
  it("inicia novo formulario sem template selecionado", () => {
    render(<CreateFormScreen {...baseProps} presets={[{ id: 1, type: "presenca", name: "Template A" }]} />);

    expect(screen.getByText("Selecao de template:")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Template vazio")).toBeInTheDocument();
    expect(screen.getByText("0 campos configurados")).toBeInTheDocument();
  });

  it("inicia com controle de socios desabilitado no template vazio", () => {
    render(<CreateFormScreen {...baseProps} />);

    expect(screen.getByRole("spinbutton")).toBeDisabled();
    expect(screen.getByText("Configuracao dos Resultados")).toBeInTheDocument();
    expect(screen.getByLabelText("Habilitar pesquisa na planilha de respostas")).toBeInTheDocument();
    expect(screen.getByLabelText("Exibir lista completa da base vinculada e faltantes")).toBeDisabled();
  });

  it("desabilita total esperado e lista completa sem vinculo com socios", () => {
    render(
      <CreateFormScreen
        {...baseProps}
        form={{
          id: 7,
          type: "presenca",
          status: "rascunho",
          title: "Sem vinculo",
          labels: [],
          fieldDefinitions: [
            { id: 2, type: "text", label: "Nome livre", required: true, show: true, total: false },
            { id: 3, type: "yes_no", label: "Vai?", required: true, show: true, total: true },
          ],
          resultsConfig: {
            searchEnabled: true,
            showLinkedRoster: true,
            totalsLayout: [{ fieldId: 3, style: "bar" }],
          },
          scaleSections: [],
        }}
      />,
    );

    expect(screen.getByRole("spinbutton")).toBeDisabled();
    expect(screen.getByLabelText("Exibir lista completa da base vinculada e faltantes")).toBeDisabled();
  });

  it("salva alteracoes da totalizacao no submit", async () => {
    const onSaveForm = vi.fn().mockResolvedValue({ ok: true });

    render(
      <CreateFormScreen
        {...baseProps}
        onSaveForm={onSaveForm}
        form={{
          id: 7,
          slug: "presenca-com-totalizacao",
          type: "presenca",
          status: "aberto",
          title: "Formulario Atual",
          labels: [],
          fieldDefinitions: [
            { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
            { id: 2, type: "yes_no", label: "Vai?", required: true, show: true, total: true },
            { id: 3, type: "number", label: "Convidados", required: false, show: true, total: true },
          ],
          resultsConfig: {
            searchEnabled: true,
            showLinkedRoster: true,
            totalsLayout: [
              { fieldId: 2, style: "bar" },
              { fieldId: 3, style: "metric" },
            ],
          },
          scaleSections: [],
        }}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Remover" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Adicionar Vai?" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar Formulario" }));

    await waitFor(() => expect(onSaveForm).toHaveBeenCalledTimes(1));
    expect(onSaveForm.mock.calls[0][0].resultsConfig).toEqual({
      searchEnabled: true,
      showLinkedRoster: true,
      blockDuplicatePersonResponses: false,
      totalsLayout: [
        { fieldId: 3, style: "number" },
        { fieldId: 2, style: "split" },
      ],
    });
  });

  it("salva metadados do campo base normalizado no formulario", async () => {
    const onSaveForm = vi.fn().mockResolvedValue({ ok: true });

    render(
      <CreateFormScreen
        {...baseProps}
        onSaveForm={onSaveForm}
        fieldCatalog={[{
          id: 11,
          key: "presenca_sessao",
          name: "Presenca em sessao",
          type: "yes_no",
          category: "presenca",
          defaultLabel: "Sessao",
          active: true,
        }]}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Ex: Presenca Sessao de Escala - 02/05/2026"), {
      target: { value: "Formulario Catalogado" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Adicionar Campo/i }));
    fireEvent.click(screen.getByRole("button", { name: "Campo existente" }));
    fireEvent.change(screen.getByDisplayValue("Selecione um campo base"), { target: { value: "11" } });
    fireEvent.change(screen.getByPlaceholderText("Ex: Vai ao Jantar?"), { target: { value: "15h - Sessao" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    fireEvent.click(screen.getByRole("button", { name: "Publicar Formulario" }));

    await waitFor(() => expect(onSaveForm).toHaveBeenCalledTimes(1));
    expect(onSaveForm.mock.calls[0][0].fieldDefinitions).toEqual(expect.arrayContaining([
      expect.objectContaining({
        catalogFieldId: 11,
        catalogKey: "presenca_sessao",
        catalogName: "Presenca em sessao",
        label: "15h - Sessao",
      }),
    ]));
  });

  it("salva regras de validacao configuradas no campo", async () => {
    const onSaveForm = vi.fn().mockResolvedValue({ ok: true });

    render(<CreateFormScreen {...baseProps} onSaveForm={onSaveForm} />);

    fireEvent.change(screen.getByPlaceholderText("Ex: Presenca Sessao de Escala - 02/05/2026"), {
      target: { value: "Formulario Validado" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Adicionar Campo/i }));
    fireEvent.change(screen.getByDisplayValue("Sim / Nao"), { target: { value: "text" } });
    fireEvent.change(screen.getByLabelText("Minimo de caracteres"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("Maximo de caracteres"), { target: { value: "10" } });
    fireEvent.change(screen.getByPlaceholderText("Ex: Vai ao Jantar?"), { target: { value: "Observacao" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    fireEvent.click(screen.getByRole("button", { name: "Publicar Formulario" }));

    await waitFor(() => expect(onSaveForm).toHaveBeenCalledTimes(1));
    expect(onSaveForm.mock.calls[0][0].fieldDefinitions[0].validation).toEqual({
      minLength: 3,
      maxLength: 10,
    });
  });

  it("mantem o tipo do campo existente definido pelo catalogo", async () => {
    const onSaveForm = vi.fn().mockResolvedValue({ ok: true });

    render(
      <CreateFormScreen
        {...baseProps}
        onSaveForm={onSaveForm}
        fieldCatalog={[{
          id: 11,
          key: "presenca_sessao",
          name: "Presenca em sessao",
          type: "yes_no",
          category: "presenca",
          defaultLabel: "Sessao",
          active: true,
        }]}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Ex: Presenca Sessao de Escala - 02/05/2026"), {
      target: { value: "Formulario Catalogado" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Adicionar Campo/i }));
    fireEvent.click(screen.getByRole("button", { name: "Campo existente" }));
    fireEvent.change(screen.getByDisplayValue("Selecione um campo base"), { target: { value: "11" } });

    const typeSelect = screen.getByDisplayValue("Sim / Nao");
    expect(typeSelect).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText("Ex: Vai ao Jantar?"), { target: { value: "15h - Sessao" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    fireEvent.click(screen.getByRole("button", { name: "Publicar Formulario" }));

    await waitFor(() => expect(onSaveForm).toHaveBeenCalledTimes(1));
    expect(onSaveForm.mock.calls[0][0].fieldDefinitions).toEqual(expect.arrayContaining([
      expect.objectContaining({
        catalogFieldId: 11,
        type: "yes_no",
        label: "15h - Sessao",
      }),
    ]));
  });

  it("cancelar edicao limpa o rascunho antes de criar novo campo", async () => {
    const onSaveForm = vi.fn().mockResolvedValue({ ok: true });

    render(
      <CreateFormScreen
        {...baseProps}
        onSaveForm={onSaveForm}
        form={{
          id: 7,
          slug: "presenca-cancelamento",
          type: "presenca",
          status: "aberto",
          title: "Formulario Atual",
          labels: [],
          fieldDefinitions: [
            { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
            { id: 2, type: "text", label: "Observacao antiga", required: false, show: true, total: false },
          ],
          resultsConfig: { searchEnabled: true, showLinkedRoster: true, totalsLayout: [] },
          scaleSections: [],
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Editar Observacao antiga" }));
    fireEvent.change(screen.getByDisplayValue("Observacao antiga"), { target: { value: "Nao deve salvar" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    fireEvent.click(screen.getByRole("button", { name: /Adicionar Campo/i }));
    fireEvent.change(screen.getByPlaceholderText("Ex: Vai ao Jantar?"), { target: { value: "Novo campo local" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar Formulario" }));

    await waitFor(() => expect(onSaveForm).toHaveBeenCalledTimes(1));
    expect(onSaveForm.mock.calls[0][0].fieldDefinitions).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 2, label: "Observacao antiga" }),
      expect.objectContaining({ label: "Novo campo local" }),
    ]));
    expect(onSaveForm.mock.calls[0][0].fieldDefinitions).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "Nao deve salvar" }),
    ]));
  });

  it("edita linhas e colunas de campo grade sem perder a configuracao", async () => {
    const onSaveForm = vi.fn().mockResolvedValue({ ok: true });

    render(
      <CreateFormScreen
        {...baseProps}
        onSaveForm={onSaveForm}
        form={{
          id: 7,
          slug: "presenca-grade",
          type: "presenca",
          status: "aberto",
          title: "Formulario Atual",
          labels: [],
          fieldDefinitions: [
            { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
            { id: 9, type: "grid", label: "Avaliacao", required: false, show: true, total: false, gridRows: ["Audio", "Limpeza"], gridCols: ["1", "2"] },
          ],
          resultsConfig: { searchEnabled: true, showLinkedRoster: true, totalsLayout: [] },
          scaleSections: [],
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Editar Avaliacao" }));
    fireEvent.change(screen.getByDisplayValue("Audio"), { target: { value: "Audio e video" } });
    fireEvent.change(screen.getByDisplayValue("2"), { target: { value: "Bom" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar campo" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar Formulario" }));

    await waitFor(() => expect(onSaveForm).toHaveBeenCalledTimes(1));
    expect(onSaveForm.mock.calls[0][0].fieldDefinitions).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 9,
        type: "grid",
        label: "Avaliacao",
        gridRows: ["Audio e video", "Limpeza"],
        gridCols: ["1", "Bom"],
      }),
    ]));
  });

  it("usa schema de matriz do catalogo sem editar linhas no formulario", async () => {
    const onSaveForm = vi.fn().mockResolvedValue({ ok: true });

    render(
      <CreateFormScreen
        {...baseProps}
        onSaveForm={onSaveForm}
        fieldCatalog={[{
          id: 20,
          key: "avaliacao_matriz",
          name: "Avaliacao em matriz",
          type: "grid",
          category: "avaliacao",
          defaultLabel: "Avaliacao",
          gridSchema: { rows: ["Audio", "Limpeza"], cols: ["Ruim", "Bom"] },
          active: true,
        }]}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Ex: Presenca Sessao de Escala - 02/05/2026"), {
      target: { value: "Formulario com matriz" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Adicionar Campo/i }));
    fireEvent.click(screen.getByRole("button", { name: "Campo existente" }));
    fireEvent.change(screen.getByDisplayValue("Selecione um campo base"), { target: { value: "20" } });

    expect(screen.getByText(/A matriz deste campo vem do catalogo global/)).toBeInTheDocument();
    expect(screen.queryByText("Adicionar linha")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    fireEvent.click(screen.getByRole("button", { name: "Publicar Formulario" }));

    await waitFor(() => expect(onSaveForm).toHaveBeenCalledTimes(1));
    expect(onSaveForm.mock.calls[0][0].fieldDefinitions).toEqual(expect.arrayContaining([
      expect.objectContaining({
        catalogFieldId: 20,
        type: "grid",
        gridRows: ["Audio", "Limpeza"],
        gridCols: ["Ruim", "Bom"],
      }),
    ]));
  });

  it("nao repovoa totalizadores removidos ao reabrir edicao", async () => {
    const onSaveForm = vi.fn().mockResolvedValue({ ok: true });

    render(
      <CreateFormScreen
        {...baseProps}
        onSaveForm={onSaveForm}
        form={{
          id: 7,
          slug: "presenca-totalizacao",
          type: "presenca",
          status: "aberto",
          title: "Formulario Atual",
          labels: [],
          fieldDefinitions: [
            { id: 1, type: "yes_no", label: "15h", required: true, show: true, total: true },
            { id: 2, type: "yes_no", label: "18h", required: true, show: true, total: true },
          ],
          resultsConfig: { searchEnabled: true, showLinkedRoster: false, totalsLayout: [{ fieldId: 2, style: "metric" }] },
          scaleSections: [],
        }}
      />,
    );

    expect(screen.queryByText("15h")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Salvar Formulario" }));

    await waitFor(() => expect(onSaveForm).toHaveBeenCalledTimes(1));
    expect(onSaveForm.mock.calls[0][0].resultsConfig.totalsLayout).toEqual([{ fieldId: 2, style: "split" }]);
  });

  it("salva secao de escala com tarefa existente ou local", async () => {
    const onSaveForm = vi.fn().mockResolvedValue({ ok: true });

    render(
      <CreateFormScreen
        {...baseProps}
        onSaveForm={onSaveForm}
        scaleTaskCatalog={[{
          id: 31,
          key: "preparo_jantar",
          name: "Preparo do jantar",
          category: "cozinha",
          defaultLabel: "Preparacao do jantar",
          active: true,
        }]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Escala da Organ/ }));
    fireEvent.change(screen.getByPlaceholderText("Ex: Presenca Sessao de Escala - 02/05/2026"), {
      target: { value: "Escala Teste" },
    });
    fireEvent.change(screen.getByLabelText("Limite por pessoa na escala"), {
      target: { value: "2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar secao" }));
    fireEvent.click(screen.getByRole("button", { name: "Tarefa existente" }));
    fireEvent.change(screen.getByDisplayValue("Selecione uma tarefa base"), { target: { value: "31" } });
    fireEvent.change(screen.getByDisplayValue("Preparacao do jantar"), { target: { value: "Jantar 17h" } });
    fireEvent.click(screen.getByRole("button", { name: "Publicar Escala" }));

    await waitFor(() => expect(onSaveForm).toHaveBeenCalledTimes(1));
    expect(onSaveForm.mock.calls[0][0].scaleSections).toEqual([
      expect.objectContaining({
        catalogTaskId: 31,
        catalogKey: "preparo_jantar",
        catalogName: "Preparo do jantar",
        title: "Jantar 17h",
      }),
    ]);
    expect(onSaveForm.mock.calls[0][0].resultsConfig.maxAssignmentsPerPerson).toBe(2);
  });

  it("exibe confirmacao de sucesso e volta para a listagem apos editar", async () => {
    const onSaveForm = vi.fn().mockResolvedValue({ ok: true });
    const onNavigate = vi.fn();

    render(
      <CreateFormScreen
        {...baseProps}
        onSaveForm={onSaveForm}
        onNavigate={onNavigate}
        form={{
          id: 7,
          slug: "presenca-editada",
          type: "presenca",
          status: "aberto",
          title: "Formulario Atual",
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
        }}
      />,
    );

    fireEvent.click(screen.getByLabelText("Habilitar pesquisa na planilha de respostas"));
    fireEvent.click(screen.getByRole("button", { name: "Salvar Formulario" }));

    await waitFor(() => expect(screen.getByText("Formulario alterado com sucesso")).toBeInTheDocument());
    expect(onNavigate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Voltar para Formularios" }));

    expect(onNavigate).toHaveBeenCalledWith("list");
  });
});
