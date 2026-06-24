/**
 * @file scripts/insertMockResponses.mjs
 * @summary Simula preenchimento de respostas de presença e slots de escala.
 * @usage node scripts/insertMockResponses.mjs [--api http://localhost:8787]
 */

const API_BASE = process.argv.find(arg => arg.startsWith("http")) || "http://localhost:8787";

// Lista de membros simulados com graus variados
const PESSOAS = [
  // QS - Quadro de Sócios
  { name: "Adolfo Rezende Marques", grau: "QS" },
  { name: "Alberto Cunha Ferreira", grau: "QS" },
  { name: "Antônio Rodrigues Neto", grau: "QS" },
  { name: "Carlos Eduardo Gadelha", grau: "QS" },
  { name: "Cláudio Renato Braga", grau: "QS" },
  { name: "Daniel Neves Carvalho", grau: "QS" },
  { name: "Eduardo Lima Sousa", grau: "QS" },
  { name: "Fernando Ferraz Costa", grau: "QS" },
  { name: "Francisco Henrique Dias", grau: "QS" },
  { name: "Hélio Martins Saraiva", grau: "QS" },
  { name: "Jorge Luiz Mendonça", grau: "QS" },
  { name: "Luiz Carlos Pinheiro", grau: "QS" },
  { name: "Marcelo Augusto Lopes", grau: "QS" },
  { name: "Paulo Roberto Andrade", grau: "QS" },
  { name: "Roberto Faria Azevedo", grau: "QS" },
  { name: "Sérgio Monteiro Viana", grau: "QS" },
  { name: "Welles Edilmo Medrado", grau: "QS" },

  // QM - Quadro de Membros
  { name: "Alessandro Borges Teixeira", grau: "QM" },
  { name: "Bruno Vieira Cavalcante", grau: "QM" },
  { name: "César Augusto Fonseca", grau: "QM" },
  { name: "Diego Campos Ribeiro", grau: "QM" },
  { name: "Edson Pereira Machado", grau: "QM" },
  { name: "Fabiano Couto Nogueira", grau: "QM" },
  { name: "Gabriel Souza Santana", grau: "QM" },
  { name: "Hugo Barbosa Freitas", grau: "QM" },
  { name: "Ivan Ramos Moreira", grau: "QM" },
  { name: "João Batista Correia", grau: "QM" },
  { name: "Leonardo Araújo Melo", grau: "QM" },
  { name: "Marcos Vinícius Rocha", grau: "QM" },
  { name: "Nelson Quirino Barros", grau: "QM" },
  { name: "Otávio Guimarães Luz", grau: "QM" },
  { name: "Pedro Henrique Lemos", grau: "QM" },
  { name: "Rafael Nascimento Cruz", grau: "QM" },
  { name: "Rodrigo Almeida Coutinho", grau: "QM" },
  { name: "Thiago Mota Carvalho", grau: "QM" },
  { name: "Wellington Cunha Criniti", grau: "QM" },

  // CI - Candidatos à Iniciação
  { name: "André Luiz Bastos", grau: "CI" },
  { name: "Breno Leal Marinho", grau: "CI" },
  { name: "Caio Fernandes Rios", grau: "CI" },
  { name: "Davi Monteiro Sousa", grau: "CI" },
  { name: "Enzo Ferrari Criniti", grau: "CI" },
  { name: "Fellipe Gomes Tavares", grau: "CI" },
  { name: "Gustavo Henrique Prado", grau: "CI" },
  { name: "Henrique Azevedo Lima", grau: "CI" },
  { name: "Igor Teles Drummond", grau: "CI" },
  { name: "Jonas Pereira Santos", grau: "CI" },
  { name: "Kevin Albuquerque Duarte", grau: "CI" },
  { name: "Lucas Mourão Vieira", grau: "CI" },
  { name: "Mateus Salgado Brito", grau: "CI" },
  { name: "Nathan Costa Paiva", grau: "CI" },
  { name: "Otávio Lins Peixoto", grau: "CI" },
  { name: "Pietro Ângelo Zanetti", grau: "CI" },
  { name: "Yuri Barcia Benedetti", grau: "CI" },

  // Membros com outros graus
  { name: "Ana Beatriz Silveira", grau: "Org." },
  { name: "Cláudia Gonçalves Melo", grau: "Org." },
  { name: "Eva Maria Santos Luz", grau: "Org." },
  { name: "Fernanda Leal Rocha", grau: "Org." },
  { name: "Jussana Prado Carmo", grau: "Org." },
  { name: "Laura Gadelha Costa", grau: "Org." },
  { name: "Lis Eduarda Marques", grau: "Org." },
  { name: "Maria Fernanda Neves", grau: "Org." },
  { name: "Maria Rosa Quirino", grau: "Org." },
  { name: "Mariângela Teixeira", grau: "Org." },
  { name: "Paula Correia Braga", grau: "Org." },
  { name: "Sandra Vieira Cardoso", grau: "Org." },
];

