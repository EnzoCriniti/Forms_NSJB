/**
 * @file backend/routes/teamPeriodsRoutes.mjs
 * @summary Rotas de periodos de equipes.
 */

import { sendJson } from "../core/http.mjs";
import { deleteTeamPeriod, getTeamPeriodSummary, getTeamPeriods, saveTeamPeriod } from "../services/teamPeriodsService.mjs";
import { validateDeleteId, validateTeamPeriodPayload } from "../validators/payloadValidators.mjs";
import { readBody, requireCapability, sendKnownError } from "./requestHelpers.mjs";

export const handleTeamPeriodsRoutes = async (req, res, url) => {
  if (req.method === "GET" && url.pathname === "/api/team-periods") {
    const auth = await requireCapability(req, res, "teams.view");
    if (!auth) return true;
    try {
      sendJson(res, 200, { teamPeriods: await getTeamPeriods() });
    } catch (error) {
      if (!sendKnownError(res, error)) {
        sendJson(res, error.statusCode || 400, { error: error.message, code: error.code || undefined });
      }
    }
    return true;
  }

  if (req.method === "GET" && url.pathname.startsWith("/api/team-periods/") && url.pathname.endsWith("/summary")) {
    const auth = await requireCapability(req, res, "teams.view");
    if (!auth) return true;
    const periodId = validateDeleteId(url.pathname.split("/")[3], "Id do periodo");
    try {
      sendJson(res, 200, { summary: await getTeamPeriodSummary(periodId) });
    } catch (error) {
      if (!sendKnownError(res, error)) {
        sendJson(res, error.statusCode || 400, { error: error.message, code: error.code || undefined });
      }
    }
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/team-periods") {
    const body = await readBody(req);
    const auth = await requireCapability(req, res, "teams.manage");
    if (!auth) return true;
    try {
      validateTeamPeriodPayload(body);
      sendJson(res, 200, { teamPeriod: await saveTeamPeriod(body) });
    } catch (error) {
      if (!sendKnownError(res, error)) {
        sendJson(res, error.statusCode || 400, { error: error.message, code: error.code || undefined });
      }
    }
    return true;
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/team-periods/")) {
    const auth = await requireCapability(req, res, "teams.manage");
    if (!auth) return true;
    const periodId = validateDeleteId(url.pathname.split("/").pop(), "Id do periodo");
    try {
      await deleteTeamPeriod(periodId);
      sendJson(res, 200, { ok: true });
    } catch (error) {
      if (!sendKnownError(res, error)) {
        sendJson(res, error.statusCode || 400, { error: error.message, code: error.code || undefined });
      }
    }
    return true;
  }

  return false;
};
