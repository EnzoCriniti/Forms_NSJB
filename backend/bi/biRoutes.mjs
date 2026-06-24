/**
 * @file backend/bi/biRoutes.mjs
 * @summary Rotas do modulo de BI.
 * @responsibility Expor metricas agregadas de participacao para administradores.
 */

import { sendJson } from "../core/http.mjs";
import { requireCapability, sendKnownError } from "../routes/requestHelpers.mjs";
import {
  getDashboardReport,
  getEscalaAnalytics,
  getMemberDetail,
  getOverviewReport,
  getParticipationMatrix,
  getTimelineReport,
} from "./reportsService.mjs";

const MEMBER_DETAIL_PREFIX = "/api/reports/members/";

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
  if (req.method === "GET" && url.pathname === "/api/reports/overview") {
    const auth = await requireCapability(req, res, "reports.view");
    if (!auth) return true;
    await handle(res, () => getOverviewReport());
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/reports/dashboard") {
    const auth = await requireCapability(req, res, "reports.view");
    if (!auth) return true;
    await handle(res, () => getDashboardReport());
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/reports/timeline") {
    const auth = await requireCapability(req, res, "reports.view");
    if (!auth) return true;
    await handle(res, () => getTimelineReport());
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/reports/escala") {
    const auth = await requireCapability(req, res, "reports.view");
    if (!auth) return true;
    await handle(res, () => getEscalaAnalytics());
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/reports/matrix") {
    const auth = await requireCapability(req, res, "reports.view");
    if (!auth) return true;
    await handle(res, () => getParticipationMatrix());
    return true;
  }

  if (req.method === "GET" && url.pathname.startsWith(MEMBER_DETAIL_PREFIX)) {
    const auth = await requireCapability(req, res, "reports.view");
    if (!auth) return true;
    const personKey = decodeURIComponent(url.pathname.slice(MEMBER_DETAIL_PREFIX.length));
    await handle(res, () => getMemberDetail(personKey));
    return true;
  }

  return false;
};
