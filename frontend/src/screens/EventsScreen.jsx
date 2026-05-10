/**
 * @file frontend/src/screens/EventsScreen.jsx
 * @summary Tela administrativa de eventos.
 * @responsibility Agrupar formularios e controlar publicacao manual.
 */

import React, { useEffect, useMemo, useState } from "react";
import { COLORS, Btn, FeedbackBanner, StatusBadge, TypeBadge, resolveActionErrorMessage } from "../components/ui";
import { buildPublicEventFormPath } from "../lib/appShell";
import { formatDate, formatDateTime } from "../lib/forms";

const emptyDraft = {
  title: "",
  description: "",
  date: "",
  opening: "",
  closing: "",
  status: "rascunho",
  formIds: [],
  messageConfig: {},
};

const toDraft = event => ({
  ...emptyDraft,
  ...(event || {}),
  formIds: Array.isArray(event?.formIds) ? event.formIds : [],
  date: event?.date || "",
  opening: event?.opening || "",
  closing: event?.closing || "",
});

const getFormTypeLabel = form => form?.type === "escala_organ" ? "Escala da organizacao" : "Presenca do nucleo";

const getFormUrl = (event, form) => {
  const eventIdentifier = event?.id || event?.title;
  const path = buildPublicEventFormPath(eventIdentifier, form);
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
};

const buildEventMessage = (event, forms) => {
  const linkedForms = (event.formIds || [])
    .map(id => forms.find(form => Number(form.id) === Number(id)))
    .filter(Boolean);
  const lines = [
    `Evento: ${event.title}`,
    event.date ? `Data: ${formatDate(event.date)}` : "",
    event.opening ? `Abertura: ${formatDateTime(event.opening)}` : "",
    event.closing ? `Fechamento: ${formatDateTime(event.closing)}` : "",
    "",
    "Links para preenchimento:",
    ...linkedForms.map(form => `- ${getFormTypeLabel(form)}: ${getFormUrl(event, form)}`),
  ].filter(line => line !== "");
  return lines.join("\n");
};

