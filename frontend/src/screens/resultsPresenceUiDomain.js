/**
 * @file frontend/src/screens/resultsPresenceUiDomain.js
 * @summary Helpers puros de interacao e estilo da planilha de presenca.
 */

export const TABLE_ZOOM_MIN = 0.4;
export const TABLE_ZOOM_MAX = 2.5;
export const TABLE_ZOOM_STEP = 0.1;

export const clampTableZoom = value => Math.min(TABLE_ZOOM_MAX, Math.max(TABLE_ZOOM_MIN, Number(value) || 1));

export const getPresenceTouchDistance = touches => {
  if (!touches || touches.length < 2) return 0;
  const [first, second] = touches;
  return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
};

export const resolvePresenceSortState = ({ sortCol, sortDir, nextCol }) => {
  if (sortCol !== nextCol) {
    return { sortCol: nextCol, sortDir: "asc" };
  }

  if (sortDir === "asc") {
    return { sortCol, sortDir: "desc" };
  }

  return { sortCol: null, sortDir: "asc" };
};

export const getPresenceSortIconName = ({ sortCol, sortDir, col }) => {
  if (sortCol !== col) return "sortNone";
  return sortDir === "asc" ? "sortAsc" : "sortDesc";
};

export const buildPresenceHeaderCellStyle = ({ col, sortCol, colors }) => ({
  padding: "10px 12px",
  textAlign: ["grau", "name", "status"].includes(col) ? "left" : "center",
  color: "#fff",
  fontWeight: 600,
  whiteSpace: "nowrap",
  cursor: "pointer",
  userSelect: "none",
  background: sortCol === col ? colors.primaryDark : colors.primary,
  transition: "background 0.15s",
  verticalAlign: "top",
  minWidth: col === "grau" ? 90 : col === "name" ? 160 : col === "status" ? 110 : 130,
});
