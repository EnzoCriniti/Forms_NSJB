/**
 * @file backend/repositories/peopleRepository.mjs
 * @summary Acesso a dados de socios/pessoas.
 * @responsibility Ler e substituir a lista global usada nos seletores.
 */

import { nowIso } from "../database/shared.mjs";
import { database } from "../database/index.mjs";

export const listPeople = async () => database.queryMany(`
  SELECT id, name, grau
  FROM people
  ORDER BY lower(name) ASC, id ASC
`);

export const replacePeopleRecords = async people => {
  const now = nowIso();
  await database.withTransaction(async tx => {
    await tx.execute("DELETE FROM people");
    const insertSql = "INSERT INTO people (name, grau, created_at, updated_at) VALUES (?, ?, ?, ?)";
    for (const person of people) {
      if (!person?.name?.trim()) continue;
      await tx.execute(insertSql, [person.name.trim(), person.grau || "", now, now]);
    }
  });
};
