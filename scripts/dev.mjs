/**
 * @file scripts/dev.mjs
 * @summary Runner de desenvolvimento local.
 * @responsibility Subir API Node e Vite em paralelo no ambiente local.
 */

import { spawn } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const nodeExec = process.execPath;

const children = [
  spawn(nodeExec, [path.join(root, "backend", "index.mjs")], { stdio: "inherit" }),
  spawn(nodeExec, [path.join(root, "node_modules", "vite", "bin", "vite.js"), "--config", path.join(root, "frontend", "vite.config.js"), "--host", "0.0.0.0", "--port", "5173", "--strictPort"], { stdio: "inherit" }),
];

const shutdown = signal => {
  for (const child of children) {
    if (!child.killed) child.kill(signal);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

for (const child of children) {
  child.on("exit", code => {
    if (code && code !== 0) {
      shutdown("SIGTERM");
      process.exit(code);
    }
  });
}
