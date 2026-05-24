/**
 * @file frontend/src/features/events/components/eventsPanels.jsx
 * @summary Paineis reutilizaveis da area de eventos.
 * @responsibility Conter blocos visuais de lista, edicao e detalhe de evento.
 */

import React from "react";
import { COLORS, Btn, Icon, ScreenHeader, StatusBadge } from "../../../components/ui";
import { FormListCard } from "../../../components/FormListCard";
import { MessageStatusBadge, MESSAGE_TYPE_LABELS } from "../../../components/MessageStatusBadge";
import { formatDate, formatDateTime } from "../../../lib/forms";

export const EventCard = ({ event, isPinned, canManageEvents, onOpen, onEdit, onDelete, onTogglePinned }) => (
  <div
    className="form-card form-card--interactive elevated"
    role="button"
    tabIndex={0}
    onClick={() => onOpen(event)}
    onKeyDown={keyboardEvent => {
      if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
        keyboardEvent.preventDefault();
        onOpen(event);
      }
    }}
    style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}
  >
    <div style={{ width: 46, height: 46, borderRadius: 12, background: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.primary, flexShrink: 0 }}>
      <Icon name="calendar" size={20} />
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <strong style={{ fontSize: 16 }}>{event.date ? `${event.title} - ${formatDate(event.date)}` : event.title}</strong>
        {isPinned && (
          <span title="Evento fixado" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 999, background: COLORS.warningLight, color: COLORS.warning }}>
            <Icon name="pin" size={12} />
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <StatusBadge status={event.status} />
        <span className="ui-badge" style={{ background: COLORS.surfaceAlt, color: COLORS.textSecondary }}>{event.formIds?.length || 0} forms</span>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: COLORS.textMuted }}>
        {event.opening && <span>Abertura: {formatDateTime(event.opening)}</span>}
        {event.closing && <span>Fechamento: {formatDateTime(event.closing)}</span>}
      </div>
    </div>
    {canManageEvents && (
      <div style={{ display: "flex", gap: 6 }} onClick={eventClick => eventClick.stopPropagation()}>
        <Btn v={isPinned ? "warning" : "ghost"} icon="pin" sz="sm" style={{ width: 42, height: 42, minWidth: 42, padding: 0, justifyContent: "center", borderRadius: 12 }} title={isPinned ? "Desfixar evento" : "Fixar evento"} aria-label={isPinned ? "Desfixar evento" : "Fixar evento"} onClick={() => onTogglePinned?.(event.id)} />
        <Btn v="ghost" icon="edit" sz="sm" style={{ width: 42, height: 42, minWidth: 42, padding: 0, justifyContent: "center", borderRadius: 12 }} title="Editar evento" aria-label="Editar evento" onClick={() => onEdit(event)} />
        <Btn v="danger" icon="trash" sz="sm" style={{ width: 42, height: 42, minWidth: 42, padding: 0, justifyContent: "center", borderRadius: 12 }} title="Excluir evento" aria-label="Excluir evento" onClick={() => onDelete(event)} />
      </div>
    )}
  </div>
);

export const EventEditorPanel = ({ draft, onChangeDraft, onCancel, onSave, saving, title }) => (
  <div>
    <ScreenHeader
      className="settings-top-card"
      leading={<Btn v="ghost" icon="back" onClick={onCancel} aria-label="Voltar" />}
      title={title}
      titleSize={20}
    />
    <section style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 18 }}>
      <div style={{ display: "grid", gap: 14 }}>
        <div className="events-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 12 }}>
          <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
            Nome do evento
            <input value={draft.title} onChange={event => onChangeDraft(current => ({ ...current, title: event.target.value }))} placeholder="Ex: Reuniao mensal - Maio" style={{ padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.surface, color: COLORS.text }} />
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
            Data
            <input type="date" value={draft.date || ""} onChange={event => onChangeDraft(current => ({ ...current, date: event.target.value }))} style={{ padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.surface, color: COLORS.text }} />
          </label>
        </div>
        <div className="events-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
            Abertura
            <input type="datetime-local" value={draft.opening || ""} onChange={event => onChangeDraft(current => ({ ...current, opening: event.target.value }))} style={{ padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.surface, color: COLORS.text }} />
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
            Fechamento
            <input type="datetime-local" value={draft.closing || ""} onChange={event => onChangeDraft(current => ({ ...current, closing: event.target.value }))} style={{ padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.surface, color: COLORS.text }} />
          </label>
        </div>
        <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
          Descricao
          <textarea value={draft.description || ""} onChange={event => onChangeDraft(current => ({ ...current, description: event.target.value }))} rows={3} style={{ padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.surface, color: COLORS.text, resize: "vertical" }} />
        </label>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Btn v="secondary" onClick={onCancel}>Cancelar</Btn>
          <Btn icon="save" onClick={onSave} loading={saving} disabled={!draft.title.trim()}>Salvar evento</Btn>
        </div>
      </div>
    </section>
  </div>
);

