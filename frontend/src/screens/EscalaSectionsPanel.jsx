/**
 * @file frontend/src/screens/EscalaSectionsPanel.jsx
 * @summary Lista visual de secoes e vagas da escala de resultados.
 */

import React from "react";
import { COLORS, Btn, Icon } from "../components/ui";

export const EscalaSectionsPanel = ({
  busyAction,
  canEdit,
  onAddSlot,
  onOpenSignup,
  onRemoveSlot,
  onUpdateSlot,
  people,
  sections,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    {sections.map((section, sectionIndex) => (
      <div key={sectionIndex} style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${COLORS.borderLight}` }}>
        <div style={{ background: section.color, padding: "10px 16px" }}><h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#333" }}>{section.title}</h3></div>
        <div style={{ background: COLORS.surface }}>
          {section.slots.map((slot, slotIndex) => (
            <div key={slotIndex} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", borderBottom: slotIndex < section.slots.length - 1 ? `1px solid ${COLORS.borderLight}` : "none", cursor: canEdit && !slot.person ? "pointer" : "default", transition: "background 0.15s" }} onClick={() => onOpenSignup(sectionIndex, slotIndex)}>
              {canEdit ? (
                <select value={slot.role} onClick={event => event.stopPropagation()} onChange={event => onUpdateSlot(sectionIndex, slotIndex, { role: event.target.value })} style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, width: 110, flexShrink: 0, border: `1px solid ${COLORS.borderLight}`, borderRadius: 6, padding: "5px 6px", background: COLORS.surface }}>
                  <option>Responsavel</option>
                  <option>Auxiliar</option>
                </select>
              ) : (
                <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, width: 110, flexShrink: 0 }}>{slot.role}</span>
              )}
              {slot.person ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.primary }}><Icon name="user" size={12} /></div>
                    {canEdit ? (
                      <select value={slot.person} onClick={event => event.stopPropagation()} onChange={event => onUpdateSlot(sectionIndex, slotIndex, { person: event.target.value })} style={{ border: `1px solid ${COLORS.borderLight}`, borderRadius: 6, padding: "6px 8px", fontSize: 13, fontWeight: 500, minWidth: 260, background: COLORS.surface }}>
                        <option value="">Pendente</option>
                        {people.map(person => <option key={person.name} value={person.name}>{person.name}</option>)}
                      </select>
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{slot.person}</span>
                    )}
                  </div>
                  {canEdit && <button aria-label={`Remover vaga ${section.title} ${slot.role}`} disabled={busyAction === "remove"} onClick={event => { event.stopPropagation(); onRemoveSlot(sectionIndex, slotIndex); }} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: busyAction === "remove" ? "not-allowed" : "pointer", padding: 4, opacity: busyAction === "remove" ? 0.3 : 0.5 }}><Icon name="close" size={12} /></button>}
                </div>
              ) : (
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px dashed ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.textMuted }}><Icon name={canEdit ? "plus" : "user"} size={10} /></div>
                  <span style={{ fontSize: 12, color: COLORS.textMuted, fontStyle: "italic" }}>{canEdit ? "Pendente - selecione um nome" : "Pendente"}</span>
                  {canEdit && (
                    <select value={slot.person} onClick={event => event.stopPropagation()} onChange={event => onUpdateSlot(sectionIndex, slotIndex, { person: event.target.value })} style={{ border: `1px solid ${COLORS.borderLight}`, borderRadius: 6, padding: "6px 8px", fontSize: 13, minWidth: 260, background: COLORS.surface }}>
                      <option value="">Pendente</option>
                      {people.map(person => <option key={person.name} value={person.name}>{person.name}</option>)}
                    </select>
                  )}
                </div>
              )}
            </div>
          ))}
          {canEdit && (
            <div style={{ padding: "8px 16px", background: COLORS.surfaceAlt }}>
              <Btn v="secondary" icon="plus" sz="sm" onClick={() => onAddSlot(sectionIndex)} loading={busyAction === "add"}>Adicionar vaga nesta secao</Btn>
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);
