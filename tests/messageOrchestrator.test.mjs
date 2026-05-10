/**
 * @file tests/messageOrchestrator.test.mjs
 * @summary Testes do gancho do orquestrador para mensagens agendadas.
 * @responsibility Validar que processScheduledMessages dispara, marca como pronta ou ignora conforme as flags.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { buildTestDatabaseEnv, createTestDatabase, dropTestDatabase } from "./helpers/postgresTestDb.mjs";

const testDbName = await createTestDatabase();
Object.assign(process.env, buildTestDatabaseEnv(testDbName));

const { saveForm } = await import("../backend/services/formsService.mjs");
const { saveEvent } = await import("../backend/services/eventsService.mjs");
const { saveEventMessage, processScheduledMessages } = await import("../backend/services/eventMessagesService.mjs");
const { findEventMessageById, upsertEventMessageRecord } = await import("../backend/repositories/eventMessagesRepository.mjs");
const { listMessageDispatchLogsByMessageId } = await import("../backend/repositories/messageDispatchLogRepository.mjs");
const { updateMessagingConfig } = await import("../backend/services/messagingConfigService.mjs");
const { database } = await import("../backend/database/index.mjs");

test.after(async () => {
  await database.close?.();
  await dropTestDatabase(testDbName);
});

let formCounter = 0;
const createPresencaForm = async () => saveForm({
  type: "presenca",
  status: "aberto",
  title: `Presenca Orquestrador ${++formCounter}`,
  sessionName: "",
  description: "",
  date: "2026-06-01",
  closing: "2026-06-01T20:00",
  closingText: "",
  totalExpected: 0,
  labels: [],
  fieldDefinitions: [
    { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
  ],
  resultsConfig: {},
  scaleSections: [],
});

const createEventWithForm = async formId => saveEvent({
  title: "Evento Orquestrador",
  description: "",
  date: "2026-06-01",
  formIds: [formId],
  messageConfig: {},
});

const createScheduledMessage = async (eventId, scheduledFor, autoDispatchEnabled = true) => {
  const message = await saveEventMessage(eventId, {
    type: "new_scale",
    body: "Anuncio em {{event.title}}",
    autoDispatchEnabled,
  });
  // forca o estado agendada com scheduled_for no passado
  await upsertEventMessageRecord({
    ...message,
    scheduledFor,
    status: "agendada",
  });
  return findEventMessageById(message.id);
};

test("processScheduledMessages dispara mensagens vencidas com auto on", async () => {
  await updateMessagingConfig({ autoDispatchEnabled: true, whatsappGroupName: "Grupo X", publicBaseUrl: "" });
  const form = await createPresencaForm();
  const event = await createEventWithForm(form.id);
  const message = await createScheduledMessage(event.id, "2026-06-01T07:00:00.000Z", true);

  const results = await processScheduledMessages("2026-06-01T07:01:00.000Z");

  const my = results.find(item => item.messageId === message.id);
  assert.ok(my, "deveria ter processado a mensagem");
  assert.equal(my.action, "dispatched");
  assert.ok(my.logId);

  const refreshed = await findEventMessageById(message.id);
  assert.equal(refreshed.status, "disparada");

  const logs = await listMessageDispatchLogsByMessageId(message.id);
  assert.ok(logs.some(log => log.mode === "scheduled"));
});

test("processScheduledMessages marca como pronta quando flag global desativada", async () => {
  await updateMessagingConfig({ autoDispatchEnabled: false, whatsappGroupName: "Grupo X", publicBaseUrl: "" });
  const form = await createPresencaForm();
  const event = await createEventWithForm(form.id);
  const message = await createScheduledMessage(event.id, "2026-06-01T07:00:00.000Z", true);

  const results = await processScheduledMessages("2026-06-01T07:05:00.000Z");

  const my = results.find(item => item.messageId === message.id);
  assert.ok(my);
  assert.equal(my.action, "marked_ready");

  const refreshed = await findEventMessageById(message.id);
  assert.equal(refreshed.status, "pronta");

  const logs = await listMessageDispatchLogsByMessageId(message.id);
  assert.equal(logs.length, 0);
});

test("processScheduledMessages respeita flag autoDispatchEnabled por mensagem", async () => {
  await updateMessagingConfig({ autoDispatchEnabled: true, whatsappGroupName: "Grupo X", publicBaseUrl: "" });
  const form = await createPresencaForm();
  const event = await createEventWithForm(form.id);
  const message = await createScheduledMessage(event.id, "2026-06-01T07:00:00.000Z", false);

  const results = await processScheduledMessages("2026-06-01T07:05:00.000Z");

  const my = results.find(item => item.messageId === message.id);
  assert.ok(my);
  assert.equal(my.action, "marked_ready");

  const refreshed = await findEventMessageById(message.id);
  assert.equal(refreshed.status, "pronta");
});

test("processScheduledMessages ignora mensagens com horario futuro", async () => {
  await updateMessagingConfig({ autoDispatchEnabled: true, whatsappGroupName: "Grupo X", publicBaseUrl: "" });
  const form = await createPresencaForm();
  const event = await createEventWithForm(form.id);
  const message = await createScheduledMessage(event.id, "2030-01-01T00:00:00.000Z", true);

  const results = await processScheduledMessages("2026-06-01T07:05:00.000Z");

  const my = results.find(item => item.messageId === message.id);
  assert.equal(my, undefined);

  const refreshed = await findEventMessageById(message.id);
  assert.equal(refreshed.status, "agendada");
});
