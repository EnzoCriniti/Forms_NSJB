/**
 * @file scripts/seedSessoesDemo.mjs
 * @summary Popula o ambiente com eventos de sessao, escalas e presencas simuladas.
 * @responsibility Criar um conjunto coerente de eventos (sessoes de escala, instrutiva,
 * direcao, feijoada e eventos pontuais), cada um com formulario de presenca vinculado a
 * base central de socios, escala da Organ (noite) e escala de atividades no nucleo (dia),
 * e entao simular o preenchimento usando os NOMES REAIS da base sincronizada.
 *
 * Diferente de `insertMockEvents.mjs`, este script:
 *  - grava `memberBinding`/`selectionSource` nos campos `person_select`, mantendo o
 *    vinculo com a base de socios (sem isso o campo cai em modo "geral");
 *  - le a base real via `GET /api/bootstrap` e usa esses nomes nas escalas e respostas;
 *  - respeita a regra de um nome por escala e o limite de vagas por pessoa;
 *  - insere as respostas ANTES de encerrar o evento historico, porque o snapshot de
 *    participacao e congelado no encerramento.
 *
 * @usage node scripts/seedSessoesDemo.mjs [http://host:8787] [--user admin] [--pass admin123]
 * @usage NSJB_PGPASSWORD=... node scripts/seedSessoesDemo.mjs http://host:8787 --reset
 *
 * `--reset` apaga as respostas dos formularios de presenca deste seed antes de recriar.
 * Sem ele o script so ACRESCENTA: quem ja respondeu fica, e como as respostas de uma
 * rodada anterior podem ter vindo de outro sorteio, os percentuais so sobem. Com ele o
 * resultado e exatamente o que o plano descreve, rodando quantas vezes quiser. Precisa
 * das credenciais do Postgres (nao existe rota HTTP para apagar resposta, e nao deve
 * existir), lidas de NSJB_PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE.
 */

import { createSeedApiClient } from "./seedApiClient.mjs";

const API = process.argv.find(a => a.startsWith("http")) || "http://localhost:8787";
const argValue = (flag, fallback) => {
  const index = process.argv.indexOf(flag);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
};
const USER = argValue("--user", "admin");
const PASS = argValue("--pass", "admin123");
const RESET = process.argv.includes("--reset");

// ---------------------------------------------------------------------------
// rng deterministico (Lehmer), para o seed ser reproduzivel
// ---------------------------------------------------------------------------
let seed = 20260820;
const rng = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const chance = p => rng() < p;
const shuffle = arr => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
const stableUnit = str => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
};

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------
const { authenticate, request: req } = createSeedApiClient({
  api: API,
  username: USER,
  password: PASS,
  onReauthenticate: () => console.log("[auth] sessao expirada; autenticando novamente..."),
});

// `POST /api/responses` e rota publica com rate limit por IP (20/min, ver
// backend/routes/formRoutes.mjs, chave = x-forwarded-for). No mundo real cada
// socio responde do proprio celular, entao o seed manda um IP estavel por pessoa:
// o limitador continua valendo (nenhuma regra e desligada) e o audit log fica
// coerente, com um endereco distinto por respondente em vez de 300 vindos do
// mesmo lugar. O pacing por janela fica como rede de seguranca para o caso de
// varios socios caindo no mesmo bucket.
const RESPONSE_WINDOW_MS = 60_000;
const RESPONSE_MAX_PER_WINDOW = 18;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// IP estavel e deterministico por nome, na faixa privada 10.x.y.z.
const ipForPerson = name => {
  const unit = Math.floor(stableUnit(name) * 100000);
  return `10.${20 + (unit % 200)}.${(unit >> 3) % 254}.${1 + ((unit >> 7) % 253)}`;
};

const bucketHits = new Map();
const postResponsePaced = async (payload, clientIp) => {
  for (let attempt = 0; attempt < 5; attempt++) {
    const now = Date.now();
    const hits = (bucketHits.get(clientIp) || []).filter(t => now - t < RESPONSE_WINDOW_MS);
    if (hits.length >= RESPONSE_MAX_PER_WINDOW) {
      await sleep(RESPONSE_WINDOW_MS - (now - hits[0]) + 500);
      continue;
    }
    hits.push(now);
    bucketHits.set(clientIp, hits);
    try {
      return await req("POST", "/api/responses", payload, { "X-Forwarded-For": clientIp });
    } catch (error) {
      if (error.status !== 429) throw error;
      bucketHits.set(clientIp, []);
      await sleep((error.retryAfter || 60) * 1000 + 500);
    }
  }
  throw new Error("Rate limit persistente em /api/responses.");
};

// ---------------------------------------------------------------------------
// Campos de presenca
// ---------------------------------------------------------------------------
const NOME = {
  id: 1,
  type: "person_select",
  label: "Nome",
  required: true,
  show: true,
  total: false,
  memberBinding: { role: "primary", source: "members" },
  selectionSource: { kind: "members" },
};

const CAMPOS_SESSAO_ESCALA = [
  NOME,
  { id: 2, type: "yes_no", label: "09h - Atividades no Nucleo", required: true, show: true, total: true },
  { id: 3, type: "yes_no", label: "12h - Almoco", required: true, show: true, total: true },
  { id: 4, type: "yes_no", label: "15h - Apresentacao DMC", required: true, show: true, total: true },
  { id: 5, type: "yes_no", label: "18h - Jantar", required: true, show: true, total: true },
  { id: 6, type: "yes_no", label: "20h - Sessao", required: true, show: true, total: true },
  { id: 7, type: "number", label: "Criancas (1-11 anos)", required: false, show: true, total: true },
  { id: 8, type: "number", label: "Jovens (12-17 anos)", required: false, show: true, total: true },
  { id: 9, type: "number", label: "Visitantes adultos", required: false, show: true, total: true },
];

const CAMPOS_INSTRUTIVA = [
  NOME,
  { id: 2, type: "yes_no", label: "20h - Sessao Instrutiva", required: true, show: true, total: true },
  { id: 3, type: "number", label: "Criancas (1-11 anos)", required: false, show: true, total: true },
  { id: 4, type: "number", label: "Jovens (12-17 anos)", required: false, show: true, total: true },
];

const CAMPOS_DIRECAO = [
  NOME,
  { id: 2, type: "yes_no", label: "20h - Sessao da Direcao", required: true, show: true, total: true },
];

