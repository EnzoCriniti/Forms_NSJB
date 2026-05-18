import { describe, expect, it } from "vitest";
import { createEmptyBootstrap, normalizeBootstrap, pickActiveFormIdAfterBootstrap, removeBootstrapListItem, removeNestedBootstrapItem, removeFormIdFromEvents, replaceBootstrapList, sortBootstrapEventsByDateDesc, updateBootstrapFormMetrics, upsertBootstrapListItem, upsertNestedBootstrapItem } from "../../frontend/src/lib/appBootstrap";

describe("appBootstrap helpers", () => {
  it("cria a estrutura vazia padrao", () => {
    const bootstrap = createEmptyBootstrap();
    expect(bootstrap.forms).toEqual([]);
    expect(bootstrap.events).toEqual([]);
    expect(bootstrap.messagingConfig.publicBaseUrl).toBe("");
  });

  it("normaliza o bootstrap sem perder o padrao", () => {
    const bootstrap = normalizeBootstrap({ forms: [{ id: 1 }], messagingConfig: { whatsappGroupName: "Grupo" } });
    expect(bootstrap.forms).toEqual([{ id: 1 }]);
    expect(bootstrap.events).toEqual([]);
    expect(bootstrap.messagingConfig.whatsappGroupName).toBe("Grupo");
  });

  it("escolhe o primeiro formulario visivel quando a selecao nao deve ser preservada", () => {
    const nextFormId = pickActiveFormIdAfterBootstrap({
      currentFormId: 10,
      currentUser: { id: 1 },
      forms: [{ id: 10 }, { id: 20 }],
      visibleForms: [{ id: 20 }],
      preserveSelection: false,
    });
    expect(nextFormId).toBe(20);
  });

  it("volta para o primeiro formulario quando o ativo desaparece", () => {
    const nextFormId = pickActiveFormIdAfterBootstrap({
      currentFormId: 10,
      currentUser: { id: 1 },
      forms: [{ id: 20 }],
      visibleForms: [{ id: 20 }],
      preserveSelection: true,
    });
    expect(nextFormId).toBe(20);
  });

  it("substitui listas do bootstrap sem perder as demais chaves", () => {
    const bootstrap = replaceBootstrapList({ forms: [], labels: ["a"] }, "labels", ["b"]);
    expect(bootstrap.forms).toEqual([]);
    expect(bootstrap.labels).toEqual(["b"]);
  });

  it("insere ou atualiza itens de uma lista do bootstrap", () => {
    const initial = { events: [{ id: 1, name: "A" }] };
    const updated = upsertBootstrapListItem(initial, "events", { id: 1, name: "B" });
    const appended = upsertBootstrapListItem(updated, "events", { id: 2, name: "C" });
    expect(updated.events).toEqual([{ id: 1, name: "B" }]);
    expect(appended.events).toEqual([{ id: 1, name: "B" }, { id: 2, name: "C" }]);
  });

  it("remove itens de uma lista do bootstrap", () => {
    const bootstrap = removeBootstrapListItem({ events: [{ id: 1 }, { id: 2 }] }, "events", item => item.id === 1);
    expect(bootstrap.events).toEqual([{ id: 2 }]);
  });

  it("atualiza itens aninhados em uma lista do bootstrap", () => {
    const initial = { events: [{ id: 1, messages: [{ id: 10, text: "A" }] }] };
    const appended = upsertNestedBootstrapItem(initial, "events", event => event.id === 1, "messages", { id: 11, text: "B" });
    const updated = upsertNestedBootstrapItem(appended, "events", event => event.id === 1, "messages", { id: 10, text: "C" });
    expect(appended.events[0].messages).toEqual([{ id: 10, text: "A" }, { id: 11, text: "B" }]);
    expect(updated.events[0].messages).toEqual([{ id: 10, text: "C" }, { id: 11, text: "B" }]);
  });

  it("remove itens aninhados de uma lista do bootstrap", () => {
    const bootstrap = removeNestedBootstrapItem(
      { events: [{ id: 1, messages: [{ id: 10 }, { id: 11 }] }] },
      "events",
      event => event.id === 1,
      "messages",
      message => message.id === 10,
    );
    expect(bootstrap.events[0].messages).toEqual([{ id: 11 }]);
  });

  it("atualiza as metricas de um formulario sem mexer nos demais", () => {
    const bootstrap = updateBootstrapFormMetrics(
      { forms: [{ id: 1, metrics: { responses: 2 } }, { id: 2, metrics: { responses: 0 } }] },
      1,
      { responses: 5, total: 8 },
    );

    expect(bootstrap.forms).toEqual([
      { id: 1, metrics: { responses: 5, total: 8 } },
      { id: 2, metrics: { responses: 0 } },
    ]);
  });

  it("remove um formulario de todos os eventos vinculados", () => {
    const bootstrap = removeFormIdFromEvents(
      { events: [{ id: 1, formIds: [10, 11] }, { id: 2, formIds: [11, 12] }] },
      11,
    );

    expect(bootstrap.events).toEqual([
      { id: 1, formIds: [10] },
      { id: 2, formIds: [12] },
    ]);
  });

  it("ordena eventos por data mais recente e id", () => {
    const events = sortBootstrapEventsByDateDesc([
      { id: 1, date: "2026-05-01" },
      { id: 3, date: "2026-05-03" },
      { id: 2, date: "2026-05-03" },
    ]);

    expect(events.map(event => event.id)).toEqual([3, 2, 1]);
  });
});
