/**
 * @file tests/ui/eventsDomain.test.js
 * @summary Testes dos helpers puros da tela de eventos.
 * @responsibility Validar drafts, seletores, elegibilidade e paginacao de eventos.
 */

import { describe, expect, it } from "vitest";
import { buildEventDraft, emptyEventDraft, isEventEligibleForMessages, paginateItems, selectEventForms, sortEvents } from "../../frontend/src/screens/eventsDomain";

describe("eventsDomain", () => {
  it("monta draft de evento com defaults e formIds seguros", () => {
    expect(buildEventDraft(null)).toEqual(emptyEventDraft);
    expect(buildEventDraft({ id: 1, title: "Evento", formIds: null })).toEqual({
      ...emptyEventDraft,
      id: 1,
      title: "Evento",
      formIds: [],
    });
  });

  it("ordena eventos fixados antes e depois por data/id desc", () => {
    const events = [
      { id: 1, date: "2026-05-01" },
      { id: 2, date: "2026-05-03" },
      { id: 3, date: "2026-05-03" },
      { id: 4, date: "2026-05-02" },
    ];

    expect(sortEvents(events, new Set([1])).map(event => event.id)).toEqual([1, 3, 2, 4]);
  });

  it("seleciona formularios do evento e oculta arquivados para viewer", () => {
    const forms = [
      { id: 1, title: "Aberto", status: "aberto" },
      { id: 2, title: "Arquivado", status: "arquivado" },
      { id: 3, title: "Fora", status: "aberto" },
    ];
    const selectedEvent = { formIds: [1, 2] };

    expect(selectEventForms({ forms, selectedEvent, user: { role: "admin" } }).map(form => form.id)).toEqual([1, 2]);
    expect(selectEventForms({ forms, selectedEvent, user: { role: "viewer" } }).map(form => form.id)).toEqual([1]);
  });

  it("detecta eventos elegiveis para mensagens", () => {
    expect(isEventEligibleForMessages([{ type: "formulario_simples" }])).toBe(false);
    expect(isEventEligibleForMessages([{ type: "formulario_simples" }, { type: "escala_organ" }])).toBe(true);
  });

  it("pagina listas com pagina segura e faixa exibida", () => {
    const pagination = paginateItems({ items: [1, 2, 3, 4, 5], page: 3, pageSize: 2 });

    expect(pagination).toEqual({
      totalPages: 3,
      safePage: 3,
      pageItems: [5],
      rangeStart: 5,
      rangeEnd: 5,
    });

    expect(paginateItems({ items: [], page: 5, pageSize: 2 })).toEqual({
      totalPages: 1,
      safePage: 1,
      pageItems: [],
      rangeStart: 0,
      rangeEnd: 0,
    });
  });
});