const CAMPOS_FEIJOADA = [
  NOME,
  { id: 2, type: "yes_no", label: "Vou a Feijoada", required: true, show: true, total: true },
  { id: 3, type: "yes_no", label: "Ajudo na montagem (a partir das 08h)", required: false, show: true, total: true },
  { id: 4, type: "number", label: "Convidados adultos", required: false, show: true, total: true },
  { id: 5, type: "number", label: "Criancas (1-11 anos)", required: false, show: true, total: true },
  { id: 6, type: "number", label: "Jovens (12-17 anos)", required: false, show: true, total: true },
  { id: 7, type: "number", label: "Marmitas para viagem", required: false, show: true, total: true },
];

const CAMPOS_MUTIRAO = [
  NOME,
  { id: 2, type: "yes_no", label: "08h - Periodo da manha", required: true, show: true, total: true },
  { id: 3, type: "yes_no", label: "13h - Periodo da tarde", required: true, show: true, total: true },
  { id: 4, type: "number", label: "Ajudantes que levo comigo", required: false, show: true, total: true },
];

const CAMPOS_BAZAR = [
  NOME,
  { id: 2, type: "yes_no", label: "Presenca no bazar", required: true, show: true, total: true },
  { id: 3, type: "number", label: "Convidados adultos", required: false, show: true, total: true },
  { id: 4, type: "number", label: "Criancas (1-11 anos)", required: false, show: true, total: true },
];

// ---------------------------------------------------------------------------
// Secoes de escala
// ---------------------------------------------------------------------------
const C = { cozinha: "#ffcdd2", masc: "#bbdefb", fem: "#f8bbd0", geral: "#c8e6c9", dia: "#ffe0b2", apoio: "#d1c4e9" };
const sec = (title, color, responsaveis, auxiliares) => ({
  title,
  color,
  slots: [
    ...Array.from({ length: responsaveis }, () => ({ role: "Responsavel", person: "" })),
    ...Array.from({ length: auxiliares }, () => ({ role: "Auxiliar", person: "" })),
  ],
});

// Escala da Organ: preparo, limpeza e coleta em torno da sessao da noite.
const ESCALA_ORGAN_COMPLETA = [
  sec("Preparacao do Jantar. Servir as 17h", C.cozinha, 1, 3),
  sec("Limpeza Apos o Jantar", C.cozinha, 1, 4),
  sec("Preparacao do Lanche Apos a Sessao", C.cozinha, 1, 6),
  sec("Limpeza da cozinha apos o lanche", C.cozinha, 1, 3),
  sec("Limpeza do banheiro antes da sessao - Masculino", C.masc, 1, 1),
  sec("Limpeza do banheiro antes da sessao - Feminino", C.fem, 1, 1),
  sec("Limpeza do banheiro depois da sessao - Masculino", C.masc, 1, 1),
  sec("Limpeza do banheiro depois da sessao - Feminino", C.fem, 1, 1),
  sec("Coleta e organizacao do lixo (dia e noite)", C.geral, 1, 1),
];

const ESCALA_ORGAN_ENXUTA = [
  sec("Preparacao do Jantar. Servir as 17h", C.cozinha, 1, 3),
  sec("Limpeza Apos o Jantar", C.cozinha, 1, 4),
  sec("Limpeza dos banheiros apos a sessao", C.geral, 1, 2),
];

// Atividades no nucleo durante o dia: manutencao, jardim, cozinha e acolhimento.
const ATIVIDADES_NUCLEO_DIA = [
  sec("07h - Abertura do nucleo e cafe da manha", C.dia, 1, 2),
  sec("08h - Limpeza do salao e da capela", C.dia, 1, 3),
  sec("09h - Jardim, horta e area externa", C.dia, 1, 4),
  sec("10h - Manutencao e pequenos reparos", C.apoio, 1, 2),
  sec("10h - Preparacao do almoco. Servir as 12h", C.cozinha, 1, 4),
  sec("13h - Limpeza da cozinha apos o almoco", C.cozinha, 1, 3),
  sec("14h - Recepcao e acolhimento de visitantes", C.apoio, 1, 2),
  sec("15h - Organizacao do estoque e da despensa", C.apoio, 1, 2),
];

const ATIVIDADES_MUTIRAO = [
  sec("08h - Lavagem do piso do salao", C.dia, 1, 4),
  sec("08h - Limpeza de vidros e luminarias", C.dia, 1, 3),
  sec("09h - Poda e capina da area externa", C.dia, 1, 4),
  sec("10h - Pintura de meio-fio e alambrado", C.apoio, 1, 3),
  sec("11h - Almoco do mutirao", C.cozinha, 1, 3),
  sec("13h - Organizacao do almoxarifado", C.apoio, 1, 2),
  sec("14h - Descarte e coleta de entulho", C.geral, 1, 2),
];

// Escala da Feijoada: evento pontual, dia inteiro, com caixa e salao.
const ESCALA_FEIJOADA = [
  sec("Vespera - Dessalga e separacao das carnes", C.cozinha, 1, 3),
  sec("06h - Panelas e fogo", C.cozinha, 2, 4),
  sec("08h - Acompanhamentos (arroz, couve, farofa)", C.cozinha, 1, 5),
  sec("09h - Montagem do salao e das mesas", C.dia, 1, 4),
  sec("10h - Sobremesas e bebidas", C.apoio, 1, 3),
  sec("11h - Caixa, fichas e retirada", C.apoio, 2, 2),
  sec("11h30 - Servir o buffet", C.cozinha, 1, 6),
  sec("14h - Limpeza do salao", C.geral, 1, 4),
  sec("15h - Limpeza da cozinha e das panelas", C.cozinha, 1, 4),
];

const DESC_ATIVIDADES = "Atividades no nucleo durante o dia: abertura, limpeza, jardim, manutencao, almoco e acolhimento. Escolha uma vaga por pessoa.";

// ---------------------------------------------------------------------------
// Plano de eventos
// ---------------------------------------------------------------------------
const presenca = (titulo, sessionName, campos, extra = {}) => ({
  kind: "presenca",
  title: titulo,
  sessionName,
  campos,
  ...extra,
});
const escala = (titulo, sessionName, secoes, extra = {}) => ({
  kind: "escala_organ",
  title: titulo,
  sessionName,
  secoes,
  ...extra,
});

