/**
 * @file server/repositories/peopleRepository.mjs
 * @summary Acesso a dados de socios/pessoas.
 * @responsibility Ler e substituir a lista global usada nos seletores.
 */

import { db, nowIso } from "../db.mjs";

export const listPeople = () => db.prepare(`
  SELECT id, name, grau
  FROM people
  ORDER BY lower(name) ASC, id ASC
`).all();

export const replacePeopleRecords = people => {
  const now = nowIso();
  db.exec("DELETE FROM people");
  const stmt = db.prepare("INSERT INTO people (name, grau, created_at, updated_at) VALUES (?, ?, ?, ?)");
  for (const person of people) {
    if (!person?.name?.trim()) continue;
    stmt.run(person.name.trim(), person.grau || "", now, now);
  }
};
