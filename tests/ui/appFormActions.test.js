/**
 * @file tests/ui/appFormActions.test.js
 * @summary Testes das acoes de formulario do shell principal.
 * @responsibility Validar mutacoes extraidas de App.jsx para formularios, respostas e escala.
 */

import { describe, expect, it, vi } from "vitest";
import {
  archiveAppForm,
  claimAppEscalaSlot,
  deleteAppForm,
  saveAppEscala,
  saveAppForm,
  saveAppResponse,
  startDuplicateForm,
  startEventFormCreation,
} from "../../frontend/src/lib/appFormActions";

describe("appFormActions", () => {
  it("inicia criacao dentro de evento apenas para quem pode criar", () => {
    const setters = buildSetters();
    startEventFormCreation({
      event: { id: 9 },
      currentUser: { role: "admin" },
      canCreateForms: () => true,
      ...setters,
    });

    expect(setters.setActiveEventId).toHaveBeenCalledWith(9);
    expect(setters.setDraftForm).toHaveBeenCalledWith(null);
    expect(setters.setEditingFormId).toHaveBeenCalledWith(null);
    expect(setters.setScreen).toHaveBeenCalledWith("create");

    const blocked = buildSetters();
    startEventFormCreation({
      event: { id: 9 },
      currentUser: { role: "viewer" },
      canCreateForms: () => false,
      ...blocked,
    });
    expect(blocked.setScreen).not.toHaveBeenCalled();
  });

  it("prepara duplicacao de formulario", () => {
    const setters = buildSetters();
    startDuplicateForm({
      form: { id: 4, title: "Original" },
      currentUser: { role: "admin" },
      canCreateForms: () => true,
      buildDuplicateFormDraft: form => ({ title: `${form.title} copia` }),
      ...setters,
    });

    expect(setters.setDraftForm).toHaveBeenCalledWith({ title: "Original copia" });
    expect(setters.setEditingFormId).toHaveBeenCalledWith(null);
    expect(setters.setActiveFormId).toHaveBeenCalledWith(4);
    expect(setters.setScreen).toHaveBeenCalledWith("create");
  });

  it("salva formulario e vincula ao evento ativo quando necessario", async () => {
    const setBootstrap = vi.fn(updater => {
      const next = updater({ events: [{ id: 3, formIds: [1] }] });
      expect(next.events[0].formIds).toEqual([1, 2]);
    });
    const setDraftForm = vi.fn();
    const setEditingFormId = vi.fn();
    const setActiveFormId = vi.fn();

    const result = await saveAppForm({
      payload: { title: "Novo" },
      activeEventId: 3,
      events: [{ id: 3, formIds: [1] }],
      saveForm: vi.fn().mockResolvedValue({ form: { id: 2 } }),
      saveEvent: vi.fn().mockResolvedValue({ event: { id: 3, formIds: [1, 2] } }),
      refreshBootstrap: vi.fn().mockResolvedValue(null),
      setActiveFormId,
      setBootstrap,
      setDraftForm,
      setEditingFormId,
      replaceBootstrapList: (state, key, list) => ({ ...state, [key]: list }),
    });

    expect(result).toEqual({ id: 2 });
    expect(setDraftForm).toHaveBeenCalledWith(null);
    expect(setEditingFormId).toHaveBeenCalledWith(2);
    expect(setActiveFormId).toHaveBeenCalledWith(2);
  });

  it("arquiva formulario usando payload de formulario existente", async () => {
    const setDraftForm = vi.fn();
    const setEditingFormId = vi.fn();
    const setActiveFormId = vi.fn();

    const result = await archiveAppForm({
      form: { id: 8, status: "aberto" },
      nextStatus: "arquivado",
      currentUser: { role: "admin" },
      canCreateForms: () => true,
      buildSaveFormPayloadFromExisting: (form, status) => ({ id: form.id, status }),
      saveForm: vi.fn().mockResolvedValue({ form: { id: 8, status: "arquivado" } }),
      refreshBootstrap: vi.fn().mockResolvedValue({}),
      setActiveFormId,
      setDraftForm,
      setEditingFormId,
    });

    expect(result.status).toBe("arquivado");
    expect(setDraftForm).toHaveBeenCalledWith(null);
    expect(setEditingFormId).toHaveBeenCalledWith(null);
    expect(setActiveFormId).toHaveBeenCalledWith(8);
  });

  it("remove detalhes e vinculos ao excluir formulario", async () => {
    const setResponseDetails = vi.fn(updater => expect(updater({ 5: ["r"] })).toEqual({}));
    const setEscalaDetails = vi.fn(updater => expect(updater({ 5: ["s"] })).toEqual({}));
    const setBootstrap = vi.fn(updater => expect(updater({ events: [{ formIds: [5, 6] }] })).toEqual({ events: [{ formIds: [6] }] }));

    await deleteAppForm({
      formId: 5,
      masterKey: "key",
      deleteForm: vi.fn().mockResolvedValue({ ok: true }),
      refreshBootstrap: vi.fn().mockResolvedValue({}),
      setBootstrap,
      setEscalaDetails,
      setResponseDetails,
      removeFormDetail: (state, formId) => {
        const next = { ...state };
        delete next[formId];
        return next;
      },
      removeFormIdFromEvents: (state, formId) => ({ events: state.events.map(event => ({ ...event, formIds: event.formIds.filter(id => id !== formId) })) }),
    });
  });

  it("atualiza detalhes e metricas de resposta e escala", async () => {
    const setResponseDetails = vi.fn(updater => expect(updater({})).toEqual({ 2: [{ id: 1 }] }));
    const setEscalaDetails = vi.fn(updater => expect(updater({})).toEqual({ 3: [{ slots: [] }] }));
    const setBootstrap = vi.fn(updater => {
      const result = updater({ forms: [{ id: 2 }, { id: 3 }] });
      expect(result.forms).toBeDefined();
    });

    await saveAppResponse({
      payload: { formId: 2 },
      saveResponse: vi.fn().mockResolvedValue({ responses: [{ id: 1 }] }),
      setBootstrap,
      setResponseDetails,
      updateBootstrapFormMetrics: (state, formId, metrics) => ({ ...state, metrics: { formId, metrics } }),
      upsertFormDetail: (state, formId, detail) => ({ ...state, [formId]: detail }),
    });

    await saveAppEscala({
      formId: 3,
      sections: [],
      saveEscala: vi.fn().mockResolvedValue({ sections: [{ slots: [] }] }),
      setBootstrap,
      setEscalaDetails,
      buildEscalaMetrics: sections => ({ sections: sections.length }),
      updateBootstrapFormMetrics: (state, formId, metrics) => ({ ...state, metrics: { formId, metrics } }),
      upsertFormDetail: (state, formId, detail) => ({ ...state, [formId]: detail }),
    });
  });

  it("recarrega escala quando ha conflito ao ocupar slot", async () => {
    const error = Object.assign(new Error("conflict"), { status: 409 });
    const refreshEscalaForForm = vi.fn();

    await expect(claimAppEscalaSlot({
      formId: 7,
      sectionIndex: 0,
      slotIndex: 1,
      person: { name: "Maria" },
      claimEscalaSlot: vi.fn().mockRejectedValue(error),
      refreshEscalaForForm,
      setBootstrap: vi.fn(),
      setEscalaDetails: vi.fn(),
      buildEscalaMetrics: vi.fn(),
      updateBootstrapFormMetrics: vi.fn(),
      upsertFormDetail: vi.fn(),
    })).rejects.toThrow("conflict");

    expect(refreshEscalaForForm).toHaveBeenCalledWith(7);
  });
});

const buildSetters = () => ({
  setActiveEventId: vi.fn(),
  setActiveFormId: vi.fn(),
  setDraftForm: vi.fn(),
  setEditingFormId: vi.fn(),
  setScreen: vi.fn(),
});
