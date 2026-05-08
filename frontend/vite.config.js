/**
 * @file frontend/vite.config.js
 * @summary Configuracao do Vite para o frontend.
 * @responsibility Ajustar host local, proxy da API e testes de UI.
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const apiProxyTarget = process.env.NSJB_API_PROXY_TARGET || "http://127.0.0.1:8787";

export default defineConfig({
  plugins: [react()],
  root: path.resolve("frontend"),
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: [path.resolve("tests/setup-ui.js")],
    include: ["../tests/ui/**/*.test.{js,jsx}"],
  },
});
