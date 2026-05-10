/**
 * @file backend/seed.mjs
 * @summary Seed inicial da aplicacao.
 * @responsibility Popular o banco com dados base na primeira execucao.
 */

import {
  DEFAULT_MEMBERS_CONFIG,
  DEFAULT_USERS,
  ESCALA_SECTIONS,
  LABELS,
  MOCK_EVENTS,
  MOCK_FORMS,
  MOCK_RESPONSES,
  PRESETS,
} from "./data/seedData.mjs";
import { database } from "./database/index.mjs";
import { nowIso, stringifyJson } from "./database/shared.mjs";
import { createPasswordRecord } from "./core/auth.mjs";

const COLORS = ["#ffcdd2", "#bbdefb", "#f8bbd0", "#c8e6c9", "#ffe0b2", "#d1c4e9"];

const buildScaleSections = sections => sections.map((section, index) => ({
  title: section.title,
  color: section.color || COLORS[index % COLORS.length],
  slots: [
    ...Array.from({ length: section.responsaveis || 0 }, () => ({ role: "Responsavel", person: "" })),
    ...Array.from({ length: section.auxiliares || 0 }, () => ({ role: "Auxiliar", person: "" })),
  ],
}));

const ensureFormsSeed = async () => {
  const count = (await database.queryOne("SELECT COUNT(*) AS total FROM forms"))?.total || 0;
  if (count) return;

  const bySeedId = new Map();
  const now = nowIso();

  await database.withTransaction(async tx => {
    for (const form of MOCK_FORMS) {
      const result = await tx.execute(`
        INSERT INTO forms (
          slug, type, status, title, session_name, description, date, closing, closing_text,
          total_expected, labels_json, field_definitions_json, results_config_json, scale_sections_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `, [
        form.slug,
        form.type,
        form.status,
        form.title,
        form.sessionName,
        form.description || "",
        form.date,
        form.closing,
        form.closingText,
        form.totalExpected || 0,
        stringifyJson(form.labels),
        stringifyJson(form.fieldDefinitions || []),
        stringifyJson(form.resultsConfig || {}),
        stringifyJson(form.scaleSections || []),
        now,
        now,
      ]);
      bySeedId.set(form.id, Number(result.lastInsertId));
    }

    for (const response of MOCK_RESPONSES) {
      const formId = bySeedId.get(response.formId);
      if (!formId) continue;
      await tx.execute(`
        INSERT INTO responses (
          form_id, respondent_name, respondent_grau, respondent_key, values_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        formId,
        response.respondentName,
        response.respondentGrau,
        response.respondentName.toLowerCase(),
        stringifyJson(response.values),
        now,
        now,
      ]);
    }

    const escalaFormId = bySeedId.get(2);
    if (escalaFormId) {
      await tx.execute(
        "INSERT INTO escala_assignments (form_id, sections_json, updated_at) VALUES (?, ?, ?)",
        [escalaFormId, stringifyJson(ESCALA_SECTIONS), now],
      );
    }

    for (const form of MOCK_FORMS.filter(item => item.type === "escala_organ" && item.id !== 2)) {
      const dbFormId = bySeedId.get(form.id);
      if (!dbFormId) continue;
      await tx.execute(
        "INSERT INTO escala_assignments (form_id, sections_json, updated_at) VALUES (?, ?, ?)",
        [dbFormId, stringifyJson(buildScaleSections(form.scaleSections || [])), now],
      );
    }
  });
};

const ensureEventsSeed = async () => {
  const count = (await database.queryOne("SELECT COUNT(*) AS total FROM events"))?.total || 0;
  if (count) return;

  const forms = await database.queryMany("SELECT id, slug FROM forms");
  const bySlug = new Map(forms.map(form => [form.slug, Number(form.id)]));
  const bySeedId = new Map(MOCK_FORMS.map(form => [form.id, bySlug.get(form.slug)]));
  const now = nowIso();

  await database.withTransaction(async tx => {
    for (const event of MOCK_EVENTS) {
      const formIds = event.formSeedIds.map(seedId => bySeedId.get(seedId)).filter(Boolean);
      await tx.execute(`
        INSERT INTO events (
          title, description, date, opening, closing, status, form_ids_json, message_config_json, published_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        event.title,
        event.description || "",
        event.date,
        event.opening,
        event.closing,
        event.status,
        stringifyJson(formIds),
        stringifyJson({}),
        null,
        now,
        now,
      ]);
    }
  });
};

const ensureUsersSeed = async () => {
  const count = (await database.queryOne("SELECT COUNT(*) AS total FROM users"))?.total || 0;
  if (count) return;
  const now = nowIso();

  await database.withTransaction(async tx => {
    for (const user of DEFAULT_USERS) {
      const secret = createPasswordRecord(user.password);
      await tx.execute(`
        INSERT INTO users (
          name, username, password, password_hash, password_salt, password_algorithm, password_iterations, password_migrated_at, role, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [user.name, user.username, user.password, secret.hash, secret.salt, secret.algorithm, secret.iterations, now, user.role, now, now]);
    }
  });
};

const ensureLabelsSeed = async () => {
  const count = (await database.queryOne("SELECT COUNT(*) AS total FROM labels"))?.total || 0;
  if (count) return;
  const now = nowIso();

  await database.withTransaction(async tx => {
    for (const label of LABELS) {
      await tx.execute(`
        INSERT INTO labels (name, color, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `, [label.name, label.color, "Sistema", now, now]);
    }
  });
};

const ensurePresetsSeed = async () => {
  const count = (await database.queryOne("SELECT COUNT(*) AS total FROM presets"))?.total || 0;
  if (count) return;
  const now = nowIso();

  await database.withTransaction(async tx => {
    for (const preset of PRESETS) {
      await tx.execute(`
        INSERT INTO presets (
          type, name, description, closing_text, labels_json, field_definitions_json, results_config_json,
          scale_sections_json, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        preset.type,
        preset.name,
        preset.desc || "",
        preset.closingText || "",
        stringifyJson(preset.labels || []),
        stringifyJson(preset.fieldDefinitions || []),
        stringifyJson(preset.resultsConfig || {}),
        stringifyJson(preset.scaleSections || []),
        "Sistema",
        now,
        now,
      ]);
    }
  });
};

const ensureMembersConfigSeed = async () => {
  const found = await database.queryOne("SELECT key FROM settings WHERE key = ?", ["membersConfig"]);
  if (found) return;
  await database.execute(
    "INSERT INTO settings (key, value_json, updated_at) VALUES (?, ?, ?)",
    ["membersConfig", stringifyJson(DEFAULT_MEMBERS_CONFIG), nowIso()],
  );
};

export const ensureSeedData = async () => {
  await ensureFormsSeed();
  await ensureEventsSeed();
  await ensureUsersSeed();
  await ensureLabelsSeed();
  await ensurePresetsSeed();
  await ensureMembersConfigSeed();
};
