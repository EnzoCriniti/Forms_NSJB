/**
 * @file backend/core/http.mjs
 * @summary Utilitarios HTTP do backend local.
 * @responsibility Padronizar leitura de body JSON e resposta JSON.
 */

export const sendJson = (res, status, payload) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
};

export const parseBody = req => new Promise((resolve, reject) => {
  let raw = "";
  req.on("data", chunk => { raw += chunk; });
  req.on("end", () => {
    if (!raw) {
      resolve({});
      return;
    }
    try {
      resolve(JSON.parse(raw));
    } catch (error) {
      reject(error);
    }
  });
  req.on("error", reject);
});
