/**
 * @file backend/orchestrator/formLifecycleOrchestrator.mjs
 * @summary Orquestrador de ciclo de vida dos formularios.
 * @responsibility Executar tarefas agendadas fora das rotas e telas da aplicacao.
 */

import { ORCHESTRATOR_INTERVAL_MS } from "../config.mjs";
import { closeExpiredFormRecords, openScheduledFormRecords } from "../repositories/formsRepository.mjs";

const formatLocalDateTime = date => {
  const pad = value => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatLocalDate = date => {
  const pad = value => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-");
};

export const refreshFormLifecycle = async (now = new Date()) => ({
  opened: await openScheduledFormRecords(formatLocalDate(now)),
  closed: await closeExpiredFormRecords(formatLocalDateTime(now)),
});

export const closeExpiredForms = async (now = new Date()) => (await refreshFormLifecycle(now)).closed;

export const startFormLifecycleOrchestrator = () => {
  const run = async () => {
    try {
      const { opened, closed } = await refreshFormLifecycle();
      if (opened > 0) console.log(`Orquestrador: ${opened} formulario(s) aberto(s) por agendamento.`);
      if (closed > 0) console.log(`Orquestrador: ${closed} formulario(s) fechado(s) por horario.`);
    } catch (error) {
      console.error("Orquestrador: falha ao atualizar ciclo de vida dos formularios.", error);
    }
  };

  void run();
  const timer = setInterval(() => {
    void run();
  }, ORCHESTRATOR_INTERVAL_MS);
  return () => clearInterval(timer);
};
