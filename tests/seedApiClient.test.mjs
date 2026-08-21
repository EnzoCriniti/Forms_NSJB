import assert from "node:assert/strict";
import test from "node:test";
import { createSeedApiClient } from "../scripts/seedApiClient.mjs";

const response = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: { get: () => null },
  json: async () => body,
});

test("renova a autenticacao e repete uma requisicao que recebeu 401", async () => {
  const calls = [];
  const replies = [
    response(200, { token: "inicial" }),
    response(401, { error: "Nao autenticado." }),
    response(200, { token: "renovado" }),
    response(200, { ok: true }),
  ];
  let reauthentications = 0;
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return replies.shift();
  };
  const client = createSeedApiClient({
    api: "http://example.test",
    username: "admin",
    password: "secret",
    fetchImpl,
    onReauthenticate: () => { reauthentications++; },
  });

  await client.authenticate();
  const result = await client.request("PUT", "/api/escala/15", { sections: [] });

  assert.deepEqual(result, { ok: true });
  assert.equal(reauthentications, 1);
  assert.equal(calls.length, 4);
  assert.equal(calls[1].options.headers.Authorization, "Bearer inicial");
  assert.equal(calls[3].options.headers.Authorization, "Bearer renovado");
  assert.equal(replies.length, 0);
});
