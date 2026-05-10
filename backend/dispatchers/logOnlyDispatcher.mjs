/**
 * @file backend/dispatchers/logOnlyDispatcher.mjs
 * @summary Dispatcher log-only: nao envia nada, apenas grava no message_dispatch_log.
 * @responsibility Servir como adapter padrao enquanto a integracao real (Twilio) nao existe.
 */

import { insertMessageDispatchLogRecord } from "../repositories/messageDispatchLogRepository.mjs";

export const logOnlyDispatcher = {
  version: "log-only-1",
  async dispatch({ messageId, mode, renderedBody, recipients, groupName }) {
    const logId = await insertMessageDispatchLogRecord({
      messageId,
      mode,
      renderedBody,
      recipients,
      groupName: groupName || null,
      status: "logged_only",
      dispatcherVersion: "log-only-1",
    });
    return { status: "logged_only", logId, dispatcherVersion: "log-only-1" };
  },
};
