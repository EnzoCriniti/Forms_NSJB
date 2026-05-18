/**
 * @file frontend/src/screens/resultsPanels.jsx
 * @summary Paineis reutilizaveis da tela de resultados.
 * @responsibility Concentrar a renderizacao visual da planilha de presenca.
 */

import React from "react";
import { COLORS, Btn, FeedbackBanner, ConfirmModal, Icon, MetricCard } from "../components/ui";
import { ResultsPresenceHeader } from "../components/ResultsPresenceHeader";

const ColumnHeader = ({ label, sortIndicator }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
    <span>{label}</span>
    {sortIndicator}
  </div>
);

export const PresenceResultsPanel = ({
  publicFormHref,
  readingControls,
  linkedPeople,
  grauOptions,
  selectedGrau,
  onSelectGrau,
  stats,
  feedback,
  totalsLayout,
  filteredResponses,
  tableRows,
  sorted,
  showLinkedRows,
  columns,
  resultsConfig,
  tableMinWidth,
  tableZoom,
  onZoomChange,
  onResetZoom,
  onExportCsv,
  filterButtons,
  activeSearchCol,
  onToggleSearchCol,
  activeFilter,
  activeFilterLabel,
  activeFilterOptions,
  columnSearches,
  onChangeColumnSearch,
  onClearFilters,
  onClearColumnSearch,
  handleTableTouchStart,
  handleTableTouchMove,
  handleTableTouchEnd,
  headerCellStyle,
  sortIndicator,
  onSort,
  formatFieldValue,
  getFieldValue,
  NO_VALUES,
}) => (
  <div>
    <ResultsPresenceHeader
      publicActionHref={publicFormHref}
      readingControls={readingControls}
      grauOptions={linkedPeople ? grauOptions : []}
      selectedGrau={selectedGrau}
      onSelectGrau={onSelectGrau}
      stats={stats}
    />
    {feedback && <div style={{ marginBottom: 12 }}><FeedbackBanner tone={feedback.tone} message={feedback.message} fixed /></div>}
    <div className="totals-panel" style={{ background: COLORS.surface, borderRadius: 10, padding: 16, marginBottom: 12, border: `1px solid ${COLORS.borderLight}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.text }}>Totalizacao</div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{totalsLayout.length} indicador{totalsLayout.length !== 1 ? "es" : ""} configurado{totalsLayout.length !== 1 ? "s" : ""}</div>
        </div>
        <div style={{ fontSize: 11, color: COLORS.textMuted }}>{filteredResponses.length} resposta{filteredResponses.length !== 1 ? "s" : ""}</div>
      </div>
      <div className="totals-grid">
        {totalsLayout.map(item => {
          const col = item.field;
          if (!col) return null;
          if (item.summary?.sim !== undefined) {
            const { sim, nao } = item.summary;
            return (
              <div key={col.id} className="total-card total-card-bar" style={{ padding: 18, minHeight: 104 }}>
                <div className="total-card-title" style={{ fontSize: 13, marginBottom: 12 }}>{col.label}</div>
                <div className="total-split" style={{ gap: 18, justifyContent: "space-between" }}>
                  <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <strong style={{ fontSize: 24, lineHeight: 1, color: COLORS.accent }}>{sim}</strong>
                    <span style={{ fontSize: 12, color: COLORS.textMuted }}>Sim</span>
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "right" }}>
                    <strong style={{ fontSize: 24, lineHeight: 1, color: COLORS.danger }}>{nao}</strong>
                    <span style={{ fontSize: 12, color: COLORS.textMuted }}>Nao</span>
                  </span>
                </div>
              </div>
            );
          }
          if (item.summary?.sum !== undefined) {
            return (
              <div key={col.id} className="total-card total-card-number" style={{ padding: 18, minHeight: 104 }}>
                <div className="total-card-title" style={{ fontSize: 13, marginBottom: 12 }}>{col.label}</div>
                <div className="total-number" style={{ fontSize: 28, lineHeight: 1.1 }}>{item.summary.sum}</div>
                <div className="total-caption" style={{ marginTop: 8 }}>total informado</div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>

    {resultsConfig.searchEnabled && (
      <div
        className="results-filter-toolbar"
        style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.borderLight}`,
          borderRadius: 12,
          padding: 14,
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 10 }}>Filtros da planilha</div>
        <div className="results-filter-toolbar-row" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {filterButtons.map(item => (
            <Btn
              key={item.id}
              v={activeSearchCol === item.id ? "primary" : "secondary"}
              sz="sm"
              onClick={() => onToggleSearchCol(item.id)}
            >
              {item.label}
            </Btn>
          ))}
          {Object.values(columnSearches).some(value => String(value || "").trim()) && (
            <Btn
              v="ghost"
              sz="sm"
              onClick={onClearFilters}
            >
              Limpar filtros
            </Btn>
          )}
        </div>
        {activeSearchCol && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
            {activeFilter?.type === "select"
              ? (
                <select
                  value={columnSearches[activeSearchCol] || ""}
                  onChange={event => onChangeColumnSearch(activeSearchCol, event.target.value)}
                  style={{
                    flex: "1 1 240px",
                    minWidth: 0,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: `1px solid ${COLORS.border}`,
                    background: COLORS.surfaceAlt,
                    color: COLORS.text,
                    fontFamily: "inherit",
                  }}
                >
                  <option value="">Todos os valores de {activeFilterLabel.toLowerCase()}</option>
                  {activeFilterOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              )
              : (
                <input
                  value={columnSearches[activeSearchCol] || ""}
                  onChange={event => onChangeColumnSearch(activeSearchCol, event.target.value)}
                  placeholder={`Filtrar ${activeFilterLabel.toLowerCase()}...`}
                  style={{
                    flex: "1 1 240px",
                    minWidth: 0,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: `1px solid ${COLORS.border}`,
                    background: COLORS.surfaceAlt,
                    color: COLORS.text,
                    fontFamily: "inherit",
                  }}
                />
              )}
            <Btn
              v="secondary"
              sz="sm"
              onClick={() => onClearColumnSearch(activeSearchCol)}
            >
              Limpar
            </Btn>
          </div>
        )}
      </div>
    )}

    <div className="results-sheet-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
      <div className="results-zoom-controls" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <Btn v="secondary" sz="sm" onClick={() => onZoomChange(-1)} disabled={tableZoom <= 0.4} aria-label="Diminuir zoom da planilha">A-</Btn>
        <Btn v="secondary" sz="sm" onClick={() => onZoomChange(1)} disabled={tableZoom >= 2.5} aria-label="Aumentar zoom da planilha">A+</Btn>
        <Btn v="ghost" sz="sm" onClick={onResetZoom} disabled={tableZoom === 1}>100%</Btn>
      </div>
      <Btn v="secondary" sz="sm" icon="download" onClick={onExportCsv}>Exportar</Btn>
    </div>

    <div
      className="results-table-shell"
      onTouchStart={handleTableTouchStart}
      onTouchMove={handleTableTouchMove}
      onTouchEnd={handleTableTouchEnd}
      onTouchCancel={handleTableTouchEnd}
      style={{ width: "100%", maxWidth: "100%", display: "block", overflow: "auto", WebkitOverflowScrolling: "touch", touchAction: "auto", overscrollBehavior: "contain", borderRadius: 10, border: `1px solid ${COLORS.borderLight}` }}
    >
      <div className="results-table-stage" style={{ width: "max-content", minWidth: `${tableMinWidth}px`, zoom: tableZoom }}>
        <table className="results-table" style={{ width: "100%", minWidth: `${tableMinWidth}px`, borderCollapse: "collapse", fontSize: 12, tableLayout: "auto", userSelect: "text", WebkitUserSelect: "text" }}>
          <thead>
            <tr>
              <th className="results-sticky-col results-sticky-grau" onClick={() => onSort("grau")} style={{ ...headerCellStyle("grau"), position: "sticky", left: 0, zIndex: 2 }}>
                <ColumnHeader label="Grau" sortIndicator={sortIndicator("grau")} />
              </th>
              <th className="results-sticky-col results-sticky-name" onClick={() => onSort("name")} style={{ ...headerCellStyle("name"), position: "sticky", left: 42, zIndex: 2 }}>
                <ColumnHeader label="Nome" sortIndicator={sortIndicator("name")} />
              </th>
              {showLinkedRows && (
                <th onClick={() => onSort("status")} style={headerCellStyle("status")}>
                  <ColumnHeader label="Status" sortIndicator={sortIndicator("status")} />
                </th>
              )}
              {columns.map(col => (
                <th key={col.id} onClick={() => onSort(col.id)} style={headerCellStyle(col.id)}>
                  <ColumnHeader label={col.label} sortIndicator={sortIndicator(col.id)} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, index) => (
              <tr key={row.key} style={{ background: index % 2 ? COLORS.surfaceAlt : COLORS.surface }}>
                <td className="results-sticky-col results-sticky-grau" style={{ padding: "8px 12px", fontWeight: 600, color: COLORS.textSecondary, position: "sticky", left: 0, background: index % 2 ? COLORS.surfaceAlt : COLORS.surface, zIndex: 1, minWidth: 90, userSelect: "text", WebkitUserSelect: "text" }}>{row.grau}</td>
                <td className="results-sticky-col results-sticky-name" style={{ padding: "8px 12px", fontWeight: 500, whiteSpace: "nowrap", position: "sticky", left: 42, background: index % 2 ? COLORS.surfaceAlt : COLORS.surface, zIndex: 1, minWidth: 160, userSelect: "text", WebkitUserSelect: "text" }}>{row.name}</td>
                {showLinkedRows && (
                  <td style={{ padding: "8px 12px", fontWeight: 700, color: row.status === "Respondido" ? COLORS.accent : row.status === "Extra" ? COLORS.warning : COLORS.danger, minWidth: 110, userSelect: "text", WebkitUserSelect: "text" }}>
                    {row.status}
                  </td>
                )}
                {columns.map(col => {
                  const value = getFieldValue(row.response, col.id);
                  const bool = value === "Sim" || NO_VALUES.includes(value);
                  return <td key={col.id} style={{ padding: "8px 12px", textAlign: "center", fontWeight: 500, color: bool ? (value === "Sim" ? COLORS.accent : COLORS.danger) : COLORS.text, minWidth: 130, whiteSpace: "nowrap", userSelect: "text", WebkitUserSelect: "text" }}>{formatFieldValue(value, col.type)}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 8, textAlign: "right" }}>
      Exibindo {sorted.length} de {tableRows.length} linhas
    </div>
  </div>
);

export const EscalaResultsPanel = ({
  canEdit,
  feedback,
  filled,
  total,
  sections,
  people,
  busyAction,
  showSignup,
  selSlot,
  signName,
  names,
  onOpenSignup,
  onCloseSignup,
  onSetSignName,
  onConfirmSignup,
  onUpdateSlot,
  onRemoveSlot,
  onConfirmRemoval,
  onAddSlot,
  onExportCsv,
  onCancelRemoval,
  pendingRemoval,
}) => (
  <div>
    <div className="results-sheet-toolbar" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
      <Btn v="secondary" icon="download" sz="sm" onClick={onExportCsv}>Exportar</Btn>
    </div>
    {feedback && <div style={{ marginBottom: 12 }}><FeedbackBanner tone={feedback.tone} message={feedback.message} fixed /></div>}
    {!canEdit && (
      <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 10, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "#795548", display: "flex", alignItems: "center", gap: 8 }}>
        <span>Voce nao tem permissao para editar esta escala. Apenas administradores podem fazer alteracoes.</span>
      </div>
    )}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
      <MetricCard value={filled} label="Preenchidas" tone={COLORS.primary} style={{ padding: "12px 16px" }} />
      <MetricCard value={total - filled} label="Pendentes" tone={COLORS.danger} style={{ padding: "12px 16px" }} />
      <MetricCard value={total} label="Total" tone={COLORS.textSecondary} style={{ padding: "12px 16px" }} />
    </div>
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
    {showSignup && selSlot && canEdit && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
        <div style={{ background: COLORS.surface, borderRadius: 16, padding: 24, width: 400, maxWidth: "90vw" }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Inscrever-se na vaga</h3>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: COLORS.textSecondary }}><strong>{sections[selSlot.sectionIndex].title}</strong> - {sections[selSlot.sectionIndex].slots[selSlot.slotIndex].role}</p>
          <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, display: "block", marginBottom: 6 }}>Selecione seu nome</label>
          <select value={signName} onChange={event => onSetSignName(event.target.value)} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: COLORS.surface, boxSizing: "border-box", marginBottom: 16 }}>
            <option value="">Selecione...</option>{names.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}><Btn v="secondary" onClick={onCloseSignup} disabled={busyAction === "signup"}>Cancelar</Btn><Btn icon="check" onClick={onConfirmSignup} disabled={!signName} loading={busyAction === "signup"}>Confirmar</Btn></div>
        </div>
      </div>
    )}
    <ConfirmModal
      open={Boolean(pendingRemoval)}
      title="Remover vaga"
      message="Tem certeza que deseja remover a pessoa desta vaga? A alteração será salva imediatamente."
      confirmLabel="Remover"
      tone="danger"
      busy={busyAction === "remove"}
      onCancel={onCancelRemoval}
      onConfirm={onConfirmRemoval}
    />
  </div>
);
