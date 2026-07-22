/**
 * @file frontend/vite.config.js
 * @summary Configuracao do Vite para o frontend.
 * @responsibility Ajustar host local, proxy da API e testes de UI.
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const apiProxyTarget = process.env.NSJB_API_PROXY_TARGET || "http://127.0.0.1:8787";
const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const packageMetadata = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

const resolveGitCommit = () => {
  if (process.env.GIT_COMMIT) return process.env.GIT_COMMIT.slice(0, 8);
  try {
    return execFileSync("git", ["rev-parse", "--short=8", "HEAD"], {
      cwd: repositoryRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "dev";
  }
};

const gitCommit = resolveGitCommit();

export default defineConfig({
  plugins: [react()],
  root: path.resolve("frontend"),
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(packageMetadata.version),
    "import.meta.env.VITE_GIT_COMMIT": JSON.stringify(gitCommit),
  },
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
