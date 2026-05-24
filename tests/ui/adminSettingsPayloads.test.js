/**
 * @file tests/ui/adminSettingsPayloads.test.js
 * @summary Testes dos payloads da central administrativa.
 * @responsibility Validar normalizacao de submits do AdminSettingsModal.
 */

import { describe, expect, it } from "vitest";
import {
  buildAdminLabelPayload,
  buildAdminUserPayload,
  buildExternalBasePayload,
  buildFieldCatalogPayload,
  buildScaleTaskCatalogPayload,
  buildSecurityPayload,
} from "../../frontend/src/features/admin/adminSettingsPayloads";

describe("adminSettingsPayloads", () => {
  it("normaliza payload de usuario e classificacao", () => {
    expect(buildAdminUserPayload({ name: "", username: "  operador  ", password: "123", role: "viewer" })).toMatchObject({
      name: "operador",
      username: "operador",
    });

    expect(buildAdminLabelPayload({ name: "  Urgente  ", color: "#111" }, { name: "Admin" })).toMatchObject({
      name: "Urgente",
      createdBy: "Admin",
    });
  });

  it("normaliza payload de base externa", () => {
    expect(buildExternalBasePayload({ name: "  Congregacoes  ", description: "  Lista ativa  " })).toMatchObject({
      name: "Congregacoes",
      description: "Lista ativa",
    });
  });

  it("normaliza payload de campo base com origem externa", () => {
    const result = buildFieldCatalogPayload({
      key: "",
      name: "Congregacoes",
      defaultLabel: "Congregacao",
      type: "person_select",
      selectionSource: { kind: "external_base", externalBaseId: 88 },
    });

    expect(result.key).toBe("congregacoes");
    expect(result.selectionSource).toEqual({ kind: "external_base", externalBaseId: 88 });
    expect(result.payload).toMatchObject({
      key: "congregacoes",
      selectionSource: { kind: "external_base", externalBaseId: 88 },
    });
  });

  it("normaliza payload de tarefa base", () => {
    expect(buildScaleTaskCatalogPayload({
      key: "",
      name: "Preparo do jantar",
      defaultLabel: "Preparacao",
    })).toMatchObject({
      key: "preparo_do_jantar",
      payload: { key: "preparo_do_jantar" },
    });
  });

  it("monta payload de chave mestra conforme estado atual", () => {
    expect(buildSecurityPayload({
      securityDraft: { currentMasterKey: "antiga", newMasterKey: "nova" },
      formDeleteKeyConfigured: true,
    })).toEqual({ currentMasterKey: "antiga", newMasterKey: "nova" });

    expect(buildSecurityPayload({
      securityDraft: { currentMasterKey: "", newMasterKey: "nova" },
      formDeleteKeyConfigured: false,
    })).toEqual({ currentMasterKey: undefined, newMasterKey: "nova" });
  });
});
