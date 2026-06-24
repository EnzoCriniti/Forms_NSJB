/**
 * @file scripts/reseedDashboard.mjs
 * @summary Re-seed coerente dos dados de BI do dashboard.
 * @responsibility Gerar respostas de presenca e preencher escalas usando os NOMES
 * REAIS da base de socios (casam por personKey), e recapturar os snapshots de
 * participacao dos eventos encerrados para que o dashboard mostre dados de verdade.
 *
 * Diferente dos scripts antigos (insertMockResponses / _fillRemaining), este:
 *  - usa a base real (GET /api/bootstrap), nao uma lista ficticia de nomes;
 *  - descobre os ids de formulario dinamicamente (sem ids hardcoded);
 *  - insere respostas ANTES de encerrar e recaptura o snapshot (toggle de status),
 *    porque o snapshot e congelado no encerramento.
 *
 * @usage node scripts/reseedDashboard.mjs [http://localhost:8787]
 */

const API = process.argv.find(a => a.startsWith("http")) || "http://localhost:8787";

// rng deterministico (Lehmer) para reprodutibilidade
let seed = 1337;
const rng = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const chance = p => rng() < p;

// hash estavel de nome -> [0,1], para "diligencia" consistente por pessoa
const stableUnit = str => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 100000) / 100000;
};

const shuffle = arr => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const req = async (method, path, body, token) => {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${json.error || JSON.stringify(json)}`);
  return json;
};

// Probabilidade de uma pessoa preencher presenca: base por grau x diligencia individual.
const GRAU_BASE = { CI: 0.60, CDC: 0.72, QS: 0.82, QM: 0.88 };
const fillProbability = person => {
  const base = GRAU_BASE[person.grau] ?? 0.7;
  const diligence = 0.6 + stableUnit(person.name) * 0.7; // [0.6, 1.3]
  return Math.max(0.05, Math.min(0.98, base * diligence));
};

// Monta values validos a partir das fieldDefinitions do form.
const buildValues = (form, person) => {
  const present = chance(0.92); // quase sempre presente quando responde
  const values = {};
  for (const field of form.fieldDefinitions || []) {
    const key = String(field.id);
    if (field.type === "person_select") {
      values[key] = `${person.grau} - ${person.name}`;
    } else if (field.type === "yes_no") {
      if (field.required) values[key] = present ? "Sim" : "Não";
      else if (chance(0.85)) values[key] = present ? "Sim" : "Não";
    } else if (field.type === "number") {
      values[key] = chance(0.12) ? 1 + Math.floor(rng() * 2) : 0;
    } else if (field.type === "text" && field.required) {
      values[key] = "—";
    }
  }
  return values;
};

const main = async () => {
  console.log(`Conectando a ${API}...`);
  const health = await fetch(`${API}/api/health`).catch(() => null);
  if (!health?.ok) throw new Error("Backend nao esta acessivel.");

  const { token } = await req("POST", "/api/auth/login", { username: "admin", password: "admin123" });
  console.log("Autenticado como admin.\n");

  const boot = await req("GET", "/api/bootstrap", null, token);
  const people = (boot.people || []).filter(p => p.active !== false && p.name && p.grau);
  const formsById = new Map((boot.forms || []).map(f => [f.id, f]));
  const eventsById = new Map((boot.events || []).map(e => [e.id, e]));
  console.log(`Base: ${people.length} socios, ${formsById.size} forms, ${eventsById.size} eventos.\n`);

  // Eventos que terao historico de presenca (encerrados com respostas reais).
  // Inclui os 2 ja encerrados + 2 eventos passados hoje publicados.
  const HISTORY_EVENT_IDS = [19, 20, 17, 12];

  // 1) Respostas de presenca para cada evento de historico
  for (const eventId of HISTORY_EVENT_IDS) {
    const event = eventsById.get(eventId);
    if (!event) { console.warn(`evento ${eventId} nao encontrado, pulando.`); continue; }
    const presencaForms = (event.formIds || []).map(id => formsById.get(id)).filter(f => f?.type === "presenca");
    for (const form of presencaForms) {
      let inserted = 0;
      for (const person of people) {
        if (!chance(fillProbability(person))) continue;
        try {
          await req("POST", "/api/responses", {
            formId: form.id,
            respondentName: person.name,
            respondentGrau: person.grau,
            values: buildValues(form, person),
          }, token);
          inserted++;
        } catch (err) {
          console.warn(`  [resp] form ${form.id} ${person.name}: ${err.message}`);
        }
      }
      console.log(`Evento ${eventId} / form ${form.id} (${form.sessionName || form.title}): ${inserted} respostas.`);
    }
  }
  console.log("");

  // 2) Recapturar snapshot: garantir transicao -> encerrado (toggla quem ja esta encerrado)
  for (const eventId of HISTORY_EVENT_IDS) {
    const event = eventsById.get(eventId);
    if (!event) continue;
    const base = {
      id: event.id,
      title: event.title,
      description: event.description || "",
      date: event.date,
      opening: event.opening,
      closing: event.closing,
      formIds: event.formIds,
      eligibleGraus: event.eligibleGraus || [],
      messageConfig: event.messageConfig || {},
      publishedAt: event.publishedAt || null,
    };
    if (event.status === "encerrado") {
      await req("POST", "/api/events", { ...base, status: "publicado" }, token); // sai de encerrado
    }
    await req("POST", "/api/events", { ...base, status: "encerrado" }, token); // recaptura snapshot
    console.log(`Evento ${eventId} (${event.title}) -> encerrado, snapshot recapturado.`);
  }
  console.log("");

  // 3) Preencher escalas com NOMES REAIS (evita socios em branco no diretorio)
  const escalaForms = [...formsById.values()].filter(f => f.type === "escala_organ");
  for (const form of escalaForms) {
    let detail;
    try {
      detail = await req("GET", `/api/forms/${form.id}/escala`, null, token);
    } catch (err) {
      console.warn(`  [escala] GET ${form.id}: ${err.message}`);
      continue;
    }
    const sections = detail.sections || detail.escala?.sections || [];
    if (!sections.length) continue;
    const pool = shuffle(people.map(p => p.name));
    let idx = 0;
    let filled = 0;
    const nextName = () => pool[idx++ % pool.length];
    const newSections = sections.map(section => ({
      ...section,
      slots: (section.slots || []).map(slot => {
        // mantem ~65% das vagas preenchidas, com nomes reais e unicos
        const keep = chance(0.65);
        if (!keep) return { ...slot, person: "" };
        filled++;
        return { ...slot, person: nextName() };
      }),
    }));
    try {
      await req("PUT", `/api/escala/${form.id}`, { sections: newSections }, token);
      console.log(`Escala form ${form.id} (${form.sessionName || form.title}): ${filled} vagas preenchidas.`);
    } catch (err) {
      console.warn(`  [escala] PUT ${form.id}: ${err.message}`);
    }
  }

  // 4) Conferir o overview resultante
  const overview = await req("GET", "/api/reports/overview", null, token);
  const presFilled = overview.members.filter(m => m.presencaFilled > 0).length;
  const blanks = overview.members.filter(m => !m.personName).length;
  console.log("\n=== Overview pos-seed ===");
  console.log("presenca:", overview.presenca, `| ${overview.presenca.expected > 0 ? Math.round(overview.presenca.filled / overview.presenca.expected * 100) : 0}%`);
  console.log("escala:", overview.escala);
  console.log("members com presenca>0:", presFilled, "| members sem nome (deve ser 0):", blanks);
  console.log("\nConcluido.");
};

main().catch(err => { console.error("Erro:", err.message); process.exitCode = 1; });
