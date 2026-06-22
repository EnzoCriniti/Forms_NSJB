/**
 * @file backend/bi/biRoutes.mjs
 * @summary Rotas do modulo de BI.
 * @responsibility Expor metricas agregadas de participacao para administradores.
 */

import { sendJson } from "../core/http.mjs";
import { requireAdmin, sendKnownError } from "../routes/requestHelpers.mjs";
import { getMemberParticipationReport, getOverviewReport } from "./reportsService.mjs";

const handle = async (res, loader) => {
  try {
    sendJson(res, 200, await loader());
  } catch (error) {
    if (!sendKnownError(res, error)) {
      sendJson(res, error.statusCode || 500, { error: error.message, code: error.code || undefined });
    }
  }
};

export const handleBiRoutes = async (req, res, url) => {
  if (req.method === "GET" && url.pathname === "/api/reports/members") {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    await handle(res, async () => ({ members: await getMemberParticipationReport() }));
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/reports/overview") {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    await handle(res, () => getOverviewReport());
    return true;
  }

  return false;
};
