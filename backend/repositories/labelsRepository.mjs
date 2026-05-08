/**
 * @file backend/repositories/labelsRepository.mjs
 * @summary Acesso a dados de classificacoes.
 * @responsibility Ler, gravar e remover labels administrativas.
 */

import { nowIso } from "../database/shared.mjs";
import { database } from "../database/index.mjs";

export const listLabels = async () => (await database.queryMany(`
  SELECT id, name, color, created_by
  FROM labels
  ORDER BY id ASC
`)).map(row => ({
  id: row.id,
  name: row.name,
  color: row.color,
  createdBy: row.created_by,
}));

export const upsertLabelRecord = async ({ id, name, color, createdBy }) => {
  const now = nowIso();
  if (id) {
    await database.execute("UPDATE labels SET name = ?, color = ?, created_by = ?, updated_at = ? WHERE id = ?", [name, color, createdBy, now, id]);
    return;
  }
  await database.execute("INSERT INTO labels (name, color, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?) RETURNING id", [name, color, createdBy, now, now]);
};

export const deleteLabelRecord = async id => {
  await database.execute("DELETE FROM labels WHERE id = ?", [id]);
};
