/**
 * @file tests/rateLimiter.test.mjs
 * @summary Testa o limitador de taxa em memoria.
 * @responsibility Garantir contagem por chave, bloqueio acima do teto e reset por janela.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { createRateLimiter, resetRateLimiterState } from "../backend/core/rateLimiter.mjs";

test("permite ate o teto e bloqueia o excedente na mesma janela", () => {
  resetRateLimiterState();
  const limiter = createRateLimiter({ name: "t1", windowMs: 60_000, max: 3 });

  assert.equal(limiter.take("ip-a").allowed, true);
  assert.equal(limiter.take("ip-a").allowed, true);
  assert.equal(limiter.take("ip-a").allowed, true);
  const blocked = limiter.take("ip-a");
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds > 0);
});

test("conta cada chave (IP) de forma isolada", () => {
  resetRateLimiterState();
  const limiter = createRateLimiter({ name: "t2", windowMs: 60_000, max: 1 });

  assert.equal(limiter.take("ip-a").allowed, true);
  assert.equal(limiter.take("ip-a").allowed, false);
  assert.equal(limiter.take("ip-b").allowed, true);
});

test("libera novamente apos a janela expirar", () => {
  resetRateLimiterState();
  let now = 1_000;
  const realNow = Date.now;
  Date.now = () => now;
  try {
    const limiter = createRateLimiter({ name: "t3", windowMs: 1_000, max: 1 });
    assert.equal(limiter.take("ip-a").allowed, true);
    assert.equal(limiter.take("ip-a").allowed, false);
    now += 1_001;
    assert.equal(limiter.take("ip-a").allowed, true);
  } finally {
    Date.now = realNow;
  }
});
