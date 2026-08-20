/**
 * @file scripts/seedEscalaClaims.mjs
 * @summary Semeia o audit log com claims de vaga de escala (timestamps realistas).
 * @responsibility Dar dados ao analytics de "tempo para encher" da escala — o seed
 * em massa (PUT /api/escala) nao passa pelo fluxo de claim, entao nenhum timestamp
 * de preenchimento existe. Aqui inserimos um `claim_escala_slot` por vaga preenchida,
 * com `created_at` escalonado entre a abertura e o fechamento do evento.
 *
 * Tambem reescreve o `created_at` das RESPOSTAS de presenca: elas entram pela rota
 * publica, que sempre carimba "agora", entao um seed rodado hoje deixa um evento de
 * abril com respostas de hoje e "tempo para preencher" de milhares de horas. Aqui cada
 * resposta e reposicionada dentro da janela do proprio evento (abertura -> fechamento,
 * limitado por agora), de forma estavel por (socio, formulario).
 *
 * Conecta direto no Postgres do Docker (precisa do created_at customizado, que as
 * rotas publicas nao permitem). Idempotente: limpa os claims anteriores e recalcula
 * os timestamps a partir da janela do evento, entao pode rodar quantas vezes quiser.
 *
 * @usage node scripts/seedEscalaClaims.mjs
 * @usage NSJB_PGHOST=192.168.15.55 NSJB_PGPASSWORD=... node scripts/seedEscalaClaims.mjs
 */

import pg from "pg";

const client = new pg.Client({
  host: process.env.NSJB_PGHOST || "127.0.0.1",
  port: Number(process.env.NSJB_PGPORT || 5432),
  user: process.env.NSJB_PGUSER || "nsjb",
  password: process.env.NSJB_PGPASSWORD || "nsjb",
  database: process.env.NSJB_PGDATABASE || "nsjb_forms",
});

const asArray = value => (Array.isArray(value) ? value : JSON.parse(value || "[]"));

// "Dificuldade" por titulo: seções chatas tendem a encher mais tarde (fração maior).
const sectionDifficulty = title => {
  const t = String(title || "").toLowerCase();
  if (t.includes("lixo") || t.includes("coleta")) return 0.9;
  if (t.includes("banheiro")) return 0.75;
  if (t.includes("limpeza")) return 0.6;
  if (t.includes("lanche")) return 0.45;
  return 0.3; // preparo do jantar etc. enchem cedo
};

let seed = 99;
const rng = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

