/**
 * @file tests/ui/adminSettingsDefaults.test.js
 * @summary Testes dos defaults da central administrativa.
 * @responsibility Validar drafts iniciais e tabs por perfil.
 */

import { describe, expect, it } from "vitest";
import {
  buildAdminSettingsTabs,
  emptyExternalBaseDraft,
  emptyFieldCatalogDraft,
  emptySecurityDraft,
  emptyUserDraft,
} from "../../frontend/src/features/admin/adminSettingsDefaults";
import { DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS } from "../../frontend/src/lib/gridDefaults";

describe("adminSettingsDefaults", () => {
  it("define drafts iniciais usados pelo modal administrativo", () => {
    expect(emptyUserDraft).toEqual({ name: "", username: "", password: "", role: "viewer" });
    expect(emptySecurityDraft).toEqual({ currentMasterKey: "", newMasterKey: "" });
    expect(emptyExternalBaseDraft).toMatchObject({
      sourceType: "google_sheets",
      range: "Itens!A:B",
      syncEnabled: true,
      syncFrequencyHours: 24,
      active: true,
      items: [],
    });
  });

  it("mantem grid e origem padrao do campo base", () => {
    expect(emptyFieldCatalogDraft).toMatchObject({
      type: "yes_no",
      category: "presenca",
      gridSchema: { rows: DEFAULT_GRID_ROWS, cols: DEFAULT_GRID_COLS },
      selectionSource: { kind: "members" },
      active: true,
    });
  });

  it("inclui auditoria apenas para admin", () => {
    expect(buildAdminSettingsTabs({ role: "viewer" }).map(tab => tab.key)).not.toContain("audit");
    expect(buildAdminSettingsTabs({ role: "admin" }).map(tab => tab.key)).toContain("audit");
  });
});
