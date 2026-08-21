export const createSeedApiClient = ({ api, username, password, fetchImpl = fetch, onReauthenticate = () => {} }) => {
  let token = "";

  const authenticate = async () => {
    const res = await fetchImpl(`${api}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.token) {
      throw new Error(`POST /api/auth/login -> ${res.status}: ${json.error || "token ausente"}`);
    }
    token = json.token;
    return json;
  };

  const request = async (method, path, body, extraHeaders = {}, retryAuthentication = true) => {
    const res = await fetchImpl(`${api}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extraHeaders,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (res.status === 401 && retryAuthentication && path !== "/api/auth/login") {
      onReauthenticate();
      await authenticate();
      return request(method, path, body, extraHeaders, false);
    }
    if (!res.ok) {
      const error = new Error(`${method} ${path} -> ${res.status}: ${json.error || JSON.stringify(json).slice(0, 200)}`);
      error.status = res.status;
      error.retryAfter = Number(res.headers.get("retry-after")) || 0;
      throw error;
    }
    return json;
  };

  return { authenticate, request };
};
