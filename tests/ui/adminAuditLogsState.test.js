/**
 * @file tests/ui/adminAuditLogsState.test.js
 * @summary Testes dos helpers de estado da auditoria administrativa.
 * @responsibility Validar calculos puros de paginacao dos logs de auditoria.
 */

import { describe, expect, it } from "vitest";
import { getAuditPaginationState } from "../../frontend/src/features/admin/adminAuditLogsState";

describe("adminAuditLogsState", () => {
  it("calcula paginas e intervalo visivel dos logs", () => {
    expect(getAuditPaginationState(0, 1)).toEqual({
      totalPages: 1,
      safePage: 1,
      fromIndex: 0,
      toIndex: 0,
    });

    expect(getAuditPaginationState(25, 3)).toEqual({
      totalPages: 3,
      safePage: 3,
      fromIndex: 21,
      toIndex: 25,
    });
  });

  it("limita pagina atual quando o total diminui", () => {
    expect(getAuditPaginationState(8, 4)).toEqual({
      totalPages: 1,
      safePage: 1,
      fromIndex: 1,
      toIndex: 8,
    });
  });
});
