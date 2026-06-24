/**
 * @file frontend/src/features/events/components/eventMessageDetailPanels.jsx
 * @summary Paineis do detalhe de mensagens de evento.
 * @responsibility Renderizar preview, destinatarios calculados e historico de disparos.
 */

import React from "react";
import { Btn, COLORS, Icon, ScreenHeader } from "../../../components/ui";
import { MessageStatusBadge, MESSAGE_TYPE_LABELS } from "../../../components/MessageStatusBadge";

export const EventMessageDetailHeader = ({
  busyAction,
  canCancel,
  canDelete,
  canDispatch,
  canEdit,
  message,
  onBack,
  onEdit,
  onRequestConfirm,
}) => (
  <ScreenHeader
    className="settings-top-card"
    onBack={onBack}
    titleContent={(
      <div style={{ minWidth: 0, flex: 1, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>{MESSAGE_TYPE_LABELS[message.type] || message.type}</h2>
        <MessageStatusBadge status={message.status} />
      </div>
    )}
    actions={(
      <>
        {canEdit && (
          <Btn v="secondary" icon="edit" onClick={onEdit}>Editar</Btn>
        )}
        {canCancel && (
          <Btn v="secondary" icon="close" onClick={() => onRequestConfirm("cancel")} loading={busyAction === "cancel"} disabled={Boolean(busyAction)}>Cancelar</Btn>
        )}
        {canDelete && (
          <Btn v="danger" icon="trash" onClick={() => onRequestConfirm("delete")} loading={busyAction === "delete"} disabled={Boolean(busyAction)}>Excluir</Btn>
        )}
        {canDispatch && (
          <Btn icon="share" onClick={() => onRequestConfirm("dispatch")} loading={busyAction === "dispatch"} disabled={Boolean(busyAction)}>Disparar agora</Btn>
        )}
      </>
    )}
    titleSize={20}
  />
);

export const MessageDetailSummaryPanel = ({
  copiedKey,
  event,
  formatDateTime,
  loading,
  message,
  onCopy,
  preview,
  recipientsActive,
  recipientsSkipped,
}) => (
  <section className="msg-card" style={{ display: "grid", gap: 16 }}>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <DetailMetaChip label="Evento" value={event?.title} strong />
      {message.scheduledFor && <DetailMetaChip label="Agendamento" value={formatDateTime(message.scheduledFor)} />}
      {message.sentAt && <DetailMetaChip label="Envio" value={formatDateTime(message.sentAt)} />}
      <DetailMetaChip label="Auto" value={message.autoDispatchEnabled ? "sim" : "não"} />
    </div>

    <MessagePreviewPanel
      loading={loading}
      preview={preview}
      copiedKey={copiedKey}
      onCopy={onCopy}
      recipientsActive={recipientsActive}
      recipientsSkipped={recipientsSkipped}
    />
  </section>
);

export const MessagePreviewPanel = ({ loading, preview, copiedKey, onCopy, recipientsActive, recipientsSkipped }) => (
  <div style={{ display: "grid", gap: 16 }}>
    <div>
      <h4 style={{ margin: "0 0 8px", fontSize: 13, color: COLORS.textSecondary }}>Corpo renderizado</h4>
      {loading ? (
        <div style={{ fontSize: 12, color: COLORS.textMuted }}>Carregando preview...</div>
      ) : preview?.renderedBody ? (
        <div style={{ position: "relative" }}>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 12, fontFamily: "inherit", fontSize: 13, margin: 0 }}>
            {preview.renderedBody}
          </pre>
          <div style={{ marginTop: 8 }}>
            <Btn v="secondary" sz="sm" icon="link" onClick={() => onCopy(preview.renderedBody, "body")}>
              {copiedKey === "body" ? "Copiado!" : "Copiar texto"}
            </Btn>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: COLORS.textMuted }}>Preview indisponível.</div>
      )}
    </div>

    {!loading && preview && preview.kind === "group" && (
      <div style={{ border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 12, fontSize: 13, color: COLORS.textSecondary }}>
        Mensagem destinada ao grupo {preview.groupName ? <strong style={{ color: COLORS.text }}>{preview.groupName}</strong> : <em>(nome do grupo não configurado)</em>}. Cole o texto acima no grupo do WhatsApp.
      </div>
    )}

    {!loading && preview && preview.kind === "dm" && (
      <div>
        <h4 style={{ margin: "0 0 8px", fontSize: 13, color: COLORS.textSecondary }}>
          Destinatários ({recipientsActive.length} com telefone{recipientsSkipped.length > 0 ? `, ${recipientsSkipped.length} sem telefone` : ""})
        </h4>
        {recipientsActive.length === 0 && recipientsSkipped.length === 0 && (
          <div style={{ fontSize: 12, color: COLORS.textMuted }}>Nenhum destinatário calculado.</div>
        )}
        <div style={{ display: "grid", gap: 6 }}>
          {recipientsActive.map(recipient => (
            <RecipientRow key={recipient.key || recipient.name} recipient={recipient} />
          ))}
          {recipientsSkipped.map(recipient => (
            <RecipientRow key={`skipped-${recipient.key || recipient.name}`} recipient={recipient} skipped />
          ))}
        </div>
      </div>
    )}
  </div>
);

