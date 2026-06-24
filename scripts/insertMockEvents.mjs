/**
 * @file scripts/insertMockEvents.mjs
 * @summary Popula o banco com eventos e formulários simulados para testes.
 * @usage node scripts/insertMockEvents.mjs [--api http://localhost:8787]
 */

const API_BASE = process.argv.find(arg => arg.startsWith("http")) || "http://localhost:8787";

const COLORS = ["#ffcdd2", "#bbdefb", "#f8bbd0", "#c8e6c9", "#ffe0b2", "#d1c4e9"];

// Seções de escala reutilizáveis
const SECOES_COMPLETA = [
  { title: "Preparação do Jantar. Servir às 17h", color: COLORS[0], slots: [{ role: "Responsável", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }] },
  { title: "Limpeza Após o Jantar", color: COLORS[0], slots: [{ role: "Responsável", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }] },
  { title: "Preparação do Lanche Após a Sessão", color: COLORS[0], slots: [{ role: "Responsável", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }] },
  { title: "Limpeza da cozinha após o lanche", color: COLORS[0], slots: [{ role: "Responsável", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }] },
  { title: "Limpeza do banheiro antes da sessão - Masculino", color: COLORS[1], slots: [{ role: "Responsável", person: "" }, { role: "Auxiliar", person: "" }] },
  { title: "Limpeza do banheiro antes da sessão - Feminino", color: COLORS[2], slots: [{ role: "Responsável", person: "" }, { role: "Auxiliar", person: "" }] },
  { title: "Limpeza do banheiro depois da sessão - Masculino", color: COLORS[1], slots: [{ role: "Responsável", person: "" }, { role: "Auxiliar", person: "" }] },
  { title: "Limpeza do banheiro depois da sessão - Feminino", color: COLORS[2], slots: [{ role: "Responsável", person: "" }, { role: "Auxiliar", person: "" }] },
  { title: "Coleta e organização do lixo (dia e noite)", color: COLORS[3], slots: [{ role: "Responsável", person: "" }, { role: "Auxiliar", person: "" }] },
];

const SECOES_ENXUTA = [
  { title: "Preparação do Jantar. Servir às 17h", color: COLORS[0], slots: [{ role: "Responsável", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }] },
  { title: "Limpeza Após o Jantar", color: COLORS[0], slots: [{ role: "Responsável", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }] },
  { title: "Preparação do Lanche Após a Sessão", color: COLORS[0], slots: [{ role: "Responsável", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }] },
  { title: "Limpeza da cozinha após o lanche", color: COLORS[0], slots: [{ role: "Responsável", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }] },
];

