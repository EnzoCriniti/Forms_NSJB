/**
 * @file server/orchestrator/formLifecycleOrchestrator.mjs
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

export const refreshFormLifecycle = (now = new Date()) => ({
  opened: openScheduledFormRecords(formatLocalDate(now)),
  closed: closeExpiredFormRecords(formatLocalDateTime(now)),
});

export const closeExpiredForms = (now = new Date()) => refreshFormLifecycle(now).closed;

export const startFormLifecycleOrchestrator = () => {
  const run = () => {
    try {
      const { opened, closed } = refreshFormLifecycle();
      if (opened > 0) console.log(`Orquestrador: ${opened} formulario(s) aberto(s) por agendamento.`);
      if (closed > 0) console.log(`Orquestrador: ${closed} formulario(s) fechado(s) por horario.`);
    } catch (error) {
      console.error("Orquestrador: falha ao atualizar ciclo de vida dos formularios.", error);
    }
  };

  run();
  const timer = setInterval(run, ORCHESTRATOR_INTERVAL_MS);
  return () => clearInterval(timer);
};
