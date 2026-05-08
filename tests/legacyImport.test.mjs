import test from "node:test";
import assert from "node:assert/strict";
import { applyLegacySnapshot } from "../backend/database/legacyImport.mjs";

test("applyLegacySnapshot limpa as tabelas e grava o marcador de importacao", async () => {
  const calls = [];
  const tx = {
    async exec(sql) {
      calls.push({ kind: "exec", sql: String(sql).trim().replace(/\s+/g, " ") });
    },
    async execute(sql, params = []) {
      calls.push({ kind: "execute", sql: String(sql).trim().replace(/\s+/g, " "), params });
      return { rowCount: 1, lastInsertId: null };
    },
    async queryOne() {
      return { max_id: 1, row_count: 1 };
    },
  };

  const snapshot = {
    forms: [
      {
        id: 1,
        slug: "form-1",
        type: "presenca",
        status: "rascunho",
        title: "Formulario 1",
        session_name: "",
        description: "",
        date: "2026-05-08",
        closing: "2026-05-08T12:00:00.000Z",
        closing_text: "",
        total_expected: 0,
        labels_json: "[]",
        field_definitions_json: "[]",
        results_config_json: "{}",
        scale_sections_json: "[]",
        created_at: "2026-05-08T10:00:00.000Z",
        updated_at: "2026-05-08T10:00:00.000Z",
      },
    ],
    users: [],
    labels: [],
    presets: [],
    people: [],
    settings: [],
    fieldCatalog: [],
    scaleTaskCatalog: [],
    authSessions: [],
    responses: [],
    responseValues: [],
    escalaAssignments: [],
    auditLogs: [],
  };

  await applyLegacySnapshot(tx, snapshot);

  assert.equal(calls[0].kind, "exec");
  assert.match(calls[0].sql, /^TRUNCATE TABLE /);
  assert.ok(calls.some(call => call.kind === "execute" && call.sql.includes("INSERT INTO forms")));
  assert.ok(calls.some(call => call.kind === "execute" && call.params?.[0] === "legacy_sqlite_import_v1"));
});
