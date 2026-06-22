/**
 * @file backend/routes/reportsRoutes.mjs
 * @summary Rotas de relatorios/BI.
 * @responsibility Expor metricas agregadas de participacao para administradores.
 */

import { sendJson } from "../core/http.mjs";
import { getMemberParticipationReport } from "../services/reportsService.mjs";
import { requireAdmin, sendKnownError } from "./requestHelpers.mjs";

export const handleReportsRoutes = async (req, res, url) => {
  if (req.method === "GET" && url.pathname === "/api/reports/members") {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    try {
      const members = await getMemberParticipationReport();
      sendJson(res, 200, { members });
    } catch (error) {
      if (!sendKnownError(res, error)) {
        sendJson(res, error.statusCode || 500, { error: error.message, code: error.code || undefined });
      }
    }
    return true;
  }

  return false;
};
