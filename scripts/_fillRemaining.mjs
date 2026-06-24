const API_BASE = "http://localhost:8787";

const PESSOAS = [
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

const ORGAN = PESSOAS.filter(p => p.grau === "Org.").map(p => p.name);
const MASC  = PESSOAS.filter(p => p.grau === "QS" || p.grau === "QM").map(p => p.name);

let seed = 7;
const rng = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const chance = p => rng() < p;

// Login
const loginRes = await fetch(`${API_BASE}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: "admin", password: "admin123" }) });
const { token } = await loginRes.json();

const postResponse = async (formId, pessoa, valores) => {
  const res = await fetch(`${API_BASE}/api/responses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ formId, respondentName: pessoa.name, respondentGrau: pessoa.grau, values: valores }),
  });
  if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || res.status); }
};

const putEscala = async (formId, sections) => {
  const res = await fetch(`${API_BASE}/api/escala/${formId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ sections }),
  });
  if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || res.status); }
};

// Formulários de presença pendentes
const PRESENCA_FORMS = [
  { id: 16, tipo: "sessao_escala", taxa: 0.75 },
  { id: 18, tipo: "sessao_escala", taxa: 0.70 },
  { id: 21, tipo: "instrutiva",    taxa: 0.73 },
  { id: 24, tipo: "sessao_escala", taxa: 0.68 },
];

for (const { id, tipo, taxa } of PRESENCA_FORMS) {
  const participantes = PESSOAS.filter(() => chance(taxa));
  let ok = 0, erros = 0;
  for (const p of participantes) {
    let v;
    if (tipo === "sessao_escala") {
      const presente = chance(0.90);
      v = { "1": `${p.grau} - ${p.name}`, "2": presente ? "Sim" : "Não", "3": presente ? "Sim" : "Não", "4": presente ? "Sim" : "Não", "5": chance(0.12) ? 1 : 0, "6": 0, "7": chance(0.07) ? 1 : 0 };
    } else {
      v = { "1": `${p.grau} - ${p.name}`, "2": chance(0.88) ? "Sim" : "Não", "3": 0, "4": 0 };
    }
    try { await postResponse(id, p, v); ok++; } catch (e) { erros++; console.warn(`  [ERRO] form ${id} ${p.name}: ${e.message}`); }
  }
  console.log(`Form ${id} (${tipo}): ${ok} respostas inseridas${erros ? `, ${erros} erros` : ""}`);
}

// Escalas da Organ pendentes
const escalaCompleta = (organArr, mascArr) => [
  { title: "Preparação do Jantar. Servir às 17h", color: "#ffcdd2", slots: [{ role: "Responsável", person: organArr[0] }, { role: "Auxiliar", person: organArr[1] }, { role: "Auxiliar", person: organArr[2] }, { role: "Auxiliar", person: "" }] },
  { title: "Limpeza Após o Jantar", color: "#ffcdd2", slots: [{ role: "Responsável", person: organArr[3] }, { role: "Auxiliar", person: organArr[4] }, { role: "Auxiliar", person: organArr[5] }, { role: "Auxiliar", person: organArr[6] }, { role: "Auxiliar", person: "" }] },
  { title: "Preparação do Lanche Após a Sessão", color: "#ffcdd2", slots: [{ role: "Responsável", person: organArr[7] }, { role: "Auxiliar", person: organArr[8] }, { role: "Auxiliar", person: organArr[9] }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }] },
  { title: "Limpeza da cozinha após o lanche", color: "#ffcdd2", slots: [{ role: "Responsável", person: organArr[10] }, { role: "Auxiliar", person: organArr[11] }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }] },
  { title: "Limpeza do banheiro antes da sessão - Masculino", color: "#bbdefb", slots: [{ role: "Responsável", person: mascArr[0] }, { role: "Auxiliar", person: mascArr[1] }] },
  { title: "Limpeza do banheiro antes da sessão - Feminino", color: "#f8bbd0", slots: [{ role: "Responsável", person: mascArr[2] }, { role: "Auxiliar", person: "" }] },
  { title: "Limpeza do banheiro depois da sessão - Masculino", color: "#bbdefb", slots: [{ role: "Responsável", person: mascArr[3] }, { role: "Auxiliar", person: mascArr[4] }] },
  { title: "Limpeza do banheiro depois da sessão - Feminino", color: "#f8bbd0", slots: [{ role: "Responsável", person: mascArr[5] }, { role: "Auxiliar", person: "" }] },
  { title: "Coleta e organização do lixo (dia e noite)", color: "#c8e6c9", slots: [{ role: "Responsável", person: mascArr[6] }, { role: "Auxiliar", person: mascArr[7] }] },
];

const escalaEnxuta = (organArr) => [
  { title: "Preparação do Jantar. Servir às 17h", color: "#ffcdd2", slots: [{ role: "Responsável", person: organArr[0] }, { role: "Auxiliar", person: organArr[1] }, { role: "Auxiliar", person: organArr[2] }, { role: "Auxiliar", person: "" }] },
  { title: "Limpeza Após o Jantar", color: "#ffcdd2", slots: [{ role: "Responsável", person: organArr[3] }, { role: "Auxiliar", person: organArr[4] }, { role: "Auxiliar", person: organArr[5] }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }] },
  { title: "Preparação do Lanche Após a Sessão", color: "#ffcdd2", slots: [{ role: "Responsável", person: organArr[6] }, { role: "Auxiliar", person: organArr[7] }, { role: "Auxiliar", person: organArr[8] }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }] },
  { title: "Limpeza da cozinha após o lanche", color: "#ffcdd2", slots: [{ role: "Responsável", person: organArr[9] }, { role: "Auxiliar", person: organArr[10] }, { role: "Auxiliar", person: "" }, { role: "Auxiliar", person: "" }] },
];

// Shuffles diferentes por form para variar os nomes
const shuffle = (arr, salt) => {
  const copy = [...arr];
  let s = salt;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

await putEscala(17, escalaCompleta(shuffle(ORGAN, 17), shuffle(MASC, 17)));
console.log("Escala form 17 (Sessão de Escala 18/07) OK");

await putEscala(19, escalaEnxuta(shuffle(ORGAN, 19)));
console.log("Escala form 19 (Sessão de Escala 15/08 — enxuta) OK");

await putEscala(25, escalaCompleta(shuffle(ORGAN, 25), shuffle(MASC, 25)));
console.log("Escala form 25 (Sessão Anual 05/09) OK");

console.log("\nConcluído.");