const PLANO = [
  {
    evento: {
      title: "Sessao de Escala",
      description: "Sessao de escala com atividades no nucleo durante o dia e sessao a noite.",
      date: "2025-09-20",
      eligibleGraus: [],
      opening: "2025-09-08T08:00",
      closing: "2025-09-20T15:00",
      status: "encerrado",
      label: 1,
    },
    fill: { presenca: 0.58, escala: 0.68 },
    forms: [
      presenca("Presenca Sessao de Escala - 20/09/2025", "Sessao de Escala", CAMPOS_SESSAO_ESCALA, { statusForm: "fechado" }),
      escala("Escala da Organ - 20/09/2025", "Sessao de Escala", ESCALA_ORGAN_COMPLETA, { statusForm: "fechado" }),
      escala("Atividades no Nucleo - 20/09/2025", "Sessao de Escala", ATIVIDADES_NUCLEO_DIA, { statusForm: "fechado", desc: DESC_ATIVIDADES }),
    ],
  },
  {
    evento: {
      title: "Sessao Instrutiva",
      description: "Sessao instrutiva com apresentacoes dos graus intermediarios.",
      date: "2025-10-18",
      eligibleGraus: ["CDC", "CI"],
      opening: "2025-10-06T08:00",
      closing: "2025-10-18T18:00",
      status: "encerrado",
      label: 5,
    },
    fill: { presenca: 0.52, escala: 0.6 },
    forms: [
      presenca("Presenca Sessao Instrutiva - 18/10/2025", "Sessao Instrutiva", CAMPOS_INSTRUTIVA, { statusForm: "fechado" }),
      escala("Escala da Organ - 18/10/2025", "Sessao Instrutiva", ESCALA_ORGAN_ENXUTA, { statusForm: "fechado" }),
    ],
  },
  {
    evento: {
      title: "Sessao de Escala",
      description: "Sessao de escala com atividades no nucleo durante o dia e sessao a noite.",
      date: "2025-11-22",
      eligibleGraus: [],
      opening: "2025-11-10T08:00",
      closing: "2025-11-22T15:00",
      status: "encerrado",
      label: 1,
    },
    fill: { presenca: 0.64, escala: 0.72 },
    forms: [
      presenca("Presenca Sessao de Escala - 22/11/2025", "Sessao de Escala", CAMPOS_SESSAO_ESCALA, { statusForm: "fechado" }),
      escala("Escala da Organ - 22/11/2025", "Sessao de Escala", ESCALA_ORGAN_COMPLETA, { statusForm: "fechado" }),
      escala("Atividades no Nucleo - 22/11/2025", "Sessao de Escala", ATIVIDADES_NUCLEO_DIA, { statusForm: "fechado", desc: DESC_ATIVIDADES }),
    ],
  },
  {
    evento: {
      title: "Feijoada Beneficente",
      description: "Feijoada beneficente do nucleo: escala do dia inteiro, convidados e marmitas para viagem.",
      date: "2025-12-14",
      eligibleGraus: [],
      opening: "2025-11-24T08:00",
      closing: "2025-12-12T20:00",
      status: "encerrado",
      labelName: "Feijoada",
      labelColor: "#8d6e63",
    },
    fill: { presenca: 0.76, escala: 0.8 },
    forms: [
      presenca("Presenca Feijoada Beneficente - 14/12/2025", "Feijoada Beneficente", CAMPOS_FEIJOADA, { statusForm: "fechado", guests: true }),
      escala("Escala da Feijoada - 14/12/2025", "Feijoada Beneficente", ESCALA_FEIJOADA, { statusForm: "fechado", desc: "Escala historica da Feijoada Beneficente." }),
    ],
  },
  {
    evento: {
      title: "Sessao de Escala",
      description: "Sessao de escala com atividades no nucleo durante o dia e sessao a noite.",
      date: "2026-01-24",
      eligibleGraus: [],
      opening: "2026-01-12T08:00",
      closing: "2026-01-24T15:00",
      status: "encerrado",
      label: 1,
    },
    fill: { presenca: 0.69, escala: 0.75 },
    forms: [
      presenca("Presenca Sessao de Escala - 24/01/2026", "Sessao de Escala", CAMPOS_SESSAO_ESCALA, { statusForm: "fechado" }),
      escala("Escala da Organ - 24/01/2026", "Sessao de Escala", ESCALA_ORGAN_COMPLETA, { statusForm: "fechado" }),
      escala("Atividades no Nucleo - 24/01/2026", "Sessao de Escala", ATIVIDADES_NUCLEO_DIA, { statusForm: "fechado", desc: DESC_ATIVIDADES }),
    ],
  },
  {
    evento: {
      title: "Sessao Instrutiva",
      description: "Sessao instrutiva com apresentacoes dos graus intermediarios.",
      date: "2026-02-21",
      eligibleGraus: ["CDC", "CI"],
      opening: "2026-02-09T08:00",
      closing: "2026-02-21T18:00",
      status: "encerrado",
      label: 5,
    },
    fill: { presenca: 0.6, escala: 0.65 },
    forms: [
      presenca("Presenca Sessao Instrutiva - 21/02/2026", "Sessao Instrutiva", CAMPOS_INSTRUTIVA, { statusForm: "fechado" }),
      escala("Escala da Organ - 21/02/2026", "Sessao Instrutiva", ESCALA_ORGAN_ENXUTA, { statusForm: "fechado" }),
    ],
  },
  {
    evento: {
      title: "Mutirao de Limpeza do Nucleo",
      description: "Evento historico de manutencao e atividades no nucleo.",
      date: "2026-03-21",
      eligibleGraus: [],
      perfil: "trabalho",
      opening: "2026-03-02T08:00",
      closing: "2026-03-20T20:00",
      status: "encerrado",
      label: 3,
    },
    fill: { presenca: 0.42, escala: 0.7 },
    forms: [
      presenca("Presenca Mutirao de Limpeza - 21/03/2026", "Mutirao de Limpeza", CAMPOS_MUTIRAO, { statusForm: "fechado" }),
      escala("Atividades no Nucleo - Mutirao 21/03/2026", "Mutirao de Limpeza", ATIVIDADES_MUTIRAO, { statusForm: "fechado", desc: "Escala historica do mutirao de manutencao." }),
    ],
  },
  {
    evento: {
      title: "Sessao de Escala",
      description: "Sessao de escala com atividades no nucleo durante o dia e sessao a noite.",
      date: "2026-08-08",
      eligibleGraus: [],
      opening: "2026-08-03T08:00",
      closing: "2026-08-08T15:00",
      status: "encerrado",
      label: 1,
    },
    fill: { presenca: 1, escala: 0.85 },
    forms: [
      presenca("Presenca Sessao de Escala - 08/08/2026", "Sessao de Escala", CAMPOS_SESSAO_ESCALA, { statusForm: "fechado" }),
      escala("Escala da Organ - 08/08/2026", "Sessao de Escala", ESCALA_ORGAN_COMPLETA, { statusForm: "fechado" }),
      escala("Atividades no Nucleo - 08/08/2026", "Sessao de Escala", ATIVIDADES_NUCLEO_DIA, { statusForm: "fechado", desc: DESC_ATIVIDADES }),
    ],
  },
  {
    evento: {
      title: "Sessao de Escala",
      description: "Sessao de escala com atividades no nucleo durante o dia e sessao a noite.",
      date: "2026-08-22",
      eligibleGraus: [],
      opening: "2026-08-17T08:00",
      closing: "2026-08-22T15:00",
      status: "publicado",
      label: 1,
    },
    fill: { presenca: 0.62, escala: 0.7 },
    forms: [
      presenca("Presenca Sessao de Escala - 22/08/2026", "Sessao de Escala", CAMPOS_SESSAO_ESCALA, { statusForm: "aberto" }),
      escala("Escala da Organ - 22/08/2026", "Sessao de Escala", ESCALA_ORGAN_COMPLETA, { statusForm: "aberto" }),
      escala("Atividades no Nucleo - 22/08/2026", "Sessao de Escala", ATIVIDADES_NUCLEO_DIA, { statusForm: "aberto", desc: DESC_ATIVIDADES }),
    ],
  },
  {
    evento: {
      title: "Sessao Instrutiva",
      description: "Sessao instrutiva com apresentacoes dos graus intermediarios.",
      date: "2026-08-29",
      eligibleGraus: ["CDC", "CI"],
      opening: "2026-08-12T08:00",
      closing: "2026-08-29T18:00",
      status: "publicado",
      label: 5,
    },
    fill: { presenca: 0.48, escala: 0.55 },
    forms: [
      presenca("Presenca Sessao Instrutiva - 29/08/2026", "Sessao Instrutiva", CAMPOS_INSTRUTIVA, { statusForm: "aberto" }),
      escala("Escala da Organ - 29/08/2026", "Sessao Instrutiva", ESCALA_ORGAN_ENXUTA, { statusForm: "aberto" }),
    ],
  },
  {
    evento: {
      title: "Mutirao de Limpeza do Nucleo",
      description: "Evento pontual de manutencao: dia inteiro de atividades no nucleo, sem sessao a noite.",
      date: "2026-08-30",
      eligibleGraus: [],
      // Mutirao e trabalho puro: quem aparece e a base da hierarquia, nao o topo.
      perfil: "trabalho",
      opening: "2026-08-10T08:00",
      closing: "2026-08-29T20:00",
      status: "publicado",
      label: 3,
    },
    fill: { presenca: 0.35, escala: 0.6 },
    forms: [
      presenca("Presenca Mutirao de Limpeza - 30/08/2026", "Mutirao de Limpeza", CAMPOS_MUTIRAO, { statusForm: "aberto" }),
      escala("Atividades no Nucleo - Mutirao 30/08/2026", "Mutirao de Limpeza", ATIVIDADES_MUTIRAO, { statusForm: "aberto", desc: "Mutirao de manutencao do nucleo: escolha um posto da manha ou da tarde. Uma vaga por pessoa." }),
    ],
  },
  {
    evento: {
      title: "Sessao da Direcao",
      description: "Reuniao da Diretoria com deliberacoes administrativas.",
      date: "2026-09-05",
      opening: "2026-08-31T08:00",
      closing: "2026-09-05T18:00",
      status: "pronto",
      label: 4,
      eligibleGraus: ["QM", "CDC"],
    },
    fill: { presenca: 0, escala: 0.5 },
    forms: [
      presenca("Presenca Sessao da Direcao - 05/09/2026", "Sessao da Direcao", CAMPOS_DIRECAO, { statusForm: "rascunho" }),
      escala("Escala da Organ - 05/09/2026", "Sessao da Direcao", ESCALA_ORGAN_ENXUTA, { statusForm: "rascunho" }),
    ],
  },
  {
    evento: {
      title: "Feijoada Beneficente",
      description: "Feijoada beneficente do nucleo: escala do dia inteiro, convidados e marmitas para viagem.",
      date: "2026-09-13",
      eligibleGraus: [],
      opening: "2026-08-18T08:00",
      closing: "2026-09-10T20:00",
      status: "publicado",
      labelName: "Feijoada",
      labelColor: "#8d6e63",
    },
    fill: { presenca: 0.71, escala: 0.75 },
    forms: [
      presenca("Presenca Feijoada Beneficente - 13/09/2026", "Feijoada Beneficente", CAMPOS_FEIJOADA, { statusForm: "aberto", guests: true }),
      escala("Escala da Feijoada - 13/09/2026", "Feijoada Beneficente", ESCALA_FEIJOADA, { statusForm: "aberto", desc: "Escala da Feijoada Beneficente: cozinha, salao, caixa e limpeza ao longo do dia. Uma vaga por pessoa." }),
    ],
  },
  {
    evento: {
      title: "Sessao de Escala",
      description: "Sessao de escala em planejamento: escala e atividades ainda em aberto.",
      date: "2026-09-19",
      eligibleGraus: [],
      opening: "2026-09-14T08:00",
      closing: "2026-09-19T15:00",
      status: "pronto",
      label: 1,
    },
    fill: { presenca: 0, escala: 0.65 },
    forms: [
      presenca("Presenca Sessao de Escala - 19/09/2026", "Sessao de Escala", CAMPOS_SESSAO_ESCALA, { statusForm: "rascunho" }),
      escala("Escala da Organ - 19/09/2026", "Sessao de Escala", ESCALA_ORGAN_COMPLETA, { statusForm: "rascunho" }),
      escala("Atividades no Nucleo - 19/09/2026", "Sessao de Escala", ATIVIDADES_NUCLEO_DIA, { statusForm: "rascunho", desc: DESC_ATIVIDADES }),
    ],
  },
  {
    // Status "rascunho" so existe para evento SEM formulario vinculado
    // (normalizeStatus em backend/services/eventsService.mjs): assim que um
    // formulario e anexado, o evento sobe para "pronto". Este e o exemplo de
    // evento ainda em montagem.
    evento: {
      title: "Confraternizacao de Fim de Ano",
      description: "Evento em montagem: data reservada, formularios ainda nao criados.",
      date: "2026-12-13",
      eligibleGraus: [],
      opening: "2026-11-16T08:00",
      closing: "2026-12-11T20:00",
      status: "rascunho",
      labelName: "Confraternizacao",
      labelColor: "#6d4c41",
    },
    fill: { presenca: 0, escala: 0 },
    forms: [],
  },
  {
    evento: {
      title: "Bazar Beneficente",
      description: "Evento pontual: bazar beneficente no salao, com plantoes durante o dia.",
      date: "2026-09-27",
      eligibleGraus: [],
      opening: "2026-09-07T08:00",
      closing: "2026-09-25T20:00",
      status: "pronto",
      label: 6,
    },
    fill: { presenca: 0, escala: 0.7 },
    forms: [
      presenca("Presenca Bazar Beneficente - 27/09/2026", "Bazar Beneficente", CAMPOS_BAZAR, { statusForm: "rascunho", guests: true }),
      escala("Escala do Bazar - 27/09/2026", "Bazar Beneficente", ATIVIDADES_MUTIRAO.slice(0, 4), { statusForm: "rascunho" }),
    ],
  },
];

