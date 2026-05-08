/**
 * @file scripts/load-local.mjs
 * @summary Runner simples de carga local.
 * @responsibility Simular envios sequenciais e concorrentes para validar resposta e bootstrap.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { performance } from "node:perf_hooks";

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const makeTempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), "nsjb-forms-load-"));

const waitForHealth = async baseUrl => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const res = await fetch(`${baseUrl}/api/health`);
      if (res.ok) return true;
    } catch {
      // retry
    }
    await wait(150);
  }
  return false;
};

const startServer = async () => {
  const tempDir = makeTempDir();
  const port = 8900 + Math.floor(Math.random() * 200);
  const dbPath = path.join(tempDir, "load.sqlite");
  const child = spawn(process.execPath, ["backend/index.mjs"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NSJB_API_PORT: String(port),
      NSJB_DB_PATH: dbPath,
    },
    stdio: "ignore",
  });

  const baseUrl = `http://127.0.0.1:${port}`;
  const ready = await waitForHealth(baseUrl);
  if (!ready) {
    child.kill("SIGTERM");
    fs.rmSync(tempDir, { recursive: true, force: true });
    throw new Error("Servidor local de carga nao iniciou.");
  }

  return {
    baseUrl,
    dbPath,
    tempDir,
    stop: async () => {
      if (!child.killed) child.kill("SIGTERM");
      await wait(200);
      fs.rmSync(tempDir, { recursive: true, force: true });
    },
  };
};

const postJson = (baseUrl, pathname, body, method = "POST") => fetch(`${baseUrl}${pathname}`, {
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const createTestForm = async baseUrl => {
  const res = await postJson(baseUrl, "/api/forms", {
    type: "presenca",
    status: "aberto",
    title: `Carga Local ${Date.now()}`,
    sessionName: "Carga Local",
    labels: [],
    totalExpected: 0,
    fieldDefinitions: [
      { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
      { id: 2, type: "yes_no", label: "Presente?", required: true, show: true, total: true },
      { id: 3, type: "number", label: "Convidados", required: false, show: true, total: true },
      { id: 4, type: "text", label: "Observacao", required: false, show: true, total: false },
    ],
    resultsConfig: {
      searchEnabled: true,
      showLinkedRoster: true,
      totalsLayout: [{ fieldId: 2, style: "bar" }, { fieldId: 3, style: "metric" }],
    },
    scaleSections: [],
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.error || "Falha ao criar formulario de teste.");
  }

  const payload = await res.json();
  return payload.form;
};

const sendResponse = async (baseUrl, formId, name, index) => {
  const res = await postJson(baseUrl, "/api/responses", {
    formId,
    respondentName: name,
    respondentGrau: `G${String(index % 5).padStart(2, "0")}`,
    values: {
      1: `G${String(index % 5).padStart(2, "0")} - ${name}`,
      2: index % 2 === 0 ? "Sim" : "Nao",
      3: index % 3,
      4: `Linha ${index}`,
    },
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.error || `Falha ao salvar resposta ${name}.`);
  }

  return res.json();
};

const runPhase = async ({ baseUrl, formId, label, total, concurrent = 1, offset = 0 }) => {
  const startedAt = performance.now();
  let errors = 0;
  let sent = 0;

  if (concurrent <= 1) {
    for (let index = 0; index < total; index += 1) {
      const name = `${label}-${String(offset + index + 1).padStart(3, "0")}`;
      try {
        await sendResponse(baseUrl, formId, name, offset + index);
        sent += 1;
      } catch (error) {
        errors += 1;
        console.error(`[${label}] erro em ${name}: ${error.message}`);
      }
    }
  } else {
    for (let cursor = 0; cursor < total; cursor += concurrent) {
      const batch = Array.from({ length: Math.min(concurrent, total - cursor) }, (_, batchIndex) => {
        const absoluteIndex = offset + cursor + batchIndex;
        const name = `${label}-${String(absoluteIndex + 1).padStart(3, "0")}`;
        return sendResponse(baseUrl, formId, name, absoluteIndex)
          .then(() => { sent += 1; })
          .catch(error => {
            errors += 1;
            console.error(`[${label}] erro em ${name}: ${error.message}`);
          });
      });
      await Promise.all(batch);
    }
  }

  const elapsedMs = performance.now() - startedAt;
  return {
    label,
    total,
    sent,
    errors,
    elapsedMs,
    averageMs: total > 0 ? elapsedMs / total : 0,
  };
};

const main = async () => {
  const server = await startServer();
  const startedAt = performance.now();

  try {
    const form = await createTestForm(server.baseUrl);
    const sequential = await runPhase({
      baseUrl: server.baseUrl,
      formId: form.id,
      label: "seq",
      total: 100,
      concurrent: 1,
      offset: 0,
    });
    const parallel = await runPhase({
      baseUrl: server.baseUrl,
      formId: form.id,
      label: "par",
      total: 20,
      concurrent: 20,
      offset: 100,
    });

    const responsesRes = await fetch(`${server.baseUrl}/api/forms/${form.id}/responses`);
    const bootstrapRes = await fetch(`${server.baseUrl}/api/bootstrap`);
    const responsesPayload = await responsesRes.json();
    const bootstrapPayload = await bootstrapRes.json();
    const totalElapsedMs = performance.now() - startedAt;
    const totalSent = sequential.sent + parallel.sent;
    const totalErrors = sequential.errors + parallel.errors;

    console.log("NSJB Forms local load test");
    console.log(`Form id: ${form.id}`);
    console.log(`Total sent: ${totalSent}`);
    console.log(`Errors: ${totalErrors}`);
    console.log(`Elapsed total: ${Math.round(totalElapsedMs)} ms`);
    console.log(`Average per send: ${Math.round((totalElapsedMs / Math.max(totalSent, 1)) * 10) / 10} ms`);
    console.log(`Responses stored: ${responsesPayload.responses?.length || 0}`);
    console.log(`Bootstrap forms: ${bootstrapPayload.forms?.length || 0}`);
    console.log(`Sequential phase: ${Math.round(sequential.elapsedMs)} ms for ${sequential.sent}/${sequential.total}`);
    console.log(`Parallel phase: ${Math.round(parallel.elapsedMs)} ms for ${parallel.sent}/${parallel.total} (batch 20)`);

    if (totalErrors > 0) process.exitCode = 1;
  } finally {
    await server.stop();
  }
};

main().catch(error => {
  console.error(error?.stack || error?.message || error);
  process.exitCode = 1;
});
