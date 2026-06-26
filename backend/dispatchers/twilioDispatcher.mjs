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

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_ATTEMPTS = 3;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const isTransientStatus = status => status === 429 || (status >= 500 && status < 600);

/** Remove destinatarios duplicados pelo numero E.164 normalizado (idempotencia por envio). */
const dedupeByPhone = recipients => {
  const seen = new Set();
  const unique = [];
  for (const recipient of recipients) {
    const e164 = toE164(recipient.phone);
    if (!e164 || seen.has(e164)) continue;
    seen.add(e164);
    unique.push({ ...recipient, e164 });
  }
  return unique;
};

/** POST com timeout e retry exponencial em falha transitoria (429/5xx/rede). */
const postWithRetry = async (url, options) => {
  let lastError = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      if (response.ok) return { ok: true, response };
      if (isTransientStatus(response.status) && attempt < MAX_ATTEMPTS) {
        await sleep(200 * 2 ** (attempt - 1));
        continue;
      }
      const detail = await response.json().catch(() => ({}));
      return { ok: false, error: detail.message || `HTTP ${response.status}` };
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) await sleep(200 * 2 ** (attempt - 1));
    } finally {
      clearTimeout(timer);
    }
  }
  return { ok: false, error: lastError?.message || "Falha de rede ao enviar." };
};

export const buildTwilioDispatcher = ({ accountSid, authToken, from, channel }) => ({
  version: "twilio-1",
  async dispatch({ messageId, mode, renderedBody, recipients, groupName }) {
    const targets = dedupeByPhone((recipients || []).filter(recipient => !recipient.skipped && recipient.phone));
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const authorization = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`;
    const fromAddress = channelAddress(toE164(from), channel);

    let sent = 0;
    let failed = 0;
    const errors = [];

    for (const recipient of targets) {
      const toAddress = channelAddress(recipient.e164, channel);
      const body = new URLSearchParams({ From: fromAddress, To: toAddress, Body: renderedBody || "" });
      const result = await postWithRetry(url, {
        method: "POST",
        headers: { Authorization: authorization, "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (result.ok) {
        sent += 1;
      } else {
        failed += 1;
        errors.push({ to: recipient.phone, error: result.error });
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