// Eventos historicos que ja existiam na base antes deste seed (mock antigo).
// Ficavam "encerrados com zero respostas", o que zera a presenca no BI e faz o
// painel mentir. Aqui eles sao preenchidos com nomes reais e reencerrados para
// recapturar o snapshot de participacao.
const HISTORICO = [
  { key: "sessao de escala|2026-04-25", presenca: 0.55, escala: 0.6, status: "encerrado" },
  { key: "evento beneficente|2026-04-26", presenca: 0.4, escala: 0.5, status: "encerrado" },
  { key: "sessao de escala|2026-05-02", presenca: 0.78, escala: 0.8, status: "encerrado" },
];

// ---------------------------------------------------------------------------
// Simulacao de preenchimento
// ---------------------------------------------------------------------------
// Probabilidade de resposta: base por grau x diligencia estavel da pessoa.
// Os graus sao uma HIERARQUIA, e ela e uma piramide: QM (12) > CDC (28) > QS (43) > CI (66).
// Duas curvas opostas correm por ela e e isso que o BI precisa mostrar:
//   - presenca sobe com o grau: quem esta no topo quase nunca falta;
//   - trabalho de escala DESCE com o grau: a base (CI) segura a escala, o topo
//     (QM/CDC) praticamente nao pega vaga.
// Um QM com cinco escalas, como o seed uniforme produzia, nao existe na vida real.
const GRAU_BASE = { CI: 0.82, QS: 0.85, CDC: 0.92, QM: 0.95 };

