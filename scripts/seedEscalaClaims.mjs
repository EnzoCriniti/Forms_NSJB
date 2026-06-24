/**
 * @file scripts/seedEscalaClaims.mjs
 * @summary Semeia o audit log com claims de vaga de escala (timestamps realistas).
 * @responsibility Dar dados ao analytics de "tempo para encher" da escala — o seed
 * em massa (PUT /api/escala) nao passa pelo fluxo de claim, entao nenhum timestamp
 * de preenchimento existe. Aqui inserimos um `claim_escala_slot` por vaga preenchida,
 * com `created_at` escalonado entre a abertura e o fechamento do evento.
 *
 * Conecta direto no Postgres do Docker (precisa do created_at customizado, que a
 * rota de claim nao permite). Idempotente: limpa os claims anteriores.
 *
 * @usage node scripts/seedEscalaClaims.mjs
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

  // --- Tempo de resposta da presença ---
  // As respostas mock foram inseridas no momento do seed (semanas após a abertura
  // do evento), o que deixa o "tempo para preencher" irreal (centenas de horas).
  // Aqui regravamos `time_to_fill_minutes`/`responded_at` no read model com tempos
  // realistas e estáveis por sócio (alguns sempre rápidos, outros devagar).
  const { rows: openings } = await client.query("SELECT id, opening FROM events WHERE opening IS NOT NULL");
  const openingByEvent = new Map(openings.map(e => [e.id, new Date(e.opening)]));

  const stableUnit = str => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ((h >>> 0) % 100000) / 100000;
  };

  const { rows: filledRows } = await client.query(
    "SELECT id, event_id, person_name FROM event_participation WHERE filled = true",
  );
  let timed = 0;
  for (const row of filledRows) {
    const opening = openingByEvent.get(row.event_id);
    if (!opening || Number.isNaN(opening.getTime())) continue;
    // distribuição enviesada p/ rápido: a maioria responde em horas, alguns em dias.
    const base = stableUnit(row.person_name || "x");
    const jitter = rng();
    const minutes = Math.round(20 + Math.pow(base * 0.7 + jitter * 0.3, 2) * 3600); // ~20min a ~2.5 dias
    const respondedAt = new Date(opening.getTime() + minutes * 60000).toISOString();
    await client.query(
      "UPDATE event_participation SET time_to_fill_minutes = $1, responded_at = $2 WHERE id = $3",
      [minutes, respondedAt, row.id],
    );
    timed++;
  }
  console.log(`Tempos de resposta regravados: ${timed}.`);

  await client.end();
};

main().catch(async err => { console.error("Erro:", err.message); try { await client.end(); } catch {} process.exitCode = 1; });
