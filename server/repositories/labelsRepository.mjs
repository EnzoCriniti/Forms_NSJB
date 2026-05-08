/**
 * @file server/repositories/labelsRepository.mjs
 * @summary Acesso a dados de classificacoes.
 * @responsibility Ler, gravar e remover labels administrativas.
 */

import { db, nowIso } from "../db.mjs";

export const listLabels = () => db.prepare(`
  SELECT id, name, color, created_by
  FROM labels
  ORDER BY id ASC
`).all().map(row => ({
  id: row.id,
  name: row.name,
  color: row.color,
  createdBy: row.created_by,
}));

export const upsertLabelRecord = ({ id, name, color, createdBy }) => {
  const now = nowIso();
  if (id) {
    db.prepare("UPDATE labels SET name = ?, color = ?, created_by = ?, updated_at = ? WHERE id = ?")
      .run(name, color, createdBy, now, id);
    return;
  }
  db.prepare("INSERT INTO labels (name, color, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?)")
    .run(name, color, createdBy, now, now);
};

export const deleteLabelRecord = id => {
  db.prepare("DELETE FROM labels WHERE id = ?").run(id);
};
