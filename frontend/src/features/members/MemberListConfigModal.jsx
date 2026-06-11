/**
 * @file frontend/src/features/members/MemberListConfigModal.jsx
 * @summary Configuracao da base de socios.
 * @responsibility Salvar origem externa e sincronizar a base central de socios.
 */

import React, { useEffect, useState } from "react";
import { COLORS, Btn, FeedbackBanner, resolveActionErrorMessage } from "../../components/ui";

const PAGE_SIZE = 12;

const gridTwo = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 };

const formatSyncDate = value => {
  if (!value) return "Nunca sincronizado";
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return "Nunca sincronizado";
  }
};

const syncStatusLabel = config => {
  if (!config?.sheetUrl) return "Origem não configurada";
  if (!config?.syncEnabled) return "Sincronização desativada";
  if (!config?.lastSyncedAt) return "Aguardando primeira sincronização";
  return "Base sincronizada";
};

export const MemberListConfigModalContent = ({ config, people, onSave, onSync }) => {
  const [draft, setDraft] = useState(config);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setDraft(config);
  }, [config]);

  const totalPages = Math.max(1, Math.ceil(people.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visiblePeople = people.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSave = async () => {
    setSaving(true);
    setToast({ type: "loading", message: "Salvando configuração da base..." });
    try {
      await onSave(draft);
      setToast({ type: "success", message: "Configuração da base salva." });
    } catch (error) {
      setToast({ type: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setSaving(false);
      window.setTimeout(() => setToast(null), 3000);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setToast({ type: "loading", message: "Sincronizando base de sócios..." });
    try {
      const result = await onSync();
      setToast({ type: "success", message: `${result.importedCount} socios sincronizados.` });
    } catch (error) {
      setToast({ type: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setSyncing(false);
      window.setTimeout(() => setToast(null), 3500);
    }
  };

  return (
    <div className="msg-settings" style={{ position: "relative" }}>
      {toast && <FeedbackBanner fixed tone={toast.type} message={toast.message} />}

      <section className="msg-card">
        <header className="msg-card__head">
          <h3 className="msg-card__title">Base central de sócios</h3>
          <p className="msg-card__hint">
            Os formulários, escalas e automações futuras consomem esta base a partir do banco.
          </p>
        </header>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <div>
            <span className="msg-label">Status</span>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginTop: 4 }}>{syncStatusLabel(config)}</div>
          </div>
          <div>
            <span className="msg-label">Última sincronização</span>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{formatSyncDate(config?.lastSyncedAt)}</div>
          </div>
        </div>
      </section>

      <section className="msg-card">
        <header className="msg-card__head">
          <h3 className="msg-card__title">Origem e mapeamento</h3>
          <p className="msg-card__hint">
            Conecte a planilha e informe o mapeamento principal. Os campos extras ficam separados mais abaixo.
          </p>
        </header>
        <div className="msg-form">
          <label className="msg-field">
            <span className="msg-label">Tipo de origem</span>
            <select className="msg-input" value={draft.sourceType || "google_sheets"} onChange={event => setDraft({ ...draft, sourceType: event.target.value })}>
              <option value="google_sheets">Google Sheets</option>
            </select>
          </label>
          <label className="msg-field">
            <span className="msg-label">Link público do Google Sheets</span>
            <input className="msg-input" value={draft.sheetUrl || ""} onChange={e => setDraft({ ...draft, sheetUrl: e.target.value })} placeholder="https://docs.google.com/spreadsheets/d/..." />
          </label>
          <label className="msg-field">
            <span className="msg-label">Aba / intervalo do Google Sheets</span>
            <input className="msg-input" value={draft.range || ""} onChange={e => setDraft({ ...draft, range: e.target.value })} placeholder="Socios!A:B" />
            <span className="msg-hint">Use o formato Aba!A:B. Exemplo: Socios!A:B.</span>
          </label>

          <h4 className="msg-subtitle" style={{ marginTop: 6 }}>Mapeamento principal</h4>
          <div style={gridTwo}>
            <label className="msg-field">
              <span className="msg-label">Coluna do grau</span>
              <input className="msg-input" value={draft.grauColumn || ""} onChange={e => setDraft({ ...draft, grauColumn: e.target.value })} placeholder="A" />
            </label>
            <label className="msg-field">
              <span className="msg-label">Coluna do nome</span>
              <input className="msg-input" value={draft.nameColumn || ""} onChange={e => setDraft({ ...draft, nameColumn: e.target.value })} placeholder="B" />
            </label>
          </div>
          <span className="msg-hint">Informe apenas a letra da coluna: A, B, C...</span>

          <details open={Boolean(draft.phoneColumn || draft.externalIdColumn || draft.activeColumn)}>
            <summary className="msg-subtitle" style={{ cursor: "pointer" }}>Campos extras opcionais</summary>
            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <span className="msg-hint">Preencha apenas se a sua planilha tiver esses dados e você quiser reaproveitá-los na base interna.</span>
              <div style={gridTwo}>
                <label className="msg-field">
                  <span className="msg-label">Coluna do telefone</span>
                  <input className="msg-input" value={draft.phoneColumn || ""} onChange={e => setDraft({ ...draft, phoneColumn: e.target.value })} placeholder="C" />
                </label>
                <label className="msg-field">
                  <span className="msg-label">Coluna do id externo</span>
                  <input className="msg-input" value={draft.externalIdColumn || ""} onChange={e => setDraft({ ...draft, externalIdColumn: e.target.value })} placeholder="D" />
                </label>
                <label className="msg-field">
                  <span className="msg-label">Coluna de ativo</span>
                  <input className="msg-input" value={draft.activeColumn || ""} onChange={e => setDraft({ ...draft, activeColumn: e.target.value })} placeholder="E" />
                </label>
              </div>
            </div>
          </details>

          <h4 className="msg-subtitle" style={{ marginTop: 6 }}>Automação</h4>
          <label className="msg-check">
            <input type="checkbox" checked={draft.syncEnabled !== false} onChange={e => setDraft({ ...draft, syncEnabled: e.target.checked })} />
            Permitir sincronização automática desta base
          </label>
          <label className="msg-field" style={{ maxWidth: 240 }}>
            <span className="msg-label">Frequência da sincronização (horas)</span>
            <input className="msg-input" type="number" min="1" value={draft.syncFrequencyHours || 24} onChange={e => setDraft({ ...draft, syncFrequencyHours: Number(e.target.value) || 24 })} />
          </label>

          <div className="msg-actions">
            <Btn onClick={handleSave} loading={saving}>Salvar configuração</Btn>
            <Btn v="secondary" onClick={handleSync} loading={syncing} disabled={!draft.sheetUrl || draft.syncEnabled === false}>Sincronizar agora</Btn>
          </div>
          <span className="msg-hint">
            O banco passa a ser a fonte operacional da aplicação. A planilha funciona como origem externa de sincronização.
          </span>
        </div>
      </section>

      <section className="msg-card">
        <header className="msg-card__head">
          <h3 className="msg-card__title">Prévia da base atual ({people.length})</h3>
        </header>
        {people.length === 0 ? (
          <div className="msg-empty">Nenhum sócio na base ainda.</div>
        ) : (
          <>
            <div style={{ maxHeight: 260, overflowY: "auto", overflowX: "hidden", paddingRight: 8 }}>
              {visiblePeople.map(person => (
                <div key={`${person.externalKey || person.id}-${person.name}`} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) auto auto", gap: 12, padding: "9px 0", fontSize: 12, borderBottom: "1px solid var(--border-light)" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{person.name}</span>
                  <strong style={{ minWidth: 28, textAlign: "right" }}>{person.grau || "-"}</strong>
                  <span style={{ minWidth: 80, textAlign: "right", color: person.active === false ? "var(--danger)" : "var(--text-muted)" }}>
                    {person.active === false ? "Inativo" : "Ativo"}
                  </span>
                </div>
              ))}
            </div>
            {people.length > PAGE_SIZE && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <span className="msg-hint">
                  {((safePage - 1) * PAGE_SIZE) + 1}-{Math.min(safePage * PAGE_SIZE, people.length)} de {people.length}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn v="secondary" sz="sm" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={safePage === 1}>Anterior</Btn>
                  <Btn v="secondary" sz="sm" onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={safePage === totalPages}>Próxima</Btn>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export const MemberListConfigModal = ({ config, people, onSave, onSync, onClose }) => (
  <div className="modal-backdrop">
    <div className="modal-card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0 }}>Base de socios</h3>
          <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 12 }}>Configuracao da fonte central usada pelos seletores e automacoes.</p>
        </div>
        <Btn v="ghost" onClick={onClose}>Fechar</Btn>
      </div>
      <MemberListConfigModalContent config={config} people={people} onSave={onSave} onSync={onSync} />
    </div>
  </div>
);
