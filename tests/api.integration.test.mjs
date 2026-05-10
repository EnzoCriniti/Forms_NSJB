/**
 * @file tests/api.integration.test.mjs
 * @summary Testes de integracao da API local.
 * @responsibility Verificar bootstrap, validacao HTTP e persistencia principal com PostgreSQL isolado.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { buildTestDatabaseEnv, createTestDatabase, dropTestDatabase, openTestDatabase } from "./helpers/postgresTestDb.mjs";
import { visibleFormsFor } from "../frontend/src/lib/auth.js";

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const postJson = (baseUrl, pathname, body, method = "POST") => fetch(`${baseUrl}${pathname}`, {
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const postJsonWithHeaders = (baseUrl, pathname, body, method = "POST", headers = {}) => fetch(`${baseUrl}${pathname}`, {
  method,
  headers: { "Content-Type": "application/json", ...headers },
  body: JSON.stringify(body),
});

const authHeaders = token => ({ Authorization: `Bearer ${token}` });

const loginAsAdmin = async baseUrl => {
  const res = await postJson(baseUrl, "/api/auth/login", {
    username: "admin",
    password: "admin123",
  });
  assert.equal(res.status, 200);
  const payload = await res.json();
  assert.ok(payload.token);
  return payload.token;
};

const createViewerUser = async (baseUrl, adminToken) => {
  const username = `viewer_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const createRes = await authedJson(baseUrl, "/api/users", {
    name: "Visualizador",
    username,
    password: "viewer123",
    role: "viewer",
  }, adminToken);
  assert.equal(createRes.status, 200);
  return { username, password: "viewer123" };
};

const authedJson = (baseUrl, pathname, body, token, method = "POST") => fetch(`${baseUrl}${pathname}`, {
  method,
  headers: { "Content-Type": "application/json", ...authHeaders(token) },
  body: JSON.stringify(body),
});

const authedFetch = (baseUrl, pathname, token, options = {}) => fetch(`${baseUrl}${pathname}`, {
  ...options,
  headers: { ...(options.headers || {}), ...authHeaders(token) },
});

const startServer = async ({ dbName } = {}) => {
  const port = 8800 + Math.floor(Math.random() * 200);
  const actualDbName = dbName || await createTestDatabase();
  const ownsDb = !dbName;
  const db = openTestDatabase(actualDbName);
  const child = spawn(process.execPath, ["backend/index.mjs"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...buildTestDatabaseEnv(actualDbName),
      NSJB_API_PORT: String(port),
    },
    stdio: "ignore",
  });

  const baseUrl = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const res = await fetch(`${baseUrl}/api/health`);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {
      await wait(150);
    }
  }

  if (!ready) {
    child.kill("SIGTERM");
    throw new Error("Servidor de teste nao iniciou.");
  }

  return {
    baseUrl,
    dbName: actualDbName,
    db,
    stop: async () => {
      if (!child.killed) child.kill("SIGTERM");
      await wait(150);
    },
    cleanup: async () => {
      await (async () => {
        if (!child.killed) child.kill("SIGTERM");
        await wait(150);
      })();
      await db.close();
      if (ownsDb) {
        await dropTestDatabase(actualDbName);
      }
    },
  };
};

const readSchemaMigrations = db => db.queryMany("SELECT version, name FROM schema_migrations ORDER BY version");

const readResponseStorage = async (db, responseId = null) => {
  const responseValues = responseId
    ? await db.queryMany(`
        SELECT response_id, field_id, field_type, value_text, value_number, value_boolean, value_json
        FROM response_values
        WHERE response_id = ?
        ORDER BY response_id ASC, field_id ASC, id ASC
      `, [responseId])
    : await db.queryMany(`
        SELECT response_id, field_id, field_type, value_text, value_number, value_boolean, value_json
        FROM response_values
        ORDER BY response_id ASC, field_id ASC, id ASC
      `);
  const responses = responseId
    ? await db.queryMany("SELECT id, values_json FROM responses WHERE id = ?", [responseId])
    : await db.queryMany("SELECT id, values_json FROM responses ORDER BY id");
  return {
    responses,
    responseValues,
  };
};

const readFormDeleteKeySetting = db => db.queryOne("SELECT value_json FROM settings WHERE key = ?", ["formDeleteKey"]);

const readAuditLogs = (db, where = "", params = []) => db.queryMany(`
      SELECT id, created_at, level, category, action, status, screen, actor_id, actor_name, actor_role, entity_type, entity_id, entity_label, message, metadata_json, request_id, ip_address, user_agent
      FROM audit_logs
      ${where}
      ORDER BY id ASC
    `, params);

const readFormCounts = async (db, formId) => {
  const getCount = async query => Number((await db.queryOne(query, [formId]))?.count || 0);
  return {
    forms: await getCount("SELECT COUNT(*) AS count FROM forms WHERE id = ?"),
    responses: await getCount("SELECT COUNT(*) AS count FROM responses WHERE form_id = ?"),
    responseValues: await getCount("SELECT COUNT(*) AS count FROM response_values WHERE form_id = ?"),
    escalaAssignments: await getCount("SELECT COUNT(*) AS count FROM escala_assignments WHERE form_id = ?"),
  };
};

test("bootstrap returns seeded data and storage metadata", async () => {
  const ctx = await startServer();
  try {
    const res = await fetch(`${ctx.baseUrl}/api/bootstrap`);
    assert.equal(res.status, 200);
    const payload = await res.json();
    assert.ok(Array.isArray(payload.forms));
    assert.ok(payload.forms.length >= 1);
    assert.ok(Array.isArray(payload.events));
    assert.ok(payload.events.length >= 1);
    assert.ok(payload.events.some(event => event.formIds.length >= 1));
    assert.ok(Array.isArray(payload.users));
    assert.ok(payload.users.some(user => user.username === "viewer" && user.role === "viewer"));
    assert.equal(Object.prototype.hasOwnProperty.call(payload.users[0] || {}, "password"), false);
    assert.deepEqual(payload.responsesByForm, {});
    assert.deepEqual(payload.escalaByForm, {});
    assert.equal(payload.storage.driver, "postgres");
    assert.equal(payload.storage.location, `127.0.0.1:5432/${ctx.dbName}`);
  } finally {
    await ctx.cleanup();
  }
});

test("bootstrap applies scheduled opening and closing before serializing forms", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);
    const pad = value => String(value).padStart(2, "0");
    const now = new Date();
    const localDate = date => [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join("-");
    const localDateTime = date => `${localDate(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const draftRes = await authedJson(ctx.baseUrl, "/api/forms", {
      type: "presenca",
      status: "rascunho",
      title: "Formulario Agendado API",
      date: localDate(now),
      closing: localDateTime(tomorrow),
      labels: [],
      fieldDefinitions: [],
      resultsConfig: {},
      scaleSections: [],
    }, adminToken);
    assert.equal(draftRes.status, 200);

    const openRes = await authedJson(ctx.baseUrl, "/api/forms", {
      type: "presenca",
      status: "aberto",
      title: "Formulario Vencido API",
      date: localDate(now),
      closing: localDateTime(yesterday),
      labels: [],
      fieldDefinitions: [],
      resultsConfig: {},
      scaleSections: [],
    }, adminToken);
    assert.equal(openRes.status, 200);

    const bootstrapRes = await fetch(`${ctx.baseUrl}/api/bootstrap`);
    const bootstrap = await bootstrapRes.json();
    const scheduled = bootstrap.forms.find(form => form.title === "Formulario Agendado API");
    const expired = bootstrap.forms.find(form => form.title === "Formulario Vencido API");

    assert.equal(scheduled.status, "aberto");
    assert.equal(expired.status, "fechado");
  } finally {
    await ctx.cleanup();
  }
});

test("health endpoint returns ok", async () => {
  const ctx = await startServer();
  try {
    const res = await fetch(`${ctx.baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const payload = await res.json();
    assert.equal(payload.ok, true);
  } finally {
    await ctx.cleanup();
  }
});

test("auth endpoints log in and resolve the current user", async () => {
  const ctx = await startServer();
  try {
    const loginRes = await postJson(ctx.baseUrl, "/api/auth/login", {
      username: "admin",
      password: "admin123",
    });
    assert.equal(loginRes.status, 200);
    const loginPayload = await loginRes.json();
    assert.ok(loginPayload.token);
    assert.deepEqual(loginPayload.user, {
      id: 1,
      name: "Administrador",
      username: "admin",
      role: "admin",
    });

    const meRes = await fetch(`${ctx.baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${loginPayload.token}` },
    });
    assert.equal(meRes.status, 200);
    const mePayload = await meRes.json();
    assert.deepEqual(mePayload.user, loginPayload.user);

    const logoutRes = await postJsonWithHeaders(ctx.baseUrl, "/api/auth/logout", {}, "POST", {
      Authorization: `Bearer ${loginPayload.token}`,
    });
    assert.equal(logoutRes.status, 200);

    const afterLogoutRes = await fetch(`${ctx.baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${loginPayload.token}` },
    });
    assert.equal(afterLogoutRes.status, 401);

    const logs = await readAuditLogs(ctx.db, "WHERE action IN (?, ?)", ["auth_login", "auth_logout"]);
    assert.ok(logs.some(log => log.action === "auth_login" && log.status === "success"));
    assert.ok(logs.some(log => log.action === "auth_logout" && log.status === "success"));
    const loginLog = logs.find(log => log.action === "auth_login");
    assert.ok(loginLog);
    const loginMetadata = loginLog.metadata_json;
    assert.equal(Object.prototype.hasOwnProperty.call(loginMetadata, "password"), false);
  } finally {
    await ctx.cleanup();
  }
});

test("nova sessao revoga a anterior da mesma conta", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);
    const viewer = await createViewerUser(ctx.baseUrl, adminToken);

    const firstLoginRes = await postJson(ctx.baseUrl, "/api/auth/login", {
      username: viewer.username,
      password: viewer.password,
    });
    assert.equal(firstLoginRes.status, 200);
    const firstLogin = await firstLoginRes.json();
    assert.ok(firstLogin.token);

    const secondLoginRes = await postJson(ctx.baseUrl, "/api/auth/login", {
      username: viewer.username,
      password: viewer.password,
    });
    assert.equal(secondLoginRes.status, 200);
    const secondLogin = await secondLoginRes.json();
    assert.ok(secondLogin.token);
    assert.notEqual(secondLogin.token, firstLogin.token);

    const firstMeRes = await fetch(`${ctx.baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${firstLogin.token}` },
    });
    assert.equal(firstMeRes.status, 401);

    const secondMeRes = await fetch(`${ctx.baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${secondLogin.token}` },
    });
    assert.equal(secondMeRes.status, 200);
  } finally {
    await ctx.cleanup();
  }
});

test("nova sessao admin revoga sessoes de outros administradores", async () => {
  const ctx = await startServer();
  try {
    const firstAdminToken = await loginAsAdmin(ctx.baseUrl);
    const createAdminRes = await authedJson(ctx.baseUrl, "/api/users", {
      name: "Admin Secundario",
      username: "admin2",
      password: "admin234",
      role: "admin",
    }, firstAdminToken);
    assert.equal(createAdminRes.status, 200);

    const secondLoginRes = await postJson(ctx.baseUrl, "/api/auth/login", {
      username: "admin2",
      password: "admin234",
    });
    assert.equal(secondLoginRes.status, 409);
    const secondLogin = await secondLoginRes.json();
    assert.equal(secondLogin.code, "AUTH_ADMIN_SESSION_ACTIVE");

    const firstMeRes = await fetch(`${ctx.baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${firstAdminToken}` },
    });
    assert.equal(firstMeRes.status, 200);
  } finally {
    await ctx.cleanup();
  }
});

test("admin endpoints require admin credentials", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);
    const viewer = await createViewerUser(ctx.baseUrl, adminToken);

    const unauthRes = await postJson(ctx.baseUrl, "/api/forms", {
      type: "presenca",
      status: "aberto",
      title: "Sem Autenticacao",
      labels: [],
      fieldDefinitions: [],
      resultsConfig: {},
      scaleSections: [],
    });
    assert.equal(unauthRes.status, 401);

    const viewerRes = await postJson(ctx.baseUrl, "/api/auth/login", {
      username: viewer.username,
      password: viewer.password,
    });
    assert.equal(viewerRes.status, 200);
    const viewerPayload = await viewerRes.json();
    const viewerAuthRes = await authedJson(ctx.baseUrl, "/api/forms", {
      type: "presenca",
      status: "aberto",
      title: "Sem Permissao",
      labels: [],
      fieldDefinitions: [],
      resultsConfig: {},
      scaleSections: [],
    }, viewerPayload.token);
    assert.equal(viewerAuthRes.status, 403);
  } finally {
    await ctx.cleanup();
  }
});

test("audit logs endpoint is restricted to admin and supports filters", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);
    const viewer = await createViewerUser(ctx.baseUrl, adminToken);
    const createRes = await authedJson(ctx.baseUrl, "/api/forms", {
      type: "presenca",
      status: "aberto",
      title: "Formulario para auditoria",
      labels: [],
      fieldDefinitions: [],
      resultsConfig: {},
      scaleSections: [],
    }, adminToken);
    assert.equal(createRes.status, 200);

    const viewerLoginRes = await postJson(ctx.baseUrl, "/api/auth/login", {
      username: viewer.username,
      password: viewer.password,
    });
    assert.equal(viewerLoginRes.status, 200);
    const viewerPayload = await viewerLoginRes.json();

    const unauthLogsRes = await fetch(`${ctx.baseUrl}/api/audit-logs`);
    assert.equal(unauthLogsRes.status, 401);

    const viewerLogsRes = await authedFetch(ctx.baseUrl, "/api/audit-logs", viewerPayload.token);
    assert.equal(viewerLogsRes.status, 403);

    const adminLogsRes = await authedFetch(ctx.baseUrl, "/api/audit-logs?category=forms&action=create_form&status=success&actor=Administrador", adminToken);
    assert.equal(adminLogsRes.status, 200);
    const adminLogsPayload = await adminLogsRes.json();
    assert.ok(Array.isArray(adminLogsPayload.items));
    assert.ok(adminLogsPayload.items.length >= 1);
    assert.ok(adminLogsPayload.items.every(item => item.category === "forms"));
    assert.ok(adminLogsPayload.items.every(item => item.action === "create_form"));
    assert.ok(adminLogsPayload.items.every(item => item.status === "success"));
    assert.ok(adminLogsPayload.items.every(item => item.actorName === "Administrador"));
  } finally {
    await ctx.cleanup();
  }
});

test("postgres initializes a fresh database with the official schema", async () => {
  const ctx = await startServer();
  try {
    const schemaTable = await ctx.db.queryOne("SELECT COUNT(*) AS count FROM schema_migrations");
    assert.equal(Number(schemaTable?.count || 0), 0);

    const bootstrapRes = await fetch(`${ctx.baseUrl}/api/bootstrap`);
    const bootstrap = await bootstrapRes.json();
    assert.ok(bootstrap.forms.length >= 1);
    assert.ok(bootstrap.users.length >= 1);
  } finally {
    await ctx.cleanup();
  }
});

test("postgres reopens the same database without duplicating seed or migrations", async () => {
  const dbName = await createTestDatabase();
  try {
    const first = await startServer({ dbName });
    const firstBootstrapRes = await fetch(`${first.baseUrl}/api/bootstrap`);
    const firstBootstrap = await firstBootstrapRes.json();
    const firstMigrations = await readSchemaMigrations(first.db);
    await first.cleanup();

    const second = await startServer({ dbName });
    try {
      const secondBootstrapRes = await fetch(`${second.baseUrl}/api/bootstrap`);
      const secondBootstrap = await secondBootstrapRes.json();
      const secondMigrations = await readSchemaMigrations(second.db);

      assert.equal(secondBootstrap.forms.length, firstBootstrap.forms.length);
      assert.equal(secondBootstrap.users.length, firstBootstrap.users.length);
      assert.deepEqual(secondMigrations, firstMigrations);
    } finally {
      await second.cleanup();
    }
  } finally {
    await dropTestDatabase(dbName);
  }
});

test("forms endpoint rejects invalid payloads", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);
    const res = await authedJson(ctx.baseUrl, "/api/forms", { type: "presenca" }, adminToken);
    assert.equal(res.status, 400);
    const payload = await res.json();
    assert.match(payload.error, /Status do formulario invalido/);
  } finally {
    await ctx.cleanup();
  }
});

test("forms endpoint persists a valid draft form", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);
    const createRes = await authedJson(ctx.baseUrl, "/api/forms", {
        type: "presenca",
        status: "rascunho",
        title: "Formulario de Teste Automatizado",
        sessionName: "Sessao Teste",
        labels: [],
        totalExpected: 5,
        fieldDefinitions: [
          { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
          { id: 2, type: "text", label: "Observacao", required: false, show: true, total: false },
          { id: 3, type: "yes_no", label: "Vai?", required: true, show: true, total: true },
        ],
        resultsConfig: {
          searchEnabled: false,
          showLinkedRoster: true,
          totalsLayout: [{ fieldId: 3, style: "bar" }],
        },
        scaleSections: [],
      }, adminToken);
    assert.equal(createRes.status, 200);
    const created = await createRes.json();
    assert.equal(created.form.title, "Formulario de Teste Automatizado");

    const logs = await readAuditLogs(ctx.db, "WHERE action = ?", ["create_form"]);
    assert.ok(logs.some(log => log.status === "success"));

    const bootstrapRes = await fetch(`${ctx.baseUrl}/api/bootstrap`);
    const bootstrap = await bootstrapRes.json();
    const savedForm = bootstrap.forms.find(form => form.title === "Formulario de Teste Automatizado");
    assert.ok(savedForm);
    assert.equal(savedForm.resultsConfig.searchEnabled, false);
    assert.deepEqual(savedForm.resultsConfig.totalsLayout, [{ fieldId: 3, style: "split" }]);
  } finally {
    await ctx.cleanup();
  }
});

test("events endpoint persists linked forms and publishes manually", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);
    const bootstrapRes = await fetch(`${ctx.baseUrl}/api/bootstrap`);
    const bootstrap = await bootstrapRes.json();
    const form = bootstrap.forms.find(item => item.type === "presenca");
    assert.ok(form);

    const createRes = await authedJson(ctx.baseUrl, "/api/events", {
      title: "Evento API",
      description: "Descricao do evento",
      date: "2026-05-20",
      opening: "2026-05-10T08:00",
      closing: "2026-05-18T18:00",
      formIds: [form.id],
      messageConfig: {},
    }, adminToken);
    assert.equal(createRes.status, 200);
    const created = await createRes.json();
    assert.equal(created.event.status, "pronto");
    assert.deepEqual(created.event.formIds, [form.id]);

    const publishRes = await authedJson(ctx.baseUrl, `/api/events/${created.event.id}/publish`, {}, adminToken);
    assert.equal(publishRes.status, 200);
    const published = await publishRes.json();
    assert.equal(published.event.status, "publicado");
    assert.ok(published.event.publishedAt);

    const refreshedRes = await fetch(`${ctx.baseUrl}/api/bootstrap`);
    const refreshed = await refreshedRes.json();
    const savedEvent = refreshed.events.find(event => event.id === created.event.id);
    assert.ok(savedEvent);
    assert.equal(savedEvent.title, "Evento API");
    assert.equal(savedEvent.opening, "2026-05-10T08:00:00.000Z");
    assert.equal(savedEvent.closing, "2026-05-18T18:00:00.000Z");
    assert.equal(savedEvent.status, "publicado");

    const deleteRes = await authedJson(ctx.baseUrl, `/api/events/${created.event.id}`, {}, adminToken, "DELETE");
    assert.equal(deleteRes.status, 200);
    const afterDeleteRes = await fetch(`${ctx.baseUrl}/api/bootstrap`);
    const afterDelete = await afterDeleteRes.json();
    assert.ok(!afterDelete.events.some(event => event.id === created.event.id));
  } finally {
    await ctx.cleanup();
  }
});

test("forms endpoint accepts archived status and keeps the form out of the public listing", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);
    const createRes = await authedJson(ctx.baseUrl, "/api/forms", {
      type: "presenca",
      status: "arquivado",
      title: "Formulario Arquivado API",
      sessionName: "Sessao Arquivada",
      labels: [],
      totalExpected: 3,
      fieldDefinitions: [
        { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
      ],
      resultsConfig: {
        searchEnabled: true,
        showLinkedRoster: true,
        totalsLayout: [],
      },
      scaleSections: [],
    }, adminToken);
    assert.equal(createRes.status, 200);

    const bootstrapRes = await fetch(`${ctx.baseUrl}/api/bootstrap`);
    const bootstrap = await bootstrapRes.json();
    const savedForm = bootstrap.forms.find(form => form.title === "Formulario Arquivado API");
    assert.ok(savedForm);
    assert.equal(savedForm.status, "arquivado");

    const publicVisible = visibleFormsFor(null, bootstrap.forms).some(form => form.title === "Formulario Arquivado API");
    assert.equal(publicVisible, false);
  } finally {
    await ctx.cleanup();
  }
});

test("forms endpoint updates an existing form", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);
    const bootstrapRes = await fetch(`${ctx.baseUrl}/api/bootstrap`);
    const bootstrap = await bootstrapRes.json();
    const existing = bootstrap.forms.find(form => form.type === "presenca");
    assert.ok(existing);

    const updateRes = await authedJson(ctx.baseUrl, "/api/forms", {
        id: existing.id,
        slug: existing.slug,
        type: existing.type,
        status: "fechado",
        title: `${existing.title} Atualizado`,
        sessionName: existing.sessionName || "",
        description: existing.description || "",
        labels: existing.labels || [],
        totalExpected: existing.totalExpected || 0,
        fieldDefinitions: existing.fieldDefinitions || [],
        resultsConfig: {
          searchEnabled: false,
          showLinkedRoster: false,
          totalsLayout: [{ fieldId: 2, style: "metric" }],
        },
        scaleSections: [],
      }, adminToken);
    assert.equal(updateRes.status, 200);
    const updated = await updateRes.json();
    assert.equal(updated.form.status, "fechado");
    assert.match(updated.form.title, /Atualizado$/);

    const refreshedRes = await fetch(`${ctx.baseUrl}/api/bootstrap`);
    const refreshed = await refreshedRes.json();
    const savedForm = refreshed.forms.find(form => form.id === existing.id);
    assert.equal(savedForm.status, "fechado");
    assert.match(savedForm.title, /Atualizado$/);
    assert.equal(savedForm.resultsConfig.searchEnabled, false);
    assert.equal(savedForm.resultsConfig.showLinkedRoster, false);
    assert.deepEqual(savedForm.resultsConfig.totalsLayout, [{ fieldId: 2, style: "number" }]);
  } finally {
    await ctx.cleanup();
  }
});

test("forms endpoint rejects duplicated slugs with a clearer message", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);
    const bootstrapRes = await fetch(`${ctx.baseUrl}/api/bootstrap`);
    const bootstrap = await bootstrapRes.json();
    const existing = bootstrap.forms.find(form => form.slug);
    assert.ok(existing);

    const createRes = await authedJson(ctx.baseUrl, "/api/forms", {
      slug: existing.slug,
      type: existing.type,
      status: "rascunho",
      title: "Formulario duplicado",
      sessionName: "",
      description: "",
      labels: [],
      totalExpected: 0,
      fieldDefinitions: existing.fieldDefinitions || [],
      resultsConfig: existing.resultsConfig || {},
      scaleSections: existing.scaleSections || [],
    }, adminToken);
    assert.equal(createRes.status, 400);
    const body = await createRes.json();
    assert.match(body.error, /identificador/i);
  } finally {
    await ctx.cleanup();
  }
});

test("forms endpoint clears expired closing when manually reopening a form", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);
    const bootstrapRes = await fetch(`${ctx.baseUrl}/api/bootstrap`);
    const bootstrap = await bootstrapRes.json();
    const existing = bootstrap.forms.find(form => form.status === "fechado" && form.closing);
    assert.ok(existing);

    const updateRes = await authedJson(ctx.baseUrl, "/api/forms", {
      id: existing.id,
      slug: existing.slug,
      type: existing.type,
      status: "aberto",
      title: existing.title,
      sessionName: existing.sessionName || "",
      description: existing.description || "",
      date: existing.date || "",
      closing: existing.closing,
      closingText: existing.closingText || "",
      labels: existing.labels || [],
      totalExpected: existing.totalExpected || 0,
      fieldDefinitions: existing.fieldDefinitions || [],
      resultsConfig: existing.resultsConfig || {},
      scaleSections: existing.scaleSections || [],
    }, adminToken);
    assert.equal(updateRes.status, 200);
    const updated = await updateRes.json();
    assert.equal(updated.form.status, "aberto");
    assert.equal(updated.form.closing, null);

    const refreshedRes = await fetch(`${ctx.baseUrl}/api/bootstrap`);
    const refreshed = await refreshedRes.json();
    const savedForm = refreshed.forms.find(form => form.id === existing.id);
    assert.equal(savedForm.status, "aberto");
    assert.equal(savedForm.closing, null);
  } finally {
    await ctx.cleanup();
  }
});

test("form detail endpoints return 404 when the form does not exist", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);
    const responsesRes = await fetch(`${ctx.baseUrl}/api/forms/999999/responses`);
    assert.equal(responsesRes.status, 404);

    const escalaRes = await fetch(`${ctx.baseUrl}/api/forms/999999/escala`);
    assert.equal(escalaRes.status, 404);

    const deleteRes = await authedJson(ctx.baseUrl, "/api/forms/999999", { masterKey: "segredo" }, adminToken, "DELETE");
    assert.equal(deleteRes.status, 404);
  } finally {
    await ctx.cleanup();
  }
});

test("security endpoint configures and updates the form delete key", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);
    const statusRes = await fetch(`${ctx.baseUrl}/api/security/form-delete-key/status`);
    assert.equal(statusRes.status, 200);
    assert.deepEqual(await statusRes.json(), { configured: false });

    const createRes = await authedJson(ctx.baseUrl, "/api/security/form-delete-key", { newMasterKey: "segredo-1" }, adminToken, "PUT");
    assert.equal(createRes.status, 200);
    assert.deepEqual(await createRes.json(), { configured: true });

    const storedSetting = await readFormDeleteKeySetting(ctx.db);
    assert.ok(storedSetting);
    const storedValue = storedSetting.value_json;
    assert.equal(storedValue.algorithm, "pbkdf2-sha512");
    assert.ok(storedValue.hash);
    assert.ok(storedValue.salt);
    assert.ok(!JSON.stringify(storedValue).includes("segredo-1"));

    const wrongCurrentRes = await authedJson(ctx.baseUrl, "/api/security/form-delete-key", { currentMasterKey: "errada", newMasterKey: "segredo-2" }, adminToken, "PUT");
    assert.equal(wrongCurrentRes.status, 403);

    const updateRes = await authedJson(ctx.baseUrl, "/api/security/form-delete-key", { currentMasterKey: "segredo-1", newMasterKey: "segredo-2" }, adminToken, "PUT");
    assert.equal(updateRes.status, 200);
    assert.deepEqual(await updateRes.json(), { configured: true });

    const securityLogs = await readAuditLogs(ctx.db, "WHERE action = ?", ["security_master_key_update"]);
    assert.ok(securityLogs.some(log => log.status === "success"));
    const lastSuccessLog = [...securityLogs].reverse().find(log => log.status === "success");
    assert.ok(lastSuccessLog);
    const securityMetadata = lastSuccessLog.metadata_json;
    assert.deepEqual(securityMetadata, { status: "success" });

    const updatedStatusRes = await fetch(`${ctx.baseUrl}/api/security/form-delete-key/status`);
    assert.deepEqual(await updatedStatusRes.json(), { configured: true });
  } finally {
    await ctx.cleanup();
  }
});

test("delete form rejects missing master key and configured-key conflicts", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);
    const createRes = await authedJson(ctx.baseUrl, "/api/forms", {
      type: "presenca",
      status: "aberto",
      title: "Formulario para exclusao",
      sessionName: "Sessao Exclusao",
      labels: [],
      totalExpected: 1,
      fieldDefinitions: [
        { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
        { id: 2, type: "yes_no", label: "Vai?", required: true, show: true, total: true },
      ],
      resultsConfig: {},
      scaleSections: [],
    }, adminToken);
    const created = await createRes.json();

    const missingKeyRes = await authedJson(ctx.baseUrl, `/api/forms/${created.form.id}`, {}, adminToken, "DELETE");
    assert.equal(missingKeyRes.status, 400);

    const configuredMissingKeyRes = await authedJson(ctx.baseUrl, `/api/forms/${created.form.id}`, { masterKey: "qualquer" }, adminToken, "DELETE");
    assert.equal(configuredMissingKeyRes.status, 409);
    const configuredMissingKeyPayload = await configuredMissingKeyRes.json();
    assert.equal(configuredMissingKeyPayload.code, "MASTER_KEY_NOT_CONFIGURED");
  } finally {
    await ctx.cleanup();
  }
});

test("delete form removes responses, response_values and escala assignments with the correct master key", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);
    const createKeyRes = await authedJson(ctx.baseUrl, "/api/security/form-delete-key", { newMasterKey: "segredo-1" }, adminToken, "PUT");
    assert.equal(createKeyRes.status, 200);

    const presenceRes = await authedJson(ctx.baseUrl, "/api/forms", {
      type: "presenca",
      status: "aberto",
      title: "Formulario Presenca Exclusao",
      sessionName: "Sessao Presenca",
      labels: [],
      totalExpected: 1,
      fieldDefinitions: [
        { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
        { id: 2, type: "yes_no", label: "Vai?", required: true, show: true, total: true },
        { id: 3, type: "grid", label: "Matriz", required: false, show: true, total: false, gridRows: ["Linha A"], gridCols: ["Coluna 1"] },
      ],
      resultsConfig: {},
      scaleSections: [],
    }, adminToken);
    const presence = await presenceRes.json();

    const responseRes = await postJson(ctx.baseUrl, "/api/responses", {
      formId: presence.form.id,
      respondentName: "Maria",
      respondentGrau: "QS",
      values: {
        "1": "Maria",
        "2": "Sim",
        "3": { "Linha A": "Coluna 1" },
      },
    });
    assert.equal(responseRes.status, 200);

    const presenceCountsBefore = await readFormCounts(ctx.db, presence.form.id);
    assert.equal(presenceCountsBefore.responses, 1);
    assert.equal(presenceCountsBefore.responseValues, 3);
    assert.equal(presenceCountsBefore.forms, 1);

    const wrongDeleteRes = await authedJson(ctx.baseUrl, `/api/forms/${presence.form.id}`, { masterKey: "errada" }, adminToken, "DELETE");
    assert.equal(wrongDeleteRes.status, 403);

    const deletePresenceRes = await authedJson(ctx.baseUrl, `/api/forms/${presence.form.id}`, { masterKey: "segredo-1" }, adminToken, "DELETE");
    assert.equal(deletePresenceRes.status, 200);

    const presenceCountsAfter = await readFormCounts(ctx.db, presence.form.id);
    assert.deepEqual(presenceCountsAfter, {
      forms: 0,
      responses: 0,
      responseValues: 0,
      escalaAssignments: 0,
    });

    const scaleRes = await authedJson(ctx.baseUrl, "/api/forms", {
      type: "escala_organ",
      status: "aberto",
      title: "Formulario Escala Exclusao",
      sessionName: "Sessao Escala",
      labels: [],
      totalExpected: 0,
      fieldDefinitions: [],
      resultsConfig: {},
      scaleSections: [
        { title: "Sala", responsaveis: 1, auxiliares: 1 },
      ],
    }, adminToken);
    const scaleForm = await scaleRes.json();

    const saveEscalaRes = await authedJson(ctx.baseUrl, `/api/escala/${scaleForm.form.id}`, {
        sections: [
          {
            title: "Sala",
            color: "#ffcdd2",
            slots: [
              { role: "Responsavel", person: "Joao" },
              { role: "Auxiliar", person: "" },
            ],
          },
        ],
      }, adminToken, "PUT");
    assert.equal(saveEscalaRes.status, 200);

    const scaleCountsBefore = await readFormCounts(ctx.db, scaleForm.form.id);
    assert.equal(scaleCountsBefore.escalaAssignments, 1);

    const deleteScaleRes = await authedJson(ctx.baseUrl, `/api/forms/${scaleForm.form.id}`, { masterKey: "segredo-1" }, adminToken, "DELETE");
    assert.equal(deleteScaleRes.status, 200);

    const scaleCountsAfter = await readFormCounts(ctx.db, scaleForm.form.id);
    assert.deepEqual(scaleCountsAfter, {
      forms: 0,
      responses: 0,
      responseValues: 0,
      escalaAssignments: 0,
    });

    const bootstrapRes = await fetch(`${ctx.baseUrl}/api/bootstrap`);
    const bootstrap = await bootstrapRes.json();
    assert.ok(!bootstrap.forms.some(form => form.id === presence.form.id));
    assert.ok(!bootstrap.forms.some(form => form.id === scaleForm.form.id));

    const deleteLogs = await readAuditLogs(ctx.db, "WHERE action = ?", ["delete_form"]);
    assert.ok(deleteLogs.some(log => log.status === "success"));
  } finally {
    await ctx.cleanup();
  }
});

test("responses endpoint persists normalized values and keeps bootstrap compatible", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);
    const createRes = await authedJson(ctx.baseUrl, "/api/forms", {
      type: "presenca",
      status: "aberto",
      title: "Formulario com Resposta",
      sessionName: "Sessao Resposta",
      labels: [],
      totalExpected: 1,
      fieldDefinitions: [
        { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
        { id: 2, type: "yes_no", label: "Vai?", required: true, show: true, total: true },
        { id: 3, type: "number", label: "Convidados", required: false, show: true, total: true },
        { id: 4, type: "text", label: "Observacao", required: false, show: true, total: false, validation: { minLength: 3, maxLength: 30 } },
        { id: 5, type: "grid", label: "Avaliacao", required: false, show: true, total: false, gridRows: ["Linha A", "Linha B"], gridCols: ["Coluna 1", "Coluna 2"] },
      ],
      resultsConfig: {
        searchEnabled: true,
        showLinkedRoster: true,
        totalsLayout: [],
      },
      scaleSections: [],
    }, adminToken);
    assert.equal(createRes.status, 200);
    const created = await createRes.json();

    const responseRes = await postJson(ctx.baseUrl, "/api/responses", {
      formId: created.form.id,
      respondentName: "Maria",
      respondentGrau: "QS",
      values: {
        "1": "QS - Maria",
        "2": "Sim",
        "3": 4,
        "4": "Observacao livre",
        "5": { "Linha A": "Coluna 1", "Linha B": "Coluna 2" },
      },
    });
    assert.equal(responseRes.status, 200);
    const responsePayload = await responseRes.json();
    assert.equal(responsePayload.responses.length, 1);
    assert.equal(responsePayload.responses[0].respondentName, "Maria");
    assert.equal(responsePayload.mode, "create");

    const savedResponseId = responsePayload.responses[0].id;
    const storageAfterInsert = await readResponseStorage(ctx.db, savedResponseId);
    assert.equal(storageAfterInsert.responses.length, 1);
    assert.deepEqual(storageAfterInsert.responses[0].values_json, {
      1: "QS - Maria",
      2: "Sim",
      3: 4,
      4: "Observacao livre",
      5: { "Linha A": "Coluna 1", "Linha B": "Coluna 2" },
    });
    assert.equal(storageAfterInsert.responseValues.length, 5);
    const byFieldAfterInsert = new Map(storageAfterInsert.responseValues.map(row => [String(row.field_id), row]));
    assert.equal(byFieldAfterInsert.get("1").value_text, "QS - Maria");
    assert.equal(byFieldAfterInsert.get("2").value_boolean, true);
    assert.equal(byFieldAfterInsert.get("3").value_number, 4);
    assert.equal(byFieldAfterInsert.get("4").value_text, "Observacao livre");
    assert.deepEqual(byFieldAfterInsert.get("5").value_json, { "Linha A": "Coluna 1", "Linha B": "Coluna 2" });
    assert.equal(byFieldAfterInsert.get("5").value_text, null);

    const invalidResponseRes = await postJson(ctx.baseUrl, "/api/responses", {
      formId: created.form.id,
      respondentName: "Joao",
      respondentGrau: "QM",
      values: {
        "1": "QM - Joao",
        "2": "Sim",
        "3": 4,
        "4": "Oi",
        "5": { "Linha A": "Coluna 1", "Linha B": "Coluna 2" },
      },
    });
    assert.equal(invalidResponseRes.status, 400);
    const invalidPayload = await invalidResponseRes.json();
    assert.match(invalidPayload.error, /pelo menos 3 caracteres/i);

    const storageAfterInvalid = await readResponseStorage(ctx.db, savedResponseId);
    assert.equal(storageAfterInvalid.responses.length, 1);

    const responseLogs = await readAuditLogs(ctx.db, "WHERE action = ?", ["save_response"]);
    assert.ok(responseLogs.some(log => log.status === "success"));
    const responseMetadata = responseLogs.findLast(log => log.status === "success").metadata_json;
    assert.equal(responseMetadata.fieldCount, 5);
    assert.equal(Object.prototype.hasOwnProperty.call(responseMetadata, "values"), false);

    const detailRes = await fetch(`${ctx.baseUrl}/api/forms/${created.form.id}/responses`);
    assert.equal(detailRes.status, 200);
    const detailPayload = await detailRes.json();
    assert.equal(detailPayload.responses.length, 1);
    assert.equal(detailPayload.responses[0].respondentName, "Maria");

    const updateRes = await postJson(ctx.baseUrl, "/api/responses", {
      formId: created.form.id,
      respondentName: "Maria",
      respondentGrau: "QS",
      values: {
        "1": "QS - Maria",
        "2": "Nao",
        "3": 6,
        "4": "Observacao atualizada",
        "5": { "Linha A": "Coluna 2", "Linha B": "Coluna 1" },
      },
    });
    assert.equal(updateRes.status, 200);
    const updatedPayload = await updateRes.json();
    assert.equal(updatedPayload.responses.length, 1);

    const storageAfterUpdate = await readResponseStorage(ctx.db, savedResponseId);
    assert.equal(storageAfterUpdate.responses.length, 1);
    assert.equal(storageAfterUpdate.responseValues.length, 5);
    const byFieldAfterUpdate = new Map(storageAfterUpdate.responseValues.map(row => [String(row.field_id), row]));
    assert.equal(byFieldAfterUpdate.get("2").value_boolean, false);
    assert.equal(byFieldAfterUpdate.get("3").value_number, 6);
    assert.equal(byFieldAfterUpdate.get("4").value_text, "Observacao atualizada");
    assert.deepEqual(byFieldAfterUpdate.get("5").value_json, { "Linha A": "Coluna 2", "Linha B": "Coluna 1" });

    await ctx.db.execute(`
      UPDATE responses
      SET values_json = ?
      WHERE id = ?
    `, [JSON.stringify({
      1: "LEGADO",
      2: "Nao",
      3: 999,
      4: "Texto legado",
      5: { "Linha A": "Legado", "Linha B": "Legado" },
    }), savedResponseId]);

    const normalizedRes = await fetch(`${ctx.baseUrl}/api/forms/${created.form.id}/responses`);
    assert.equal(normalizedRes.status, 200);
    const normalizedPayload = await normalizedRes.json();
    const normalizedResponse = normalizedPayload.responses.find(item => item.id === savedResponseId);
    assert.equal(normalizedResponse.values["3"], 6);
    assert.deepEqual(normalizedResponse.values["5"], { "Linha A": "Coluna 2", "Linha B": "Coluna 1" });

    await ctx.db.execute("DELETE FROM response_values WHERE response_id = ?", [savedResponseId]);

    const fallbackRes = await fetch(`${ctx.baseUrl}/api/forms/${created.form.id}/responses`);
    assert.equal(fallbackRes.status, 200);
    const fallbackPayload = await fallbackRes.json();
    const fallbackResponse = fallbackPayload.responses.find(item => item.id === savedResponseId);
    assert.equal(fallbackResponse.values["1"], "LEGADO");
    assert.equal(fallbackResponse.values["2"], "Nao");
    assert.equal(fallbackResponse.values["3"], 999);
    assert.deepEqual(fallbackResponse.values["5"], { "Linha A": "Legado", "Linha B": "Legado" });

    const bootstrapRes = await fetch(`${ctx.baseUrl}/api/bootstrap`);
    const bootstrap = await bootstrapRes.json();
    assert.deepEqual(bootstrap.responsesByForm, {});
  } finally {
    await ctx.cleanup();
  }
});

test("responses endpoint blocks duplicate submissions when configured", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);
    const createRes = await authedJson(ctx.baseUrl, "/api/forms", {
      type: "presenca",
      status: "aberto",
      title: "Formulario sem duplicidade",
      sessionName: "Sessao Teste",
      labels: [],
      fieldDefinitions: [
        { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
      ],
      resultsConfig: {
        searchEnabled: true,
        showLinkedRoster: true,
        blockDuplicatePersonResponses: true,
        totalsLayout: [],
      },
      scaleSections: [],
    }, adminToken);
    assert.equal(createRes.status, 200);
    const created = await createRes.json();

    const firstRes = await postJson(ctx.baseUrl, "/api/responses", {
      formId: created.form.id,
      respondentName: "Maria",
      respondentGrau: "QS",
      values: {
        "1": "QS - Maria",
      },
    });
    assert.equal(firstRes.status, 200);

    const duplicateRes = await postJson(ctx.baseUrl, "/api/responses", {
      formId: created.form.id,
      respondentName: "Maria",
      respondentGrau: "QS",
      values: {
        "1": "QS - Maria",
      },
    });
    assert.equal(duplicateRes.status, 409);
    const duplicatePayload = await duplicateRes.json();
    assert.match(duplicatePayload.error, /bloqueadas/i);

    const bootstrapRes = await fetch(`${ctx.baseUrl}/api/bootstrap`);
    const bootstrap = await bootstrapRes.json();
    const savedForm = bootstrap.forms.find(form => form.id === created.form.id);
    assert.equal(savedForm.resultsConfig.blockDuplicatePersonResponses, true);
  } finally {
    await ctx.cleanup();
  }
});

test("escala endpoint persists sections and bootstrap reflects it", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);
    const createRes = await authedJson(ctx.baseUrl, "/api/forms", {
      type: "escala_organ",
      status: "aberto",
      title: "Escala de Teste",
      sessionName: "Sessao Escala",
      labels: [],
      totalExpected: 0,
      fieldDefinitions: [],
      resultsConfig: {
        maxAssignmentsPerPerson: 2,
      },
      scaleSections: [
        { title: "Cozinha", responsaveis: 2, auxiliares: 0 },
      ],
    }, adminToken);
    assert.equal(createRes.status, 200);
    const created = await createRes.json();

    const escalaRes = await authedJson(ctx.baseUrl, `/api/escala/${created.form.id}`, {
        sections: [
          {
            title: "Cozinha",
            color: "#ffcdd2",
            slots: [
              { role: "Responsável", person: "Maria" },
              { role: "Auxiliar", person: "Maria" },
            ],
          },
        ],
      }, adminToken, "PUT");
    assert.equal(escalaRes.status, 200);
    const escalaPayload = await escalaRes.json();
    assert.equal(escalaPayload.sections[0].slots[1].person, "Maria");

    const detailRes = await fetch(`${ctx.baseUrl}/api/forms/${created.form.id}/escala`);
    assert.equal(detailRes.status, 200);
    const detailPayload = await detailRes.json();
    assert.equal(detailPayload.sections[0].slots[1].person, "Maria");

    const bootstrapRes = await fetch(`${ctx.baseUrl}/api/bootstrap`);
    const bootstrap = await bootstrapRes.json();
    assert.equal(bootstrap.forms.find(form => form.id === created.form.id).resultsConfig.maxAssignmentsPerPerson, 2);
    assert.deepEqual(bootstrap.escalaByForm, {});
  } finally {
    await ctx.cleanup();
  }
});

test("public escala claim endpoint persists a slot and rejects conflicts", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);
    const createRes = await authedJson(ctx.baseUrl, "/api/forms", {
      type: "escala_organ",
      status: "aberto",
      title: "Escala Publica de Teste",
      sessionName: "Sessao Escala Publica",
      labels: [],
      totalExpected: 0,
      fieldDefinitions: [],
      resultsConfig: {
        maxAssignmentsPerPerson: 2,
      },
      scaleSections: [
        { title: "Sala", responsaveis: 3, auxiliares: 0 },
      ],
    }, adminToken);
    assert.equal(createRes.status, 200);
    const created = await createRes.json();

    const claimRes = await postJson(ctx.baseUrl, `/api/forms/${created.form.id}/escala/claim`, {
      sectionIndex: 0,
      slotIndex: 0,
      person: "Maria",
    });
    assert.equal(claimRes.status, 200);
    const claimedPayload = await claimRes.json();
    assert.equal(claimedPayload.sections[0].slots[0].person, "Maria");

    const secondClaimRes = await postJson(ctx.baseUrl, `/api/forms/${created.form.id}/escala/claim`, {
      sectionIndex: 0,
      slotIndex: 1,
      person: "Maria",
    });
    assert.equal(secondClaimRes.status, 200);

    const duplicateRes = await postJson(ctx.baseUrl, `/api/forms/${created.form.id}/escala/claim`, {
      sectionIndex: 0,
      slotIndex: 2,
      person: "Maria",
    });
    assert.equal(duplicateRes.status, 409);
    const duplicatePayload = await duplicateRes.json();
    assert.equal(duplicatePayload.code, "ESCALA_LIMIT_REACHED");

    const conflictRes = await postJson(ctx.baseUrl, `/api/forms/${created.form.id}/escala/claim`, {
      sectionIndex: 0,
      slotIndex: 0,
      person: "Ana",
    });
    assert.equal(conflictRes.status, 409);
    const conflictPayload = await conflictRes.json();
    assert.equal(conflictPayload.code, "ESCALA_CONFLICT");

    const conflictLogs = await readAuditLogs(ctx.db, "WHERE action = ? AND status = ?", ["claim_escala_slot", "conflict"]);
    assert.ok(conflictLogs.length >= 1);

    const missingRes = await postJson(ctx.baseUrl, "/api/forms/999999/escala/claim", {
      sectionIndex: 0,
      slotIndex: 0,
      person: "Ana",
    });
    assert.equal(missingRes.status, 404);

    const detailRes = await fetch(`${ctx.baseUrl}/api/forms/${created.form.id}/escala`);
    assert.equal(detailRes.status, 200);
    const detailPayload = await detailRes.json();
    assert.equal(detailPayload.sections[0].slots[0].person, "Maria");
  } finally {
    await ctx.cleanup();
  }
});

test("catalog endpoints persist field and scale task definitions", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);
    const fieldRes = await authedJson(ctx.baseUrl, "/api/field-catalog", {
        key: "presenca sessao",
        name: "Presenca em sessao",
        type: "yes_no",
        category: "presenca",
        defaultLabel: "Sessao",
        gridSchema: {},
        description: "Campo padrao para presenca em sessoes.",
        active: true,
      }, adminToken);
    assert.equal(fieldRes.status, 200);
    const fieldPayload = await fieldRes.json();
    assert.equal(fieldPayload.fieldCatalog[0].key, "presenca_sessao");

    const linkedFieldRes = await authedJson(ctx.baseUrl, "/api/field-catalog", {
        key: "congregacoes",
        name: "Congregacoes",
        type: "person_select",
        category: "presenca",
        defaultLabel: "Congregacao",
        selectionSource: { kind: "external_base", externalBaseId: 88 },
        gridSchema: {},
        description: "Campo vinculado a uma base externa.",
        active: true,
      }, adminToken);
    assert.equal(linkedFieldRes.status, 200);
    const linkedFieldPayload = await linkedFieldRes.json();
    assert.equal(linkedFieldPayload.fieldCatalog.find(item => item.key === "congregacoes").selectionSource.kind, "external_base");
    assert.equal(linkedFieldPayload.fieldCatalog.find(item => item.key === "congregacoes").selectionSource.externalBaseId, 88);

    const gridRes = await authedJson(ctx.baseUrl, "/api/field-catalog", {
        key: "avaliacao matriz",
        name: "Avaliacao em matriz",
        type: "grid",
        category: "avaliacao",
        defaultLabel: "Avaliacao",
        gridSchema: { rows: ["Audio", "Limpeza"], cols: ["1", "2", "3"] },
        active: true,
      }, adminToken);
    assert.equal(gridRes.status, 200);
    const gridPayload = await gridRes.json();
    assert.deepEqual(gridPayload.fieldCatalog.find(item => item.key === "avaliacao_matriz").gridSchema, { rows: ["Audio", "Limpeza"], cols: ["1", "2", "3"] });

    const taskRes = await authedJson(ctx.baseUrl, "/api/scale-task-catalog", {
        key: "preparo jantar",
        name: "Preparo do jantar",
        category: "cozinha",
        defaultLabel: "Preparacao do jantar",
        description: "Tarefa padrao da Organ.",
        active: true,
      }, adminToken);
    assert.equal(taskRes.status, 200);
    const taskPayload = await taskRes.json();
    assert.equal(taskPayload.scaleTaskCatalog[0].key, "preparo_jantar");

    const bootstrapRes = await fetch(`${ctx.baseUrl}/api/bootstrap`);
    const bootstrap = await bootstrapRes.json();
    assert.equal(bootstrap.fieldCatalog.find(item => item.key === "presenca_sessao").name, "Presenca em sessao");
    assert.equal(bootstrap.fieldCatalog.find(item => item.key === "congregacoes").selectionSource.kind, "external_base");
    assert.deepEqual(bootstrap.fieldCatalog.find(item => item.key === "avaliacao_matriz").gridSchema.cols, ["1", "2", "3"]);
    assert.equal(bootstrap.scaleTaskCatalog[0].name, "Preparo do jantar");

    const logs = await readAuditLogs(ctx.db, "WHERE action IN (?, ?)", ["admin_create_field_catalog", "admin_create_scale_task_catalog"]);
    assert.ok(logs.length >= 2);
  } finally {
    await ctx.cleanup();
  }
});

test("external bases endpoint persists CRUD data and exposes it on bootstrap", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);
    const createRes = await authedJson(ctx.baseUrl, "/api/external-bases", {
      name: "Congregacoes",
      description: "Lista externa para visitantes.",
      sourceType: "google_sheets",
      sheetUrl: "https://docs.google.com/spreadsheets/d/base123/edit#gid=0",
      range: "Congregacoes!A:D",
      valueColumn: "A",
      labelColumn: "B",
      descriptionColumn: "C",
      activeColumn: "D",
      syncEnabled: true,
      syncFrequencyHours: 12,
      active: true,
      items: [
        { value: "CENTRAL", label: "Central", active: true },
      ],
    }, adminToken);
    assert.equal(createRes.status, 200);
    const createPayload = await createRes.json();
    assert.equal(createPayload.externalBases.length, 1);
    assert.equal(createPayload.externalBases[0].name, "Congregacoes");

    const baseId = createPayload.externalBases[0].id;
    const updateRes = await authedJson(ctx.baseUrl, "/api/external-bases", {
      ...createPayload.externalBases[0],
      id: baseId,
      description: "Lista atualizada.",
      active: false,
    }, adminToken);
    assert.equal(updateRes.status, 200);
    const updatePayload = await updateRes.json();
    assert.equal(updatePayload.externalBases[0].description, "Lista atualizada.");
    assert.equal(updatePayload.externalBases[0].active, false);

    const bootstrapRes = await fetch(`${ctx.baseUrl}/api/bootstrap`);
    assert.equal(bootstrapRes.status, 200);
    const bootstrap = await bootstrapRes.json();
    assert.equal(bootstrap.externalBases.length, 1);
    assert.equal(bootstrap.externalBases[0].name, "Congregacoes");
    assert.equal(bootstrap.externalBases[0].description, "Lista atualizada.");

    const deleteRes = await authedFetch(ctx.baseUrl, `/api/external-bases/${baseId}`, adminToken, { method: "DELETE" });
    assert.equal(deleteRes.status, 200);
    const deletePayload = await deleteRes.json();
    assert.equal(deletePayload.externalBases.length, 0);

    const logs = await readAuditLogs(ctx.db, "WHERE action IN (?, ?)", ["admin_save_external_base", "admin_delete_external_base"]);
    assert.ok(logs.some(log => log.action === "admin_save_external_base" && log.status === "success"));
    assert.ok(logs.some(log => log.action === "admin_delete_external_base" && log.status === "success"));
  } finally {
    await ctx.cleanup();
  }
});

test("messaging templates and presets CRUD", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);

    const listSeedRes = await authedFetch(ctx.baseUrl, "/api/message-templates", adminToken);
    assert.equal(listSeedRes.status, 200);
    const seedPayload = await listSeedRes.json();
    assert.ok(seedPayload.templates.length >= 3);

    const createRes = await authedJson(ctx.baseUrl, "/api/message-templates", {
      name: "Template teste",
      type: "fill_reminder",
      body: "Ola {{person.name}}",
    }, adminToken);
    assert.equal(createRes.status, 200);
    const created = await createRes.json();
    assert.ok(created.template.id);

    const updateRes = await authedJson(ctx.baseUrl, "/api/message-templates", {
      id: created.template.id,
      name: "Template atualizado",
      type: "fill_reminder",
      body: "Ola novamente {{person.name}}",
    }, adminToken);
    assert.equal(updateRes.status, 200);
    const updated = await updateRes.json();
    assert.equal(updated.template.name, "Template atualizado");

    const presetCreateRes = await authedJson(ctx.baseUrl, "/api/person-presets", {
      name: "Preset principal",
      personKeys: ["1", "2"],
    }, adminToken);
    assert.equal(presetCreateRes.status, 200);
    const preset = (await presetCreateRes.json()).preset;
    assert.deepEqual(preset.personKeys, ["1", "2"]);

    const deletePresetRes = await authedFetch(ctx.baseUrl, `/api/person-presets/${preset.id}`, adminToken, { method: "DELETE" });
    assert.equal(deletePresetRes.status, 200);

    const deleteTemplateRes = await authedFetch(ctx.baseUrl, `/api/message-templates/${created.template.id}`, adminToken, { method: "DELETE" });
    assert.equal(deleteTemplateRes.status, 200);
  } finally {
    await ctx.cleanup();
  }
});

test("messaging-config GET and PUT", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);
    const getRes = await authedFetch(ctx.baseUrl, "/api/messaging-config", adminToken);
    assert.equal(getRes.status, 200);
    const initial = (await getRes.json()).config;
    assert.equal(initial.autoDispatchEnabled, true);

    const updateRes = await authedJson(ctx.baseUrl, "/api/messaging-config", {
      whatsappGroupName: "Grupo Teste",
      autoDispatchEnabled: false,
      publicBaseUrl: "https://app.example.com",
    }, adminToken, "PUT");
    assert.equal(updateRes.status, 200);
    const updated = (await updateRes.json()).config;
    assert.equal(updated.whatsappGroupName, "Grupo Teste");
    assert.equal(updated.autoDispatchEnabled, false);
    assert.equal(updated.publicBaseUrl, "https://app.example.com");
  } finally {
    await ctx.cleanup();
  }
});

test("event message create blocks events without eligible forms", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);

    const createEventRes = await authedJson(ctx.baseUrl, "/api/events", {
      title: "Evento Vazio",
      formIds: [],
    }, adminToken);
    assert.equal(createEventRes.status, 200);
    const event = (await createEventRes.json()).event;

    const createMsgRes = await authedJson(ctx.baseUrl, `/api/events/${event.id}/messages`, {
      type: "new_scale",
      body: "Mensagem qualquer",
    }, adminToken);
    assert.equal(createMsgRes.status, 400);
    const error = await createMsgRes.json();
    assert.equal(error.code, "EVENT_NOT_ELIGIBLE_FOR_MESSAGES");
  } finally {
    await ctx.cleanup();
  }
});

test("event message type 1 dispatch grava log e marca disparada", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);
    const bootstrap = await (await fetch(`${ctx.baseUrl}/api/bootstrap`)).json();
    const presenca = bootstrap.forms.find(form => form.type === "presenca");
    assert.ok(presenca);

    const eventRes = await authedJson(ctx.baseUrl, "/api/events", {
      title: "Evento com mensagem",
      date: "2026-06-01",
      formIds: [presenca.id],
    }, adminToken);
    assert.equal(eventRes.status, 200);
    const event = (await eventRes.json()).event;

    const createRes = await authedJson(ctx.baseUrl, `/api/events/${event.id}/messages`, {
      type: "new_scale",
      body: "Confiram em {{event.title}} ({{event.date}})\n{{forms.list}}",
    }, adminToken);
    assert.equal(createRes.status, 200);
    const message = (await createRes.json()).message;
    assert.equal(message.status, "rascunho");

    const previewRes = await authedFetch(ctx.baseUrl, `/api/events/${event.id}/messages/${message.id}/preview`, adminToken);
    assert.equal(previewRes.status, 200);
    const preview = (await previewRes.json()).preview;
    assert.equal(preview.kind, "group");
    assert.ok(preview.renderedBody.includes("Evento com mensagem"));

    const dispatchRes = await authedJson(ctx.baseUrl, `/api/events/${event.id}/messages/${message.id}/dispatch`, {}, adminToken);
    assert.equal(dispatchRes.status, 200);
    const dispatch = await dispatchRes.json();
    assert.equal(dispatch.message.status, "disparada");
    assert.equal(dispatch.dispatch.status, "logged_only");
    assert.ok(dispatch.dispatch.logId);

    const logsRes = await authedFetch(ctx.baseUrl, `/api/events/${event.id}/messages/${message.id}/logs`, adminToken);
    assert.equal(logsRes.status, 200);
    const logs = (await logsRes.json()).logs;
    assert.equal(logs.length, 1);
    assert.equal(logs[0].mode, "manual");
    assert.equal(logs[0].dispatcherVersion, "log-only-1");
  } finally {
    await ctx.cleanup();
  }
});

test("event message type 2 bloqueia sem phoneColumn e libera ao configurar", async () => {
  const ctx = await startServer();
  try {
    const adminToken = await loginAsAdmin(ctx.baseUrl);
    const bootstrap = await (await fetch(`${ctx.baseUrl}/api/bootstrap`)).json();
    const presenca = bootstrap.forms.find(form => form.type === "presenca");
    assert.ok(presenca);

    const eventRes = await authedJson(ctx.baseUrl, "/api/events", {
      title: "Evento DM",
      date: "2026-06-10",
      formIds: [presenca.id],
    }, adminToken);
    const event = (await eventRes.json()).event;

    const blockedRes = await authedJson(ctx.baseUrl, `/api/events/${event.id}/messages`, {
      type: "fill_reminder",
      body: "Ola {{person.name}}",
      config: { formId: presenca.id, recipients: { mode: "auto" } },
    }, adminToken);
    assert.equal(blockedRes.status, 400);
    assert.equal((await blockedRes.json()).code, "PHONE_COLUMN_NOT_CONFIGURED");

    const updateMembersRes = await authedJson(ctx.baseUrl, "/api/members-config", {
      sourceType: "google_sheets",
      nameColumn: "B",
      grauColumn: "A",
      phoneColumn: "C",
      range: "Socios!A:C",
      syncEnabled: true,
      syncFrequencyHours: 24,
    }, adminToken, "PUT");
    assert.equal(updateMembersRes.status, 200);

    const okRes = await authedJson(ctx.baseUrl, `/api/events/${event.id}/messages`, {
      type: "fill_reminder",
      body: "Ola {{person.name}}",
      config: { formId: presenca.id, recipients: { mode: "auto" } },
    }, adminToken);
    assert.equal(okRes.status, 200);
    const message = (await okRes.json()).message;
    assert.equal(message.type, "fill_reminder");
    assert.equal(message.status, "rascunho");
  } finally {
    await ctx.cleanup();
  }
});
