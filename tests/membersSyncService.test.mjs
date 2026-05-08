/**
 * @file tests/membersSyncService.test.mjs
 * @summary Testes unitarios da sincronizacao de socios.
 * @responsibility Garantir parsing e mapeamento estaveis para a base central de socios.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { mapPeopleFromRows, parseCsvRows } from "../backend/services/membersSyncHelpers.mjs";

test("parseCsvRows preserva campos com virgula e aspas", () => {
  const rows = parseCsvRows('grau,nome,telefone\n"M","Ana, Maria","5511999999999"\n"C","Joao ""Junior""","5511888888888"');

  assert.deepEqual(rows, [
    ["grau", "nome", "telefone"],
    ["M", "Ana, Maria", "5511999999999"],
    ["C", 'Joao "Junior"', "5511888888888"],
  ]);
});

test("mapPeopleFromRows converte colunas configuradas em socios normalizados", () => {
  const rows = [
    ["grau", "nome", "telefone", "external_id", "ativo"],
    ["M", "Ana", "5511999999999", "soc-1", "sim"],
    ["C", "Bruno", "5511888888888", "soc-2", "nao"],
  ];

  const people = mapPeopleFromRows(rows, {
    grauColumn: "A",
    nameColumn: "B",
    phoneColumn: "C",
    externalIdColumn: "D",
    activeColumn: "E",
  });

  assert.equal(people.length, 2);
  assert.deepEqual(people.map(person => ({
    name: person.name,
    grau: person.grau,
    phone: person.phone,
    active: person.active,
    source: person.source,
    externalKey: person.externalKey,
    rowNumber: person.metadata.rowNumber,
  })), [
    {
      name: "Ana",
      grau: "M",
      phone: "5511999999999",
      active: true,
      source: "google_sheets",
      externalKey: "soc-1",
      rowNumber: 2,
    },
    {
      name: "Bruno",
      grau: "C",
      phone: "5511888888888",
      active: false,
      source: "google_sheets",
      externalKey: "soc-2",
      rowNumber: 3,
    },
  ]);
  assert.ok(people[0].syncedAt);
});
