/**
 * @file tests/ui/appEventActions.test.js
 * @summary Testes das acoes de eventos do shell principal.
 * @responsibility Validar mutacoes extraidas de App.jsx para eventos.
 */

import { describe, expect, it, vi } from "vitest";
import { deleteAppEvent, publishAppEvent, saveAppEvent, toggleAppPinnedEvent } from "../../frontend/src/lib/appEventActions";

describe("appEventActions", () => {
  it("salva evento e reordena a lista", async () => {
    const setBootstrap = vi.fn(updater => {
      expect(updater({ events: [{ id: 1, date: "2026-05-01" }] })).toEqual({
        events: [{ id: 2, date: "2026-05-02" }, { id: 1, date: "2026-05-01" }],
      });
    });

    const result = await saveAppEvent({
      payload: { title: "Novo" },
      saveEvent: vi.fn().mockResolvedValue({ event: { id: 2, date: "2026-05-02" } }),
      setBootstrap,
      replaceBootstrapList: (state, key, value) => ({ ...state, [key]: value }),
      sortBootstrapEventsByDateDesc: list => [...list].sort((a, b) => b.date.localeCompare(a.date)),
    });

    expect(result).toEqual({ id: 2, date: "2026-05-02" });
  });

  it("publica evento com upsert na lista", async () => {
    const setBootstrap = vi.fn(updater => {
      expect(updater({ events: [{ id: 4, status: "rascunho" }] })).toEqual({
        events: [{ id: 4, status: "publicado" }],
      });
    });

    const result = await publishAppEvent({
      id: 4,
      publishEvent: vi.fn().mockResolvedValue({ event: { id: 4, status: "publicado" } }),
      setBootstrap,
      upsertBootstrapListItem: (state, key, item) => ({
        ...state,
        [key]: state[key].map(entry => entry.id === item.id ? item : entry),
      }),
    });

    expect(result.status).toBe("publicado");
  });

  it("exclui evento, remove pin e limpa selecao ativa", async () => {
    const setPinnedEventsByUser = vi.fn(updater => {
      expect(updater({ 1: [7, 8] })).toEqual({ 1: [8] });
    });
    const setBootstrap = vi.fn(updater => {
      expect(updater({ events: [{ id: 7 }, { id: 8 }] })).toEqual({ events: [{ id: 8 }] });
    });
    const setActiveEventId = vi.fn();

    await deleteAppEvent({
      id: 7,
      activeEventId: 7,
      currentUser: { id: 1 },
      deleteEvent: vi.fn().mockResolvedValue({ ok: true }),
      removeBootstrapListItem: (state, key, predicate) => ({ ...state, [key]: state[key].filter(item => !predicate(item)) }),
      removePinnedIdForUser: (state, userId, id) => ({ ...state, [userId]: state[userId].filter(item => item !== id) }),
      setActiveEventId,
      setBootstrap,
      setPinnedEventsByUser,
    });

    expect(setActiveEventId).toHaveBeenCalledWith(null);
  });

  it("alterna evento fixado por usuario", () => {
    const setPinnedEventsByUser = vi.fn(updater => {
      expect(updater({ 3: [5] })).toEqual({ 3: [5, 6] });
    });

    toggleAppPinnedEvent({
      eventId: 6,
      currentUser: { id: 3 },
      setPinnedEventsByUser,
      togglePinnedIdForUser: (state, userId, id) => ({ ...state, [userId]: [...(state[userId] || []), id] }),
    });
  });
});