const main = async () => {
  await client.connect();
  console.log("Conectado ao Postgres.");

  const { rows: assignments } = await client.query("SELECT form_id, sections_json FROM escala_assignments");
  const { rows: events } = await client.query("SELECT form_ids_json, opening, closing FROM events");

  const windowByFormId = new Map();
  for (const event of events) {
    const opening = event.opening ? new Date(event.opening) : null;
    const closing = event.closing ? new Date(event.closing) : null;
    if (!opening || Number.isNaN(opening.getTime())) continue;
    const end = closing && !Number.isNaN(closing.getTime()) && closing > opening
      ? closing
      : new Date(opening.getTime() + 6 * 60 * 60 * 1000); // fallback: 6h de janela
    for (const formId of asArray(event.form_ids_json)) {
      windowByFormId.set(Number(formId), { openingMs: opening.getTime(), windowMs: end.getTime() - opening.getTime() });
    }
  }

  await client.query("DELETE FROM audit_logs WHERE action = 'claim_escala_slot'");

  const insertSql = `
    INSERT INTO audit_logs (
      created_at, level, category, action, status, screen, actor_id, actor_name, actor_role,
      entity_type, entity_id, entity_label, message, metadata_json, request_id, ip_address, user_agent
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
  `;

  let inserted = 0;
  let skipped = 0;
  for (const assignment of assignments) {
    const formId = Number(assignment.form_id);
    const win = windowByFormId.get(formId);
    const sections = asArray(assignment.sections_json);
    for (let si = 0; si < sections.length; si++) {
      const section = sections[si];
      const difficulty = sectionDifficulty(section?.title);
      const slots = section?.slots || [];
      for (let sli = 0; sli < slots.length; sli++) {
        if (!String(slots[sli]?.person || "").trim()) continue;
        if (!win) { skipped++; continue; }
        // fração da janela: dificuldade + leve avanço por slot + jitter
        const fraction = Math.min(0.98, Math.max(0.02, difficulty + sli * 0.03 + (rng() - 0.5) * 0.2));
        const createdAt = new Date(win.openingMs + win.windowMs * fraction).toISOString();
        await client.query(insertSql, [
          createdAt, "info", "escala", "claim_escala_slot", "success", "public-escala", null, "Seed", null,
          "form", String(formId), `Escala ${formId}`, "Vaga de escala preenchida.",
          JSON.stringify({ formId, sectionIndex: si, slotIndex: sli }), null, null, null,
        ]);
        inserted++;
      }
    }
  }

  console.log(`Claims inseridos: ${inserted}${skipped ? ` (pulados sem janela: ${skipped})` : ""}.`);

  // --- Backdate das respostas de presenca ---
  // A rota publica carimba `created_at = agora`. Reposiciona cada resposta dentro da
  // janela do proprio evento, com um instante estavel por (socio, formulario): o mesmo
  // socio sempre responde igualmente cedo/tarde, entao o ranking de "responde rapido"
  // do BI para de mudar a cada reexecucao.
  const stableUnit = str => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ((h >>> 0) % 100000) / 100000;
  };

  const { rows: eventRows } = await client.query("SELECT id, form_ids_json, opening, closing, date FROM events");
  const nowMs = Date.now();
  const windowByForm = new Map();
  for (const event of eventRows) {
    const opening = event.opening ? new Date(event.opening) : null;
    const eventDate = event.date ? new Date(event.date) : null;
    const from = opening && !Number.isNaN(opening.getTime())
      ? opening
      : (eventDate && !Number.isNaN(eventDate.getTime()) ? new Date(eventDate.getTime() - 7 * 86400000) : null);
    if (!from) continue;
    const closing = event.closing ? new Date(event.closing) : null;
    const rawEnd = closing && !Number.isNaN(closing.getTime()) && closing > from
      ? closing
      : new Date(from.getTime() + 5 * 86400000);
    // Evento ainda aberto: ninguem respondeu no futuro.
    const end = new Date(Math.min(rawEnd.getTime(), nowMs));
    if (end <= from) continue;
    for (const formId of asArray(event.form_ids_json)) {
      windowByForm.set(Number(formId), { fromMs: from.getTime(), spanMs: end.getTime() - from.getTime() });
    }
  }

  const { rows: responseRows } = await client.query("SELECT id, form_id, respondent_name FROM responses");
  let backdated = 0;
  for (const row of responseRows) {
    const win = windowByForm.get(Number(row.form_id));
    if (!win) continue;
    // Distribuicao enviesada para o inicio: a maioria responde nos primeiros dias.
    const diligence = stableUnit(row.respondent_name || "x");
    const jitter = stableUnit(`${row.respondent_name}#${row.form_id}`);
    const fraction = Math.min(0.98, Math.max(0.01, Math.pow(diligence * 0.6 + jitter * 0.4, 1.8)));
    const createdAt = new Date(win.fromMs + win.spanMs * fraction).toISOString();
    await client.query(
      "UPDATE responses SET created_at = $1, updated_at = $1 WHERE id = $2",
      [createdAt, row.id],
    );
    await client.query(
      "UPDATE response_values SET created_at = $1, updated_at = $1 WHERE response_id = $2",
      [createdAt, row.id],
    ).catch(() => {});
    backdated++;
  }
  console.log(`Respostas reposicionadas na janela do evento: ${backdated}.`);

  // --- Participacao (read model congelado no encerramento) ---
  // Depois do backdate, o snapshot gravado no encerramento aponta para o horario
  // antigo. Recalcula a partir da propria resposta, sem inventar numero.
  const { rows: syncRows } = await client.query(`
    UPDATE event_participation ep
       SET responded_at = r.created_at,
           time_to_fill_minutes = GREATEST(0, ROUND(EXTRACT(EPOCH FROM (r.created_at - e.opening)) / 60))
      FROM responses r, events e
     WHERE ep.filled = true
       AND ep.event_id = e.id
       AND e.opening IS NOT NULL
       AND r.form_id = ep.form_id
       AND r.person_key = ep.person_key
    RETURNING ep.id
  `);
  console.log(`Snapshots de participacao sincronizados com as respostas: ${syncRows.length}.`);

  await client.end();
};

main().catch(async err => { console.error("Erro:", err.message); try { await client.end(); } catch {} process.exitCode = 1; });