export const MessageLogsPanel = ({ logs, formatDateTime }) => (
  <section style={{ marginTop: 24 }}>
    <h3 className="msg-card__title" style={{ margin: "0 0 12px", fontSize: 16 }}>Histórico de disparos</h3>
    {logs.length === 0 ? (
      <div className="msg-empty" style={{ textAlign: "left" }}>
        Nenhum disparo registrado ainda.
      </div>
    ) : (
      <div style={{ display: "grid", gap: 10 }}>
        {logs.map(log => (
          <div key={log.id} style={{ border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 12, background: COLORS.surface }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontSize: 12, color: COLORS.textMuted }}>
              <span>{formatDateTime(log.dispatchedAt)} - modo {log.mode}</span>
              <span>{log.status} ({log.dispatcherVersion})</span>
            </div>
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 6, padding: 10, fontFamily: "inherit", fontSize: 12, margin: "8px 0 0" }}>
              {log.renderedBody}
            </pre>
            {log.groupName && <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 6 }}>Grupo: {log.groupName}</div>}
            {Array.isArray(log.recipients) && log.recipients.length > 0 && (
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 6 }}>
                {log.recipients.filter(item => !item.skipped).length} destinatário(s){log.recipients.some(item => item.skipped) ? `, ${log.recipients.filter(item => item.skipped).length} ignorado(s)` : ""}
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </section>
);

const DetailMetaChip = ({ label, value, strong = false }) => (
  <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 999, padding: "5px 12px", fontSize: 12, color: COLORS.textMuted }}>
    <span style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, fontSize: 10 }}>{label}</span>
    <strong style={{ color: COLORS.text, fontWeight: strong ? 800 : 600 }}>{value}</strong>
  </span>
);

const RecipientRow = ({ recipient, skipped = false }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", border: skipped ? `1px dashed ${COLORS.border}` : `1px solid ${COLORS.borderLight}`, borderRadius: 8, background: skipped ? COLORS.surfaceAlt : COLORS.surface, opacity: skipped ? 0.7 : 1, flexWrap: "wrap" }}>
    <div style={{ minWidth: 0, flex: 1 }}>
      <strong style={{ fontSize: 13 }}>{recipient.name}</strong>
      {recipient.grau && <span style={{ fontSize: 11, color: COLORS.textMuted, marginLeft: 6 }}>({recipient.grau})</span>}
      <div style={{ fontSize: 11, color: skipped ? COLORS.warning : COLORS.textMuted }}>{recipient.phone || "sem telefone"}</div>
    </div>
    {recipient.waLink && !skipped && (
      <a
        href={recipient.waLink}
        target="_blank"
        rel="noreferrer"
        style={{ fontSize: 12, color: COLORS.primary, textDecoration: "none", padding: "6px 10px", border: `1px solid ${COLORS.primary}`, borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 4 }}
      >
        <Icon name="share" size={12} /> wa.me
      </a>
    )}
  </div>
);