// Comprometimento: quanto o grau resiste a um evento pouco atrativo. Multiplicar
// todo mundo pelo mesmo fator achataria a hierarquia justamente onde ela aparece -
// o evento fraco e carregado pelo topo, e e disso que o painel precisa falar. Com
// expoente, um fator 0,4 vira 62% para o QM e 33% para o CI.
const GRAU_COMPROMISSO = { CI: 1, QS: 1.15, CDC: 1.6, QM: 2.2 };

// Evento de trabalho puro (mutirao) inverte a logica: quem trabalha e a base.
const ESCALA_BASE = { CI: 1, QS: 0.45, CDC: 0.1, QM: 0.03 };

/** Taxa esperada de preenchimento de um grau para um dado evento. */
const taxaDoGrau = (grau, factor, perfil = "presenca") => {
  if (perfil === "trabalho") {
    const peso = ESCALA_BASE[grau] ?? 0.5;
    return Math.max(0.01, Math.min(0.95, 0.9 * peso * factor));
  }
  const base = GRAU_BASE[grau] ?? 0.8;
  const commit = GRAU_COMPROMISSO[grau] ?? 1;
  return Math.max(0.02, Math.min(0.98, base * Math.pow(factor, 1 / commit)));
};

/**
 * Quem respondeu este formulario, por COTA e nao por sorteio independente.
 *
 * Com 12 QM na base, um sorteio por pessoa faz uma falta a mais virar 8 pontos no
 * grafico: o ruido engole a hierarquia justamente no grau que deveria lidera-la.
 * Aqui cada grau preenche exatamente a sua taxa, e quem entra sao os socios mais
 * assiduos - a assiduidade individual e estavel, entao os rankings do BI continuam
 * fazendo sentido. Um jitter por formulario evita que os conjuntos fiquem
 * perfeitamente encaixados (o evento de 50% sendo sempre a metade exata do de 100%).
 */
const selecionarRespondentes = (pessoas, formKey, factor, perfil = "presenca") => {
  const porGrau = new Map();
  for (const person of pessoas) {
    const lista = porGrau.get(person.grau) || [];
    lista.push(person);
    porGrau.set(person.grau, lista);
  }
  const ordem = person => stableUnit(person.name) * 0.75 + stableUnit(`${person.name}#${formKey}`) * 0.25;
  const escolhidos = new Set();
  for (const [grau, lista] of porGrau) {
    const alvo = Math.round(taxaDoGrau(grau, factor, perfil) * lista.length);
    for (const person of [...lista].sort((a, b) => ordem(a) - ordem(b)).slice(0, alvo)) {
      escolhidos.add(person.name);
    }
  }
  return escolhidos;
};

const buildValues = (campos, guests, person) => {
  const present = chance(0.9);
  const values = {};
  for (const field of campos) {
    const key = String(field.id);
    if (field.type === "person_select") {
      values[key] = `${person.grau} - ${person.name}`;
    } else if (field.type === "yes_no") {
      if (field.required) values[key] = present ? "Sim" : "Nao";
      else if (chance(0.8)) values[key] = present && chance(0.55) ? "Sim" : "Nao";
    } else if (field.type === "number") {
      const rate = guests ? 0.38 : 0.12;
      values[key] = present && chance(rate) ? 1 + Math.floor(rng() * 3) : 0;
    } else if (field.type === "text" && field.required) {
      values[key] = "-";
    }
  }
  return values;
};

// Mesma semantica de shared/grauEligibility.mjs: conjunto vazio = todos os graus.
const normalizeGrauToken = value => String(value || "").trim().normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
const filterByEligibleGraus = (people, eligibleGraus) => {
  const set = new Set((Array.isArray(eligibleGraus) ? eligibleGraus : []).map(normalizeGrauToken).filter(Boolean));
  if (!set.size) return people;
  return people.filter(person => set.has(normalizeGrauToken(person.grau)));
};

// Postos de coordenacao/atendimento: e onde CDC e QM aparecem quando aparecem.
const ehPostoDeCoordenacao = titulo => /recep|acolhi|caixa|ficha|coordena|estoque|despensa/i.test(String(titulo || ""));

/**
 * Sorteio ponderado e deterministico de uma vaga.
 * Corrida exponencial: cada candidato tira `-ln(u) / peso`, e o menor vence. Peso
 * maior = tende a sair antes. `u` vem do hash (pessoa, formulario, secao), entao o
 * resultado e sempre o mesmo para a mesma escala - reexecutar nao remonta a equipe.
 */
