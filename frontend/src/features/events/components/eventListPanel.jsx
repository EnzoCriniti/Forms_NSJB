import React from "react";
import { COLORS, Btn, Icon, StatusBadge } from "../../../components/ui";
import { formatDate, formatDateTime } from "../../../lib/forms";
import { EventPaginationControls } from "./eventPaginationControls";

const MONTHS_PT = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

const parseEventDate = value => {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const STATUS_TILE = {
  rascunho: { bg: COLORS.warningLight, fg: COLORS.warning },
  pronto: { bg: COLORS.primaryLight, fg: COLORS.primary },
  publicado: { bg: COLORS.primaryLight, fg: COLORS.accent },
  encerrado: { bg: COLORS.surfaceAlt, fg: COLORS.textSecondary },
  arquivado: { bg: COLORS.surfaceAlt, fg: COLORS.textSecondary },
};

export const EventCard = ({ event, isPinned, canManageEvents, onOpen, onEdit, onDelete, onTogglePinned }) => {
  const tile = STATUS_TILE[event.status] || { bg: COLORS.primaryLight, fg: COLORS.primary };
  const eventDate = parseEventDate(event.date);
  const formattedDate = eventDate ? formatDate(event.date) : "";
  const titleDateSuffix = formattedDate ? ` - ${formattedDate}` : "";
  const displayTitle = titleDateSuffix && !String(event.title).endsWith(titleDateSuffix)
    ? `${event.title}${titleDateSuffix}`
    : event.title;
  return (
    <div
      className="form-card form-card--interactive elevated"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(event)}
      onKeyDown={keyboardEvent => {
        if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
          keyboardEvent.preventDefault();
          onOpen(event);
        }
      }}
      style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", gap: 12, cursor: "pointer", transition: "transform .15s, box-shadow .15s", touchAction: "manipulation" }}
      onMouseEnter={eventMouseEnter => { eventMouseEnter.currentTarget.style.borderColor = COLORS.primary; }}
      onMouseLeave={eventMouseLeave => { eventMouseLeave.currentTarget.style.borderColor = COLORS.border; }}
    >
      <>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          {eventDate ? (
            <div style={{ width: 50, height: 50, borderRadius: 12, background: tile.bg, color: tile.fg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, lineHeight: 1 }}>
              <div style={{ fontSize: 19, fontWeight: 800 }}>{String(eventDate.getDate()).padStart(2, "0")}</div>
              <div style={{ fontSize: 9.5, letterSpacing: "0.05em", marginTop: 1 }}>{MONTHS_PT[eventDate.getMonth()]}</div>
            </div>
          ) : (
            <div style={{ width: 50, height: 50, borderRadius: 12, background: tile.bg, display: "flex", alignItems: "center", justifyContent: "center", color: tile.fg, flexShrink: 0 }}>
              <Icon name="calendar" size={20} />
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <strong style={{ fontSize: 15, display: "block", lineHeight: 1.3 }}>{displayTitle}</strong>
          </div>
          {isPinned && (
            <span title="Evento fixado" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 8, background: COLORS.warningLight, color: "var(--secondary-strong)", flexShrink: 0 }}>
              <Icon name="pin" size={12} />
            </span>
          )}
        </div>
        {(event.opening || event.closing) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 12, color: COLORS.textMuted }}>
            {event.opening && <span>Abertura: {formatDateTime(event.opening)}</span>}
            {event.closing && <span>Fechamento: {formatDateTime(event.closing)}</span>}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: "auto" }}>
          <StatusBadge status={event.status} uppercase />
          <span className="ui-badge" style={{ background: "var(--track)", color: COLORS.textSecondary, fontWeight: 600, padding: "4px 11px" }}>{event.formIds?.length || 0} {(event.formIds?.length || 0) === 1 ? "formulário" : "formulários"}</span>
        </div>
        {canManageEvents && (
          <div style={{ display: "flex", gap: 6, paddingTop: 12, borderTop: `1px solid ${COLORS.borderLight}` }} onClick={eventClick => eventClick.stopPropagation()}>
            <Btn v={isPinned ? "warning" : "ghost"} icon="pin" iconSize={17} sz="sm" style={{ flex: 1, height: 42, minHeight: 42, padding: 0, justifyContent: "center", borderRadius: 10, background: isPinned ? COLORS.warningLight : COLORS.surfaceAlt, border: `1px solid ${isPinned ? "var(--secondary)" : COLORS.border}`, color: isPinned ? "var(--secondary-strong)" : COLORS.textSecondary }} title={isPinned ? "Desfixar evento" : "Fixar evento"} aria-label={isPinned ? "Desfixar evento" : "Fixar evento"} onClick={() => onTogglePinned?.(event.id)} />
            <Btn v="ghost" icon="edit" iconSize={17} sz="sm" style={{ flex: 1, height: 42, minHeight: 42, padding: 0, justifyContent: "center", borderRadius: 10, background: COLORS.primaryLight, border: `1px solid ${COLORS.border}`, color: COLORS.primary }} title="Editar evento" aria-label="Editar evento" onClick={() => onEdit(event)} />
            <Btn v="danger" icon="trash" iconSize={17} sz="sm" style={{ flex: 1, height: 42, minHeight: 42, padding: 0, justifyContent: "center", borderRadius: 10, background: COLORS.dangerLight, border: "1px solid var(--feedback-error-border)", color: COLORS.danger }} title="Excluir evento" aria-label="Excluir evento" onClick={() => onDelete(event)} />
          </div>
        )}
      </>
    </div>
  );
};

