/**
 * @file tests/secretBox.test.mjs
 * @summary Testa a cifra de segredos em repouso.
 * @responsibility Garantir round-trip, formato de envelope e tolerancia a texto puro legado.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { decryptSecret, encryptSecret, isEncrypted } from "../backend/core/secretBox.mjs";

test("cifra e decifra preservando o valor", () => {
  const token = "AC0123456789secrettoken";
  const sealed = encryptSecret(token);
  assert.ok(isEncrypted(sealed));
  assert.notEqual(sealed, token);
  assert.equal(decryptSecret(sealed), token);
});

test("string vazia permanece vazia", () => {
  assert.equal(encryptSecret(""), "");
  assert.equal(decryptSecret(""), "");
});

test("nao recifra um valor ja cifrado", () => {
  const sealed = encryptSecret("abc");
  assert.equal(encryptSecret(sealed), sealed);
});

test("decifrar texto puro legado devolve o proprio valor", () => {
  assert.equal(isEncrypted("plain-token"), false);
  assert.equal(decryptSecret("plain-token"), "plain-token");
});

test("cada cifra usa IV novo (saidas diferentes para a mesma entrada)", () => {
  assert.notEqual(encryptSecret("mesmo"), encryptSecret("mesmo"));
});