// Pessoas que tipicamente ficam apenas na sessão principal
const APENAS_SESSAO = new Set(["Kevin Albuquerque Duarte", "Jonas Pereira Santos", "Breno Leal Marinho", "Ana Beatriz Silveira", "Fernanda Leal Rocha"]);
// Pessoas que frequentemente faltam ao jantar
const SEM_JANTAR = new Set(["Igor Teles Drummond", "Otávio Lins Peixoto", "Edson Pereira Machado", "Nelson Quirino Barros"]);

const rng = (seed => () => { seed = (seed * 16807 + 0) % 2147483647; return (seed - 1) / 2147483646; })(42);
const pick = arr => arr[Math.floor(rng() * arr.length)];
const chance = p => rng() < p;

const buildValoresSessaoEscala = (pessoa) => {
  const apenasSessao = APENAS_SESSAO.has(pessoa.name);
  const semJantar = SEM_JANTAR.has(pessoa.name);
  const presente = chance(0.92);
  return {
    "1": `${pessoa.grau} - ${pessoa.name}`,
    "2": apenasSessao ? "Não" : (presente ? "Sim" : "Não"),
    "3": apenasSessao || semJantar ? "Não" : (presente ? "Sim" : "Não"),
    "4": presente ? "Sim" : "Não",
    "5": chance(0.15) ? Math.floor(rng() * 3) + 1 : 0,
    "6": chance(0.10) ? Math.floor(rng() * 2) + 1 : 0,
    "7": chance(0.08) ? Math.floor(rng() * 2) + 1 : 0,
  };
};

const buildValoresInstrutiva = (pessoa) => ({
  "1": `${pessoa.grau} - ${pessoa.name}`,
  "2": chance(0.88) ? "Sim" : "Não",
  "3": chance(0.10) ? Math.floor(rng() * 2) + 1 : 0,
  "4": chance(0.08) ? Math.floor(rng() * 2) + 1 : 0,
});

const buildValoresBeneficente = (pessoa) => ({
  "1": `${pessoa.grau} - ${pessoa.name}`,
  "2": chance(0.90) ? "Sim" : "Não",
  "3": chance(0.20) ? Math.floor(rng() * 3) + 1 : 0,
  "4": chance(0.12) ? Math.floor(rng() * 2) + 1 : 0,
  "5": chance(0.10) ? Math.floor(rng() * 2) + 1 : 0,
});

const buildValoresDirecao = (pessoa) => ({
  "1": `${pessoa.grau} - ${pessoa.name}`,
  "2": chance(0.95) ? "Sim" : "Não",
});

// Mapeamento de formId → tipo de valores
const FORM_CONFIGS = {
  // Sessão de Escala - 20/06/2026 (publicado)
  14: { tipo: "sessao_escala", taxa: 0.78 },
  // Sessão de Escala - 18/07/2026 (pronto) — rascunho, sem respostas
  // Sessão de Escala - 15/08/2026 (rascunho) — sem respostas
  // Sessão Instrutiva - 27/06/2026 (publicado)
  20: { tipo: "instrutiva", taxa: 0.72 },
  // Sessão Instrutiva - 25/07/2026 (pronto) — rascunho
  // Sessão da Direção - 14/06/2026 (publicado)
  22: { tipo: "direcao", taxa: 0.85 },
  // Evento Beneficente - 17/05/2026 (encerrado)
  26: { tipo: "beneficente", taxa: 0.88 },
  // Sessão Extra - 07/06/2026 (encerrado)
  27: { tipo: "instrutiva", taxa: 0.68 },
};

