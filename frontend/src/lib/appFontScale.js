/**
 * @file frontend/src/lib/appFontScale.js
 * @summary Limites e normalizacao da escala de fonte do app.
 */

export const FONT_SCALE_MIN = 1;
export const FONT_SCALE_MAX = 1.3;
export const FONT_SCALE_STEP = 0.1;

export const clampFontScale = value => Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, Number(value.toFixed(2))));