export const EventDetailHeader = ({
  event,
  canManageEvents,
  detailTab,
  messagesEligible,
  statusAction,
  onBack,
  onPublish,
  onClose,
  onEdit,
  onCreateForm,
  onCreateMessage,
}) => (
  <ScreenHeader
    className="settings-top-card"
    leading={<Btn v="ghost" icon="back" onClick={onBack} aria-label="Voltar" />}
    titleContent={(
      <div style={{ minWidth: 0, flex: 1, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>{event.date ? `${event.title} - ${formatDate(event.date)}` : event.title}</h2>
        <StatusBadge status={event.status} />
      </div>
    )}
    actions={(
      <>
        {canManageEvents && event.status === "pronto" && onPublish && (
          <Btn v="secondary" icon="check" onClick={onPublish} loading={statusAction === "publish"} disabled={Boolean(statusAction)}>Publicar</Btn>
        )}
        {canManageEvents && event.status === "publicado" && (
          <Btn v="secondary" icon="lock" onClick={onClose} loading={statusAction === "close"} disabled={Boolean(statusAction)}>Encerrar</Btn>
        )}
        {canManageEvents && <Btn v="secondary" icon="edit" onClick={onEdit}>Editar</Btn>}
        {canManageEvents && detailTab === "forms" && <Btn icon="plus" onClick={onCreateForm} aria-label="Novo formulario" title="Novo formulario" />}
        {canManageEvents && detailTab === "messages" && messagesEligible && onCreateMessage && (
          <Btn icon="plus" onClick={onCreateMessage} aria-label="Nova mensagem" title="Nova mensagem" />
        )}
      </>
    )}
  />
);

export const EventDetailTabs = ({ activeTab, onChangeTab, formsCount, messagesCount, hasMessages }) => (
  <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
    <Btn v={activeTab === "forms" ? "primary" : "ghost"} sz="sm" onClick={() => onChangeTab("forms")}>
      Formularios{formsCount > 0 ? ` (${formsCount})` : ""}
    </Btn>
    {hasMessages && (
      <Btn v={activeTab === "messages" ? "primary" : "ghost"} sz="sm" onClick={() => onChangeTab("messages")}>
        Mensagens{messagesCount > 0 ? ` (${messagesCount})` : ""}
      </Btn>
    )}
  </div>
);

export const EventPaginationControls = ({ pagination, totalItems, onPrevious, onNext }) => {
  if (totalItems <= pagination.pageItems.length) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
      <div style={{ fontSize: 12, color: COLORS.textMuted }}>
        Exibindo {pagination.rangeStart} a {pagination.rangeEnd} de {totalItems}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn v="secondary" sz="sm" onClick={onPrevious} disabled={pagination.safePage === 1}>Anterior</Btn>
        <div style={{ display: "flex", alignItems: "center", fontSize: 13, color: COLORS.textSecondary, padding: "0 8px" }}>Pagina {pagination.safePage} de {pagination.totalPages}</div>
        <Btn v="secondary" sz="sm" onClick={onNext} disabled={pagination.safePage === pagination.totalPages}>Proxima</Btn>
      </div>
    </div>
  );
};

export const EventMessagesPanel = ({ messages, eligible, canManage, onCreate, onOpen }) => {
  if (!eligible) {
    return (
      <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: 8, padding: 18, color: COLORS.textSecondary, fontSize: 13 }}>
        Vincule um formulario de presenca ou escala da organ para habilitar mensagens neste evento.
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: 8, padding: 18, color: COLORS.textSecondary, fontSize: 13, display: "grid", gap: 12, justifyItems: "start" }}>
        Nenhuma mensagem cadastrada neste evento.
        {canManage && onCreate && <Btn icon="plus" sz="sm" onClick={onCreate}>Nova mensagem</Btn>}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {messages.map(message => (
        <div
          key={message.id}
          role="button"
          tabIndex={0}
          onClick={() => onOpen && onOpen(message)}
          onKeyDown={keyEvent => {
            if (keyEvent.key === "Enter" || keyEvent.key === " ") {
              keyEvent.preventDefault();
              onOpen && onOpen(message);
            }
          }}
          style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
        >
          <div style={{ width: 38, height: 38, borderRadius: 10, background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="share" size={18} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <strong style={{ fontSize: 14 }}>{MESSAGE_TYPE_LABELS[message.type] || message.type}</strong>
              <MessageStatusBadge status={message.status} />
              {message.scheduledFor && (
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>
                  Agendada para {new Date(message.scheduledFor).toLocaleString("pt-BR")}
                </span>
              )}
              {message.sentAt && (
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>
                  Disparada em {new Date(message.sentAt).toLocaleString("pt-BR")}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {message.body?.split("\n")[0] || ""}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const EventFormsList = ({ forms, user, labels, isPinnedForm, canManageEvents, onNavigate, onDuplicateForm, onTogglePinnedForm, onArchiveForm, onDeleteForm }) => (
  <div style={{ display: "grid", gap: 18 }}>
    {forms.map(form => (
      <FormListCard
        key={form.id}
        form={form}
        user={user}
        labels={labels}
        isPinned={isPinnedForm(form.id)}
        canPinForms={canManageEvents}
        onNavigate={onNavigate}
        onDuplicateForm={onDuplicateForm}
        onTogglePinnedForm={onTogglePinnedForm}
        onArchiveForm={onArchiveForm}
        onDeleteForm={onDeleteForm}
      />
    ))}
  </div>
);