// Escala da Organ aberta: form 15 (Sessão de Escala 20/06) e 23 (Direção 14/06)
const NOMES_ORGAN = PESSOAS.filter(p => p.grau === "Org.").map(p => p.name);
const NOMES_QS_QM = PESSOAS.filter(p => p.grau === "QS" || p.grau === "QM").map(p => p.name);

const shuffled = arr => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const buildEscalaCompleta = () => {
  const organ = shuffled(NOMES_ORGAN);
  const masc = shuffled(NOMES_QS_QM);
  let oi = 0;
  let mi = 0;
  const nextOrgan = () => organ[oi++ % organ.length];
  const nextMasc = () => masc[mi++ % masc.length];
  return [
    { title: "Preparação do Jantar. Servir às 17h", color: "#ffcdd2", slots: [
      { role: "Responsável", person: nextOrgan() },
      { role: "Auxiliar", person: nextOrgan() },
      { role: "Auxiliar", person: nextOrgan() },
      { role: "Auxiliar", person: "" },
    ]},
    { title: "Limpeza Após o Jantar", color: "#ffcdd2", slots: [
      { role: "Responsável", person: nextOrgan() },
      { role: "Auxiliar", person: nextOrgan() },
      { role: "Auxiliar", person: nextOrgan() },
      { role: "Auxiliar", person: nextOrgan() },
      { role: "Auxiliar", person: "" },
    ]},
    { title: "Preparação do Lanche Após a Sessão", color: "#ffcdd2", slots: [
      { role: "Responsável", person: nextOrgan() },
      { role: "Auxiliar", person: nextOrgan() },
      { role: "Auxiliar", person: nextOrgan() },
      { role: "Auxiliar", person: "" },
      { role: "Auxiliar", person: "" },
      { role: "Auxiliar", person: "" },
      { role: "Auxiliar", person: "" },
    ]},
    { title: "Limpeza da cozinha após o lanche", color: "#ffcdd2", slots: [
      { role: "Responsável", person: nextOrgan() },
      { role: "Auxiliar", person: nextOrgan() },
      { role: "Auxiliar", person: "" },
      { role: "Auxiliar", person: "" },
    ]},
    { title: "Limpeza do banheiro antes da sessão - Masculino", color: "#bbdefb", slots: [
      { role: "Responsável", person: nextMasc() },
      { role: "Auxiliar", person: nextMasc() },
    ]},
    { title: "Limpeza do banheiro antes da sessão - Feminino", color: "#f8bbd0", slots: [
      { role: "Responsável", person: nextOrgan() },
      { role: "Auxiliar", person: "" },
    ]},
    { title: "Limpeza do banheiro depois da sessão - Masculino", color: "#bbdefb", slots: [
      { role: "Responsável", person: nextMasc() },
      { role: "Auxiliar", person: nextMasc() },
    ]},
    { title: "Limpeza do banheiro depois da sessão - Feminino", color: "#f8bbd0", slots: [
      { role: "Responsável", person: nextOrgan() },
      { role: "Auxiliar", person: "" },
    ]},
    { title: "Coleta e organização do lixo (dia e noite)", color: "#c8e6c9", slots: [
      { role: "Responsável", person: nextMasc() },
      { role: "Auxiliar", person: nextMasc() },
    ]},
  ];
};

