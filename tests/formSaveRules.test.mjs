/**
 * @file tests/formSaveRules.test.mjs
 * @summary Testes das regras de preparo do save de formularios.
 * @responsibility Preservar normalizacao e validacao do registro salvo pelo formsService.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { buildFormSaveValues } from "../backend/services/formSaveRules.mjs";

test("buildFormSaveValues normaliza registro de presenca do nucleo", () => {
  const values = buildFormSaveValues({
    type: "presenca",
    status: "aberto",
    title: "Formulario",
    totalExpected: "12",
    fieldDefinitions: [
      { id: 1, type: "person_select", selectionSource: { kind: "members" } },
    ],
    resultsConfig: {
      totalsLayout: [{ fieldId: 1, style: "metric" }],
    },
  }, "formulario");

  assert.equal(values.slug, "formulario");
  assert.equal(values.totalExpected, 12);
  assert.equal(values.resultsConfig.formMode, "nucleo");
  assert.equal(values.resultsConfig.totalsLayout[0].style, "number");
});

test("buildFormSaveValues rejeita presenca geral com base central de socios", () => {
  assert.throws(() => buildFormSaveValues({
    type: "presenca",
    status: "aberto",
    title: "Formulario",
    fieldDefinitions: [
      { id: 1, type: "person_select", selectionSource: { kind: "members" } },
    ],
    resultsConfig: { formMode: "geral" },
  }, "formulario"), /Formulario geral nao pode usar a base central de socios/);
});
