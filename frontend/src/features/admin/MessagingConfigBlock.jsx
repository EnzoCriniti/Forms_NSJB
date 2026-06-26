import React, { useState } from "react";
import { Btn, FeedbackBanner, resolveActionErrorMessage } from "../../components/ui";

export const MessagingConfigBlock = ({ messagingConfig, onSave }) => {
  const [draft, setDraft] = useState(() => ({
    whatsappGroupName: messagingConfig.whatsappGroupName || "",
    autoDispatchEnabled: messagingConfig.autoDispatchEnabled !== false,
    publicBaseUrl: messagingConfig.publicBaseUrl || "",
    provider: messagingConfig.provider || "log",
    channel: messagingConfig.channel || "whatsapp",
    twilioAccountSid: messagingConfig.twilioAccountSid || "",
    twilioFrom: messagingConfig.twilioFrom || "",
    twilioAuthToken: "",
  }));
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const set = patch => setDraft(current => ({ ...current, ...patch }));

  const submit = async () => {
    setBusy(true);
    setFeedback({ tone: "loading", message: "Salvando configuração..." });
    try {
      await onSave(draft);
      setFeedback({ tone: "success", message: "Configuração salva." });
      set({ twilioAuthToken: "" });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="msg-form">
      <label className="msg-field">
        <span className="msg-label">Nome do grupo do WhatsApp</span>
        <input className="msg-input" value={draft.whatsappGroupName} onChange={e => set({ whatsappGroupName: e.target.value })} placeholder="Ex.: Irmandade NSJB" />
        <span className="msg-hint">Usado nas mensagens de abertura, que o organizador posta no grupo.</span>
      </label>
      <label className="msg-field">
        <span className="msg-label">URL pública do app</span>
        <input className="msg-input" value={draft.publicBaseUrl} onChange={e => set({ publicBaseUrl: e.target.value })} placeholder="https://app.exemplo.com" />
        <span className="msg-hint">Usada para gerar os links públicos dos formulários nas mensagens.</span>
      </label>

      <div className="msg-subtitle" style={{ marginTop: 8 }}>Envio individual (lembretes)</div>
      <label className="msg-field">
        <span className="msg-label">Provedor de envio</span>
        <select className="msg-input" value={draft.provider} onChange={e => set({ provider: e.target.value })}>
          <option value="log">Nenhum (apenas registra, não envia)</option>
          <option value="twilio">Twilio</option>
        </select>
      </label>

      {draft.provider === "twilio" && (
        <>
          <label className="msg-field">
            <span className="msg-label">Canal</span>
            <select className="msg-input" value={draft.channel} onChange={e => set({ channel: e.target.value })}>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
            </select>
          </label>
          <label className="msg-field">
            <span className="msg-label">Account SID</span>
            <input className="msg-input" value={draft.twilioAccountSid} onChange={e => set({ twilioAccountSid: e.target.value })} placeholder="ACxxxxxxxxxxxxxxxx" />
          </label>
          <label className="msg-field">
            <span className="msg-label">Número remetente (From)</span>
            <input className="msg-input" value={draft.twilioFrom} onChange={e => set({ twilioFrom: e.target.value })} placeholder={draft.channel === "whatsapp" ? "+14155238886 (sandbox)" : "+5511999998888"} />
            <span className="msg-hint">{draft.channel === "whatsapp" ? "Número do WhatsApp Sandbox ou do seu sender aprovado." : "Número Twilio habilitado para SMS."}</span>
          </label>
          <label className="msg-field">
            <span className="msg-label">Auth Token</span>
            <input className="msg-input" type="password" value={draft.twilioAuthToken} onChange={e => set({ twilioAuthToken: e.target.value })} placeholder={messagingConfig.twilioConfigured ? "•••••••• (configurado — deixe em branco para manter)" : "Cole o Auth Token do Twilio"} />
            <span className="msg-hint">Guardado em segredo no servidor; nunca é exibido de volta.</span>
          </label>
        </>
      )}

      <label className="msg-check">
        <input type="checkbox" checked={draft.autoDispatchEnabled} onChange={e => set({ autoDispatchEnabled: e.target.checked })} />
        Disparo automático de mensagens agendadas
      </label>
      {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} />}
      <div className="msg-actions">
        <Btn onClick={submit} loading={busy} disabled={busy}>Salvar configuração</Btn>
      </div>
    </div>
  );
};
