import { describe, expect, it } from "vitest";
import { createEmptyBootstrap, normalizeBootstrap, pickActiveFormIdAfterBootstrap, removeBootstrapListItem, replaceBootstrapList, upsertBootstrapListItem } from "../../frontend/src/lib/appBootstrap";

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
});
