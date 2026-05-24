/**
 * @file tests/ui/appAdminActions.test.js
 * @summary Testes das acoes administrativas do shell principal.
 * @responsibility Validar mutacoes extraidas de App.jsx para admin e mensagens.
 */

import { describe, expect, it, vi } from "vitest";
import {
  applyAppMessageDeletion,
  applyAppMessageUpdate,
  deleteAppListResult,
  deleteAppMessageTemplate,
  deleteAppUser,
  openAppEventMessageDetail,
  openAppEventMessageEditor,
  saveAppEventMessage,
  saveAppListResult,
  saveAppMembersConfig,
  saveAppMessageTemplate,
  saveAppMessagingConfig,
  saveAppPersonPreset,
  saveAppUser,
  syncAppMembersConfig,
} from "../../frontend/src/lib/appAdminActions";

describe("appAdminActions", () => {
  it("salva usuario e atualiza sessao quando e o usuario atual", async () => {
    const applyBootstrapListResult = vi.fn();
    const setSession = vi.fn(updater => {
      expect(updater({ token: "t", user: { id: 1, name: "Antigo" } })).toEqual({
        token: "t",
        user: { id: 1, name: "Atualizado" },
      });
    });

    const result = await saveAppUser({
      user: { id: 1 },
      currentUser: { id: 1 },
      saveUser: vi.fn().mockResolvedValue({ users: [{ id: 1, name: "Atualizado" }] }),
      applyBootstrapListResult,
      sanitizeUser: user => user,
      setSession,
    });

    expect(result).toEqual({ ok: true });
    expect(applyBootstrapListResult).toHaveBeenCalledWith("users", { users: [{ id: 1, name: "Atualizado" }] });
  });

  it("exclui usuario atual e dispara logout", async () => {
    const logout = vi.fn();
    const applyBootstrapListResult = vi.fn();

    await deleteAppUser({
      id: 2,
      currentUser: { id: 2 },
      deleteUser: vi.fn().mockResolvedValue({ users: [] }),
      applyBootstrapListResult,
      logout,
    });

    expect(applyBootstrapListResult).toHaveBeenCalledWith("users", { users: [] });
    expect(logout).toHaveBeenCalled();
  });

  it("aplica resultados simples de listas administrativas", async () => {
    const applyBootstrapListResult = vi.fn();
    const saved = await saveAppListResult({
      payload: { name: "Label" },
      key: "labels",
      saveFn: vi.fn().mockResolvedValue({ labels: [{ id: 1 }] }),
      applyBootstrapListResult,
    });
    const deleted = await deleteAppListResult({
      id: 1,
      key: "labels",
      deleteFn: vi.fn().mockResolvedValue({ labels: [] }),
      applyBootstrapListResult,
    });

    expect(saved).toEqual({ labels: [{ id: 1 }] });
    expect(deleted).toEqual({ labels: [] });
    expect(applyBootstrapListResult).toHaveBeenCalledWith("labels", { labels: [{ id: 1 }] });
    expect(applyBootstrapListResult).toHaveBeenCalledWith("labels", { labels: [] });
  });

  it("salva e sincroniza configuracao de membros", async () => {
    const setBootstrap = vi.fn(updater => {
      expect(updater({ people: [] })).toEqual({ people: [{ name: "Maria" }], membersConfig: { sheetUrl: "url" } });
    });

    await syncAppMembersConfig({
      syncMembersConfig: vi.fn().mockResolvedValue({ people: [{ name: "Maria" }], membersConfig: { sheetUrl: "url" } }),
      setBootstrap,
      replaceBootstrapList: (state, key, value) => ({ ...state, [key]: value }),
    });

    const setBootstrapSave = vi.fn(updater => {
      expect(updater({})).toEqual({ membersConfig: { sheetUrl: "url" } });
    });
    await saveAppMembersConfig({
      nextConfig: { sheetUrl: "url" },
      saveMembersConfig: vi.fn().mockResolvedValue({ membersConfig: { sheetUrl: "url" } }),
      setBootstrap: setBootstrapSave,
      replaceBootstrapListFromResult: (state, key, result) => ({ ...state, [key]: result[key] }),
    });
  });

  it("salva configuracao de mensagens, template e preset", async () => {
    const setBootstrap = vi.fn(updater => {
      const next = updater({});
      expect(next).toBeDefined();
    });

    await expect(saveAppMessagingConfig({
      nextConfig: { publicBaseUrl: "https://app" },
      saveMessagingConfig: vi.fn().mockResolvedValue({ config: { publicBaseUrl: "https://app" } }),
      setBootstrap,
      replaceBootstrapList: (state, key, value) => ({ ...state, [key]: value }),
    })).resolves.toEqual({ publicBaseUrl: "https://app" });

    await expect(saveAppMessageTemplate({
      template: { name: "Aviso" },
      saveMessageTemplate: vi.fn().mockResolvedValue({ template: { id: 1 } }),
      setBootstrap,
      upsertBootstrapListItem: (state, key, item) => ({ ...state, [key]: [item] }),
    })).resolves.toEqual({ id: 1 });

    await expect(saveAppPersonPreset({
      preset: { name: "Todos" },
      savePersonPreset: vi.fn().mockResolvedValue({ preset: { id: 2 } }),
      setBootstrap,
      upsertBootstrapListItem: (state, key, item) => ({ ...state, [key]: [item] }),
    })).resolves.toEqual({ id: 2 });
  });

  it("remove template de mensagem", async () => {
    const setBootstrap = vi.fn(updater => {
      expect(updater({ messageTemplates: [{ id: 1 }, { id: 2 }] })).toEqual({ messageTemplates: [{ id: 2 }] });
    });

    await deleteAppMessageTemplate({
      id: 1,
      deleteMessageTemplate: vi.fn().mockResolvedValue({ ok: true }),
      setBootstrap,
      removeBootstrapListItem: (state, key, predicate) => ({ ...state, [key]: state[key].filter(item => !predicate(item)) }),
    });
  });

  it("salva mensagem de evento e atualiza lista aninhada", async () => {
    const setBootstrap = vi.fn(updater => {
      expect(updater({ events: [{ id: 4, messages: [] }] })).toEqual({ events: [{ id: 4, messages: [{ id: 9 }] }] });
    });

    await expect(saveAppEventMessage({
      eventId: 4,
      payload: {},
      saveEventMessage: vi.fn().mockResolvedValue({ message: { id: 9 } }),
      setBootstrap,
      upsertNestedBootstrapItem: (state, key, predicate, childKey, item) => ({
        ...state,
        [key]: state[key].map(parent => predicate(parent) ? { ...parent, [childKey]: [item, ...(parent[childKey] || [])] } : parent),
      }),
    })).resolves.toEqual({ id: 9 });
  });

  it("abre editor e detalhe de mensagem", () => {
    const setters = buildMessageSetters();
    openAppEventMessageEditor({ event: { id: 7 }, message: { id: 8 }, ...setters });
    expect(setters.setActiveEventId).toHaveBeenCalledWith(7);
    expect(setters.setActiveMessageId).toHaveBeenCalledWith(8);
    expect(setters.setScreen).toHaveBeenCalledWith("eventMessageEditor");

    const detailSetters = buildMessageSetters();
    openAppEventMessageDetail({ event: { id: 7 }, message: { id: 9 }, ...detailSetters });
    expect(detailSetters.setActiveEventId).toHaveBeenCalledWith(7);
    expect(detailSetters.setActiveMessageId).toHaveBeenCalledWith(9);
    expect(detailSetters.setScreen).toHaveBeenCalledWith("eventMessageDetail");
  });

  it("aplica atualizacao e exclusao de mensagem", () => {
    const setBootstrapUpdate = vi.fn(updater => {
      expect(updater({ events: [{ id: 1, messages: [] }] })).toEqual({ events: [{ id: 1, messages: [{ id: 3, eventId: 1 }] }] });
    });
    applyAppMessageUpdate({
      updated: { id: 3, eventId: 1 },
      setBootstrap: setBootstrapUpdate,
      upsertNestedBootstrapItem: (state, key, predicate, childKey, item) => ({
        ...state,
        [key]: state[key].map(parent => predicate(parent) ? { ...parent, [childKey]: [item] } : parent),
      }),
    });

    const setBootstrapDelete = vi.fn(updater => {
      expect(updater({ events: [{ messages: [{ id: 3 }, { id: 4 }] }] })).toEqual({ events: [{ messages: [{ id: 4 }] }] });
    });
    applyAppMessageDeletion({
      messageId: 3,
      setBootstrap: setBootstrapDelete,
      removeNestedBootstrapItem: (state, key, _predicate, childKey, predicate) => ({
        ...state,
        [key]: state[key].map(parent => ({ ...parent, [childKey]: parent[childKey].filter(item => !predicate(item)) })),
      }),
    });
  });
});

const buildMessageSetters = () => ({
  setActiveEventId: vi.fn(),
  setActiveMessageId: vi.fn(),
  setScreen: vi.fn(),
});
