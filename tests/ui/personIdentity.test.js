/**
 * @file tests/ui/personIdentity.test.js
 * @summary Testes da identidade canonica de socios.
 */

import { describe, it, expect } from "vitest";
import { getPersonKey, getResponsePersonKey, normalizePersonKey } from "../../shared/personIdentity.mjs";

describe("personIdentity", () => {
  it("normaliza removendo acento, caixa e espacos redundantes", () => {
    expect(normalizePersonKey("  José   da   SILVA ")).toBe("jose da silva");
    expect(normalizePersonKey("Ana Pessôa")).toBe(normalizePersonKey("ANA PESSOA"));
  });

  it("trata valores vazios sem quebrar", () => {
    expect(normalizePersonKey(null)).toBe("");
    expect(normalizePersonKey(undefined)).toBe("");
  });

  it("deriva a chave da pessoa pelo nome", () => {
    expect(getPersonKey({ name: "María Clara" })).toBe("maria clara");
  });

  it("usa person_key gravado e cai para o nome em respostas legadas", () => {
    expect(getResponsePersonKey({ personKey: "joao", respondentName: "Ignorado" })).toBe("joao");
    expect(getResponsePersonKey({ respondentName: "João" })).toBe("joao");
  });
});