export const EventsScreen = ({ events = [], forms = [], onSaveEvent, onPublishEvent, onNavigate }) => {
  const [draft, setDraft] = useState(() => toDraft(events[0]));
  const [activeId, setActiveId] = useState(events[0]?.id || null);
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const activeEvent = useMemo(() => events.find(event => event.id === activeId) || null, [events, activeId]);
  const linkedForms = useMemo(() => (draft.formIds || [])
    .map(id => forms.find(form => Number(form.id) === Number(id)))
    .filter(Boolean), [draft.formIds, forms]);
  const message = draft.title ? buildEventMessage(draft, forms) : "";

  useEffect(() => {
    if (activeId || !events[0]) return;
    loadEvent(events[0]);
  }, [activeId, events]);

  const loadEvent = event => {
    setActiveId(event.id);
    setDraft({
      ...toDraft(event),
    });
    setFeedback(null);
  };

  const startNew = () => {
    setActiveId(null);
    setDraft({ ...emptyDraft });
    setFeedback(null);
  };

  const toggleForm = formId => {
    setDraft(current => {
      const formIds = current.formIds.includes(formId)
        ? current.formIds.filter(id => id !== formId)
        : [...current.formIds, formId];
      return { ...current, formIds };
    });
  };

  const save = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const saved = await onSaveEvent(draft);
      setDraft({
        ...toDraft(saved),
      });
      setActiveId(saved.id);
      setFeedback({ tone: "success", message: "Evento salvo." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (!draft.id) return;
    setPublishing(true);
    setFeedback(null);
    try {
      const published = await onPublishEvent(draft.id);
      setDraft({
        ...toDraft(published),
      });
      setActiveId(published.id);
      setFeedback({ tone: "success", message: "Evento publicado. A mensagem ja pode ser copiada." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setPublishing(false);
    }
  };

  const copyMessage = async () => {
    if (!message) return;
    try {
      await navigator.clipboard?.writeText(message);
      setFeedback({ tone: "success", message: "Mensagem copiada." });
    } catch {
      setFeedback({ tone: "info", message: "Selecione a mensagem e copie manualmente." });
    }
  };

  return (
    <div>
      {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} fixed />}
      <div className="create-form-header screen-top-card settings-top-card" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Btn v="ghost" icon="back" onClick={() => onNavigate("list")} aria-label="Voltar" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Eventos</h2>
          <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 13 }}>Agrupe formularios e publique a divulgacao inicial.</p>
        </div>
        <Btn icon="plus" onClick={startNew} aria-label="Novo evento" title="Novo evento" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 0.9fr) minmax(0, 1.6fr)", gap: 18 }} className="events-layout">
        <section style={{ display: "grid", gap: 10, alignContent: "start" }}>
          {events.length === 0 && (
            <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: 8, padding: 18, color: COLORS.textSecondary, fontSize: 13 }}>
              Nenhum evento criado.
            </div>
          )}
          {events.map(event => (
            <button
              key={event.id}
              type="button"
              onClick={() => loadEvent(event)}
              style={{
                textAlign: "left",
                border: `1px solid ${activeId === event.id ? COLORS.primary : COLORS.borderLight}`,
                background: COLORS.surface,
                borderRadius: 8,
                padding: 14,
                cursor: "pointer",
                color: COLORS.text,
                fontFamily: "inherit",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                <strong style={{ fontSize: 14 }}>{event.date ? `${event.title} - ${formatDate(event.date)}` : event.title}</strong>
                <StatusBadge status={event.status} />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8, color: COLORS.textMuted, fontSize: 12, flexWrap: "wrap" }}>
                {event.opening && <span>Abre {formatDateTime(event.opening)}</span>}
                {event.closing && <span>Fecha {formatDateTime(event.closing)}</span>}
                <span>{event.formIds?.length || 0} forms</span>
              </div>
            </button>
          ))}
        </section>

        <section style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 18 }}>
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 12 }} className="events-form-grid">
              <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
                Nome do evento
                <input value={draft.title} onChange={event => setDraft(current => ({ ...current, title: event.target.value }))} placeholder="Ex: Reuniao mensal - Maio" style={{ padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.surface, color: COLORS.text }} />
              </label>
              <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
                Data
                <input type="date" value={draft.date || ""} onChange={event => setDraft(current => ({ ...current, date: event.target.value }))} style={{ padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.surface, color: COLORS.text }} />
              </label>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="events-form-grid">
              <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
                Abertura
                <input type="datetime-local" value={draft.opening || ""} onChange={event => setDraft(current => ({ ...current, opening: event.target.value }))} style={{ padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.surface, color: COLORS.text }} />
              </label>
              <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
                Fechamento
                <input type="datetime-local" value={draft.closing || ""} onChange={event => setDraft(current => ({ ...current, closing: event.target.value }))} style={{ padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.surface, color: COLORS.text }} />
              </label>
            </div>
            <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
              Descricao
              <textarea value={draft.description || ""} onChange={event => setDraft(current => ({ ...current, description: event.target.value }))} rows={2} style={{ padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.surface, color: COLORS.text, resize: "vertical" }} />
            </label>

            <div style={{ borderTop: `1px solid ${COLORS.borderLight}`, paddingTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 10 }}>
                <strong style={{ fontSize: 14 }}>Formularios do evento</strong>
                <span style={{ color: COLORS.textMuted, fontSize: 12 }}>{linkedForms.length} vinculados</span>
              </div>
              <div style={{ display: "grid", gap: 8, maxHeight: 280, overflow: "auto", paddingRight: 4 }}>
                {forms.map(form => (
                  <label key={form.id} style={{ display: "flex", alignItems: "center", gap: 10, border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 10, cursor: "pointer" }}>
                    <input type="checkbox" checked={draft.formIds.includes(form.id)} onChange={() => toggleForm(form.id)} />
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <strong style={{ display: "block", fontSize: 13 }}>{getFormTypeLabel(form)}</strong>
                      <small style={{ color: COLORS.textMuted }}>{form.title} · {form.status}</small>
                    </span>
                    <TypeBadge type={form.type} />
                  </label>
                ))}
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${COLORS.borderLight}`, paddingTop: 14, display: "grid", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <strong style={{ fontSize: 14 }}>Divulgacao inicial</strong>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn v="secondary" icon="clipboard" onClick={copyMessage} disabled={!message}>Copiar</Btn>
                  <Btn icon="share" onClick={publish} loading={publishing} disabled={!draft.id || !draft.formIds.length || draft.status === "publicado"}>Publicar</Btn>
                </div>
              </div>
              <textarea value={message} readOnly rows={Math.max(6, linkedForms.length + 4)} style={{ width: "100%", boxSizing: "border-box", padding: 12, border: `1px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.surfaceAlt, color: COLORS.text, resize: "vertical", fontFamily: "inherit" }} />
              {activeEvent?.publishedAt && <small style={{ color: COLORS.textMuted }}>Publicado em {formatDateTime(activeEvent.publishedAt)}.</small>}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Btn v="secondary" onClick={() => activeEvent ? loadEvent(activeEvent) : startNew()}>Cancelar</Btn>
              <Btn icon="save" onClick={save} loading={saving} disabled={!draft.title.trim()}>Salvar evento</Btn>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
