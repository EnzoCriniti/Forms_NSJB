/**
 * @file frontend/src/features/auth/AuthPanel.jsx
 * @summary Painel de autenticacao do topo.
 * @responsibility Realizar login local, logout e acoes rapidas de sessao.
 */

import React, { useState } from "react";
import { Btn, FeedbackBanner, resolveActionErrorMessage, ThemeIcon } from "../../components/ui";
import { ROLES } from "../../lib/auth";
import { FONT_SCALE_MAX, FONT_SCALE_MIN } from "../../lib/appFontScale";

const userInitials = name => String(name || "Usuário")
  .trim()
  .split(/\s+/)
  .slice(0, 2)
  .map(part => part.charAt(0).toUpperCase())
  .join("") || "U";

export const AuthPanel = ({ user, onLogin, onLogout, theme, fontScale = 1, onToggleTheme, onIncreaseTextSize, onDecreaseTextSize, variant = "header" }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);
  const isSheet = variant === "sheet";

  const getLoginErrorMessage = error => {
    const message = String(error?.message || "");
    if (error?.code === "AUTH_INVALID_PAYLOAD" || /usuario e senha sao obrigatorios|usu[aá]rio e senha s[aã]o obrigat[oó]rios/i.test(message)) {
      return "Informe usuário e senha.";
    }
    if (error?.code === "AUTH_INVALID_CREDENTIALS" || /usuario ou senha invalidos|usu[aá]rio ou senha inv[aá]lidos/i.test(message)) {
      return "Usuário ou senha inválidos.";
    }
    return resolveActionErrorMessage(error);
  };

  const submit = async () => {
    setFeedback(null);
    if (!username.trim() || !password.trim()) {
      setFeedback({ tone: "error", title: "Entrada", message: "Informe usuário e senha." });
      return;
    }
    setSaving(true);
    setFeedback({ tone: "loading", title: "Entrada", message: "Entrando..." });
    try {
      await onLogin(username.trim(), password);
      setUsername("");
      setPassword("");
      setFeedback(null);
    } catch (error) {
      setFeedback({ tone: "error", title: "Entrada", message: getLoginErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  if (user) return (
    <div className="auth-panel" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
      <Btn
        v="ghost"
        sz="sm"
        onClick={onDecreaseTextSize}
        title="Diminuir fonte"
        aria-label="Diminuir fonte"
        disabled={fontScale <= FONT_SCALE_MIN}
        style={{ border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", minHeight: 36, minWidth: 36, padding: "8px 10px", fontWeight: 700, borderRadius: 10, boxShadow: "var(--shadow-sm)" }}
      >
        A-
      </Btn>
      <Btn
        v="ghost"
        sz="sm"
        onClick={onIncreaseTextSize}
        title="Aumentar fonte"
        aria-label="Aumentar fonte"
        disabled={fontScale >= FONT_SCALE_MAX}
        style={{ border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", minHeight: 36, minWidth: 36, padding: "8px 10px", fontWeight: 700, borderRadius: 10, boxShadow: "var(--shadow-sm)" }}
      >
        A+
      </Btn>
      <Btn
        v="ghost"
        sz="sm"
        onClick={onToggleTheme}
        title={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
        style={{ border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", padding: "8px 10px", minHeight: 36, minWidth: 36, borderRadius: 10, boxShadow: "var(--shadow-sm)" }}
      >
        <ThemeIcon theme={theme} />
      </Btn>
      <div className="app-header__user">
        <span className="app-header__user-badge">{userInitials(user.name)}</span>
        <div>
          <div className="app-header__user-name">{user.name}</div>
          <div className="app-header__user-role">{ROLES[user.role]?.label}</div>
        </div>
      </div>
      <Btn v="ghost" sz="sm" onClick={onLogout} style={{ border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", minHeight: 36, borderRadius: 10, fontWeight: 600, boxShadow: "var(--shadow-sm)" }}>
        Sair
      </Btn>
    </div>
  );

  if (isSheet) {
    return (
      <div className="auth-panel auth-panel--sheet" style={{ display: "grid", gap: 14, width: "100%" }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)" }}>Usuário</span>
          <input
            className="auth-panel__input"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="ex.: admin"
            style={{ width: "100%", minHeight: 44 }}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)" }}>Senha</span>
          <input
            className="auth-panel__input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            style={{ width: "100%", minHeight: 44 }}
            onKeyDown={e => { if (e.key === "Enter") submit(); }}
          />
        </label>
        <Btn onClick={submit} loading={saving} style={{ marginTop: 4, background: "var(--primary)", color: "var(--on-primary)", minHeight: 46, fontSize: 15, fontWeight: 700, borderRadius: 10, boxShadow: "0 6px 16px rgba(var(--primary-rgb), 0.28)", width: "100%" }}>Entrar</Btn>
        {feedback && <FeedbackBanner fixed tone={feedback.tone} title={feedback.title} message={feedback.message} />}
      </div>
    );
  }

  return (
    <div className="auth-panel" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
      <Btn
        v="ghost"
        sz="sm"
        onClick={onToggleTheme}
        title={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
        style={{ border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", padding: "8px 10px", minHeight: 36, minWidth: 36, borderRadius: 10, boxShadow: "var(--shadow-sm)" }}
      >
        <ThemeIcon theme={theme} />
      </Btn>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Usuário" style={{ width: 140 }} />
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" type="password" style={{ width: 128 }} onKeyDown={e => { if (e.key === "Enter") submit(); }} />
      <Btn onClick={submit} loading={saving} style={{ background: "var(--primary)", color: "var(--on-primary)", minHeight: 36, borderRadius: 10, boxShadow: "var(--shadow-sm)" }}>Entrar</Btn>
      {feedback && <FeedbackBanner fixed tone={feedback.tone} title={feedback.title} message={feedback.message} />}
    </div>
  );
};
