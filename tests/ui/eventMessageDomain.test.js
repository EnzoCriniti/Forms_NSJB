/**
 * @file tests/ui/eventMessageDomain.test.js
 * @summary Testes dos helpers puros do editor de mensagens de evento.
 * @responsibility Validar tipos elegiveis e montagem segura do draft inicial.
 */

import { describe, expect, it } from "vitest";
import {
  buildEventMessageSavePayload,
  buildEventMessageTypePatch,
  buildInitialEventMessageDraft,
  eligibleTypesForEvent,
  getEventMessageConfirmProps,
  isEventMessageCancellable,
  isEventMessageDispatchable,
  isEventMessageEditable,
  splitPreviewRecipients,
} from "../../frontend/src/screens/eventMessageDomain";

const presenca = { id: 1, type: "presenca", title: "Presenca" };
const escala = { id: 2, type: "escala_organ", title: "Escala" };

describe("eventMessageDomain", () => {
  it("resolve tipos elegiveis conforme os formularios do evento", () => {
    expect(eligibleTypesForEvent([])).toEqual([]);
    expect(eligibleTypesForEvent([presenca])).toEqual(["new_scale", "fill_reminder"]);
    expect(eligibleTypesForEvent([escala])).toEqual(["new_scale", "open_slots"]);
    expect(eligibleTypesForEvent([presenca, escala])).toEqual(["new_scale", "fill_reminder", "open_slots"]);
  });

  it("monta draft novo com tipo padrao e formulario alvo quando necessario", () => {
    expect(buildInitialEventMessageDraft(null, ["fill_reminder"], [presenca])).toEqual({
      id: null,
      type: "fill_reminder",
      templateId: "",
      body: "",
      formId: 1,
      recipientsMode: "auto",
      recipientsPresetId: "",
      recipientsPersonKeys: [],
      recipientsGraus: [],
      scheduledFor: "",
      windowOptions: [],
      autoDispatchEnabled: true,
    });
  });

  it("normaliza draft de mensagem existente preservando configuracoes", () => {
    expect(buildInitialEventMessageDraft({
      id: 9,
      type: "fill_reminder",
      templateId: 3,
      body: "Lembrete",
      config: { formId: 1, recipients: { mode: "manual", personKeys: ["7"] } },
      scheduledFor: "2026-05-20T10:00:00.000Z",
      autoDispatchEnabled: false,
    }, ["fill_reminder"], [presenca])).toEqual({
      id: 9,
      type: "fill_reminder",
      templateId: 3,
      body: "Lembrete",
      formId: 1,
      recipientsMode: "manual",
      recipientsPresetId: "",
      recipientsPersonKeys: ["7"],
      recipientsGraus: [],
      scheduledFor: "2026-05-20T10:00:00.000Z",
      windowOptions: [],
      autoDispatchEnabled: false,
    });
  });

  it("monta patch de troca de tipo preservando apenas campos compativeis", () => {
    expect(buildEventMessageTypePatch({
      nextType: "fill_reminder",
      currentDraft: { windowOptions: ["12h_before"], recipientsMode: "manual" },
      eventForms: [presenca],
    })).toEqual({
      type: "fill_reminder",
      templateId: "",
      formId: 1,
      windowOptions: ["12h_before"],
      recipientsMode: "auto",
    });

    expect(buildEventMessageTypePatch({
      nextType: "new_scale",
      currentDraft: { windowOptions: ["12h_before"], recipientsMode: "manual" },
      eventForms: [presenca],
    })).toEqual({
      type: "new_scale",
      templateId: "",
      formId: "",
      windowOptions: [],
      recipientsMode: "manual",
    });
  });

  it("monta payload de salvamento com destinatarios e agendamento normalizados", () => {
    expect(buildEventMessageSavePayload({
      id: null,
      type: "fill_reminder",
      templateId: "3",
      body: "Lembrete",
      formId: "1",
      recipientsMode: "preset",
      recipientsPresetId: "7",
      recipientsPersonKeys: [],
      scheduledFor: "",
      windowOptions: ["morning_of_closing"],
      autoDispatchEnabled: true,
    })).toEqual({
      id: undefined,
      type: "fill_reminder",
      templateId: 3,
      body: "Lembrete",
      config: { formId: 1, recipients: { mode: "preset", presetId: 7, graus: [] }, windowOptions: ["morning_of_closing"] },
      autoDispatchEnabled: true,
    });

    expect(buildEventMessageSavePayload({
      id: 4,
      type: "new_scale",
      templateId: "",
      body: "Escala",
      scheduledFor: "2026-05-20T10:00",
      autoDispatchEnabled: false,
    })).toMatchObject({
      id: 4,
      type: "new_scale",
      templateId: undefined,
      body: "Escala",
      config: {},
      autoDispatchEnabled: false,
      scheduledFor: new Date("2026-05-20T10:00").toISOString(),
    });
  });

  it("classifica acoes permitidas por status da mensagem", () => {
    expect(isEventMessageEditable("rascunho")).toBe(true);
    expect(isEventMessageEditable("pronta")).toBe(false);
    expect(isEventMessageCancellable("pronta")).toBe(true);
    expect(isEventMessageCancellable("disparada")).toBe(false);
    expect(isEventMessageDispatchable("agendada")).toBe(true);
    expect(isEventMessageDispatchable("cancelada")).toBe(false);
  });

  it("separa destinatarios ativos e ignorados do preview", () => {
    const split = splitPreviewRecipients({
      recipients: [
        { key: "1", skipped: false },
        { key: "2", skipped: true },
      ],
    });

    expect(split.recipientsActive).toEqual([{ key: "1", skipped: false }]);
    expect(split.recipientsSkipped).toEqual([{ key: "2", skipped: true }]);
  });

  it("resolve textos de confirmacao por acao", () => {
    expect(getEventMessageConfirmProps("dispatch")).toMatchObject({
      title: "Disparar mensagem",
      confirmLabel: "Disparar",
      tone: "primary",
    });
    expect(getEventMessageConfirmProps("cancel")).toMatchObject({
      title: "Cancelar mensagem",
      confirmLabel: "Cancelar mensagem",
      tone: "warning",
    });
    expect(getEventMessageConfirmProps("delete")).toMatchObject({
      title: "Excluir mensagem",
      confirmLabel: "Excluir",
      tone: "danger",
    });
  });
});