const buildEscalaEnxuta = () => {
  const organ = shuffled(NOMES_ORGAN);
  let oi = 0;
  const nextOrgan = () => organ[oi++ % organ.length];
  return [
    { title: "Preparação do Jantar. Servir às 17h", color: "#ffcdd2", slots: [
      { role: "Responsável", person: nextOrgan() },
      { role: "Auxiliar", person: nextOrgan() },
      { role: "Auxiliar", person: nextOrgan() },
      { role: "Auxiliar", person: "" },
    ]},
    { title: "Limpeza Após o Jantar", color: "#ffcdd2", slots: [
      { role: "Responsável", person: nextOrgan() },
      { role: "Auxiliar", person: nextOrgan() },
      { role: "Auxiliar", person: nextOrgan() },
      { role: "Auxiliar", person: "" },
      { role: "Auxiliar", person: "" },
    ]},
    { title: "Preparação do Lanche Após a Sessão", color: "#ffcdd2", slots: [
      { role: "Responsável", person: nextOrgan() },
      { role: "Auxiliar", person: nextOrgan() },
      { role: "Auxiliar", person: nextOrgan() },
      { role: "Auxiliar", person: "" },
      { role: "Auxiliar", person: "" },
      { role: "Auxiliar", person: "" },
      { role: "Auxiliar", person: "" },
    ]},
    { title: "Limpeza da cozinha após o lanche", color: "#ffcdd2", slots: [
      { role: "Responsável", person: nextOrgan() },
      { role: "Auxiliar", person: nextOrgan() },
      { role: "Auxiliar", person: "" },
      { role: "Auxiliar", person: "" },
    ]},
  ];
};

// HTTP helpers
const postJson = async (path, body, token) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}: ${json.error || JSON.stringify(json)}`);
  return json;
};

const putJson = async (path, body, token) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`PUT ${path} → ${res.status}: ${json.error || JSON.stringify(json)}`);
  return json;
};

const main = async () => {
  console.log(`Conectando a ${API_BASE}...`);
  const health = await fetch(`${API_BASE}/api/health`).catch(() => null);
  if (!health?.ok) throw new Error("Backend nao esta acessivel.");
  console.log("Backend online.\n");

  const { token } = await postJson("/api/auth/login", { username: "admin", password: "admin123" }, null)
    .catch(() => { throw new Error("Falha no login."); });
  console.log("Autenticado como admin.\n");

  let totalRespostas = 0;
  let totalErros = 0;

  for (const [formIdStr, config] of Object.entries(FORM_CONFIGS)) {
    const formId = Number(formIdStr);
    const participantes = PESSOAS.filter(() => chance(config.taxa));

    console.log(`Form ${formId} (${config.tipo}) — ${participantes.length}/${PESSOAS.length} pessoas (${Math.round(config.taxa * 100)}% esperado):`);

    for (const pessoa of participantes) {
      let values;
      if (config.tipo === "sessao_escala") values = buildValoresSessaoEscala(pessoa);
      else if (config.tipo === "instrutiva") values = buildValoresInstrutiva(pessoa);
      else if (config.tipo === "beneficente") values = buildValoresBeneficente(pessoa);
      else if (config.tipo === "direcao") values = buildValoresDirecao(pessoa);

      try {
        await postJson("/api/responses", { formId, respondentName: pessoa.name, respondentGrau: pessoa.grau, values }, token);
        totalRespostas++;
      } catch (err) {
        console.warn(`  [ERRO] ${pessoa.name}: ${err.message}`);
        totalErros++;
      }
    }
    console.log(`  -> ${participantes.length} respostas enviadas.\n`);
  }

  // Preencher slots das escalas da Organ abertas
  console.log("Preenchendo slots das escalas da Organ abertas...");

  await putJson("/api/escala/15", { sections: buildEscalaCompleta() }, token);
  console.log("  [escala] Form 15 (Sessão de Escala 20/06) preenchida.");

  await putJson("/api/escala/23", { sections: buildEscalaEnxuta() }, token);
  console.log("  [escala] Form 23 (Sessão da Direção 14/06) preenchida.\n");

  console.log(`Concluido: ${totalRespostas} respostas inseridas, ${totalErros} erros.`);
};

main().catch(err => {
  console.error("Erro:", err.message);
  process.exitCode = 1;
});
