/**
 * @file tests/ui/appShell.test.js
 * @summary Testes dos helpers de shell do frontend.
 * @responsibility Cobrir rotas publicas canonicas.
 */

import { describe, it, expect } from "vitest";
import { buildPublicEventFormPath, getPublicRouteFromLocation } from "../../frontend/src/lib/appShell.js";

describe("appShell public routes", () => {
  it("monta e resolve link publico de formulario dentro de evento", () => {
    const path = buildPublicEventFormPath({ id: "evento maio" }, { id: 12 });
    expect(path).toBe("#/eventos/evento%20maio/12");

    window.location.hash = path;
    expect(getPublicRouteFromLocation()).toEqual({
      identifier: "12",
      eventIdentifier: "evento maio",
      view: "form",
      isLegacySlug: false,
    });
  });
});
