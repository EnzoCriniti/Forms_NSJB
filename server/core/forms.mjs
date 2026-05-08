/**
 * @file server/core/forms.mjs
 * @summary Regras utilitarias de formularios.
 * @responsibility Normalizar slug e montar secoes iniciais da escala.
 */

const SCALE_COLORS = ["#ffcdd2", "#bbdefb", "#f8bbd0", "#c8e6c9", "#ffe0b2", "#d1c4e9"];

export const normalizeSlug = value => String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

export const buildScaleSections = sections => sections.map((section, index) => ({
  title: section.title,
  color: section.color || SCALE_COLORS[index % SCALE_COLORS.length],
  slots: [
    ...Array.from({ length: Number(section.responsaveis || 0) }, () => ({ role: "Responsável", person: "" })),
    ...Array.from({ length: Number(section.auxiliares || 0) }, () => ({ role: "Auxiliar", person: "" })),
  ],
}));
