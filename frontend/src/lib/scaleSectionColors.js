/**
 * @file frontend/src/lib/scaleSectionColors.js
 * @summary Normaliza cores vermelhas de secoes da Escala da Organ, preservando rosa.
 */

const SCALE_SECTION_PALETTE = ["#fff2c7", "#dff2ec", "#e5edf7", "#e8e2f3", "#e6efe1"];

const parseHexColor = color => {
  const value = String(color || "").trim().toLowerCase();
  const shortMatch = /^#([0-9a-f]{3})$/.exec(value);
  if (shortMatch) {
    const [r, g, b] = shortMatch[1].split("").map(part => parseInt(part + part, 16));
    return { r, g, b };
  }
  const longMatch = /^#([0-9a-f]{6})$/.exec(value);
  if (!longMatch) return null;
  return {
    r: parseInt(longMatch[1].slice(0, 2), 16),
    g: parseInt(longMatch[1].slice(2, 4), 16),
    b: parseInt(longMatch[1].slice(4, 6), 16),
  };
};

export const isRedScaleColor = color => {
  const rgb = parseHexColor(color);
  return Boolean(
    rgb
    && rgb.r >= 170
    && rgb.r > rgb.g + 24
    && rgb.r > rgb.b + 24
    && Math.abs(rgb.g - rgb.b) <= 18,
  );
};

export const resolveScaleSectionColor = (color, index = 0) => {
  const fallback = SCALE_SECTION_PALETTE[Math.abs(index) % SCALE_SECTION_PALETTE.length];
  if (!color || isRedScaleColor(color)) return fallback;
  return color;
};
