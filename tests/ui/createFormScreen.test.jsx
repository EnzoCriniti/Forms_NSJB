/**
 * @file tests/ui/createFormScreen.test.jsx
 * @summary Testes de UI da criacao de formulario.
 * @responsibility Validar template vazio, configuracao de totalizacao e persistencia do submit.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CreateFormScreen } from "../../frontend/src/screens/CreateFormScreen.jsx";

const baseProps = {
  onNavigate: vi.fn(),
  people: [{ name: "Maria", grau: "QS" }],
  membersConfig: { sheetUrl: "https://docs.google.com/spreadsheets/d/demo" },
  externalBases: [],
  labels: [],
  presets: [],
  onSavePreset: vi.fn(),
  onSaveForm: vi.fn(),
};

const renderNewForm = ({ setupType = "presenca", ...props } = {}) => {
  const result = render(<CreateFormScreen {...baseProps} {...props} />);
  if (setupType === "escala_organ") {
    fireEvent.click(screen.getByRole("button", { name: /Escala da Organ/ }));
  }
  fireEvent.click(screen.getByRole("button", { name: "Continuar para o editor" }));
  return result;
};

describe("CreateFormScreen", () => {
  it("inicia novo formulario sem template selecionado", () => {
    const { container } = renderNewForm({ presets: [{ id: 1, type: "presenca", name: "Template A" }] });

    expect(screen.getByText("Templates de formulario")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Template vazio")).toBeInTheDocument();
    expect(screen.getByText("1 campo configurado")).toBeInTheDocument();
    expect(screen.getByText("Presenca do nucleo")).toBeInTheDocument();
    expect(container.querySelector(".create-form-mobile-hero")).toBeInTheDocument();
  });

  it("inicia no modo nucleo com campo da base central ativo", () => {
    renderNewForm();

    expect(screen.getByRole("spinbutton")).not.toBeDisabled();
    expect(screen.getByText("Configuracao dos Resultados")).toBeInTheDocument();
    expect(screen.getByLabelText("Habilitar pesquisa na planilha de respostas")).toBeInTheDocument();
    expect(screen.getByLabelText("Exibir lista da base vinculada e destacar faltantes")).not.toBeDisabled();
    expect(screen.getByLabelText("Permitir visualizacao publica dos resultados")).toBeInTheDocument();
    expect(screen.getByText("Campo principal da base central")).toBeInTheDocument();
  });

  it("preset o nome do formulario quando e criado dentro de um evento", async () => {
    const onSaveForm = vi.fn().mockResolvedValue({ ok: true });

    renderNewForm({
      onSaveForm,
      event: {
        id: 99,
        title: "Sessao de Maio",
        date: "2026-05-20",
      },
    });

    const titleInput = screen.getByDisplayValue("Presenca Sessao de Maio - 20/05/2026");
    expect(titleInput).toHaveAttribute("readonly");

    fireEvent.click(screen.getByRole("button", { name: "Publicar Formulario" }));

    await waitFor(() => expect(onSaveForm).toHaveBeenCalledTimes(1));
    expect(onSaveForm.mock.calls[0][0].title).toBe("Presenca Sessao de Maio - 20/05/2026");
  });

  it("preset o nome da escala quando e criada dentro de um evento", async () => {
    const onSaveForm = vi.fn().mockResolvedValue({ ok: true });

    renderNewForm({
      setupType: "escala_organ",
      onSaveForm,
      event: {
        id: 88,
        title: "Sessao de Escala",
        date: "2026-05-20",
      },
    });

    const titleInput = screen.getByDisplayValue("Escala da Organ - 20/05/2026");
    expect(titleInput).toHaveAttribute("readonly");

    fireEvent.click(screen.getByRole("button", { name: "Publicar Escala" }));

    await waitFor(() => expect(onSaveForm).toHaveBeenCalledTimes(1));
    expect(onSaveForm.mock.calls[0][0].title).toBe("Escala da Organ - 20/05/2026");
  });

  it("abre a pre-visualizacao e reflete o rascunho atual", () => {
    renderNewForm();

    expect(screen.queryByText("Pre-visualizacao do formulario")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Visualizar formulario" }));
    fireEvent.change(screen.getByPlaceholderText("Ex: Presenca Sessao de Escala - 02/05/2026"), {
      target: { value: "Formulario Preview" },
    });
    fireEvent.change(screen.getByPlaceholderText("Prezada Irmandade..."), {
      target: { value: "Descricao da previa" },
    });

    expect(screen.getByText("Pre-visualizacao do formulario")).toBeInTheDocument();
    expect(screen.getByText("Formulario Preview")).toBeInTheDocument();
    expect(screen.getAllByText("Descricao da previa")).toHaveLength(2);
    expect(screen.getAllByText("Nome")).not.toHaveLength(0);
    expect(screen.getByRole("button", { name: "Ocultar visualizacao" })).toBeInTheDocument();
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
    expect(screen.getByLabelText("Exibir lista da base vinculada e destacar faltantes")).toBeDisabled();
  });

  it("troca para formulario geral e remove a base central do payload", async () => {
    const onSaveForm = vi.fn().mockResolvedValue({ ok: true });

    renderNewForm({ onSaveForm });

    fireEvent.click(screen.getByRole("button", { name: /Formulario geral/i }));
    fireEvent.change(screen.getByPlaceholderText("Ex: Presenca Sessao de Escala - 02/05/2026"), {
      target: { value: "Formulario Geral" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Publicar Formulario" }));

    await waitFor(() => expect(onSaveForm).toHaveBeenCalledTimes(1));
    expect(onSaveForm.mock.calls[0][0].fieldDefinitions).toEqual([]);
    expect(onSaveForm.mock.calls[0][0].resultsConfig.formMode).toBe("geral");
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
      publicResultsEnabled: false,
      formMode: "nucleo",
      totalsLayout: [
        { fieldId: 3, style: "number" },
        { fieldId: 2, style: "split" },
      ],
    });
  });

  it("salva metadados do campo base normalizado no formulario", async () => {
    const onSaveForm = vi.fn().mockResolvedValue({ ok: true });

    renderNewForm({
      onSaveForm,
      fieldCatalog: [{
          id: 11,
          key: "presenca_sessao",
          name: "Presenca em sessao",
          type: "yes_no",
          category: "presenca",
          defaultLabel: "Sessao",
          active: true,
      }],
    });

    fireEvent.change(screen.getByPlaceholderText("Ex: Presenca Sessao de Escala - 02/05/2026"), {
      target: { value: "Formulario Catalogado" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Adicionar Campo/i }));
    fireEvent.click(screen.getByRole("button", { name: "Da biblioteca" }));
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

  it("salva o campo principal da base central com papel explicito no modo nucleo", async () => {
    const onSaveForm = vi.fn().mockResolvedValue({ ok: true });

    renderNewForm({ onSaveForm });

    fireEvent.change(screen.getByPlaceholderText("Ex: Presenca Sessao de Escala - 02/05/2026"), {
      target: { value: "Formulario Vinculado" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Publicar Formulario" }));

    await waitFor(() => expect(onSaveForm).toHaveBeenCalledTimes(1));
    expect(onSaveForm.mock.calls[0][0].fieldDefinitions).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: "person_select",
        selectionSource: { kind: "members" },
        memberBinding: { source: "members", role: "primary" },
      }),
    ]));
  });

  it("salva campo vinculado a base externa", async () => {
    const onSaveForm = vi.fn().mockResolvedValue({ ok: true });

    renderNewForm({
      onSaveForm,
      fieldCatalog: [
          {
            id: 77,
            key: "congregacoes",
            name: "Congregacoes",
            type: "person_select",
            category: "presenca",
            defaultLabel: "Congregacao",
            selectionSource: { kind: "external_base", externalBaseId: 88 },
            active: true,
          },
      ],
      externalBases: [
          { id: 88, name: "Lista de Congregacoes", active: true, items: [] },
      ],
    });

    fireEvent.change(screen.getByPlaceholderText("Ex: Presenca Sessao de Escala - 02/05/2026"), {
      target: { value: "Formulario com Base Externa" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Adicionar Campo/i }));
    fireEvent.click(screen.getByRole("button", { name: "Da biblioteca" }));
    fireEvent.change(screen.getByDisplayValue("Selecione um campo base"), { target: { value: "77" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    fireEvent.click(screen.getByRole("button", { name: "Publicar Formulario" }));

    await waitFor(() => expect(onSaveForm).toHaveBeenCalledTimes(1));
    expect(onSaveForm.mock.calls[0][0].fieldDefinitions).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: "person_select",
        label: "Congregacao",
        selectionSource: { kind: "external_base", externalBaseId: 88 },
      }),
    ]));
    expect(onSaveForm.mock.calls[0][0].fieldDefinitions).not.toEqual(expect.arrayContaining([
      expect.objectContaining({
        label: "Congregacao",
        memberBinding: expect.anything(),
      }),
    ]));
  });

  it("salva regras de validacao configuradas no campo", async () => {
    const onSaveForm = vi.fn().mockResolvedValue({ ok: true });

    renderNewForm({ onSaveForm });

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
    expect(onSaveForm.mock.calls[0][0].fieldDefinitions.find(field => field.label === "Observacao")?.validation).toEqual({
      minLength: 3,
      maxLength: 10,
    });
  });

  it("mantem o tipo do campo existente definido pelo catalogo", async () => {
    const onSaveForm = vi.fn().mockResolvedValue({ ok: true });

    renderNewForm({
      onSaveForm,
      fieldCatalog: [{
          id: 11,
          key: "presenca_sessao",
          name: "Presenca em sessao",
          type: "yes_no",
          category: "presenca",
          defaultLabel: "Sessao",
          active: true,
      }],
    });

    fireEvent.change(screen.getByPlaceholderText("Ex: Presenca Sessao de Escala - 02/05/2026"), {
      target: { value: "Formulario Catalogado" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Adicionar Campo/i }));
    fireEvent.click(screen.getByRole("button", { name: "Da biblioteca" }));
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

    renderNewForm({
      onSaveForm,
      fieldCatalog: [{
          id: 20,
          key: "avaliacao_matriz",
          name: "Avaliacao em matriz",
          type: "grid",
          category: "avaliacao",
          defaultLabel: "Avaliacao",
          gridSchema: { rows: ["Audio", "Limpeza"], cols: ["Ruim", "Bom"] },
          active: true,
      }],
    });

    fireEvent.change(screen.getByPlaceholderText("Ex: Presenca Sessao de Escala - 02/05/2026"), {
      target: { value: "Formulario com matriz" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Adicionar Campo/i }));
    fireEvent.click(screen.getByRole("button", { name: "Da biblioteca" }));
    fireEvent.change(screen.getByDisplayValue("Selecione um campo base"), { target: { value: "20" } });

    expect(screen.getByText(/A matriz deste campo vem da biblioteca global/)).toBeInTheDocument();
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

    renderNewForm({
      setupType: "escala_organ",
      onSaveForm,
      scaleTaskCatalog: [{
          id: 31,
          key: "preparo_jantar",
          name: "Preparo do jantar",
          category: "cozinha",
          defaultLabel: "Preparacao do jantar",
          active: true,
      }],
    });

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

    expect(screen.getByText("Tipo do formulario")).toBeInTheDocument();
    expect(screen.getByText("O tipo e a estrutura do formulario vigente ficam travados na edicao. Para mudar isso, use duplicacao ou crie um novo formulario.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Salvar como Template" })).not.toBeInTheDocument();
    expect(screen.queryByText("Modo do formulario")).not.toBeInTheDocument();
    expect(screen.queryByText("Templates de formulario")).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Habilitar pesquisa na planilha de respostas"));
    fireEvent.click(screen.getByRole("button", { name: "Salvar Formulario" }));

    await waitFor(() => expect(screen.getByText("Formulario alterado com sucesso")).toBeInTheDocument());
    expect(onNavigate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Voltar para Formularios" }));

    expect(onNavigate).toHaveBeenCalledWith("list");
  });
});
