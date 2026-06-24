/**
 * @file frontend/src/features/teams/components/TeamPeriodListPanel.jsx
 * @summary Lista visual dos periodos de equipes.
 */

import React from "react";
import { Btn, COLORS, Icon } from "../../../components/ui";
import { findPersonName, formatTeamDate } from "../../../screens/teamsDomain";

export const TeamPeriodListPanel = ({
  periods = [],
  people = [],
  selectedPeriodId,
  canManage,
  onSelect,
  onEdit,
  onDelete,
  onStartNew,
}) => (
  <section style={{ display: "grid", gap: 12 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, color: COLORS.text }}>Periodos cadastrados</h2>
        <p style={{ margin: "4px 0 0", color: COLORS.textMuted, fontSize: 13 }}>Controle as equipes vigentes por intervalo.</p>
      </div>
      {canManage && <Btn icon="plus" onClick={onStartNew}>Novo periodo</Btn>}
    </div>
    {periods.length === 0 ? (
      <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: 8, padding: 18, color: COLORS.textMuted }}>
        Nenhum periodo de equipes cadastrado.
      </div>
    ) : (
      <div style={{ display: "grid", gap: 10 }}>
        {periods.map(period => {
          const active = String(period.id) === String(selectedPeriodId);
          return (
            <article
              key={period.id}
              style={{
                border: `1px solid ${active ? COLORS.primary : COLORS.borderLight}`,
                borderRadius: 8,
                background: active ? COLORS.primaryLight : COLORS.surface,
                padding: 14,
                display: "grid",
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={() => onSelect(period.id)}
                style={{ border: "none", background: "transparent", padding: 0, textAlign: "left", cursor: "pointer", color: COLORS.text }}
              >
                <strong style={{ display: "block", fontSize: 15 }}>{period.title || "Periodo de equipes"}</strong>
                <span style={{ display: "block", color: COLORS.textMuted, fontSize: 12, marginTop: 3 }}>
                  {formatTeamDate(period.startDate)} ate {formatTeamDate(period.endDate)}
                </span>
                <span style={{ display: "block", color: COLORS.textSecondary, fontSize: 12, marginTop: 6 }}>
                  Mestre Assistente: {findPersonName(people, period.assistantMasterPersonId)}
                </span>
                <span style={{ display: "block", color: COLORS.textSecondary, fontSize: 12, marginTop: 3 }}>
                  Auxiliar do Mestre: {findPersonName(people, period.directAssistantPersonId)}
                </span>
                <span style={{ display: "block", color: COLORS.textSecondary, fontSize: 12, marginTop: 3 }}>
                  Organ: {findPersonName(people, period.organPersonId)}
                </span>
                {period.organDirectAssistantPersonId && (
                  <span style={{ display: "block", color: COLORS.textSecondary, fontSize: 12, marginTop: 3 }}>
                    Auxiliar da Organ: {findPersonName(people, period.organDirectAssistantPersonId)}
                  </span>
                )}
              </button>
              {canManage && (
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                  <button type="button" onClick={() => onEdit(period)} aria-label="Editar periodo" style={{ border: `1px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.surface, color: COLORS.text, padding: "7px 9px", cursor: "pointer" }}>
                    <Icon name="edit" size={15} />
                  </button>
                  <button type="button" onClick={() => onDelete(period)} aria-label="Excluir periodo" style={{ border: `1px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.surface, color: COLORS.danger, padding: "7px 9px", cursor: "pointer" }}>
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    )}
  </section>
);
