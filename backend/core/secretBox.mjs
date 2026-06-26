/**
 * @file backend/core/secretBox.mjs
 * @summary Cifra simetrica de segredos em repouso (AES-256-GCM).
 * @responsibility Proteger segredos guardados no banco (ex.: token do Twilio) de
 * quem tiver apenas acesso de leitura ao Postgres. A chave vem de
 * `NSJB_SECRET_KEY` (env) e nunca fica junto dos dados.
 *
 * Formato do envelope: `enc:v1:<iv b64>:<tag b64>:<ciphertext b64>`.
 * `decryptSecret` aceita valores legados em texto puro (sem o prefixo) e os
 * devolve como estao — assim a migracao acontece na proxima gravacao.
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { SECRET_KEY } from "../config.mjs";

const PREFIX = "enc:v1:";
let warned = false;

/** Deriva uma chave de 32 bytes da env; sem env, usa um fallback de dev com aviso. */
const resolveKey = () => {
  if (SECRET_KEY) return scryptSync(SECRET_KEY, "nsjb-secret-box", 32);
  if (!warned) {
    console.warn("[secretBox] NSJB_SECRET_KEY ausente: usando chave de desenvolvimento. Defina em producao.");
    warned = true;
  }
  return scryptSync("nsjb-dev-fallback-key", "nsjb-secret-box", 32);
};

export const isEncrypted = value => typeof value === "string" && value.startsWith(PREFIX);

/** Cifra um texto; string vazia continua vazia (nada a proteger). */
export const encryptSecret = plaintext => {
  const text = String(plaintext ?? "");
  if (!text) return "";
  if (isEncrypted(text)) return text;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", resolveKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${ciphertext.toString("base64")}`;
};

/** Decifra um envelope; valores legados em texto puro voltam como estao. */
export const decryptSecret = value => {
  const text = String(value ?? "");
  if (!isEncrypted(text)) return text;
  try {
    const [, , ivB64, tagB64, dataB64] = text.split(":");
    const decipher = createDecipheriv("aes-256-gcm", resolveKey(), Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]).toString("utf8");
  } catch (error) {
    console.error("[secretBox] Falha ao decifrar segredo:", error.message);
    return "";
  }
};
