/**
 * @file tests/orchestrator.test.mjs
 * @summary Testes do orquestrador de backend.
 * @responsibility Validar fechamento automatico de formularios vencidos.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { buildTestDatabaseEnv, createTestDatabase, dropTestDatabase } from "./helpers/postgresTestDb.mjs";

const testDbName = await createTestDatabase();
Object.assign(process.env, buildTestDatabaseEnv(testDbName));

const { saveForm } = await import("../backend/services/formsService.mjs");
const { findFormById } = await import("../backend/repositories/formsRepository.mjs");
const { closeExpiredForms, refreshFormLifecycle } = await import("../backend/orchestrator/formLifecycleOrchestrator.mjs");
const { database } = await import("../backend/database/index.mjs");

test.after(async () => {
  await database.close?.();
  await dropTestDatabase(testDbName);
});

test("closeExpiredForms fecha somente formularios abertos vencidos", async () => {
  const expired = await saveForm({
    type: "presenca",
    status: "aberto",
    title: "Formulario Vencido",
    sessionName: "",
    description: "",
    date: "2026-05-04",
    closing: "2026-05-04T10:00",
    closingText: "",
    totalExpected: 0,
    labels: [],
    fieldDefinitions: [
      { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
    ],
    resultsConfig: {},
    scaleSections: [],
  });

  const future = await saveForm({
    type: "presenca",
    status: "aberto",
    title: "Formulario Futuro",
    sessionName: "",
    description: "",
    date: "2026-05-04",
    closing: "2026-05-04T12:00",
    closingText: "",
    totalExpected: 0,
    labels: [],
    fieldDefinitions: [
      { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
    ],
    resultsConfig: {},
    scaleSections: [],
  });

  const closed = await closeExpiredForms(new Date(2026, 4, 4, 11, 0));

  assert.equal(closed, 1);
  assert.equal((await findFormById(expired.id)).status, "fechado");
  assert.equal((await findFormById(future.id)).status, "aberto");
});

test("refreshFormLifecycle abre rascunhos agendados e fecha abertos vencidos no mesmo ciclo", async () => {
  const scheduled = await saveForm({
    type: "presenca",
    status: "rascunho",
    title: "Formulario Agendado",
    sessionName: "",
    description: "",
    date: "2026-05-04",
    closing: "2026-05-04T15:00",
    closingText: "",
    totalExpected: 0,
    labels: [],
    fieldDefinitions: [
      { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
    ],
    resultsConfig: {},
    scaleSections: [],
  });

  const expired = await saveForm({
    type: "presenca",
    status: "aberto",
    title: "Formulario Para Fechar",
    sessionName: "",
    description: "",
    date: "2026-05-04",
    closing: "2026-05-04T10:00",
    closingText: "",
    totalExpected: 0,
    labels: [],
    fieldDefinitions: [
      { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
    ],
    resultsConfig: {},
    scaleSections: [],
  });

  const result = await refreshFormLifecycle(new Date(2026, 4, 4, 11, 0));

  assert.equal(result.opened, 1);
  assert.equal(result.closed, 1);
  assert.equal((await findFormById(scheduled.id)).status, "aberto");
  assert.equal((await findFormById(expired.id)).status, "fechado");
});

test("saveForm normaliza datas vazias para null e o lifecycle ignora formulario sem agenda", async () => {
  const draft = await saveForm({
    type: "presenca",
    status: "rascunho",
    title: "Formulario Sem Agenda",
    sessionName: "",
    description: "",
    date: "",
    closing: "",
    closingText: "",
    totalExpected: 0,
    labels: [],
    fieldDefinitions: [
      { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
    ],
    resultsConfig: {},
    scaleSections: [],
  });

  assert.equal(draft.date, null);
  assert.equal(draft.closing, null);

  const stored = await findFormById(draft.id);
  assert.equal(stored.date, null);
  assert.equal(stored.closing, null);

  const result = await refreshFormLifecycle(new Date(2026, 4, 4, 11, 0));
  assert.equal(result.opened, 0);
  assert.equal(result.closed, 0);
  assert.equal((await findFormById(draft.id)).status, "rascunho");
});
