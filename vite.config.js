/**
 * @file vite.config.js
 * @summary Configuracao do Vite.
 * @responsibility Ajustar host local e proxy da API durante desenvolvimento.
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./tests/setup-ui.js",
    include: ["tests/ui/**/*.test.{js,jsx}"],
  },
});
