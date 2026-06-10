import React, { useState } from "react";
import { Btn, FeedbackBanner, resolveActionErrorMessage } from "../../components/ui";

export const MessagingConfigBlock = ({ messagingConfig, onSave }) => {
  const [draft, setDraft] = useState(() => ({
    whatsappGroupName: messagingConfig.whatsappGroupName || "",
    autoDispatchEnabled: messagingConfig.autoDispatchEnabled !== false,
    publicBaseUrl: messagingConfig.publicBaseUrl || "",
  }));
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const submit = async () => {
    setBusy(true);
    setFeedback({ tone: "loading", message: "Salvando configuração..." });
    try {
      await onSave(draft);
      setFeedback({ tone: "success", message: "Configuração salva." });
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
        <input
          className="msg-input"
          value={draft.whatsappGroupName}
          onChange={event => setDraft(current => ({ ...current, whatsappGroupName: event.target.value }))}
          placeholder="Ex.: Irmandade NSJB"
        />
      </label>
      <label className="msg-field">
        <span className="msg-label">URL pública do app</span>
        <input
          className="msg-input"
          value={draft.publicBaseUrl}
          onChange={event => setDraft(current => ({ ...current, publicBaseUrl: event.target.value }))}
          placeholder="https://app.exemplo.com"
        />
        <span className="msg-hint">Usada para gerar os links públicos dos formulários nas mensagens.</span>
      </label>
      <label className="msg-check">
        <input
          type="checkbox"
          checked={draft.autoDispatchEnabled}
          onChange={event => setDraft(current => ({ ...current, autoDispatchEnabled: event.target.checked }))}
        />
        Disparo automático de mensagens agendadas
      </label>
      {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} />}
      <div className="msg-actions">
        <Btn onClick={submit} loading={busy} disabled={busy}>Salvar configuração</Btn>
      </div>
    </div>
  );
};