const pontuacaoEscala = (person, formKey, section, slot) => {
  let peso = ESCALA_BASE[person.grau] ?? 0.5;
  // Responsavel de secao e cargo: puxa para o grau mais alto, auxiliar para a base.
  if (slot.role === "Responsavel") peso *= { QM: 2, CDC: 3.5, QS: 2.5, CI: 0.55 }[person.grau] ?? 1;
  if (ehPostoDeCoordenacao(section.title)) peso *= { QM: 5, CDC: 6, QS: 1.5, CI: 0.4 }[person.grau] ?? 1;
  const u = Math.max(1e-6, stableUnit(`${person.name}#${formKey}#${section.title}#${slot.role}`));
  return -Math.log(u) / peso;
};

const fillEscalaSections = (sections, people, ratio, formKey = "") => {
  const disponiveis = new Set(people.map(p => p.name));
  const porNome = new Map(people.map(p => [p.name, p]));
  let filled = 0;
  return {
    sections: sections.map(section => ({
      ...section,
      slots: (section.slots || []).map(slot => {
        // A vaga so e disputada se sair no ratio de preenchimento da escala.
        if (!disponiveis.size || !chance(ratio)) return { ...slot, person: "" };
        let escolhido = null;
        let melhor = Infinity;
        for (const nome of disponiveis) {
          const pontos = pontuacaoEscala(porNome.get(nome), formKey, section, slot);
          if (pontos < melhor) { melhor = pontos; escolhido = nome; }
        }
        disponiveis.delete(escolhido);
        filled++;
        return { ...slot, person: escolhido };
      }),
    })),
    filled,
  };
};

// ---------------------------------------------------------------------------
const ensureLabel = async (labels, name, color) => {
  const existing = labels.find(l => l.name.toLowerCase() === name.toLowerCase());
  if (existing) return existing.id;
  const { labels: updated } = await req("POST", "/api/labels", { id: 0, name, color, createdBy: "Seed" });
  const created = updated.find(l => l.name.toLowerCase() === name.toLowerCase());
  console.log(`[label] "${name}" criada (id=${created.id})`);
  labels.push(created);
  return created.id;
};

/**
 * Apaga as respostas dos formularios informados, direto no Postgres.
 * So roda com --reset e so toca nos ids que este seed administra.
 */
const resetRespostas = async formIds => {
  if (!formIds.length) return 0;
  const { default: pg } = await import("pg");
  const client = new pg.Client({
    host: process.env.NSJB_PGHOST || "127.0.0.1",
    port: Number(process.env.NSJB_PGPORT || 5432),
    user: process.env.NSJB_PGUSER || "nsjb",
    password: process.env.NSJB_PGPASSWORD || "nsjb",
    database: process.env.NSJB_PGDATABASE || "nsjb_forms",
  });
  await client.connect();
  try {
    await client.query("DELETE FROM response_values WHERE form_id = ANY($1::int[])", [formIds]);
    const { rowCount } = await client.query("DELETE FROM responses WHERE form_id = ANY($1::int[])", [formIds]);
    return rowCount;
  } finally {
    await client.end();
  }
};

