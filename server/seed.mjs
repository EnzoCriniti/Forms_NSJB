/**
 * @file server/seed.mjs
 * @summary Seed inicial da aplicacao.
 * @responsibility Popular o SQLite com dados base na primeira execucao.
 */

import {
  DEFAULT_MEMBERS_CONFIG,
  DEFAULT_USERS,
  ESCALA_SECTIONS,
  LABELS,
  MOCK_FORMS,
  MOCK_RESPONSES,
  PRESETS,
} from "../src/data/seedData.js";
import { db, nowIso, stringifyJson } from "./db.mjs";
import { createPasswordRecord } from "./core/auth.mjs";

const COLORS = ["#ffcdd2", "#bbdefb", "#f8bbd0", "#c8e6c9", "#ffe0b2", "#d1c4e9"];

const buildScaleSections = sections => sections.map((section, index) => ({
  title: section.title,
  color: section.color || COLORS[index % COLORS.length],
  slots: [
    ...Array.from({ length: section.responsaveis || 0 }, () => ({ role: "Responsável", person: "" })),
    ...Array.from({ length: section.auxiliares || 0 }, () => ({ role: "Auxiliar", person: "" })),
  ],
}));

const ensureFormsSeed = () => {
  const count = db.prepare("SELECT COUNT(*) AS total FROM forms").get().total;
  if (count) return;

  const insertForm = db.prepare(`
    INSERT INTO forms (
      slug, type, status, title, session_name, description, date, closing, closing_text,
      total_expected, labels_json, field_definitions_json, results_config_json, scale_sections_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertResponse = db.prepare(`
    INSERT INTO responses (
      form_id, respondent_name, respondent_grau, respondent_key, values_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertEscala = db.prepare(`
    INSERT INTO escala_assignments (form_id, sections_json, updated_at) VALUES (?, ?, ?)
  `);

  const bySeedId = new Map();
  const now = nowIso();

  for (const form of MOCK_FORMS) {
    const result = insertForm.run(
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
    );
    bySeedId.set(form.id, Number(result.lastInsertRowid));
  }

  for (const response of MOCK_RESPONSES) {
    const formId = bySeedId.get(response.formId);
    if (!formId) continue;
    insertResponse.run(
      formId,
      response.respondentName,
      response.respondentGrau,
      response.respondentName.toLowerCase(),
      stringifyJson(response.values),
      now,
      now,
    );
  }

  const escalaFormId = bySeedId.get(2);
  if (escalaFormId) {
    insertEscala.run(escalaFormId, stringifyJson(ESCALA_SECTIONS), now);
  }

  for (const form of MOCK_FORMS.filter(item => item.type === "escala_organ" && item.id !== 2)) {
    const dbFormId = bySeedId.get(form.id);
    if (!dbFormId) continue;
    insertEscala.run(dbFormId, stringifyJson(buildScaleSections(form.scaleSections || [])), now);
  }
};

const ensureUsersSeed = () => {
  const count = db.prepare("SELECT COUNT(*) AS total FROM users").get().total;
  if (count) return;
  const stmt = db.prepare(`
    INSERT INTO users (
      name, username, password, password_hash, password_salt, password_algorithm, password_iterations, password_migrated_at, role, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const now = nowIso();
  for (const user of DEFAULT_USERS) {
    const secret = createPasswordRecord(user.password);
    stmt.run(user.name, user.username, user.password, secret.hash, secret.salt, secret.algorithm, secret.iterations, now, user.role, now, now);
  }
};

const ensureLabelsSeed = () => {
  const count = db.prepare("SELECT COUNT(*) AS total FROM labels").get().total;
  if (count) return;
  const stmt = db.prepare(`
    INSERT INTO labels (name, color, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  const now = nowIso();
  for (const label of LABELS) {
    stmt.run(label.name, label.color, "Sistema", now, now);
  }
};

const ensurePresetsSeed = () => {
  const count = db.prepare("SELECT COUNT(*) AS total FROM presets").get().total;
  if (count) return;
  const stmt = db.prepare(`
    INSERT INTO presets (
      type, name, description, closing_text, labels_json, field_definitions_json, results_config_json,
      scale_sections_json, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const now = nowIso();
  for (const preset of PRESETS) {
    stmt.run(
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
    );
  }
};

const ensureMembersConfigSeed = () => {
  const found = db.prepare("SELECT key FROM settings WHERE key = ?").get("membersConfig");
  if (found) return;
  db.prepare("INSERT INTO settings (key, value_json, updated_at) VALUES (?, ?, ?)")
    .run("membersConfig", stringifyJson(DEFAULT_MEMBERS_CONFIG), nowIso());
};

export const ensureSeedData = () => {
  ensureFormsSeed();
  ensureUsersSeed();
  ensureLabelsSeed();
  ensurePresetsSeed();
  ensureMembersConfigSeed();
};
