/**
 * @file frontend/src/features/members/MemberListConfigModal.jsx
 * @summary Configuracao da base de socios.
 * @responsibility Salvar parametros do Google Sheets e importar pessoas para a base local.
 */

import React, { useState } from "react";
import { COLORS, Btn, FeedbackBanner, resolveActionErrorMessage } from "../../components/ui";

const PAGE_SIZE = 12;

function colIndex(letter) {
  return letter.toUpperCase().charCodeAt(0) - 65;
}

function parseCSV(text) {
  return text.split("\n").map(line => {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQuotes = !inQuotes; }
      else if (line[i] === "," && !inQuotes) { result.push(current.trim()); current = ""; }
      else { current += line[i]; }
    }
    result.push(current.trim());
    return result;
  }).filter(row => row.some(cell => cell !== ""));
}

async function fetchPeople(cfg) {
  const match = cfg.sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) throw new Error("URL do Google Sheets invalida.");
  const id = match[1];
  const [sheetPart, rangePart] = cfg.range.includes("!") ? cfg.range.split("!") : ["", cfg.range];
  const params = new URLSearchParams({ tqx: "out:csv" });
  if (sheetPart) params.set("sheet", sheetPart);
  if (rangePart) params.set("range", rangePart);
  const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ao buscar planilha (${res.status}).`);
  const text = await res.text();
  const rows = parseCSV(text);
  const nameCol = colIndex(cfg.nameColumn || "B");
  const grauCol = colIndex(cfg.grauColumn || "A");
  return rows
    .slice(1) // pula header
    .map(row => ({ name: row[nameCol] || "", grau: row[grauCol] || "" }))
    .filter(p => p.name);
}

export const MemberListConfigModalContent = ({ config, people, onSave, onSavePeople }) => {
  const [draft, setDraft] = useState(config);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const input = {
    width: "100%",
    minHeight: 42,
    padding: "10px 12px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10,
    background: COLORS.surface,
    color: COLORS.text,
    boxShadow: "var(--shadow-sm)",
  };
  const totalPages = Math.max(1, Math.ceil(people.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visiblePeople = people.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSave = async () => {
    setSaving(true);
    setToast({ type: "loading", message: "Salvando e buscando lista..." });
    try {
      await onSave(draft);
      const fetched = await fetchPeople(draft);
      await onSavePeople(fetched);
      setToast({ type: "success", message: `${fetched.length} socios carregados.` });
    } catch (e) {
      setToast({ type: "error", message: resolveActionErrorMessage(e) });
    }
    setSaving(false);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div style={{ position: "relative" }}>
      {toast && <FeedbackBanner fixed tone={toast.type} message={toast.message} />}
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <input value={draft.sheetUrl} onChange={e => setDraft({ ...draft, sheetUrl: e.target.value })} placeholder="Link publico do Google Sheets" style={input} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <input value={draft.nameColumn} onChange={e => setDraft({ ...draft, nameColumn: e.target.value })} placeholder="Coluna do nome. Ex: B" style={input} />
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <input value={draft.grauColumn} onChange={e => setDraft({ ...draft, grauColumn: e.target.value })} placeholder="Coluna do grau. Ex: A" style={input} />
          </div>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <input value={draft.range} onChange={e => setDraft({ ...draft, range: e.target.value })} placeholder="Aba ou intervalo. Ex: Socios!A:B" style={input} />
        </div>
        <Btn onClick={handleSave} loading={saving}>Salvar configuracao</Btn>
        <p style={{ margin: 0, fontSize: 12, color: COLORS.textMuted }}>Salvamos o link e as colunas para a fonte global de socios. A planilha precisa estar acessivel publicamente para o preview funcionar.</p>
      </div>
      <div style={{ marginTop: 18, borderTop: `1px solid ${COLORS.borderLight}`, paddingTop: 12 }}>
        <strong style={{ fontSize: 12 }}>Previa da lista atual ({people.length})</strong>
        <div style={{ maxHeight: 220, overflowY: "auto", overflowX: "hidden", marginTop: 8, paddingRight: 8 }}>
          {visiblePeople.map(person => (
            <div key={`${person.grau}-${person.name}`} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 12, padding: "9px 0", fontSize: 12, borderBottom: `1px solid ${COLORS.borderLight}` }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{person.name}</span>
              <strong style={{ minWidth: 28, textAlign: "right" }}>{person.grau}</strong>
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
      </div>
    </div>
  );
};

export const MemberListConfigModal = ({ config, people, onSave, onClose }) => (
  <div className="modal-backdrop">
    <div className="modal-card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0 }}>Lista de socios</h3>
          <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 12 }}>Configuracao global usada pelos seletores de nome.</p>
        </div>
        <Btn v="ghost" onClick={onClose}>Fechar</Btn>
      </div>
      <MemberListConfigModalContent config={config} people={people} onSave={onSave} onSavePeople={() => {}} />
    </div>
  </div>
);
