/**
 * @file frontend/src/features/auth/UserManagementModal.jsx
 * @summary Modal legado de usuarios.
 * @responsibility Criar usuarios de forma isolada quando usado fora do painel principal.
 */

import React, { useState } from "react";
import { COLORS, Btn, FeedbackBanner, resolveActionErrorMessage } from "../../components/ui";
import { ROLES } from "../../lib/auth";

export const UserManagementModal = ({ users, onCreate, onClose }) => {
  const [form, setForm] = useState({ name: "", username: "", password: "", role: "viewer" });
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);
  const input = { width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.surface, color: COLORS.text };

  const submit = async () => {
    setFeedback(null);
    if (!form.username.trim() || !form.password.trim()) {
      setFeedback({ tone: "error", title: "Usuário", message: "Informe usuário e senha." });
      return;
    }

    setSaving(true);
    setFeedback({ tone: "loading", title: "Usuário", message: "Criando usuário..." });

    try {
      const result = await Promise.resolve(onCreate({ ...form, name: form.name.trim() || form.username.trim(), username: form.username.trim() }));
      if (result?.ok) {
        setFeedback({ tone: "success", title: "Usuário", message: "Usuário criado com sucesso." });
        setForm({ name: "", username: "", password: "", role: "viewer" });
      } else {
        setFeedback({ tone: "error", title: "Usuário", message: result?.message || "Não foi possível criar o usuário." });
      }
    } catch (error) {
      setFeedback({ tone: "error", title: "Usuário", message: resolveActionErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0 }}>Cadastrar usuário</h3>
            <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 12 }}>Apenas contas administrativas podem criar novos usuários.</p>
          </div>
          <Btn v="ghost" onClick={onClose}>Fechar</Btn>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {feedback && <FeedbackBanner tone={feedback.tone} title={feedback.title} message={feedback.message} />}
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome exibido" style={input} />
          <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Nome de usuario" style={input} />
          <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Senha" type="password" style={input} />
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={input}>
            <option value="viewer">Visualizador</option>
            <option value="admin">Administrativo</option>
          </select>
          <Btn onClick={submit} loading={saving}>Criar usuário</Btn>
        </div>
        <div style={{ marginTop: 18, borderTop: `1px solid ${COLORS.borderLight}`, paddingTop: 12 }}>
          <strong style={{ fontSize: 12 }}>Usuários cadastrados</strong>
          {users.map(user => (
            <div key={user.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", fontSize: 12, borderBottom: `1px solid ${COLORS.borderLight}` }}>
              <span>{user.name} <span style={{ color: COLORS.textMuted }}>({user.username})</span></span>
              <strong>{ROLES[user.role]?.label}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
