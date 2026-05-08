/**
 * @file backend/index.mjs
 * @summary Ponto de entrada da API local.
 * @responsibility Subir servidor HTTP, inicializar seed e delegar rotas.
 */

import { databaseInfo } from "./database/index.mjs";
import { API_PORT } from "./config.mjs";
import { createAppServer } from "./app.mjs";
import { startFormLifecycleOrchestrator } from "./orchestrator/formLifecycleOrchestrator.mjs";

const server = await createAppServer();
const stopOrchestrator = startFormLifecycleOrchestrator();

server.listen(API_PORT, "0.0.0.0", () => {
  console.log(`NSJB API em http://127.0.0.1:${API_PORT}`);
  console.log(`${databaseInfo.driver.toUpperCase()}: ${databaseInfo.path || "n/a"}`);
});

const shutdown = () => {
  stopOrchestrator();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
