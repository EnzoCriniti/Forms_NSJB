/**
 * @file frontend/src/lib/gridDefaults.js
 * @summary Defaults compartilhados para campos de grade.
 * @responsibility Manter linhas, colunas e presets de escala usados por editores de campos.
 */

export const DEFAULT_GRID_ROWS = ["Opcao 1", "Opcao 2"];
export const DEFAULT_GRID_COLS = ["0", "1", "2", "3"];

export const SCALE_PRESETS = [
  { label: "0 a 3", cols: ["0", "1", "2", "3"] },
  { label: "0 a 5", cols: ["0", "1", "2", "3", "4", "5"] },
  { label: "1 a 5", cols: ["1", "2", "3", "4", "5"] },
  { label: "Ruim / Bom", cols: ["Ruim", "Regular", "Bom", "Otimo"] },
  { label: "Discordo / Concordo", cols: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"] },
];
