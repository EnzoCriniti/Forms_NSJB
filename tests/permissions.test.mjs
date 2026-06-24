/**
 * @file tests/permissions.test.mjs
 * @summary Testes do engine puro de permissões (RBAC).
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
  ALL_CAPABILITIES,
  CAPABILITY_GROUPS,
  SYSTEM_LAYERS,
  deriveLegacyRole,
  hasCapability,
  normalizePermissions,
} from "../shared/permissions.mjs";

test("o registro não tem capacidades duplicadas", () => {
  assert.equal(ALL_CAPABILITIES.length, new Set(ALL_CAPABILITIES).size);
  assert.ok(ALL_CAPABILITIES.includes("forms.escala.edit"));
  assert.ok(ALL_CAPABILITIES.includes("layers.manage"));
});

test("preset Administrativo concede tudo; Visualizador é read-only", () => {
  assert.deepEqual([...SYSTEM_LAYERS.admin.permissions].sort(), [...ALL_CAPABILITIES].sort());
  assert.ok(hasCapability(SYSTEM_LAYERS.viewer.permissions, "results.view"));
  assert.ok(!hasCapability(SYSTEM_LAYERS.viewer.permissions, "events.create"));
  assert.ok(!hasCapability(SYSTEM_LAYERS.viewer.permissions, "users.manage"));
});

test("hasCapability aceita array e Set", () => {
  assert.ok(hasCapability(["forms.escala.edit"], "forms.escala.edit"));
  assert.ok(hasCapability(new Set(["reports.view"]), "reports.view"));
  assert.ok(!hasCapability([], "reports.view"));
  assert.ok(!hasCapability(["reports.view"], ""));
});

test("normalizePermissions remove inválidas e duplicadas", () => {
  assert.deepEqual(
    normalizePermissions(["events.view", "events.view", "naoexiste", 123]),
    ["events.view"],
  );
  assert.deepEqual(normalizePermissions(null), []);
});

test("deriveLegacyRole: admin tem users.manage, demais viewer", () => {
  assert.equal(deriveLegacyRole(SYSTEM_LAYERS.admin.permissions), "admin");
  assert.equal(deriveLegacyRole(SYSTEM_LAYERS.viewer.permissions), "viewer");
  assert.equal(deriveLegacyRole(["forms.escala.edit", "results.view"]), "viewer");
});

test("todo grupo do registro tem ao menos uma capacidade", () => {
  for (const group of CAPABILITY_GROUPS) {
    assert.ok(group.capabilities.length > 0, `grupo ${group.key} vazio`);
  }
});
