/**
 * @file backend/core/rateLimiter.mjs
 * @summary Limitador de taxa em memoria por chave (ex.: IP).
 * @responsibility Proteger rotas publicas de flood/abuso sem dependencia externa.
 *
 * Janela fixa: conta requisicoes por chave dentro de `windowMs` e bloqueia acima
 * de `max`. Como o backend roda em um unico processo (Docker), o estado em memoria
 * e suficiente nesta fase; se escalar para multiplas instancias, trocar por um
 * store compartilhado (ex.: Redis) mantendo esta mesma interface.
 */

const buckets = new Map();

/** Cria um limitador isolado (cada rota pode ter o seu) com janela e teto proprios. */
export const createRateLimiter = ({ windowMs = 60_000, max = 30, name = "default" } = {}) => {
  const take = key => {
    const now = Date.now();
    const id = `${name}:${key || "anon"}`;
    const entry = buckets.get(id);
    if (!entry || entry.resetAt <= now) {
      buckets.set(id, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: max - 1, retryAfterSeconds: 0 };
    }
    if (entry.count >= max) {
      return { allowed: false, remaining: 0, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
    }
    entry.count += 1;
    return { allowed: true, remaining: max - entry.count, retryAfterSeconds: 0 };
  };
  return { take };
};

/** Remove buckets expirados; chamar periodicamente para nao crescer indefinidamente. */
export const pruneRateLimiterBuckets = (now = Date.now()) => {
  for (const [id, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(id);
  }
};

/** Apenas para testes: zera todo o estado em memoria. */
export const resetRateLimiterState = () => buckets.clear();
