/**
 * @file src/lib/storage.js
 * @summary Persistencia leve no navegador.
 * @responsibility Manter sessao e tema locais sem depender da API.
 */

export const loadStored = (key, fallback) => {
  try {
    if (typeof localStorage === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(fallback) && !Array.isArray(parsed) ? fallback : parsed;
  } catch {
    return fallback;
  }
};

export const persist = (key, value) => {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // MVP local: se o navegador bloquear storage, a tela segue funcionando em memoria.
  }
};
