/**
 * @file tools/visual/screenshot-local.mjs
 * @summary Runner local de screenshot do app.
 * @responsibility Subir API + Vite, autenticar opcionalmente e capturar PNG via navegador headless do sistema.
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const nodeExec = process.execPath;
const clientPort = 4173;
const apiPort = 8787;
const browserPort = 9222;
const clientUrl = `http://127.0.0.1:${clientPort}`;
const apiUrl = `http://127.0.0.1:${apiPort}`;
const storageSessionKey = "nsjb_forms_mvp_session";
const storageThemeKey = "nsjb_forms_mvp_theme";

const args = parseArgs(process.argv.slice(2));
const outputPath = path.resolve(root, args.out || "screenshots/app.png");
const browserPath = resolveBrowserPath();
const tempProfileDir = fs.mkdtempSync(path.join(os.tmpdir(), "nsjb-forms-shot-"));

const children = [];
const cleanupTasks = [];

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("exit", () => {
  for (const task of cleanupTasks) task();
});

main().catch(error => {
  console.error(error?.stack || String(error));
  process.exitCode = 1;
}).finally(async () => {
  await shutdown();
});

async function main() {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const apiAlreadyRunning = await probeUrl(`${apiUrl}/api/health`, body => body?.ok === true);
  if (!apiAlreadyRunning) {
    const serverChild = spawn(nodeExec, [path.join(root, "server", "index.mjs")], {
      cwd: root,
      stdio: "inherit",
    });
    children.push(serverChild);
  }

  const clientAlreadyRunning = await probeUrl(clientUrl, body => typeof body === "string" && body.toLowerCase().includes("<!doctype html"), false);
  if (!clientAlreadyRunning) {
    const viteChild = spawn(nodeExec, [
      path.join(root, "node_modules", "vite", "bin", "vite.js"),
      "--host",
      "127.0.0.1",
      "--port",
      String(clientPort),
      "--strictPort",
    ], {
      cwd: root,
      stdio: "inherit",
    });
    children.push(viteChild);
  }

  await waitForUrl(`${apiUrl}/api/health`, body => body?.ok === true, 30000);
  await waitForUrl(clientUrl, body => typeof body === "string" && body.toLowerCase().includes("<!doctype html"), 30000, false);

  const browserChild = spawn(browserPath, [
    "--headless=new",
    `--remote-debugging-port=${browserPort}`,
    `--user-data-dir=${tempProfileDir}`,
    "--hide-scrollbars",
    "--disable-gpu",
    "about:blank",
  ], {
    cwd: root,
    stdio: "ignore",
    windowsHide: true,
  });
  children.push(browserChild);
  cleanupTasks.push(() => fs.rmSync(tempProfileDir, { recursive: true, force: true }));

  await waitForUrl(`http://127.0.0.1:${browserPort}/json/version`, body => Boolean(body?.webSocketDebuggerUrl), 15000);

  const version = await fetchJson(`http://127.0.0.1:${browserPort}/json/version`);
  const cdp = new CdpClient(version.webSocketDebuggerUrl);
  await cdp.open();

  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });

  await cdp.send("Page.enable", {}, sessionId);
  await cdp.send("Runtime.enable", {}, sessionId);
  await cdp.send("Network.enable", {}, sessionId);
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: Number(args.width || 1440),
    height: Number(args.height || 1080),
    deviceScaleFactor: Number(args.scale || 1),
    mobile: false,
    screenWidth: Number(args.width || 1440),
    screenHeight: Number(args.height || 1080),
  }, sessionId);

  await navigate(cdp, sessionId, clientUrl);

  if (args.auth) {
    const authPayload = await loginForRole(args.auth);
    const storedSession = JSON.stringify({
      user: authPayload.user,
      token: authPayload.token,
      expiresAt: authPayload.expiresAt || null,
    });
    await cdp.send("Runtime.evaluate", {
      expression: `localStorage.setItem(${JSON.stringify(storageSessionKey)}, ${JSON.stringify(storedSession)});`,
    }, sessionId);
  }

  if (args.theme) {
    await cdp.send("Runtime.evaluate", {
      expression: `localStorage.setItem(${JSON.stringify(storageThemeKey)}, ${JSON.stringify(args.theme)});`,
    }, sessionId);
  }

  await navigate(cdp, sessionId, buildTargetUrl());

  if (args.action) {
    await cdp.send("Runtime.evaluate", {
      expression: args.action,
      awaitPromise: true,
    }, sessionId);
  }

  if (args.selector) {
    await waitForSelector(cdp, sessionId, args.selector, 15000);
  }

  await wait(Number(args.wait || 1200));

  const screenshot = await cdp.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
  }, sessionId);
  fs.writeFileSync(outputPath, Buffer.from(screenshot.data, "base64"));

  console.log(`Screenshot salvo em ${outputPath}`);
  await cdp.close();
}

function buildTargetUrl() {
  const hash = args.hash
    ? args.hash.startsWith("#")
      ? args.hash
      : `#${args.hash}`
    : "";
  const pathname = args.path ? (args.path.startsWith("/") ? args.path : `/${args.path}`) : "/";
  return `${clientUrl}${pathname}${hash}`;
}

async function loginForRole(role) {
  const credentials = role === "viewer"
    ? { username: "viewer", password: "viewer123" }
    : { username: "admin", password: "admin123" };
  const response = await fetch(`${apiUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || `Falha ao autenticar como ${role}.`);
  }
  return payload;
}

async function navigate(cdp, sessionId, url) {
  const load = cdp.waitForEvent("Page.loadEventFired", event => event.sessionId === sessionId, 15000);
  await cdp.send("Page.navigate", { url }, sessionId);
  await load;
}

async function waitForSelector(cdp, sessionId, selector, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const result = await cdp.send("Runtime.evaluate", {
      expression: `Boolean(document.querySelector(${JSON.stringify(selector)}))`,
      returnByValue: true,
    }, sessionId);
    if (result?.result?.value === true) return;
    await wait(200);
  }
  throw new Error(`Timeout esperando selector: ${selector}`);
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const part = argv[index];
    if (!part.startsWith("--")) continue;
    const key = part.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      continue;
    }
    parsed[key] = next;
    index += 1;
  }
  return parsed;
}

function resolveBrowserPath() {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  const found = candidates.find(candidate => fs.existsSync(candidate));
  if (!found) {
    throw new Error("Nao foi encontrado Chrome ou Edge instalados para captura headless.");
  }
  return found;
}

async function waitForUrl(url, predicate, timeoutMs, asJson = true) {
  const started = Date.now();
  let lastError = null;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      const payload = asJson ? await response.json() : await response.text();
      if (predicate(payload, response)) return payload;
    } catch (error) {
      lastError = error;
    }
    await wait(250);
  }
  throw new Error(`Timeout aguardando ${url}${lastError ? `: ${lastError.message}` : ""}`);
}

async function probeUrl(url, predicate, asJson = true) {
  try {
    const response = await fetch(url);
    const payload = asJson ? await response.json() : await response.text();
    return predicate(payload, response);
  } catch {
    return false;
  }
}

async function fetchJson(url) {
  const response = await fetch(url);
  return response.json();
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function shutdown() {
  while (children.length > 0) {
    const child = children.pop();
    if (child && !child.killed) {
      child.kill("SIGTERM");
    }
  }
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.nextId = 1;
    this.pending = new Map();
    this.eventQueue = [];
    this.eventWaiters = [];
  }

  async open() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", event => {
      const payload = JSON.parse(String(event.data));
      if (payload.id) {
        const pending = this.pending.get(payload.id);
        if (!pending) return;
        this.pending.delete(payload.id);
        if (payload.error) pending.reject(new Error(payload.error.message || "Erro CDP"));
        else pending.resolve(payload.result);
        return;
      }
      this.eventQueue.push(payload);
      this.flushWaiters();
    });
  }

  async close() {
    if (!this.ws) return;
    this.ws.close();
  }

  send(method, params = {}, sessionId = undefined) {
    const id = this.nextId++;
    const message = { id, method, params };
    if (sessionId) message.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(message));
    });
  }

  waitForEvent(method, predicate = () => true, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const waiterRecord = {
        method,
        predicate,
        resolve: event => {
          clearTimeout(timeout);
          resolve(event);
        },
      };
      const timeout = setTimeout(() => {
        this.eventWaiters = this.eventWaiters.filter(waiter => waiter !== waiterRecord);
        reject(new Error(`Timeout aguardando evento ${method}`));
      }, timeoutMs);
      this.eventWaiters.push(waiterRecord);
      this.flushWaiters();
    });
  }

  flushWaiters() {
    this.eventWaiters = this.eventWaiters.filter(waiter => {
      const index = this.eventQueue.findIndex(event => event.method === waiter.method && waiter.predicate(event));
      if (index === -1) return true;
      const [event] = this.eventQueue.splice(index, 1);
      waiter.resolve(event);
      return false;
    });
  }
}
