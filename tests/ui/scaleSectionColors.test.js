/**
 * @file tests/ui/scaleSectionColors.test.js
 * @summary Garante que a Escala da Organ remova vermelho e preserve rosa.
 */

import { describe, expect, it } from "vitest";
import { isRedScaleColor, resolveScaleSectionColor } from "../../frontend/src/lib/scaleSectionColors.js";

describe("scaleSectionColors", () => {
  it("substitui tons vermelhos pela paleta suave da escala", () => {
    expect(isRedScaleColor("#ffcdd2")).toBe(true);
    expect(isRedScaleColor("#c62828")).toBe(true);
    expect(resolveScaleSectionColor("#ffcdd2", 0)).toBe("#fff2c7");
    expect(resolveScaleSectionColor("#c62828", 1)).toBe("#dff2ec");
  });

  it("preserva rosa, azul, verde e dourado existentes", () => {
    expect(isRedScaleColor("#f8bbd0")).toBe(false);
    expect(resolveScaleSectionColor("#f8bbd0", 0)).toBe("#f8bbd0");
    expect(resolveScaleSectionColor("#bbdefb", 1)).toBe("#bbdefb");
    expect(resolveScaleSectionColor("#c8e6c9", 2)).toBe("#c8e6c9");
    expect(resolveScaleSectionColor("#fff2c7", 3)).toBe("#fff2c7");
  });
});
