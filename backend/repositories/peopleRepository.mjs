/**
 * @file backend/repositories/peopleRepository.mjs
 * @summary Acesso a dados de socios/pessoas.
 * @responsibility Ler e substituir a lista global usada nos seletores.
 */

import { nowIso, parseJson, stringifyJson } from "../database/shared.mjs";
import { database } from "../database/index.mjs";

const mapPersonRow = row => ({
  id: row.id,
  name: row.name,
  grau: row.grau || "",
  phone: row.phone || "",
  active: row.active !== false,
  source: row.source || "manual",
  externalKey: row.external_key || "",
  syncedAt: row.synced_at || null,
  metadata: parseJson(row.metadata_json, {}),
});

export const listPeople = async () => database.queryMany(`
  SELECT id, name, grau, phone, active, source, external_key, metadata_json, synced_at
  FROM people
  ORDER BY lower(name) ASC, id ASC
`).then(rows => rows.map(mapPersonRow));

export const replacePeopleRecords = async people => {
  const now = nowIso();
  await database.withTransaction(async tx => {
    await tx.execute("DELETE FROM people");
    const insertSql = `
      INSERT INTO people (name, grau, phone, active, source, external_key, metadata_json, synced_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    for (const person of people) {
      if (!person?.name?.trim()) continue;
      await tx.execute(insertSql, [
        person.name.trim(),
        person.grau || "",
        person.phone || "",
        person.active !== false,
        person.source || "manual",
        person.externalKey || "",
        stringifyJson(person.metadata || {}),
        person.syncedAt || null,
        now,
        now,
      ]);
    }
  });
};
