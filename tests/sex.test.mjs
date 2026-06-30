/**
 * @file tests/sex.test.mjs
 * @summary Testa as regras puras de sexo (sócio/escala/elegibilidade).
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_ESCALA_SEX,
  isPersonEligibleForEscala,
  normalizeEscalaSex,
  normalizePersonSex,
} from "../shared/sex.mjs";

test("normalizePersonSex reconhece variações comuns", () => {
  assert.equal(normalizePersonSex("M"), "male");
  assert.equal(normalizePersonSex("Masculino"), "male");
  assert.equal(normalizePersonSex("homem"), "male");
  assert.equal(normalizePersonSex("F"), "female");
  assert.equal(normalizePersonSex("Feminino"), "female");
  assert.equal(normalizePersonSex(""), "");
  assert.equal(normalizePersonSex("xyz"), "");
});

test("normalizeEscalaSex cai em unisex quando inválido", () => {
  assert.equal(normalizeEscalaSex("male"), "male");
  assert.equal(normalizeEscalaSex("female"), "female");
  assert.equal(normalizeEscalaSex("unisex"), "unisex");
  assert.equal(normalizeEscalaSex(""), DEFAULT_ESCALA_SEX);
  assert.equal(normalizeEscalaSex("qualquer"), "unisex");
});

test("elegibilidade: unisex aceita todos", () => {
  assert.equal(isPersonEligibleForEscala("male", "unisex"), true);
  assert.equal(isPersonEligibleForEscala("female", "unisex"), true);
  assert.equal(isPersonEligibleForEscala("", "unisex"), true);
});

test("elegibilidade: escala restrita exige mesmo sexo definido", () => {
  assert.equal(isPersonEligibleForEscala("male", "male"), true);
  assert.equal(isPersonEligibleForEscala("female", "male"), false);
  assert.equal(isPersonEligibleForEscala("male", "female"), false);
  // sexo desconhecido NÃO entra em escala restrita
  assert.equal(isPersonEligibleForEscala("", "male"), false);
  assert.equal(isPersonEligibleForEscala("", "female"), false);
});
