/**
 * @file tests/ui/appHeaderTitle.test.js
 * @summary Cobertura dos titulos contextuais do header global.
 */

import { describe, expect, it } from "vitest";
import { resolveAppHeaderTitle } from "../../frontend/src/lib/appHeaderTitle.js";

const nav = [
  { key: "events", label: "Eventos" },
  { key: "messages", label: "Mensagens" },
];

describe("resolveAppHeaderTitle", () => {
  it("usa o rotulo de menu na listagem inicial de eventos", () => {
    expect(resolveAppHeaderTitle({ screen: "events", nav })).toBe("Eventos");
  });

  it("resolve titulos de telas fora do menu principal", () => {
    expect(resolveAppHeaderTitle({ screen: "settings", nav })).toBe("Configurações");
  });

  it("usa os nomes reais nos fluxos internos", () => {
    expect(resolveAppHeaderTitle({ screen: "events", nav, activeEvent: { title: "Capitulo Geral" } })).toBe("Capitulo Geral");
    expect(resolveAppHeaderTitle({ screen: "respond", nav, activeForm: { title: "Presenca de julho" } })).toBe("Presenca de julho");
    expect(resolveAppHeaderTitle({ screen: "results", nav, activeForm: { title: "Escala da Organ" } })).toBe("Escala da Organ");
    expect(resolveAppHeaderTitle({ screen: "create", nav, editingForm: { title: "Formulario de abertura" } })).toBe("Formulario de abertura");
  });

  it("mantem rotulos de menu e contextos de criacao ou mensagem", () => {
    expect(resolveAppHeaderTitle({ screen: "messages", nav })).toBe("Mensagens");
    expect(resolveAppHeaderTitle({ screen: "create", nav, activeEvent: { title: "Evento Agosto" } })).toBe("Novo formul\u00e1rio - Evento Agosto");
    expect(resolveAppHeaderTitle({ screen: "eventMessageEditor", nav, activeEvent: { title: "Evento Agosto" } })).toBe("Mensagem - Evento Agosto");
  });
});
