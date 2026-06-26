/**
 * @file backend/dispatchers/twilioDispatcher.mjs
 * @summary Dispatcher real via Twilio (WhatsApp ou SMS).
 * @responsibility Enviar a mensagem renderizada para cada destinatario com
 * telefone, registrando o resultado agregado no message_dispatch_log.
 */

import { insertMessageDispatchLogRecord } from "../repositories/messageDispatchLogRepository.mjs";

/** Normaliza para E.164. Assume Brasil (+55) quando não há DDI. */
const toE164 = value => {
  let digits = String(value || "").replace(/\D+/g, "");
  if (!digits) return "";
  if (digits.length <= 11 && !digits.startsWith("55")) digits = `55${digits}`;
  return `+${digits}`;
};

const channelAddress = (e164, channel) => (channel === "whatsapp" ? `whatsapp:${e164}` : e164);

export const buildTwilioDispatcher = ({ accountSid, authToken, from, channel }) => ({
  version: "twilio-1",
  async dispatch({ messageId, mode, renderedBody, recipients, groupName }) {
    const targets = (recipients || []).filter(recipient => !recipient.skipped && recipient.phone);
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const authorization = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`;
    const fromAddress = channelAddress(toE164(from), channel);

    let sent = 0;
    let failed = 0;
    const errors = [];

    for (const recipient of targets) {
      const toAddress = channelAddress(toE164(recipient.phone), channel);
      try {
        const body = new URLSearchParams({ From: fromAddress, To: toAddress, Body: renderedBody || "" });
        const response = await fetch(url, {
          method: "POST",
          headers: { Authorization: authorization, "Content-Type": "application/x-www-form-urlencoded" },
          body,
        });
        if (response.ok) {
          sent += 1;
        } else {
          failed += 1;
          const detail = await response.json().catch(() => ({}));
          errors.push({ to: recipient.phone, error: detail.message || `HTTP ${response.status}` });
        }
      } catch (error) {
        failed += 1;
        errors.push({ to: recipient.phone, error: error.message });
      }
    }

    const status = failed === 0 ? "sent" : sent === 0 ? "failed" : "partial";
    const logId = await insertMessageDispatchLogRecord({
      messageId,
      mode,
      renderedBody,
      recipients,
      groupName: groupName || null,
      status,
      dispatcherVersion: "twilio-1",
    });
    return { status, logId, dispatcherVersion: "twilio-1", sent, failed, errors };
  },
});
