/**
 * @file frontend/src/features/admin/adminSettingsConstants.js
 * @summary Constantes e normalizadores compartilhados do admin.
 * @responsibility Centralizar labels, estilo de input e helpers puros de catalogo.
 */

import { COLORS } from "../../components/ui";

export const PAGE_SIZE = 6;

export const ADMIN_INPUT_STYLE = {
  width: "100%",
  minHeight: 42,
  padding: "10px 12px",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 10,
  background: COLORS.surface,
  color: COLORS.text,
  boxShadow: "var(--shadow-sm)",
};

export const fieldTypeLabels = {
  person_select: "Seletor por base",
  yes_no: "Sim / Nao",
  number: "Numero",
  text: "Texto",
  grid: "Grade",
};

export const fieldCategoryLabels = {
  presenca: "Presenca",
  quantidade: "Quantidade",
  texto: "Texto",
  avaliacao: "Avaliacao",
  outro: "Outro",
};

export const taskCategoryLabels = {
  cozinha: "Cozinha",
  limpeza: "Limpeza",
  organizacao: "Organizacao",
  sessao: "Sessao",
  outro: "Outro",
};

export const normalizeFieldSelectionSource = field => {
  if (field?.type !== "person_select") return undefined;
  if (field.selectionSource?.kind === "external_base") {
    return {
      kind: "external_base",
      externalBaseId: Number(field.selectionSource.externalBaseId || 0),
    };
  }
  return { kind: "members" };
};

export const normalizeIdentifier = value => String(value || "")
  .trim()
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");

export const getExternalBaseName = (externalBases, baseId) => (externalBases || []).find(base => String(base.id) === String(baseId || ""))?.name || "base externa";
