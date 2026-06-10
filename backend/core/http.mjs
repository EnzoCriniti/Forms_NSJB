/**
 * @file backend/core/http.mjs
 * @summary Utilitarios HTTP do backend local.
 * @responsibility Padronizar leitura de body JSON e resposta JSON.
 */

import { MAX_BODY_BYTES } from "../config.mjs";

export const sendJson = (res, status, payload) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
};

export const parseBody = (req, { maxBytes = MAX_BODY_BYTES } = {}) => new Promise((resolve, reject) => {
  const chunks = [];
  let size = 0;
  let aborted = false;

  req.on("data", chunk => {
    if (aborted) return;
    size += chunk.length;
    if (size > maxBytes) {
      aborted = true;
      chunks.length = 0;
      const error = new Error("Corpo da requisicao excede o limite permitido.");
      error.statusCode = 413;
      error.code = "PAYLOAD_TOO_LARGE";
      reject(error);
      return;
    }
    chunks.push(chunk);
  });
  req.on("end", () => {
    if (aborted) return;
    if (chunks.length === 0) {
      resolve({});
      return;
    }
    try {
      resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    } catch (error) {
      reject(error);
    }
  });
  req.on("error", error => {
    if (aborted) return;
    reject(error);
  });
});
