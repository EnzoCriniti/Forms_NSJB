/**
 * @file frontend/src/features/admin/AccessLayersPanel.jsx
 * @summary Painel de gestão das camadas de acesso (RBAC).
 * @responsibility Listar camadas e editar a matriz de permissões. Camadas de
 * sistema são somente leitura.
 */

import React, { useState } from "react";
import { Btn } from "../../components/ui";
import { CAPABILITY_GROUPS } from "../../../../shared/permissions.mjs";
import { saveAccessLayer, deleteAccessLayer } from "../../lib/api";

const emptyDraft = { name: "", description: "", permissions: [] };

export const AccessLayersPanel = ({ layers = [], onChanged, requestDelete }) => {
  const [draft, setDraft] = useState(emptyDraft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const perms = new Set(draft.permissions);
  const toggle = key => {
    const next = new Set(perms);
    if (next.has(key)) next.delete(key); else next.add(key);
    setDraft({ ...draft, permissions: [...next] });
  };
  const editLayer = layer => { setError(null); setDraft({ id: layer.id, name: layer.name, description: layer.description, permissions: layer.permissions }); };
  const reset = () => { setDraft(emptyDraft); setError(null); };

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await saveAccessLayer(draft);
      reset();
      await onChanged?.();
    } catch (err) {
      setError(err?.message || "Não foi possível salvar a camada.");
    } finally {
      setBusy(false);
    }
  };

  const remove = layer => requestDelete(
    "Excluir camada",
    `Excluir a camada "${layer.name}"? Reatribua os usuários dela antes.`,
    "Excluir",
    async () => { await deleteAccessLayer(layer.id); await onChanged?.(); },
  );

  return (
    <section className="msg-card" style={{ marginTop: 16 }}>
      <header className="msg-card__head">
        <h3 className="msg-card__title">Camadas de acesso</h3>
        <p className="msg-card__hint">Defina o que cada camada pode ver e fazer. As camadas de sistema não podem ser editadas.</p>
      </header>
      <div className="msg-split">
        <div className="msg-form">
          <h4 className="msg-subtitle">{draft.id ? "Editar camada" : "Nova camada"}</h4>
          <label className="msg-field">
            <span className="msg-label">Nome</span>
            <input className="msg-input" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="Ex.: Coordenador de escala" />
          </label>
          <label className="msg-field">
            <span className="msg-label">Descrição</span>
            <input className="msg-input" value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} placeholder="Opcional" />
          </label>
          <div className="access-matrix">
            {CAPABILITY_GROUPS.map(group => (
              <div key={group.key} className="access-matrix__group">
                <div className="access-matrix__group-title">{group.label}</div>
                <div className="access-matrix__caps">
                  {group.capabilities.map(cap => (
                    <label key={cap.key} className="access-matrix__cap">
                      <input type="checkbox" checked={perms.has(cap.key)} onChange={() => toggle(cap.key)} />
                      <span>{cap.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {error && <div className="msg-error" role="alert">{error}</div>}
          <div className="msg-actions">
            <Btn onClick={save} loading={busy} disabled={!draft.name.trim()}>{draft.id ? "Salvar camada" : "Criar camada"}</Btn>
            {draft.id && <Btn v="ghost" onClick={reset}>Cancelar</Btn>}
          </div>
        </div>
        <div>
          <h4 className="msg-subtitle">Camadas cadastradas</h4>
          <div style={{ display: "grid", gap: 6 }}>
            {layers.map(layer => (
              <div key={layer.id} className="settings-row">
                <div style={{ minWidth: 0, flex: 1 }}>
                  <strong>{layer.name}</strong>
                  {layer.isSystem && <span className="access-badge">Sistema</span>}
                  <div>{layer.permissions.length} permissões{layer.description ? ` · ${layer.description}` : ""}</div>
                </div>
                {!layer.isSystem && <Btn v="secondary" sz="sm" onClick={() => editLayer(layer)}>Editar</Btn>}
                {!layer.isSystem && <Btn v="danger" sz="sm" onClick={() => remove(layer)}>Excluir</Btn>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
