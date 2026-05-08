/**
 * @file tests/validators.test.mjs
 * @summary Testes unitarios dos validadores.
 * @responsibility Garantir que payloads validos passam e payloads invalidos falham cedo.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
  validateFormPayload,
  validateResponsePayload,
  validateEscalaPayload,
  validateEscalaClaimPayload,
  validateFormDeleteKeyPayload,
  validateFormDeleteKeyUpdatePayload,
  validateUserPayload,
  validateLabelPayload,
  validatePresetPayload,
  validateFieldCatalogPayload,
  validateScaleTaskCatalogPayload,
  validatePeoplePayload,
  validateMembersConfigPayload,
} from "../backend/validators/payloadValidators.mjs";

test("validateFormPayload accepts a valid presence form", () => {
  assert.doesNotThrow(() => validateFormPayload({
    type: "presenca",
    status: "aberto",
    title: "Formulario Teste",
    labels: [1],
    totalExpected: 10,
    fieldDefinitions: [
      { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
      { id: 2, type: "yes_no", label: "Vai?", required: true, show: true, total: true },
    ],
  }));
});

test("validateFormPayload accepts new totals layout styles", () => {
  assert.doesNotThrow(() => validateFormPayload({
    type: "presenca",
    status: "aberto",
    title: "Formulario Teste",
    labels: [],
    fieldDefinitions: [
      { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
      { id: 2, type: "yes_no", label: "Vai?", required: true, show: true, total: true },
      { id: 3, type: "number", label: "Qtd", required: false, show: true, total: true },
    ],
    resultsConfig: {
      totalsLayout: [
        { fieldId: 2, style: "split" },
        { fieldId: 3, style: "number" },
      ],
    },
  }));
});

test("validateFormPayload rejects an invalid status", () => {
  assert.throws(() => validateFormPayload({
    type: "presenca",
    status: "x",
    title: "Formulario Teste",
    labels: [],
    fieldDefinitions: [],
  }), /Status do formulario invalido/);
});

test("validateFormPayload rejects missing fields for presence and scale forms", () => {
  assert.throws(() => validateFormPayload({
    type: "presenca",
    status: "aberto",
    title: "",
    labels: [],
    fieldDefinitions: [],
  }), /Titulo do formulario e obrigatorio/);
  assert.throws(() => validateFormPayload({
    type: "escala_organ",
    status: "aberto",
    title: "Escala",
    labels: [],
    scaleSections: [{ title: "", responsaveis: 1, auxiliares: 0 }],
  }), /Secao de escala precisa de titulo/);
});

test("validateResponsePayload rejects non-object values", () => {
  assert.throws(() => validateResponsePayload({
    formId: 1,
    respondentName: "Pessoa",
    values: [],
  }), /Valores da resposta precisam ser um objeto/);
});

test("validateResponsePayload rejects payloads without formId or respondent", () => {
  assert.throws(() => validateResponsePayload({
    respondentName: "Pessoa",
    values: {},
  }), /formId invalido/);
  assert.throws(() => validateResponsePayload({
    formId: 1,
    values: {},
  }), /Respondente invalido/);
});

test("admin payload validators accept valid payloads", () => {
  assert.doesNotThrow(() => validateUserPayload({ username: "admin2", password: "123", role: "admin" }));
  assert.doesNotThrow(() => validateLabelPayload({ name: "Evento", color: "#fff000" }));
  assert.doesNotThrow(() => validatePresetPayload({
    type: "presenca",
    name: "Preset",
    labels: [],
    fieldDefinitions: [],
    scaleSections: [],
  }));
  assert.doesNotThrow(() => validatePeoplePayload({ people: [{ name: "Maria", grau: "QS", phone: "5511999999999", active: true, source: "google_sheets", externalKey: "abc-1", syncedAt: "2026-05-08T10:00:00Z", metadata: { rowNumber: 4 } }] }));
  assert.doesNotThrow(() => validateMembersConfigPayload({ sourceType: "google_sheets", sheetUrl: "", nameColumn: "B", grauColumn: "A", phoneColumn: "C", externalIdColumn: "D", activeColumn: "E", range: "Socios!A:E", syncEnabled: true, syncFrequencyHours: 24, lastSyncedAt: null }));
  assert.doesNotThrow(() => validateFormDeleteKeyPayload({ masterKey: "segredo" }));
  assert.doesNotThrow(() => validateFormDeleteKeyUpdatePayload({ currentMasterKey: "antiga", newMasterKey: "nova" }));
  assert.doesNotThrow(() => validateFormDeleteKeyUpdatePayload({ newMasterKey: "nova" }));
  assert.doesNotThrow(() => validateEscalaClaimPayload({ sectionIndex: 0, slotIndex: 1, person: "Maria" }));
  assert.doesNotThrow(() => validateFieldCatalogPayload({
    key: "campo base",
    name: "Campo Base",
    type: "text",
    category: "texto",
    defaultLabel: "Campo",
    gridSchema: { rows: ["A"], cols: ["B"] },
    active: true,
  }));
  assert.doesNotThrow(() => validateScaleTaskCatalogPayload({
    key: "tarefa base",
    name: "Tarefa Base",
    category: "cozinha",
    defaultLabel: "Tarefa",
    active: true,
  }));
});

test("validateEscalaPayload rejects malformed slots", () => {
  assert.throws(() => validateEscalaPayload(2, {
    sections: [{ title: "Secao", slots: [{ role: "" }] }],
  }), /Slot da escala precisa de funcao/);
});

test("validateEscalaClaimPayload rejects invalid payloads", () => {
  assert.throws(() => validateEscalaClaimPayload({ sectionIndex: -1, slotIndex: 0, person: "Maria" }), /sectionIndex da escala invalido/);
  assert.throws(() => validateEscalaClaimPayload({ sectionIndex: 0, slotIndex: -1, person: "Maria" }), /slotIndex da escala invalido/);
  assert.throws(() => validateEscalaClaimPayload({ sectionIndex: 0, slotIndex: 0, person: "" }), /Nome da inscricao invalido/);
});

test("catalog and admin validators reject invalid payloads", () => {
  assert.throws(() => validateFormDeleteKeyPayload({}), /Chave mestra e obrigatoria/);
  assert.throws(() => validateFormDeleteKeyUpdatePayload({ currentMasterKey: 123, newMasterKey: "nova" }), /Chave mestra atual invalida/);
  assert.throws(() => validateFieldCatalogPayload({ key: "", name: "Campo", type: "text", category: "texto", defaultLabel: "Campo" }), /Chave do campo base e obrigatoria/);
  assert.throws(() => validateScaleTaskCatalogPayload({ key: "tarefa", name: "", category: "cozinha", defaultLabel: "Tarefa" }), /Nome da tarefa base e obrigatorio/);
  assert.throws(() => validatePeoplePayload({ people: [{}] }), /Socio precisa de nome/);
  assert.throws(() => validateMembersConfigPayload({ sheetUrl: 123 }), /sheetUrl invalido/);
  assert.throws(() => validatePeoplePayload({ people: [{ name: "Maria", active: "sim" }] }), /Status do socio invalido/);
});
