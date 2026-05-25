import React, { useState } from "react";
import { Btn, COLORS, FeedbackBanner, resolveActionErrorMessage } from "../../components/ui";
import { messagingInputStyle } from "./messagingSettingsShared";

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
    setFeedback({ tone: "loading", message: "Salvando configuracao..." });
    try {
      await onSave(draft);
      setFeedback({ tone: "success", message: "Configuracao salva." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h4 style={{ margin: "0 0 10px" }}>Configuracao global</h4>
      <div style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
          Nome do grupo do WhatsApp
          <input
            value={draft.whatsappGroupName}
            onChange={event => setDraft(current => ({ ...current, whatsappGroupName: event.target.value }))}
            placeholder="Ex.: Irmandade NSJB"
            style={messagingInputStyle}
          />
        </label>
        <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
          URL publica do app
          <input
            value={draft.publicBaseUrl}
            onChange={event => setDraft(current => ({ ...current, publicBaseUrl: event.target.value }))}
            placeholder="https://app.exemplo.com"
            style={messagingInputStyle}
          />
          <span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 400 }}>
            Usada para gerar os links publicos dos formularios nas mensagens.
          </span>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: COLORS.text }}>
          <input
            type="checkbox"
            checked={draft.autoDispatchEnabled}
            onChange={event => setDraft(current => ({ ...current, autoDispatchEnabled: event.target.checked }))}
          />
          Disparo automatico de mensagens agendadas
        </label>
        {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} />}
        <div>
          <Btn onClick={submit} loading={busy} disabled={busy}>Salvar configuracao</Btn>
        </div>
      </div>
    </div>
  );
};
