/**
 * @file frontend/src/features/bi/MemberProfilePanel.jsx
 * @summary Painel (modal) de perfil de um sócio.
 * @responsibility Mostrar assiduidade, histórico de presença, recorrência de
 * escala e os formulários respondidos — com link para os resultados de cada um.
 */

import React, { useEffect, useState } from "react";
import { COLORS, Icon, Btn } from "../../components/ui";
import { fetchMemberDetail } from "../../lib/api";
import { grauColor } from "./BiPanels";
import { formatPercent, formatDuration, formatDate } from "./biDomain";

const initials = name => String(name || "").trim().split(/\s+/).filter(Boolean).map(p => p[0]).filter((_, i, a) => i === 0 || i === a.length - 1).join("").toUpperCase() || "?";

const avgTimeToFill = (presenca = []) => {
  const values = presenca
    .filter(item => item.expected !== false)
    .map(item => item.timeToFillMinutes)
    .filter(value => value !== null && value !== undefined);
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
};

export const MemberProfilePanel = ({ personKey, forms = [], onNavigate, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!personKey) return undefined;
    let active = true;
    setLoading(true);
    setDetail(null);
    setError(null);
    (async () => {
      try {
        const payload = await fetchMemberDetail(personKey);
        if (active) setDetail(payload);
      } catch {
        if (active) setError("Não foi possível carregar o perfil.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [personKey]);

  if (!personKey) return null;

  const formsById = new Map(forms.map(form => [form.id, form]));
  const openResults = formId => {
    const form = formsById.get(formId);
    if (form && onNavigate) { onClose?.(); onNavigate("results", form); }
  };

  const tone = grauColor(detail?.grau);
  const summary = detail?.summary;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card bi-profile" style={{ width: "min(560px, 100%)" }} onClick={event => event.stopPropagation()}>
        <div className="bi-profile-head">
          <span className="bi-avatar bi-avatar--lg" style={{ background: `${tone}22`, color: tone }}>
            {initials(detail?.personName || personKey)}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 className="bi-profile-name">{detail?.personName || "—"}</h3>
            {detail?.grau && (
              <span className="bi-grau-tag" style={{ color: tone }}>
                <span className="bi-grau-dot" style={{ background: tone }} />{detail.grau}
              </span>
            )}
          </div>
          <button type="button" className="bi-icon-btn" aria-label="Fechar" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>

        {loading ? (
          <div className="bi-empty">Carregando perfil…</div>
        ) : error ? (
          <div className="bi-empty" style={{ color: COLORS.danger }}>{error}</div>
        ) : (
          <>
            <div className="bi-profile-stats">
              <div className="bi-profile-stat">
                <div className="bi-profile-stat-value">{formatPercent(summary.rate)}</div>
                <div className="bi-profile-stat-label">Preenchimento</div>
                <div className="bi-profile-stat-hint">
                  {summary.filled}/{summary.expected} esperados{summary.exempted ? ` · ${summary.exempted} dispensado${summary.exempted !== 1 ? "s" : ""}` : ""}
                </div>
              </div>
              <div className="bi-profile-stat">
                <div className="bi-profile-stat-value">{summary.escalaTotal}</div>
                <div className="bi-profile-stat-label">Vagas de escala</div>
                <div className="bi-profile-stat-hint">assumidas</div>
              </div>
              <div className="bi-profile-stat">
                <div className="bi-profile-stat-value">{formatDuration(avgTimeToFill(detail.presenca))}</div>
                <div className="bi-profile-stat-label">Tempo de resposta</div>
                <div className="bi-profile-stat-hint">última: {summary.lastFilledAt ? formatDate(summary.lastFilledAt) : "—"}</div>
              </div>
            </div>

            {detail.escala.length > 0 && (
              <div className="bi-profile-section">
                <div className="bi-profile-section-title">Escala — seções que costuma fazer</div>
                <div className="bi-profile-chips">
                  {detail.escala.map(item => (
                    <span key={item.title} className="bi-profile-chip">{item.title} <strong>×{item.count}</strong></span>
                  ))}
                </div>
              </div>
            )}

            <div className="bi-profile-section">
              <div className="bi-profile-section-title">Presença por evento</div>
              {detail.presenca.length === 0 ? (
                <div className="bi-empty">Sem eventos encerrados ainda.</div>
              ) : (
                <ul className="bi-profile-list">
                  {detail.presenca.map(item => (
                    <li key={`${item.eventId}-${item.formId}`} className="bi-profile-row">
                      <span className={`bi-profile-badge ${item.expected === false ? "" : item.filled ? "is-yes" : "is-no"}`}>
                        <Icon name={item.expected === false ? "info" : item.filled ? "check" : "close"} size={13} />
                      </span>
                      <span className="bi-profile-row-info">
                        <span className="bi-profile-row-title">{item.eventTitle || item.formTitle || `Form ${item.formId}`}</span>
                        <span className="bi-profile-row-meta">
                          {formatDate(item.date)}
                          {item.expected === false ? ` · ${item.exemptionReason || "Dispensado no periodo"}` : ""}
                          {item.expected !== false && item.filled && item.timeToFillMinutes != null ? ` · respondeu em ${formatDuration(item.timeToFillMinutes)}` : ""}
                        </span>
                      </span>
                      {formsById.has(item.formId) && (
                        <Btn v="secondary" sz="sm" icon="eye" onClick={() => openResults(item.formId)}>Ver resultados</Btn>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