export const EventListPanel = ({
  events,
  pagination,
  totalItems = events.length,
  searchValue = "",
  searchLoading = false,
  statusFilter = "",
  sortBy = "date",
  sortDir = "desc",
  pinnedEventSet,
  canManageEvents,
  onChangeSearch,
  onChangeStatus,
  onChangeSortBy,
  onChangeSortDir,
  onClearSearch,
  onOpen,
  onEdit,
  onDelete,
  onSubmitSearch,
  onTogglePinned,
  onPreviousPage,
  onNextPage,
}) => (
  <div style={{ display: "grid", gap: 18 }}>
    <form className="events-search-bar" onSubmit={onSubmitSearch}>
      <div className="events-search-bar__top">
        <div className="events-search-field">
          <Icon name="search" size={16} />
          <input
            id="event-search-input"
            aria-label="Pesquisar eventos"
            value={searchValue}
            onChange={event => onChangeSearch?.(event.target.value)}
            placeholder="Buscar por nome, data ou descrição"
          />
          {searchValue && (
            <button type="button" className="events-search-field__clear" aria-label="Limpar texto da busca" onClick={() => onChangeSearch?.("")}>
              <Icon name="close" size={14} />
            </button>
          )}
        </div>
        <Btn type="submit" icon="search" disabled={searchLoading}>{searchLoading ? "Buscando..." : "Pesquisar"}</Btn>
      </div>

      <div className="events-search-bar__filters">
        <select className="events-filter__select" aria-label="Filtrar status" value={statusFilter} onChange={event => onChangeStatus?.(event.target.value)}>
          <option value="">Todos os status</option>
          <option value="rascunho">Rascunho</option>
          <option value="pronto">Pronto</option>
          <option value="publicado">Publicado</option>
          <option value="encerrado">Encerrado</option>
        </select>
        <select className="events-filter__select" aria-label="Ordenar eventos" value={sortBy} onChange={event => onChangeSortBy?.(event.target.value)}>
          <option value="date">Ordenar: data</option>
          <option value="title">Ordenar: nome</option>
          <option value="status">Ordenar: status</option>
          <option value="createdAt">Ordenar: criação</option>
          <option value="updatedAt">Ordenar: atualização</option>
        </select>
        <select className="events-filter__select" aria-label="Direção da ordenação" value={sortDir} onChange={event => onChangeSortDir?.(event.target.value)}>
          <option value="desc">↓ Decrescente</option>
          <option value="asc">↑ Crescente</option>
        </select>
        <Btn type="button" v="ghost" icon="close" onClick={onClearSearch} disabled={searchLoading || (!searchValue && !statusFilter && sortBy === "date" && sortDir === "desc")}>Limpar</Btn>
      </div>
    </form>
    {events.length === 0 ? (
      <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: 12, padding: 18, color: COLORS.textSecondary, fontSize: 13 }}>
        {searchValue ? "Nenhum evento encontrado para a pesquisa." : "Nenhum evento criado."}
      </div>
    ) : (
      <div className="events-card-grid" style={{ display: "grid", gap: 16 }}>
        {pagination.pageItems.map(event => (
          <EventCard
            key={event.id}
            event={event}
            isPinned={pinnedEventSet.has(event.id)}
            canManageEvents={canManageEvents}
            onOpen={onOpen}
            onEdit={onEdit}
            onDelete={onDelete}
            onTogglePinned={onTogglePinned}
          />
        ))}
      </div>
    )}
    <EventPaginationControls
      pagination={pagination}
      totalItems={totalItems}
      onPrevious={onPreviousPage}
      onNext={onNextPage}
    />
  </div>
);
