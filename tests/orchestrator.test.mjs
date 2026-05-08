/**
 * @file tests/orchestrator.test.mjs
 * @summary Testes do orquestrador de backend.
 * @responsibility Validar fechamento automatico de formularios vencidos.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "nsjb-orchestrator-test-"));
process.env.NSJB_DB_PATH = path.join(tempDir, "test.sqlite");

const { saveForm } = await import("../server/services/formsService.mjs");
const { findFormById } = await import("../server/repositories/formsRepository.mjs");
const { closeExpiredForms, refreshFormLifecycle } = await import("../server/orchestrator/formLifecycleOrchestrator.mjs");
const { db } = await import("../server/db.mjs");

test.after(() => {
  db.close();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

test("closeExpiredForms fecha somente formularios abertos vencidos", () => {
  const expired = saveForm({
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

  const future = saveForm({
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

  const closed = closeExpiredForms(new Date(2026, 4, 4, 11, 0));

  assert.equal(closed, 1);
  assert.equal(findFormById(expired.id).status, "fechado");
  assert.equal(findFormById(future.id).status, "aberto");
});

test("refreshFormLifecycle abre rascunhos agendados e fecha abertos vencidos no mesmo ciclo", () => {
  const scheduled = saveForm({
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

  const expired = saveForm({
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

  const result = refreshFormLifecycle(new Date(2026, 4, 4, 11, 0));

  assert.equal(result.opened, 1);
  assert.equal(result.closed, 1);
  assert.equal(findFormById(scheduled.id).status, "aberto");
  assert.equal(findFormById(expired.id).status, "fechado");
});
