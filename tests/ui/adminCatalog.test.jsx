/**
 * @file tests/ui/adminCatalog.test.jsx
 * @summary Testes do catalogo administrativo.
 * @responsibility Validar CRUD visual de campos base e tarefas base.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminSettingsModal } from "../../frontend/src/features/admin/AdminSettingsModal.jsx";

const { fetchAuditLogsMock } = vi.hoisted(() => ({
  fetchAuditLogsMock: vi.fn(),
}));

vi.mock("../../frontend/src/lib/api.js", () => ({
  fetchAuditLogs: (...args) => fetchAuditLogsMock(...args),
}));

beforeEach(() => {
  fetchAuditLogsMock.mockReset();
});

const baseProps = {
  users: [],
  labels: [],
  presets: [],
  fieldCatalog: [],
  scaleTaskCatalog: [],
  membersConfig: {},
  externalBases: [],
  people: [],
  currentUser: { id: 1, name: "Admin", role: "admin" },
  onSaveUser: vi.fn(),
  onDeleteUser: vi.fn(),
  onSaveLabel: vi.fn(),
  onDeleteLabel: vi.fn(),
  onSavePreset: vi.fn(),
  onDeletePreset: vi.fn(),
  onSaveMembersConfig: vi.fn(),
  onSaveExternalBase: vi.fn(),
  onDeleteExternalBase: vi.fn(),
  onSyncExternalBase: vi.fn(),
  onSavePeople: vi.fn(),
  onSyncMembersConfig: vi.fn(),
  formDeleteKeyConfigured: false,
  onSaveFormDeleteKey: vi.fn(),
  onSaveFieldCatalogItem: vi.fn(),
  onDeleteFieldCatalogItem: vi.fn(),
  onSaveScaleTaskCatalogItem: vi.fn(),
  onDeleteScaleTaskCatalogItem: vi.fn(),
  onClose: vi.fn(),
};

describe("AdminSettingsModal catalogo", () => {
  it("cria campo base de formulario", () => {
    const onSaveFieldCatalogItem = vi.fn();
    render(<AdminSettingsModal {...baseProps} onSaveFieldCatalogItem={onSaveFieldCatalogItem} />);

    fireEvent.click(screen.getByRole("button", { name: "Campos e tarefas" }));
    fireEvent.change(screen.getByPlaceholderText("Opcional. Ex: presenca_sessao"), { target: { value: "presenca_sessao" } });
    fireEvent.change(screen.getByPlaceholderText("Ex: Presenca em sessao"), { target: { value: "Presenca em sessao" } });
    fireEvent.change(screen.getByPlaceholderText("Ex: Sessao"), { target: { value: "Sessao" } });
    expect(screen.getByText("Previa do campo")).toBeInTheDocument();
    expect(screen.getByText("Sessao")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Criar campo" }));

    expect(onSaveFieldCatalogItem).toHaveBeenCalledWith(expect.objectContaining({
      key: "presenca_sessao",
      name: "Presenca em sessao",
      defaultLabel: "Sessao",
      type: "yes_no",
      category: "presenca",
    }));
  });

  it("cria campo base vinculado a base externa", () => {
    const onSaveFieldCatalogItem = vi.fn();
    render(
      <AdminSettingsModal
        {...baseProps}
        externalBases={[
          { id: 88, name: "Lista de Congregacoes", active: true, items: [] },
        ]}
        onSaveFieldCatalogItem={onSaveFieldCatalogItem}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Campos e tarefas" }));
    fireEvent.change(screen.getByPlaceholderText("Opcional. Ex: presenca_sessao"), { target: { value: "congregacoes" } });
    fireEvent.change(screen.getByPlaceholderText("Ex: Presenca em sessao"), { target: { value: "Congregacoes" } });
    fireEvent.change(screen.getByPlaceholderText("Ex: Sessao"), { target: { value: "Congregacao" } });
    fireEvent.change(screen.getByDisplayValue("Sim / Nao"), { target: { value: "person_select" } });
    fireEvent.click(screen.getByRole("button", { name: /Base externa/i }));
    fireEvent.click(screen.getByRole("button", { name: "Criar campo" }));

    expect(onSaveFieldCatalogItem).toHaveBeenCalledWith(expect.objectContaining({
      key: "congregacoes",
      name: "Congregacoes",
      defaultLabel: "Congregacao",
      type: "person_select",
      selectionSource: { kind: "external_base", externalBaseId: 88 },
    }));
  });

  it("cria tarefa base da escala", () => {
    const onSaveScaleTaskCatalogItem = vi.fn();
    render(<AdminSettingsModal {...baseProps} onSaveScaleTaskCatalogItem={onSaveScaleTaskCatalogItem} />);

    fireEvent.click(screen.getByRole("button", { name: "Campos e tarefas" }));
    fireEvent.click(screen.getByRole("button", { name: "Tarefas da escala" }));
    fireEvent.change(screen.getByPlaceholderText("Opcional. Ex: preparo_jantar"), { target: { value: "preparo_jantar" } });
    fireEvent.change(screen.getByPlaceholderText("Ex: Preparo do jantar"), { target: { value: "Preparo do jantar" } });
    fireEvent.change(screen.getByPlaceholderText("Ex: Preparacao do jantar"), { target: { value: "Preparacao do jantar" } });
    fireEvent.click(screen.getByRole("button", { name: "Criar tarefa" }));

    expect(onSaveScaleTaskCatalogItem).toHaveBeenCalledWith(expect.objectContaining({
      key: "preparo_jantar",
      name: "Preparo do jantar",
      defaultLabel: "Preparacao do jantar",
      category: "cozinha",
    }));
  });

  it("configura matriz no catalogo de campo base", () => {
    const onSaveFieldCatalogItem = vi.fn();
    render(<AdminSettingsModal {...baseProps} onSaveFieldCatalogItem={onSaveFieldCatalogItem} />);

    fireEvent.click(screen.getByRole("button", { name: "Campos e tarefas" }));
    fireEvent.change(screen.getByPlaceholderText("Opcional. Ex: presenca_sessao"), { target: { value: "avaliacao_matriz" } });
    fireEvent.change(screen.getByPlaceholderText("Ex: Presenca em sessao"), { target: { value: "Avaliacao em matriz" } });
    fireEvent.change(screen.getByPlaceholderText("Ex: Sessao"), { target: { value: "Avaliacao" } });
    fireEvent.change(screen.getByDisplayValue("Sim / Nao"), { target: { value: "grid" } });
    fireEvent.change(screen.getByDisplayValue("Opcao 1"), { target: { value: "Audio" } });
    fireEvent.change(screen.getByDisplayValue("3"), { target: { value: "Bom" } });
    fireEvent.click(screen.getByRole("button", { name: "Criar campo" }));

    expect(onSaveFieldCatalogItem).toHaveBeenCalledWith(expect.objectContaining({
      type: "grid",
      gridSchema: expect.objectContaining({
        rows: expect.arrayContaining(["Audio"]),
        cols: expect.arrayContaining(["Bom"]),
      }),
    }));
  });

  it("pagina listas grandes do catalogo", () => {
    const fieldCatalog = Array.from({ length: 8 }, (_, index) => ({
      id: index + 1,
      key: `campo_${index + 1}`,
      name: `Campo ${index + 1}`,
      type: "yes_no",
      category: "presenca",
      defaultLabel: `Campo ${index + 1}`,
      active: true,
    }));

    render(<AdminSettingsModal {...baseProps} fieldCatalog={fieldCatalog} />);

    fireEvent.click(screen.getByRole("button", { name: "Campos e tarefas" }));
    expect(screen.getByText("Campo 1")).toBeInTheDocument();
    expect(screen.queryByText("Campo 8")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Proxima" }));

    expect(screen.getByText("Campo 8")).toBeInTheDocument();
  });

  it("confirma exclusao antes de remover usuario", () => {
    const onDeleteUser = vi.fn();
    render(
      <AdminSettingsModal
        {...baseProps}
        onDeleteUser={onDeleteUser}
        users={[
          { id: 1, name: "Admin", username: "admin", role: "admin" },
          { id: 2, name: "Usuario Teste", username: "teste", role: "viewer" },
        ]}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Remover" })[1]);
    expect(screen.getByRole("heading", { name: "Excluir usuario" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    expect(onDeleteUser).toHaveBeenCalledWith(2);
  });

  it("cadastra a chave mestra quando ela ainda nao existe", async () => {
    const onSaveFormDeleteKey = vi.fn().mockResolvedValue({ configured: true });
    render(<AdminSettingsModal {...baseProps} onSaveFormDeleteKey={onSaveFormDeleteKey} formDeleteKeyConfigured={false} />);

    fireEvent.click(screen.getByRole("button", { name: "Exclusao segura" }));
    fireEvent.change(screen.getByPlaceholderText("Nova chave mestra"), { target: { value: "segredo-novo" } });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar chave" }));

    expect(onSaveFormDeleteKey).toHaveBeenCalledWith({
      currentMasterKey: undefined,
      newMasterKey: "segredo-novo",
    });
  });

  it("exige chave atual para alterar a chave mestra existente", async () => {
    const onSaveFormDeleteKey = vi.fn().mockResolvedValue({ configured: true });
    render(<AdminSettingsModal {...baseProps} onSaveFormDeleteKey={onSaveFormDeleteKey} formDeleteKeyConfigured={true} />);

    fireEvent.click(screen.getByRole("button", { name: "Exclusao segura" }));
    fireEvent.change(screen.getByPlaceholderText("Chave mestra atual"), { target: { value: "antiga" } });
    fireEvent.change(screen.getByPlaceholderText("Nova chave mestra"), { target: { value: "nova" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alteracao" }));

    expect(onSaveFormDeleteKey).toHaveBeenCalledWith({
      currentMasterKey: "antiga",
      newMasterKey: "nova",
    });
  });

  it("salva e sincroniza a base central de socios", async () => {
    const onSaveMembersConfig = vi.fn().mockResolvedValue({
      membersConfig: {
        sourceType: "google_sheets",
      },
    });
    const onSyncMembersConfig = vi.fn().mockResolvedValue({
      importedCount: 2,
      membersConfig: {
        sourceType: "google_sheets",
        lastSyncedAt: "2026-05-08T12:00:00.000Z",
      },
      people: [
        { id: 1, name: "Ana", grau: "M", active: true },
        { id: 2, name: "Bruno", grau: "C", active: false },
      ],
    });

    render(
      <AdminSettingsModal
        {...baseProps}
        membersConfig={{
          sourceType: "google_sheets",
          sheetUrl: "",
          nameColumn: "B",
          grauColumn: "A",
          syncEnabled: true,
        }}
        people={[
          { id: 1, name: "Ana", grau: "M", active: true },
          { id: 2, name: "Bruno", grau: "C", active: false },
        ]}
        onSaveMembersConfig={onSaveMembersConfig}
        onSyncMembersConfig={onSyncMembersConfig}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Base de socios" }));
    fireEvent.change(screen.getByPlaceholderText("https://docs.google.com/spreadsheets/d/..."), {
      target: { value: "https://docs.google.com/spreadsheets/d/teste123/edit#gid=0" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar configuracao" }));

    await waitFor(() => expect(onSaveMembersConfig).toHaveBeenCalledWith(expect.objectContaining({
      sheetUrl: "https://docs.google.com/spreadsheets/d/teste123/edit#gid=0",
      sourceType: "google_sheets",
    })));

    fireEvent.click(screen.getByRole("button", { name: "Sincronizar agora" }));

    await waitFor(() => expect(onSyncMembersConfig).toHaveBeenCalled());
    expect(screen.getByText("Previa da base atual (2)")).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Bruno")).toBeInTheDocument();
  });

  it("cria base externa para uso em campos do formulario", () => {
    const onSaveExternalBase = vi.fn();
    render(<AdminSettingsModal {...baseProps} onSaveExternalBase={onSaveExternalBase} />);

    fireEvent.click(screen.getByRole("button", { name: "Bases externas" }));
    fireEvent.change(screen.getByPlaceholderText("Ex: Congregacoes, Turnos, Equipes"), {
      target: { value: "Congregacoes" },
    });
    fireEvent.change(screen.getByPlaceholderText("Explique onde essa base sera usada no sistema."), {
      target: { value: "Lista de congregacoes para visitantes." },
    });
    fireEvent.change(screen.getByPlaceholderText("https://docs.google.com/spreadsheets/d/..."), {
      target: { value: "https://docs.google.com/spreadsheets/d/base123/edit#gid=0" },
    });
    fireEvent.change(screen.getByPlaceholderText("Itens!A:B"), {
      target: { value: "Congregacoes!A:D" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar base" }));

    expect(onSaveExternalBase).toHaveBeenCalledWith(expect.objectContaining({
      name: "Congregacoes",
      description: "Lista de congregacoes para visitantes.",
      sheetUrl: "https://docs.google.com/spreadsheets/d/base123/edit#gid=0",
      range: "Congregacoes!A:D",
      valueColumn: "A",
      labelColumn: "B",
      syncEnabled: true,
      active: true,
    }));
  });

  it("mostra o modo do template na lista de presets", () => {
    render(
      <AdminSettingsModal
        {...baseProps}
        presets={[
          {
            id: 1,
            name: "Template Nucleo",
            type: "presenca",
            resultsConfig: { formMode: "nucleo" },
            fieldDefinitions: [{ id: 1 }, { id: 2 }],
            createdBy: "Admin",
          },
          {
            id: 2,
            name: "Template Geral",
            type: "presenca",
            resultsConfig: { formMode: "geral" },
            fieldDefinitions: [{ id: 1 }],
            createdBy: "Admin",
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Templates" }));
    expect(screen.getByText("Como os templates funcionam")).toBeInTheDocument();
    expect(screen.getByText("Templates de formulario existentes")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Criar template" })).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Nome do template")).not.toBeInTheDocument();
    expect(screen.getByText("Presenca do nucleo - 2 campos - Criado por Admin")).toBeInTheDocument();
    expect(screen.getByText("Formulario geral - 1 campos - Criado por Admin")).toBeInTheDocument();
  });
});

describe("AdminSettingsModal auditoria", () => {
  it("mostra a aba de auditoria apenas para admin e carrega logs", async () => {
    fetchAuditLogsMock.mockResolvedValue({
      items: [
        {
          id: 1,
          createdAt: "2026-01-01T10:00:00.000Z",
          level: "info",
          category: "forms",
          action: "create_form",
          status: "success",
          screen: "formularios",
          actorName: "Admin",
          actorRole: "admin",
          entityType: "form",
          entityId: "1",
          entityLabel: "Formulario",
          message: "Formulario criado.",
          metadata: { formId: 1, fieldCount: 0, mode: "create" },
        },
      ],
      total: 1,
      limit: 10,
      offset: 0,
    });

    render(<AdminSettingsModal {...baseProps} />);

    expect(screen.getByRole("button", { name: "Historico" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Historico" }));

    expect(await screen.findByText("Formulario criado.")).toBeInTheDocument();
    expect(fetchAuditLogsMock).toHaveBeenCalledWith(expect.objectContaining({
      limit: 10,
      offset: 0,
    }));
    fireEvent.change(screen.getByPlaceholderText("Pesquisar mensagem ou contexto"), { target: { value: "Formulario" } });
    fireEvent.click(screen.getByRole("button", { name: "Aplicar filtros" }));
    await waitFor(() => expect(fetchAuditLogsMock).toHaveBeenLastCalledWith(expect.objectContaining({
      search: "Formulario",
      limit: 10,
      offset: 0,
    })));
  });

  it("nao mostra a aba de auditoria para viewer", () => {
    render(<AdminSettingsModal {...baseProps} currentUser={{ id: 2, name: "Viewer", role: "viewer" }} />);

    expect(screen.queryByRole("button", { name: "Historico" })).not.toBeInTheDocument();
  });

  it("mostra estado vazio quando nao ha logs", async () => {
    fetchAuditLogsMock.mockResolvedValue({
      items: [],
      total: 0,
      limit: 10,
      offset: 0,
    });

    render(<AdminSettingsModal {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Historico" }));

    expect(await screen.findByText("Nenhum log encontrado para os filtros atuais.")).toBeInTheDocument();
  });
});
