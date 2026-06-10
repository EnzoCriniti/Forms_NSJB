/**
 * @file backend/app.mjs
 * @summary Fabrica do servidor HTTP.
 * @responsibility Criar a API local sem acoplar subida de porta ao ponto de entrada.
 */

import http from "node:http";
import { randomUUID } from "node:crypto";
import { URL } from "node:url";
import { ensureSeedData } from "./seed.mjs";
import { sendJson } from "./core/http.mjs";
import { handleApiRequest } from "./routes/apiRouter.mjs";

export const createAppServer = async () => {
  await ensureSeedData();

  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    req.auditContext = {
      requestId: req.headers["x-request-id"] || randomUUID(),
      ipAddress: String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim() || null,
      userAgent: req.headers["user-agent"] || null,
    };
    try {
      const handled = await handleApiRequest(req, res, url);
      if (!handled) sendJson(res, 404, { error: "Not found" });
    } catch (error) {
      if (res.headersSent) return;
      if (error?.statusCode) {
        sendJson(res, error.statusCode, { error: error.message, code: error.code || undefined });
        return;
      }
      console.error("Erro nao tratado na API:", error);
      sendJson(res, 500, { error: "Erro interno do servidor." });
    }
  });
};
