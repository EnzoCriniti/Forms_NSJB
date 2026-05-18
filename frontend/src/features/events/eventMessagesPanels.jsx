/**
 * @file frontend/src/features/events/eventMessagesPanels.jsx
 * @summary Paineis reutilizaveis das mensagens de evento.
 * @responsibility Conter a UI comum do editor e do detalhe de mensagens.
 */

import React from "react";
import { Btn, COLORS, FeedbackBanner, Icon } from "../../components/ui";

const panelStyle = {
  border: `1px solid ${COLORS.borderLight}`,
  borderRadius: 8,
  padding: 12,
  display: "grid",
  gap: 10,
};

export const MessageRecipientsPanel = ({
  draft,
  personPresets,
  people,
  inputStyle,
  messagingConfig,
  selectedForm,
  onChange,
}) => (
  <fieldset style={panelStyle}>
    <legend style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, padding: "0 6px" }}>Destinatarios</legend>
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
      <input type="radio" checked={draft.recipientsMode === "auto"} onChange={() => onChange({ recipientsMode: "auto" })} />
      Quem ainda nao respondeu (automatico)
    </label>
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
      <input type="radio" checked={draft.recipientsMode === "preset"} onChange={() => onChange({ recipientsMode: "preset" })} disabled={personPresets.length === 0} />
      Usar preset de pessoas
    </label>
    {draft.recipientsMode === "preset" && (
      <select value={draft.recipientsPresetId || ""} onChange={event => onChange({ recipientsPresetId: event.target.value })} style={inputStyle}>
        <option value="">Selecione um preset...</option>
        {personPresets.map(preset => (
          <option key={preset.id} value={preset.id}>{preset.name} ({preset.personKeys.length})</option>
        ))}
      </select>
    )}
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
      <input type="radio" checked={draft.recipientsMode === "manual"} onChange={() => onChange({ recipientsMode: "manual" })} />
      Selecao manual
    </label>
    {draft.recipientsMode === "manual" && (
      <ManualPersonPicker people={people} selected={draft.recipientsPersonKeys} onChange={keys => onChange({ recipientsPersonKeys: keys })} inputStyle={inputStyle} />
    )}
    {draft.type === "fill_reminder" && (
      <div style={{ fontSize: 11, color: COLORS.textMuted }}>
        Base pública: {messagingConfig?.publicBaseUrl ? "configurada" : "ausente"}{selectedForm?.closing ? ` • fechamento: ${new Date(selectedForm.closing).toLocaleString("pt-BR")}` : ""}
      </div>
    )}
  </fieldset>
);

export const MessageSchedulePanel = ({ draft, selectedForm, inputStyle, onChange }) => (
  <fieldset style={panelStyle}>
    <legend style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, padding: "0 6px" }}>Agendamento</legend>
    {draft.type === "fill_reminder" ? (
      <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
        Janela
        <select value={draft.windowOption || ""} onChange={event => onChange({ windowOption: event.target.value, scheduledFor: "" })} style={inputStyle}>
          <option value="">Sem agendamento (rascunho)</option>
          <option value="morning_of_closing">Manha do fechamento (07h)</option>
          <option value="12h_before">12h antes do fechamento</option>
          <option value="1h_before">1h antes do fechamento</option>
        </select>
        {selectedForm?.closing && draft.windowOption && (
          <span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 400 }}>
            Fechamento do form: {new Date(selectedForm.closing).toLocaleString("pt-BR")}
          </span>
        )}
      </label>
    ) : (
      <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
        Data e hora (opcional)
        <input type="datetime-local" value={toLocalDateTime(draft.scheduledFor)} onChange={event => onChange({ scheduledFor: event.target.value })} style={inputStyle} />
      </label>
    )}
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
      <input type="checkbox" checked={draft.autoDispatchEnabled} onChange={event => onChange({ autoDispatchEnabled: event.target.checked })} />
      Permitir disparo automatico no horario agendado
    </label>
    <span style={{ fontSize: 11, color: COLORS.textMuted }}>
      Se desabilitado, no horario agendado a mensagem fica como "pronta" aguardando disparo manual.
    </span>
  </fieldset>
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
        <div style={{ fontSize: 12, color: COLORS.textMuted }}>Preview indisponivel.</div>
      )}
    </div>

    {!loading && preview && preview.kind === "group" && (
      <div style={{ border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 12, fontSize: 13, color: COLORS.textSecondary }}>
        Mensagem destinada ao grupo {preview.groupName ? <strong style={{ color: COLORS.text }}>{preview.groupName}</strong> : <em>(nome do grupo nao configurado)</em>}. Cole o texto acima no grupo do WhatsApp.
      </div>
    )}

    {!loading && preview && preview.kind === "dm" && (
      <div>
        <h4 style={{ margin: "0 0 8px", fontSize: 13, color: COLORS.textSecondary }}>
          Destinatarios ({recipientsActive.length} com telefone{recipientsSkipped.length > 0 ? `, ${recipientsSkipped.length} sem telefone` : ""})
        </h4>
        {recipientsActive.length === 0 && recipientsSkipped.length === 0 && (
          <div style={{ fontSize: 12, color: COLORS.textMuted }}>Nenhum destinatario calculado.</div>
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
    <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Historico de disparos</h3>
    {logs.length === 0 ? (
      <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: 8, padding: 18, color: COLORS.textSecondary, fontSize: 13 }}>
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
                {log.recipients.filter(item => !item.skipped).length} destinatario(s){log.recipients.some(item => item.skipped) ? `, ${log.recipients.filter(item => item.skipped).length} ignorado(s)` : ""}
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </section>
);

const ManualPersonPicker = ({ people, selected, onChange, inputStyle }) => {
  const [search, setSearch] = React.useState("");
  const sorted = React.useMemo(() => [...people].sort((a, b) => String(a.name).localeCompare(String(b.name), "pt-BR")), [people]);
  const filtered = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return sorted;
    return sorted.filter(person => String(person.name || "").toLowerCase().includes(needle));
  }, [sorted, search]);
  const selectedSet = React.useMemo(() => new Set((selected || []).map(String)), [selected]);

  const toggle = key => {
    const next = new Set(selectedSet);
    if (next.has(key)) next.delete(key); else next.add(key);
    onChange(Array.from(next));
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar pessoas..." style={inputStyle} />
      <div style={{ maxHeight: 200, overflowY: "auto", border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 8, background: COLORS.surface }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 12, fontSize: 12, color: COLORS.textMuted }}>Nenhuma pessoa encontrada.</div>
        ) : filtered.map(person => {
          const key = String(person.id);
          return (
            <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 4px", fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={selectedSet.has(key)} onChange={() => toggle(key)} />
              <span style={{ flex: 1 }}>{person.name}{person.grau ? ` (${person.grau})` : ""}</span>
              {!person.phone && <span style={{ fontSize: 10, color: COLORS.warning }}>sem telefone</span>}
            </label>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: COLORS.textMuted }}>{(selected || []).length} pessoa(s) selecionada(s)</div>
    </div>
  );
};

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

const toLocalDateTime = isoValue => {
  if (!isoValue) return "";
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return "";
  const pad = value => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
