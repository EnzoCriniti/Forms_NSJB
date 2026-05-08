/**
 * @file frontend/src/features/members/MemberListConfigModal.jsx
 * @summary Configuracao da base de socios.
 * @responsibility Salvar origem externa e sincronizar a base central de socios.
 */

import React, { useEffect, useState } from "react";
import { COLORS, Btn, FeedbackBanner, resolveActionErrorMessage } from "../../components/ui";

const PAGE_SIZE = 12;

const inputStyle = {
  width: "100%",
  minHeight: 42,
  padding: "10px 12px",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 10,
  background: COLORS.surface,
  color: COLORS.text,
  boxShadow: "var(--shadow-sm)",
};

const infoCardStyle = {
  background: COLORS.surfaceAlt,
  border: `1px solid ${COLORS.borderLight}`,
  borderRadius: 12,
  padding: 14,
};

const sectionTitleStyle = {
  display: "block",
  fontSize: 13,
  color: COLORS.text,
  marginBottom: 4,
};

const formatSyncDate = value => {
  if (!value) return "Nunca sincronizado";
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return "Nunca sincronizado";
  }
};

const syncStatusLabel = config => {
  if (!config?.sheetUrl) return "Origem nao configurada";
  if (!config?.syncEnabled) return "Sincronizacao desativada";
  if (!config?.lastSyncedAt) return "Aguardando primeira sincronizacao";
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
    setToast({ type: "loading", message: "Salvando configuracao da base..." });
    try {
      await onSave(draft);
      setToast({ type: "success", message: "Configuracao da base salva." });
    } catch (error) {
      setToast({ type: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setSaving(false);
      window.setTimeout(() => setToast(null), 3000);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setToast({ type: "loading", message: "Sincronizando base de socios..." });
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
    <div style={{ position: "relative", display: "grid", gap: 16 }}>
      {toast && <FeedbackBanner fixed tone={toast.type} message={toast.message} />}

      <section style={infoCardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div>
            <strong style={{ display: "block", fontSize: 13, color: COLORS.text }}>Base central de socios</strong>
            <div style={{ marginTop: 4, fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.5 }}>
              Os formularios, escalas e automacoes futuras consomem esta base a partir do banco.
            </div>
          </div>
          <div style={{ textAlign: "right", minWidth: 180 }}>
            <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", fontWeight: 800 }}>Status</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{syncStatusLabel(config)}</div>
            <div style={{ marginTop: 4, fontSize: 11, color: COLORS.textMuted }}>
              Ultima sincronizacao: {formatSyncDate(config?.lastSyncedAt)}
            </div>
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <div>
          <strong style={{ ...sectionTitleStyle }}>Origem da base</strong>
          <div style={{ fontSize: 12, color: COLORS.textSecondary }}>Conecte a planilha e informe apenas o mapeamento principal. Os campos extras ficam separados mais abaixo.</div>
        </div>

        <section style={infoCardStyle}>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Tipo de origem</label>
              <select value={draft.sourceType || "google_sheets"} onChange={event => setDraft({ ...draft, sourceType: event.target.value })} style={inputStyle}>
                <option value="google_sheets">Google Sheets</option>
              </select>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Link publico do Google Sheets</label>
              <input value={draft.sheetUrl || ""} onChange={e => setDraft({ ...draft, sheetUrl: e.target.value })} placeholder="https://docs.google.com/spreadsheets/d/..." style={inputStyle} />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Aba / intervalo do Google Sheets</label>
              <input value={draft.range || ""} onChange={e => setDraft({ ...draft, range: e.target.value })} placeholder="Socios!A:B" style={inputStyle} />
            </div>

            <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.45 }}>
              Use o formato <strong style={{ color: COLORS.text }}>Aba!A:B</strong>. Exemplo: <strong style={{ color: COLORS.text }}>Socios!A:B</strong>.
            </div>
          </div>
        </section>

        <section style={infoCardStyle}>
          <div style={{ marginBottom: 10 }}>
            <strong style={{ ...sectionTitleStyle, marginBottom: 2 }}>Mapeamento principal</strong>
            <div style={{ fontSize: 12, color: COLORS.textSecondary }}>Esses campos sao os minimos para o sistema identificar a pessoa na base.</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Coluna do grau</label>
              <input value={draft.grauColumn || ""} onChange={e => setDraft({ ...draft, grauColumn: e.target.value })} placeholder="A" style={inputStyle} />
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Coluna do nome</label>
              <input value={draft.nameColumn || ""} onChange={e => setDraft({ ...draft, nameColumn: e.target.value })} placeholder="B" style={inputStyle} />
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: COLORS.textMuted }}>Informe apenas a letra da coluna: `A`, `B`, `C`...</div>
        </section>

        <details style={infoCardStyle} open={Boolean(draft.phoneColumn || draft.externalIdColumn || draft.activeColumn)}>
          <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 700, color: COLORS.text }}>Campos extras opcionais</summary>
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <div style={{ fontSize: 12, color: COLORS.textSecondary }}>Preencha apenas se a sua planilha tiver esses dados e voce quiser reaproveita-los na base interna.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Coluna do telefone</label>
                <input value={draft.phoneColumn || ""} onChange={e => setDraft({ ...draft, phoneColumn: e.target.value })} placeholder="C" style={inputStyle} />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Coluna do id externo</label>
                <input value={draft.externalIdColumn || ""} onChange={e => setDraft({ ...draft, externalIdColumn: e.target.value })} placeholder="D" style={inputStyle} />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Coluna de ativo</label>
                <input value={draft.activeColumn || ""} onChange={e => setDraft({ ...draft, activeColumn: e.target.value })} placeholder="E" style={inputStyle} />
              </div>
            </div>
          </div>
        </details>

        <section style={infoCardStyle}>
          <div style={{ marginBottom: 10 }}>
            <strong style={{ ...sectionTitleStyle, marginBottom: 2 }}>Automacao</strong>
            <div style={{ fontSize: 12, color: COLORS.textSecondary }}>Defina se a base pode ser atualizada automaticamente e com qual frequencia.</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 220px", gap: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: COLORS.textSecondary }}>
              <input type="checkbox" checked={draft.syncEnabled !== false} onChange={e => setDraft({ ...draft, syncEnabled: e.target.checked })} />
              Permitir sincronizacao automatica desta base
            </label>
            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Frequencia da sincronizacao (horas)</label>
              <input type="number" min="1" value={draft.syncFrequencyHours || 24} onChange={e => setDraft({ ...draft, syncFrequencyHours: Number(e.target.value) || 24 })} style={inputStyle} />
            </div>
          </div>
        </section>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn onClick={handleSave} loading={saving}>Salvar configuracao</Btn>
          <Btn v="secondary" onClick={handleSync} loading={syncing} disabled={!draft.sheetUrl || draft.syncEnabled === false}>Sincronizar agora</Btn>
        </div>

        <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.55 }}>
          O banco passa a ser a fonte operacional da aplicacao. A planilha funciona como origem externa de sincronizacao.
        </div>
      </section>

      <section style={{ ...infoCardStyle, paddingTop: 12 }}>
        <strong style={{ display: "block", fontSize: 12, color: COLORS.text }}>Previa da base atual ({people.length})</strong>
        <div style={{ maxHeight: 260, overflowY: "auto", overflowX: "hidden", marginTop: 8, paddingRight: 8 }}>
          {visiblePeople.map(person => (
            <div key={`${person.externalKey || person.id}-${person.name}`} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) auto auto", gap: 12, padding: "9px 0", fontSize: 12, borderBottom: `1px solid ${COLORS.borderLight}` }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{person.name}</span>
              <strong style={{ minWidth: 28, textAlign: "right" }}>{person.grau || "-"}</strong>
              <span style={{ minWidth: 80, textAlign: "right", color: person.active === false ? COLORS.danger : COLORS.textMuted }}>
                {person.active === false ? "Inativo" : "Ativo"}
              </span>
            </div>
          ))}
        </div>
        {people.length > PAGE_SIZE && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: COLORS.textMuted }}>
              {((safePage - 1) * PAGE_SIZE) + 1}-{Math.min(safePage * PAGE_SIZE, people.length)} de {people.length}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <Btn v="secondary" sz="sm" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={safePage === 1}>Anterior</Btn>
              <Btn v="secondary" sz="sm" onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={safePage === totalPages}>Proxima</Btn>
            </div>
          </div>
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