const main = async () => {
  console.log(`Conectando a ${API}...`);
  const health = await fetch(`${API}/api/health`).catch(() => null);
  if (!health?.ok) throw new Error("Backend nao esta acessivel.");
  await authenticate();
  console.log(`Autenticado como ${USER}.\n`);

  const boot = await req("GET", "/api/bootstrap");
  const people = (boot.people || []).filter(p => p.active !== false && p.name && p.grau);
  if (!people.length) throw new Error("Base de socios vazia. Sincronize a base antes de rodar o seed.");
  const labels = [...(boot.labels || [])];
  // Indices para re-execucao idempotente: o seed reaproveita evento/formulario
  // ja criado em vez de duplicar, o que permite retomar de uma execucao cortada
  // pelo rate limit.
  const formsByTitle = new Map((boot.forms || []).map(f => [String(f.title || "").toLowerCase(), f]));
  const eventsByKey = new Map((boot.events || []).map(e => [
    `${String(e.title || "").toLowerCase()}|${String(e.date || "").slice(0, 10)}`,
    e,
  ]));
  console.log(`Base: ${people.length} socios ativos, ${labels.length} classificacoes, ${formsByTitle.size} formularios existentes.\n`);

  if (RESET) {
    const titulosDoSeed = new Set(PLANO.flatMap(pl => pl.forms).filter(f => f.kind !== "escala_organ").map(f => f.title.toLowerCase()));
    const idsHistorico = new Set(HISTORICO.flatMap(alvo => {
      const evento = eventsByKey.get(alvo.key);
      return evento ? (evento.formIds || []) : [];
    }));
    const alvos = (boot.forms || [])
      .filter(f => f.type === "presenca" && (titulosDoSeed.has(String(f.title || "").toLowerCase()) || idsHistorico.has(f.id)))
      .map(f => f.id);
    const apagadas = await resetRespostas(alvos);
    console.log(`[reset] ${apagadas} respostas apagadas em ${alvos.length} formularios de presenca.`);
  }

  let eventosCriados = 0;
  let formsCriados = 0;
  let respostasCriadas = 0;
  let vagasPreenchidas = 0;

  for (const plano of PLANO) {
    const { evento, forms, fill } = plano;
    // O limitador de grau do evento e um CONJUNTO de graus esperados (vazio = todos).
    // Quem esta fora dele nao e convocado: nao entra na escala nem responde a presenca,
    // senao o denominador de "nao preencheu" do BI fica incoerente com os dados.
    const elegiveis = filterByEligibleGraus(people, evento.eligibleGraus);
    if (elegiveis.length !== people.length) {
      console.log(`  [graus] elegiveis: ${evento.eligibleGraus.join(", ")} -> ${elegiveis.length} de ${people.length} socios`);
    }
    const labelId = evento.labelName
      ? await ensureLabel(labels, evento.labelName, evento.labelColor || "#8d6e63")
      : evento.label;

    const formIds = [];
    const presencaForms = [];

    const dataBr = evento.date.split("-").reverse().join("/");

    for (const form of forms) {
      const isEscala = form.kind === "escala_organ";
      const payload = {
        id: 0,
        type: isEscala ? "escala_organ" : "presenca",
        status: form.statusForm,
        title: form.title,
        sessionName: form.sessionName,
        description: form.desc || (isEscala
          ? `Escala de funcoes para ${form.sessionName} em ${dataBr}. Escolha uma vaga por pessoa.`
          : `Prezada Irmandade, confirme sua presenca em ${form.sessionName} - ${dataBr}.`),
        labels: [labelId],
        totalExpected: isEscala ? 0 : elegiveis.length,
        date: evento.date,
        closing: evento.closing,
        closingText: isEscala
          ? "Esta escala nao esta mais aceitando inscricoes."
          : "Este formulario nao esta mais aceitando respostas.",
        fieldDefinitions: isEscala ? [] : form.campos,
        scaleSections: isEscala
          ? form.secoes.map(s => ({
              title: s.title,
              responsaveis: s.slots.filter(sl => sl.role === "Responsavel").length,
              auxiliares: s.slots.filter(sl => sl.role === "Auxiliar").length,
            }))
          : [],
        resultsConfig: isEscala
          ? { maxAssignmentsPerPerson: 1 }
          : {
              formMode: "nucleo",
              searchEnabled: true,
              showLinkedRoster: true,
              blockDuplicatePersonResponses: true,
              totalsLayout: form.campos
                .filter(f => f.total)
                .map(f => ({ fieldId: f.id, style: f.type === "yes_no" ? "split" : "number" })),
            },
      };

      // Re-execucao: reaproveita o formulario ja criado em vez de duplicar.
      const existingForm = formsByTitle.get(form.title.toLowerCase());
      let formId = existingForm?.id;
      if (formId) {
        console.log(`  [form] ${form.title} (id=${formId}, ja existia)`);
      } else {
        const { form: saved } = await req("POST", "/api/forms", payload);
        formId = saved.id;
        formsCriados++;
        console.log(`  [form] ${form.title} (id=${formId}, ${payload.type}/${form.statusForm})`);
      }
      formIds.push(formId);

      if (isEscala) {
        const ratio = fill.escala || 0;
        const current = await req("GET", `/api/forms/${formId}/escala`).catch(() => ({ sections: [] }));
        const jaPreenchida = (current.sections || []).some(s => (s.slots || []).some(sl => String(sl.person || "").trim()));
        if (jaPreenchida && !RESET) {
          console.log("    -> escala ja preenchida, mantida como esta");
        } else {
          const { sections, filled } = ratio > 0
            ? fillEscalaSections(form.secoes, elegiveis, ratio, form.title)
            : { sections: form.secoes, filled: 0 };
          await req("PUT", `/api/escala/${formId}`, { sections });
          vagasPreenchidas += filled;
          if (filled) console.log(`    -> ${filled} vagas preenchidas com nomes da base`);
        }
      } else if (form.statusForm !== "rascunho") {
        // Rascunho nao recebe resposta: um formulario nao publicado com respostas
        // nao existe no fluxo real e sujaria os totais.
        presencaForms.push({ id: formId, campos: form.campos, guests: form.guests === true });
      }
    }

    // O evento nasce em "pronto" quando o alvo e "encerrado": o snapshot de
    // participacao e congelado na transicao para encerrado, entao ele so pode
    // acontecer depois que as respostas ja estiverem gravadas.
    const targetStatus = evento.status;
    const createStatus = targetStatus === "encerrado" ? "pronto" : targetStatus;
    const existingEvent = eventsByKey.get(`${evento.title.toLowerCase()}|${evento.date}`);
    const eventPayload = {
      id: existingEvent?.id || 0,
      title: evento.title,
      description: evento.description,
      date: evento.date,
      opening: evento.opening,
      closing: evento.closing,
      status: createStatus,
      formIds,
      eligibleGraus: evento.eligibleGraus || [],
    };
    const { event: savedEvent } = await req("POST", "/api/events", eventPayload);
    if (!existingEvent) eventosCriados++;

    if (createStatus === "publicado") await req("POST", `/api/events/${savedEvent.id}/publish`, {});

    // Respostas de presenca
    const presencaRatio = fill.presenca || 0;
    if (presencaRatio > 0) {
      for (const form of presencaForms) {
        const existing = await req("GET", `/api/forms/${form.id}/responses`).catch(() => ({ responses: [] }));
        const jaResponderam = new Set((existing.responses || []).map(r => String(r.respondentName || "").trim().toLowerCase()));
        let inserted = 0;
        const respondentes = selecionarRespondentes(elegiveis, form.id, presencaRatio, evento.perfil);
        for (const person of elegiveis) {
          if (!respondentes.has(person.name)) continue;
          if (jaResponderam.has(person.name.trim().toLowerCase())) continue;
          try {
            await postResponsePaced({
              formId: form.id,
              respondentName: person.name,
              respondentGrau: person.grau,
              values: buildValues(form.campos, form.guests, person),
            }, ipForPerson(person.name));
            inserted++;
          } catch (error) {
            console.warn(`    [resp] ${person.name}: ${error.message}`);
          }
        }
        respostasCriadas += inserted;
        console.log(`    -> ${inserted} respostas de presenca no form ${form.id} (${jaResponderam.size} ja existiam)`);
      }
    }

    if (targetStatus === "encerrado") {
      // Sai de encerrado antes de reencerrar, senao o snapshot antigo permanece.
      if (savedEvent.status === "encerrado") {
        await req("POST", "/api/events", { ...eventPayload, id: savedEvent.id, status: "publicado" });
      }
      await req("POST", "/api/events", { ...eventPayload, id: savedEvent.id, status: "encerrado" });
      console.log(`[evento] "${evento.title} - ${evento.date}" (id=${savedEvent.id}) -> encerrado (snapshot capturado)`);
    } else {
      console.log(`[evento] "${evento.title} - ${evento.date}" (id=${savedEvent.id}) -> ${targetStatus}`);
    }
    console.log("");
  }

  // -------------------------------------------------------------------------
  // Backfill dos eventos historicos ja existentes na base.
  // -------------------------------------------------------------------------
  const bootAfter = await req("GET", "/api/bootstrap");
  const formsById = new Map((bootAfter.forms || []).map(f => [f.id, f]));
  const eventsAfter = new Map((bootAfter.events || []).map(e => [
    `${String(e.title || "").toLowerCase()}|${String(e.date || "").slice(0, 10)}`,
    e,
  ]));

  for (const alvo of HISTORICO) {
    const evento = eventsAfter.get(alvo.key);
    if (!evento) {
      console.log(`[historico] "${alvo.key}" nao existe na base, ignorado`);
      continue;
    }
    const elegiveis = filterByEligibleGraus(people, evento.eligibleGraus);
    console.log(`[historico] "${evento.title} - ${String(evento.date).slice(0, 10)}" (id=${evento.id})`);

    for (const formId of evento.formIds || []) {
      const form = formsById.get(formId);
      if (!form) continue;

      if (form.type === "escala_organ") {
        const current = await req("GET", `/api/forms/${formId}/escala`).catch(() => ({ sections: [] }));
        // Com --reset a equipe e refeita do zero, senao os nomes sorteados por uma
        // regra antiga (por exemplo, sem peso de grau) ficariam presos na escala.
        const sections = (current.sections || []).map(sec => (RESET
          ? { ...sec, slots: (sec.slots || []).map(sl => ({ ...sl, person: "" })) }
          : sec));
        const vazias = sections.flatMap(sec => sec.slots || []).filter(sl => !String(sl.person || "").trim()).length;
        if (!vazias || !alvo.escala) continue;
        // Nao remexe em quem ja esta escalado: so completa as vagas em branco,
        // respeitando a regra de um nome por escala.
        // O mock antigo deixou nomes repetidos na mesma escala, o que o backend
        // rejeita (409). Mantem a primeira ocorrencia e libera as demais vagas.
        const usados = new Set();
        const limpas = sections.map(sec => ({
          ...sec,
          slots: (sec.slots || []).map(sl => {
            const nome = String(sl.person || "").trim();
            if (!nome) return sl;
            if (usados.has(nome)) return { ...sl, person: "" };
            usados.add(nome);
            return sl;
          }),
        }));
        // Mesma regra ponderada por grau do plano principal, so que preservando
        // quem ja estava escalado.
        const livres = elegiveis.filter(pe => !usados.has(pe.name));
        const { sections: sorteadas } = fillEscalaSections(limpas, livres, alvo.escala, `historico-${formId}`);
        let preenchidas = 0;
        const novas = limpas.map((sec, si) => ({
          ...sec,
          slots: (sec.slots || []).map((sl, sli) => {
            if (String(sl.person || "").trim()) return sl;
            const nome = sorteadas[si].slots[sli].person;
            if (!nome) return sl;
            preenchidas++;
            return { ...sl, person: nome };
          }),
        }));
        await req("PUT", `/api/escala/${formId}`, { sections: novas });
        vagasPreenchidas += preenchidas;
        console.log(`    -> escala ${formId}: ${preenchidas} vagas completadas`);
        continue;
      }

      const campos = form.fieldDefinitions || [];
      if (!campos.length || !alvo.presenca) continue;
      const guests = campos.some(c => /convidad|marmita/i.test(String(c.label || "")));
      const existing = await req("GET", `/api/forms/${formId}/responses`).catch(() => ({ responses: [] }));
      const jaResponderam = new Set((existing.responses || []).map(r => String(r.respondentName || "").trim().toLowerCase()));
      let inserted = 0;
      const respondentes = selecionarRespondentes(elegiveis, formId, alvo.presenca, alvo.perfil);
      for (const person of elegiveis) {
        if (jaResponderam.has(person.name.trim().toLowerCase())) continue;
        if (!respondentes.has(person.name)) continue;
        try {
          await postResponsePaced({
            formId,
            respondentName: person.name,
            respondentGrau: person.grau,
            values: buildValues(campos, guests, person),
          }, ipForPerson(person.name));
          inserted++;
        } catch (error) {
          console.warn(`    [resp] ${person.name}: ${error.message}`);
        }
      }
      respostasCriadas += inserted;
      console.log(`    -> ${inserted} respostas no form ${formId} (${jaResponderam.size} ja existiam)`);
    }

    // Reencerra para recapturar o snapshot: saveEvent so captura na transicao
    // nao-encerrado -> encerrado.
    const payload = {
      id: evento.id,
      title: evento.title,
      description: evento.description || "",
      date: String(evento.date).slice(0, 10),
      opening: evento.opening,
      closing: evento.closing,
      status: evento.status,
      formIds: evento.formIds || [],
      eligibleGraus: evento.eligibleGraus || [],
    };
    if (alvo.status === "encerrado") {
      await req("POST", "/api/events", { ...payload, status: "publicado" });
      await req("POST", "/api/events", { ...payload, status: "encerrado" });
      console.log(`    -> evento reencerrado (snapshot recapturado)`);
    } else if (evento.status !== alvo.status) {
      await req("POST", "/api/events", { ...payload, status: alvo.status });
      console.log(`    -> status ajustado para ${alvo.status}`);
    }
    console.log("");
  }

  // -------------------------------------------------------------------------
  // Sanitiza as escalas: nome que nao existe na base vira "socio em branco" no
  // diretorio e no BI (o casamento e por nome normalizado, ver
  // shared/personIdentity.mjs). Os seeds antigos deixaram nomes ficticios nas
  // escalas, entao a contagem de socios ficava maior que a base real.
  // -------------------------------------------------------------------------
  const normalizaNome = nome => String(nome || "").trim().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const nomesDaBase = new Map(people.map(pe => [normalizaNome(pe.name), pe.name]));
  let nomesCorrigidos = 0;

  for (const form of bootAfter.forms || []) {
    if (form.type !== "escala_organ") continue;
    const atual = await req("GET", `/api/forms/${form.id}/escala`).catch(() => ({ sections: [] }));
    const secoes = atual.sections || [];
    const foraDaBase = secoes.flatMap(sec => (sec.slots || []).map(sl => sl.person))
      .filter(nome => String(nome || "").trim() && !nomesDaBase.has(normalizaNome(nome)));
    if (!foraDaBase.length) continue;

    const usados = new Set(secoes.flatMap(sec => (sec.slots || []).map(sl => normalizaNome(sl.person))).filter(Boolean));
    const substitutos = shuffle(people.map(pe => pe.name)).filter(nome => !usados.has(normalizaNome(nome)));
    let index = 0;
    let trocados = 0;
    const novas = secoes.map(sec => ({
      ...sec,
      slots: (sec.slots || []).map(sl => {
        const nome = String(sl.person || "").trim();
        if (!nome || nomesDaBase.has(normalizaNome(nome))) return sl;
        if (index >= substitutos.length) return { ...sl, person: "" };
        trocados++;
        return { ...sl, person: substitutos[index++] };
      }),
    }));
    await req("PUT", `/api/escala/${form.id}`, { sections: novas });
    nomesCorrigidos += trocados;
    console.log(`[escala ${form.id}] ${trocados} nomes fora da base trocados por socios reais`);
  }
  if (nomesCorrigidos) console.log("");

  console.log("=== Resumo ===");
  console.log(`eventos: ${eventosCriados} | formularios: ${formsCriados} | respostas: ${respostasCriadas} | vagas de escala: ${vagasPreenchidas}`);
};

main().catch(error => {
  console.error("Erro:", error.message);
  process.exitCode = 1;
});
