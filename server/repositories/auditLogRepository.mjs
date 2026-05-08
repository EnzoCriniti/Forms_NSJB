/**
 * @file server/repositories/auditLogRepository.mjs
 * @summary Acesso a dados de auditoria administrativa.
 * @responsibility Persistir e consultar eventos de auditoria no SQLite principal.
 */

import { db, nowIso, parseJson, stringifyJson } from "../db.mjs";

const mapAuditLogRow = row => ({
  id: row.id,
  createdAt: row.created_at,
  level: row.level,
  category: row.category,
  action: row.action,
  status: row.status,
  screen: row.screen,
  actorId: row.actor_id,
  actorName: row.actor_name,
  actorRole: row.actor_role,
  entityType: row.entity_type,
  entityId: row.entity_id,
  entityLabel: row.entity_label,
  message: row.message,
  metadata: parseJson(row.metadata_json, {}),
  requestId: row.request_id,
  ipAddress: row.ip_address,
  userAgent: row.user_agent,
});

const normalizeQueryValue = value => String(value || "").trim();

const buildFilters = filters => {
  const where = [];
  const params = [];

  const addEquals = (column, value) => {
    const normalized = normalizeQueryValue(value);
    if (!normalized) return;
    where.push(`${column} = ?`);
    params.push(normalized);
  };

  const addLike = (column, value) => {
    const normalized = normalizeQueryValue(value);
    if (!normalized) return;
    where.push(`lower(${column}) LIKE ?`);
    params.push(`%${normalized.toLowerCase()}%`);
  };

  if (filters.from) {
    where.push("created_at >= ?");
    params.push(filters.from);
  }

  if (filters.to) {
    where.push("created_at <= ?");
    params.push(filters.to);
  }

  addEquals("level", filters.level);
  addEquals("category", filters.category);
  addEquals("action", filters.action);
  addEquals("status", filters.status);
  addEquals("screen", filters.screen);
  addLike("actor_name", filters.actor);
  addEquals("entity_type", filters.entityType);
  addEquals("entity_id", filters.entityId);

  const search = normalizeQueryValue(filters.search);
  if (search) {
    where.push(`(
      lower(COALESCE(message, '')) LIKE ?
      OR lower(COALESCE(actor_name, '')) LIKE ?
      OR lower(COALESCE(entity_label, '')) LIKE ?
      OR lower(COALESCE(entity_type, '')) LIKE ?
      OR lower(COALESCE(action, '')) LIKE ?
      OR lower(COALESCE(category, '')) LIKE ?
      OR lower(COALESCE(screen, '')) LIKE ?
    )`);
    const like = `%${search.toLowerCase()}%`;
    params.push(like, like, like, like, like, like, like);
  }

  return { where, params };
};

export const insertAuditLogRecord = record => {
  db.prepare(`
    INSERT INTO audit_logs (
      created_at, level, category, action, status, screen, actor_id, actor_name, actor_role,
      entity_type, entity_id, entity_label, message, metadata_json, request_id, ip_address, user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    record.createdAt || nowIso(),
    record.level,
    record.category,
    record.action,
    record.status,
    record.screen || null,
    record.actorId ?? null,
    record.actorName || null,
    record.actorRole || null,
    record.entityType || null,
    record.entityId == null ? null : String(record.entityId),
    record.entityLabel || null,
    record.message || null,
    stringifyJson(record.metadata ?? {}),
    record.requestId || null,
    record.ipAddress || null,
    record.userAgent || null,
  );
};

export const listAuditLogRecords = (filters = {}) => {
  const limit = Math.max(1, Math.min(200, Number(filters.limit) || 50));
  const offset = Math.max(0, Number(filters.offset) || 0);
  const { where, params } = buildFilters(filters);
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const total = db.prepare(`
    SELECT COUNT(*) AS count
    FROM audit_logs
    ${whereClause}
  `).get(...params)?.count || 0;

  const items = db.prepare(`
    SELECT
      id, created_at, level, category, action, status, screen,
      actor_id, actor_name, actor_role, entity_type, entity_id, entity_label,
      message, metadata_json, request_id, ip_address, user_agent
    FROM audit_logs
    ${whereClause}
    ORDER BY created_at DESC, id DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset).map(mapAuditLogRow);

  return {
    items,
    total: Number(total || 0),
    limit,
    offset,
  };
};