// Definições de campos de presença
const CAMPOS_SESSAO_ESCALA = [
  { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
  { id: 2, type: "yes_no", label: "15h - Apresentação DMC", required: true, show: true, total: true },
  { id: 3, type: "yes_no", label: "18h - Jantar", required: true, show: true, total: true },
  { id: 4, type: "yes_no", label: "20h - Sessão", required: true, show: true, total: true },
  { id: 5, type: "number", label: "Crianças (1-11 anos)", required: false, show: true, total: true },
  { id: 6, type: "number", label: "Jovens (12-17 anos)", required: false, show: true, total: true },
  { id: 7, type: "number", label: "Visitantes adultos", required: false, show: true, total: true },
];

const CAMPOS_INSTRUTIVA = [
  { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
  { id: 2, type: "yes_no", label: "20h - Sessão", required: true, show: true, total: true },
  { id: 3, type: "number", label: "Crianças (1-11 anos)", required: false, show: true, total: true },
  { id: 4, type: "number", label: "Jovens (12-17 anos)", required: false, show: true, total: true },
];

const CAMPOS_BENEFICENTE = [
  { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
  { id: 2, type: "yes_no", label: "Presença no evento", required: true, show: true, total: true },
  { id: 3, type: "number", label: "Crianças (1-11 anos)", required: false, show: true, total: true },
  { id: 4, type: "number", label: "Jovens (12-17 anos)", required: false, show: true, total: true },
  { id: 5, type: "number", label: "Visitantes adultos", required: false, show: true, total: true },
];

const CAMPOS_DIRECAO = [
  { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
  { id: 2, type: "yes_no", label: "20h - Sessão da Direção", required: true, show: true, total: true },
];

// Plano de eventos simulados: cada item descreve um evento e seus forms
const PLANO = [
  {
    evento: { title: "Sessão de Escala", description: "Sessão operacional com presença do núcleo e escala da Organ.", date: "2026-06-20", opening: "2026-06-16T08:00", closing: "2026-06-20T15:00", status: "publicado" },
    forms: [
      { type: "presenca", statusForm: "aberto", sessionName: "Sessão de Escala", titleSuffix: "20/06/2026", desc: "Prezada Irmandade, por favor preencha sua presença para a sessão de escala.", closingText: "Este formulário não está mais aceitando respostas.", labels: [1], campos: CAMPOS_SESSAO_ESCALA },
      { type: "escala_organ", statusForm: "aberto", sessionName: "Sessão de Escala", titleSuffix: "20/06/2026", desc: "Escala completa da Organ com todas as funções de preparo, limpeza e coleta.", closingText: "Esta escala não está mais aceitando inscrições.", labels: [1], secoes: SECOES_COMPLETA },
    ],
  },
  {
    evento: { title: "Sessão de Escala", description: "Sessão operacional — formulários em preparação.", date: "2026-07-18", opening: "2026-07-14T08:00", closing: "2026-07-18T15:00", status: "pronto" },
    forms: [
      { type: "presenca", statusForm: "rascunho", sessionName: "Sessão de Escala", titleSuffix: "18/07/2026", desc: "Prezada Irmandade, por favor preencha sua presença para a sessão de escala.", closingText: "Este formulário não está mais aceitando respostas.", labels: [1], campos: CAMPOS_SESSAO_ESCALA },
      { type: "escala_organ", statusForm: "rascunho", sessionName: "Sessão de Escala", titleSuffix: "18/07/2026", desc: "Escala completa da Organ com todas as funções de preparo, limpeza e coleta.", closingText: "Esta escala não está mais aceitando inscrições.", labels: [1], secoes: SECOES_COMPLETA },
    ],
  },
  {
    evento: { title: "Sessão de Escala", description: "Sessão em planejamento inicial.", date: "2026-08-15", opening: "2026-08-11T08:00", closing: "2026-08-15T15:00", status: "rascunho" },
    forms: [
      { type: "presenca", statusForm: "rascunho", sessionName: "Sessão de Escala", titleSuffix: "15/08/2026", desc: "Prezada Irmandade, por favor preencha sua presença para a sessão de escala.", closingText: "Este formulário não está mais aceitando respostas.", labels: [1], campos: CAMPOS_SESSAO_ESCALA },
      { type: "escala_organ", statusForm: "rascunho", sessionName: "Sessão de Escala", titleSuffix: "15/08/2026", desc: "Escala simplificada da Organ apenas com preparo e limpeza.", closingText: "Esta escala não está mais aceitando inscrições.", labels: [1], secoes: SECOES_ENXUTA },
    ],
  },
  {
    evento: { title: "Sessão Instrutiva", description: "Sessão instrutiva com apresentações dos graus intermediários.", date: "2026-06-27", opening: "2026-06-23T08:00", closing: "2026-06-27T18:00", status: "publicado" },
    forms: [
      { type: "presenca", statusForm: "aberto", sessionName: "Sessão Instrutiva", titleSuffix: "27/06/2026", desc: "Confirmação de presença para a sessão instrutiva.", closingText: "Este formulário não está mais aceitando respostas.", labels: [5], campos: CAMPOS_INSTRUTIVA },
    ],
  },
  {
    evento: { title: "Sessão Instrutiva", description: "Sessão instrutiva — preparação em andamento.", date: "2026-07-25", opening: "2026-07-21T08:00", closing: "2026-07-25T18:00", status: "pronto" },
    forms: [
      { type: "presenca", statusForm: "rascunho", sessionName: "Sessão Instrutiva", titleSuffix: "25/07/2026", desc: "Confirmação de presença para a sessão instrutiva.", closingText: "Este formulário não está mais aceitando respostas.", labels: [5], campos: CAMPOS_INSTRUTIVA },
    ],
  },
  {
    evento: { title: "Sessão da Direção", description: "Reunião da Diretoria com deliberações administrativas.", date: "2026-06-14", opening: "2026-06-10T08:00", closing: "2026-06-14T18:00", status: "publicado" },
    forms: [
      { type: "presenca", statusForm: "aberto", sessionName: "Sessão da Direção", titleSuffix: "14/06/2026", desc: "Confirmação de presença para a sessão da Diretoria.", closingText: "Este formulário não está mais aceitando respostas.", labels: [4], campos: CAMPOS_DIRECAO },
      { type: "escala_organ", statusForm: "aberto", sessionName: "Sessão da Direção", titleSuffix: "14/06/2026", desc: "Escala da Organ para a sessão da Diretoria.", closingText: "Esta escala não está mais aceitando inscrições.", labels: [4], secoes: SECOES_ENXUTA },
    ],
  },
  {
    evento: { title: "Sessão Anual", description: "Sessão Anual — grande evento com apresentações e homenagens.", date: "2026-09-05", opening: "2026-09-01T08:00", closing: "2026-09-05T18:00", status: "rascunho" },
    forms: [
      { type: "presenca", statusForm: "rascunho", sessionName: "Sessão Anual", titleSuffix: "05/09/2026", desc: "Confirmação de presença para a Sessão Anual.", closingText: "Este formulário não está mais aceitando respostas.", labels: [2], campos: CAMPOS_SESSAO_ESCALA },
      { type: "escala_organ", statusForm: "rascunho", sessionName: "Sessão Anual", titleSuffix: "05/09/2026", desc: "Escala completa da Organ para a Sessão Anual.", closingText: "Esta escala não está mais aceitando inscrições.", labels: [2], secoes: SECOES_COMPLETA },
    ],
  },
  {
    evento: { title: "Evento Beneficente", description: "Evento encerrado — resultados disponíveis no histórico.", date: "2026-05-17", opening: "2026-05-12T08:00", closing: "2026-05-16T23:59", status: "encerrado" },
    forms: [
      { type: "presenca", statusForm: "fechado", sessionName: "Evento Beneficente", titleSuffix: "17/05/2026", desc: "Confirmação de presença para o evento beneficente.", closingText: "O prazo de preenchimento deste evento foi encerrado.", labels: [6], campos: CAMPOS_BENEFICENTE },
    ],
  },
  {
    evento: { title: "Sessão Extra", description: "Sessão extraordinária encerrada — acesso apenas ao histórico.", date: "2026-06-07", opening: "2026-06-03T08:00", closing: "2026-06-06T23:59", status: "encerrado" },
    forms: [
      { type: "presenca", statusForm: "fechado", sessionName: "Sessão Extra", titleSuffix: "07/06/2026", desc: "Confirmação de presença para a sessão extraordinária.", closingText: "Este formulário foi encerrado.", labels: [3], campos: CAMPOS_INSTRUTIVA },
    ],
  },
];

// Helpers HTTP
const postJson = async (path, body, token) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}: ${json.error || JSON.stringify(json)}`);
  return json;
};

const putJson = async (path, body, token) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`PUT ${path} → ${res.status}: ${json.error || JSON.stringify(json)}`);
  return json;
};

const main = async () => {
  console.log(`Conectando a ${API_BASE}...`);

  // Health check
  const health = await fetch(`${API_BASE}/api/health`).catch(() => null);
  if (!health?.ok) throw new Error("Backend nao esta acessivel. Verifique se esta rodando.");
  console.log("Backend online.\n");

  // Login
  const { token } = await postJson("/api/auth/login", { username: "admin", password: "admin123" });
  console.log("Autenticado como admin.\n");

  let eventosInseridos = 0;
  let formsInseridos = 0;

  for (const plano of PLANO) {
    const { evento, forms } = plano;
    const formIds = [];

    for (const form of forms) {
      const isEscala = form.type === "escala_organ";
      const title = isEscala
        ? `Escala da Organ - ${form.titleSuffix}`
        : `Presença ${form.sessionName} - ${form.titleSuffix}`;

      const payload = {
        id: 0,
        type: form.type,
        status: form.statusForm,
        title,
        sessionName: form.sessionName,
        description: form.desc,
        labels: form.labels,
        totalExpected: isEscala ? 0 : 148,
        date: evento.date,
        closing: evento.closing,
        closingText: form.closingText,
        fieldDefinitions: isEscala ? [] : form.campos,
        scaleSections: isEscala ? form.secoes.map(s => ({ title: s.title, responsaveis: s.slots.filter(sl => sl.role === "Responsável").length, auxiliares: s.slots.filter(sl => sl.role === "Auxiliar").length })) : [],
        resultsConfig: {},
      };

      const { form: savedForm } = await postJson("/api/forms", payload, token);
      formIds.push(savedForm.id);
      formsInseridos++;
      console.log(`  [form] ${title} (id=${savedForm.id})`);

      if (isEscala) {
        await putJson(`/api/escala/${savedForm.id}`, { sections: form.secoes }, token);
        console.log(`  [escala] seções salvas para form ${savedForm.id}`);
      }
    }

    // Criar evento
    const eventPayload = {
      id: 0,
      title: evento.title,
      description: evento.description,
      date: evento.date,
      opening: evento.opening,
      closing: evento.closing,
      status: evento.status,
      formIds,
    };

    const { event: savedEvent } = await postJson("/api/events", eventPayload, token);
    eventosInseridos++;

    // Publicar se status for publicado
    if (evento.status === "publicado") {
      await postJson(`/api/events/${savedEvent.id}/publish`, {}, token);
      console.log(`[evento] "${evento.title} - ${evento.date}" (id=${savedEvent.id}) → publicado`);
    } else {
      console.log(`[evento] "${evento.title} - ${evento.date}" (id=${savedEvent.id}) → ${evento.status}`);
    }

    console.log("");
  }

  console.log(`Concluido: ${eventosInseridos} eventos e ${formsInseridos} formularios inseridos.`);
};

main().catch(err => {
  console.error("Erro:", err.message);
  process.exitCode = 1;
});
