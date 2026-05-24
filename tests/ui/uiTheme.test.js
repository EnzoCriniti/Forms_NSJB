/**
 * @file tests/ui/uiTheme.test.js
 * @summary Testes dos tokens compartilhados de UI.
 * @responsibility Garantir que cores base seguem exportadas pelo modulo de tema.
 */

import { describe, expect, it } from "vitest";
import { COLORS } from "../../frontend/src/components/uiTheme";

describe("uiTheme", () => {
  it("expoe os tokens de cor usados pelos componentes base", () => {
    expect(COLORS.primary).toBe("var(--primary)");
    expect(COLORS.surface).toBe("var(--surface)");
    expect(COLORS.textMuted).toBe("var(--text-muted)");
  });
});
