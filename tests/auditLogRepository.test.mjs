import test from "node:test";
import assert from "node:assert/strict";
import { buildTestDatabaseEnv, createTestDatabase, dropTestDatabase } from "./helpers/postgresTestDb.mjs";

const testDbName = await createTestDatabase();
Object.assign(process.env, buildTestDatabaseEnv(testDbName));

const { database } = await import("../backend/database/index.mjs");
const { listAuditLogRecords } = await import("../backend/repositories/auditLogRepository.mjs");

test.after(async () => {
  await database.close?.();
  await dropTestDatabase(testDbName);
});

test("listAuditLogRecords mapeia rows recebidas do banco", async () => {
  const originalQueryOne = database.queryOne;
  const originalQueryMany = database.queryMany;

  database.queryOne = async () => ({ count: 1 });
  database.queryMany = async () => ([
    {
      id: 7,
      created_at: "2026-05-08T12:00:00.000Z",
      level: "info",
      category: "admin",
      action: "audit_test",
      status: "success",
      screen: "configuracoes",
      actor_id: 1,
      actor_name: "Admin",
      actor_role: "admin",
      entity_type: "user",
      entity_id: "1",
      entity_label: "Usuario",
      message: "ok",
      metadata_json: "{\"foo\":\"bar\"}",
      request_id: "req-1",
      ip_address: "127.0.0.1",
      user_agent: "test-agent",
    },
  ]);

  try {
    const result = await listAuditLogRecords({ limit: 10, offset: 0 });
    assert.equal(result.total, 1);
    assert.equal(result.items.length, 1);
    assert.deepEqual(result.items[0], {
      id: 7,
      createdAt: "2026-05-08T12:00:00.000Z",
      level: "info",
      category: "admin",
      action: "audit_test",
      status: "success",
      screen: "configuracoes",
      actorId: 1,
      actorName: "Admin",
      actorRole: "admin",
      entityType: "user",
      entityId: "1",
      entityLabel: "Usuario",
      message: "ok",
      metadata: { foo: "bar" },
      requestId: "req-1",
      ipAddress: "127.0.0.1",
      userAgent: "test-agent",
    });
  } finally {
    database.queryOne = originalQueryOne;
    database.queryMany = originalQueryMany;
  }
});
