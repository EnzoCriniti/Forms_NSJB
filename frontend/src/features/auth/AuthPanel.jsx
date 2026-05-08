/**
 * @file frontend/src/features/auth/AuthPanel.jsx
 * @summary Painel de autenticacao do topo.
 * @responsibility Realizar login local, logout e acoes rapidas de sessao.
 */

import React, { useState } from "react";
import { Btn, FeedbackBanner, resolveActionErrorMessage } from "../../components/ui";
import { ROLES } from "../../lib/auth";

const ThemeIcon = ({ theme }) => (
  theme === "dark"
    ? <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    : <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
);

export const AuthPanel = ({ user, onLogin, onLogout, theme, fontScale = 1, onToggleTheme, onIncreaseTextSize, onDecreaseTextSize, onOpenSettings, variant = "header" }) => {
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
    if (error?.code === "AUTH_ADMIN_SESSION_ACTIVE" || /administrador conectado em outro dispositivo/i.test(message)) {
      return "Já existe um administrador conectado em outro dispositivo. Aguarde o logout ou o tempo de inatividade.";
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
        disabled={fontScale <= 0.9}
        style={{ border: "1px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.08)", color: "#fff", minHeight: 38, padding: "8px 10px", fontWeight: 800 }}
      >
        A-
      </Btn>
      <Btn
        v="ghost"
        sz="sm"
        onClick={onIncreaseTextSize}
        title="Aumentar fonte"
        aria-label="Aumentar fonte"
        disabled={fontScale >= 1.3}
        style={{ border: "1px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.08)", color: "#fff", minHeight: 38, padding: "8px 10px", fontWeight: 800 }}
      >
        A+
      </Btn>
      <Btn
        v="ghost"
        sz="sm"
        onClick={onToggleTheme}
        title={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
        style={{ border: "1px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.08)", color: "#fff", padding: "8px 10px", minHeight: 38 }}
      >
        <ThemeIcon theme={theme} />
      </Btn>
      {user.role === "admin" && (
        <Btn v="ghost" sz="sm" onClick={onOpenSettings} style={{ border: "1px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.08)", color: "#fff", minHeight: 38 }}>
          Configuracoes
        </Btn>
      )}
      <div style={{ color: "#fff", fontSize: 12, textAlign: "right", lineHeight: 1.2 }}>
        <strong>{user.name}</strong>
        <div style={{ color: "rgba(255,255,255,0.72)" }}>{ROLES[user.role]?.label}</div>
      </div>
      <Btn v="ghost" sz="sm" onClick={onLogout} style={{ border: "1px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.08)", color: "#fff", minHeight: 38 }}>
        Sair
      </Btn>
    </div>
  );

  if (isSheet) {
    return (
      <div className="auth-panel auth-panel--sheet" style={{ display: "grid", gap: 12, width: "100%" }}>
        <div>
          <strong style={{ display: "block", color: "var(--text)", fontSize: 14, marginBottom: 2 }}>Informe seus dados</strong>
          <span style={{ color: "var(--text-secondary)", fontSize: 12, lineHeight: 1.4 }}>Use seu usuário e senha para continuar e liberar as opções do cabeçalho.</span>
        </div>
        <input
          className="auth-panel__input"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Usuário"
          style={{ width: "100%" }}
        />
        <input
          className="auth-panel__input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Senha"
          type="password"
          style={{ width: "100%" }}
          onKeyDown={e => { if (e.key === "Enter") submit(); }}
        />
        <Btn onClick={submit} loading={saving} style={{ background: "var(--primary)", color: "#fff", minHeight: 42, boxShadow: "var(--shadow-sm)", width: "100%" }}>Entrar</Btn>
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
        style={{ border: "1px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.08)", color: "#fff", padding: "8px 10px", minHeight: 38 }}
      >
        <ThemeIcon theme={theme} />
      </Btn>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Usuário" style={{ width: 140 }} />
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" type="password" style={{ width: 128 }} onKeyDown={e => { if (e.key === "Enter") submit(); }} />
      <Btn onClick={submit} loading={saving} style={{ background: "#fff", color: "var(--primary)", minHeight: 38, boxShadow: "var(--shadow-sm)" }}>Entrar</Btn>
      {feedback && <FeedbackBanner fixed tone={feedback.tone} title={feedback.title} message={feedback.message} />}
    </div>
  );
};
