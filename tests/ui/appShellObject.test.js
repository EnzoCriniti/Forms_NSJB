/**
 * @file tests/ui/appShellObject.test.js
 * @summary Testes da montagem do objeto do shell.
 * @responsibility Garantir composicao previsivel de estado, dados, acoes e setters.
 */

import { describe, expect, it, vi } from "vitest";
import { buildShellApp } from "../../frontend/src/lib/appShellObject";

describe("appShellObject", () => {
  it("combina blocos de estado, dados, acoes, setters e permissoes", () => {
    const onNavigate = vi.fn();
    const setScreen = vi.fn();
    const app = buildShellApp({
      state: { screen: "events", currentUser: { id: 1 } },
      data: { forms: [{ id: 2 }], events: [{ id: 3 }] },
      actions: { onNavigate },
      setters: { setScreen },
      permissions: { canCreateForms: () => true },
    });

    expect(app).toMatchObject({
      screen: "events",
      currentUser: { id: 1 },
      forms: [{ id: 2 }],
      events: [{ id: 3 }],
    });
    expect(app.onNavigate).toBe(onNavigate);
    expect(app.setScreen).toBe(setScreen);
    expect(app.canCreateForms({ role: "admin" })).toBe(true);
  });
});
