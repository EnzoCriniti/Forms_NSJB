const API_BASE = "http://localhost:8787";
const ORGAN = ["Ana Beatriz Silveira","Cláudia Gonçalves Melo","Eva Maria Santos Luz","Fernanda Leal Rocha","Jussana Prado Carmo","Laura Gadelha Costa","Lis Eduarda Marques","Maria Fernanda Neves","Maria Rosa Quirino","Mariângela Teixeira","Paula Correia Braga","Sandra Vieira Cardoso"];
const MASC = ["Adolfo Rezende Marques","Alberto Cunha Ferreira","Fernando Ferraz Costa","Daniel Neves Carvalho","Eduardo Lima Sousa","Pedro Henrique Lemos","Rodrigo Almeida Coutinho","Thiago Mota Carvalho"];

const loginRes = await fetch(`${API_BASE}/api/auth/login`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({username:"admin",password:"admin123"}) });
const { token } = await loginRes.json();

const put = async (formId, sections) => {
  const res = await fetch(`${API_BASE}/api/escala/${formId}`, { method:"PUT", headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`}, body: JSON.stringify({sections}) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`form ${formId}: ${j.error}`);
  console.log(`Escala form ${formId} OK`);
};

// form 15: escala completa — todos os 9 seções com nomes únicos
// ORGAN: 12 pessoas (índices 0-11) → usadas nas seções de cozinha e banheiros femininos
// MASC:  8 pessoas (índices 0-7)  → usadas nos banheiros masculinos e lixo
await put(15, [
  { title:"Preparação do Jantar. Servir às 17h", color:"#ffcdd2", slots:[{role:"Responsável",person:ORGAN[0]},{role:"Auxiliar",person:ORGAN[1]},{role:"Auxiliar",person:ORGAN[2]},{role:"Auxiliar",person:""}] },
  { title:"Limpeza Após o Jantar", color:"#ffcdd2", slots:[{role:"Responsável",person:ORGAN[3]},{role:"Auxiliar",person:ORGAN[4]},{role:"Auxiliar",person:ORGAN[5]},{role:"Auxiliar",person:ORGAN[6]},{role:"Auxiliar",person:""}] },
  { title:"Preparação do Lanche Após a Sessão", color:"#ffcdd2", slots:[{role:"Responsável",person:ORGAN[7]},{role:"Auxiliar",person:ORGAN[8]},{role:"Auxiliar",person:ORGAN[9]},{role:"Auxiliar",person:""},{role:"Auxiliar",person:""},{role:"Auxiliar",person:""},{role:"Auxiliar",person:""}] },
  { title:"Limpeza da cozinha após o lanche", color:"#ffcdd2", slots:[{role:"Responsável",person:ORGAN[10]},{role:"Auxiliar",person:ORGAN[11]},{role:"Auxiliar",person:""},{role:"Auxiliar",person:""}] },
  { title:"Limpeza do banheiro antes da sessão - Masculino", color:"#bbdefb", slots:[{role:"Responsável",person:MASC[0]},{role:"Auxiliar",person:MASC[1]}] },
  { title:"Limpeza do banheiro antes da sessão - Feminino", color:"#f8bbd0", slots:[{role:"Responsável",person:MASC[2]},{role:"Auxiliar",person:""}] },
  { title:"Limpeza do banheiro depois da sessão - Masculino", color:"#bbdefb", slots:[{role:"Responsável",person:MASC[3]},{role:"Auxiliar",person:MASC[4]}] },
  { title:"Limpeza do banheiro depois da sessão - Feminino", color:"#f8bbd0", slots:[{role:"Responsável",person:MASC[5]},{role:"Auxiliar",person:""}] },
  { title:"Coleta e organização do lixo (dia e noite)", color:"#c8e6c9", slots:[{role:"Responsável",person:MASC[6]},{role:"Auxiliar",person:MASC[7]}] },
]);

// form 23: escala enxuta — 4 seções, nomes únicos
await put(23, [
  { title:"Preparação do Jantar. Servir às 17h", color:"#ffcdd2", slots:[{role:"Responsável",person:ORGAN[0]},{role:"Auxiliar",person:ORGAN[1]},{role:"Auxiliar",person:ORGAN[2]},{role:"Auxiliar",person:""}] },
  { title:"Limpeza Após o Jantar", color:"#ffcdd2", slots:[{role:"Responsável",person:ORGAN[3]},{role:"Auxiliar",person:ORGAN[4]},{role:"Auxiliar",person:ORGAN[5]},{role:"Auxiliar",person:""},{role:"Auxiliar",person:""}] },
  { title:"Preparação do Lanche Após a Sessão", color:"#ffcdd2", slots:[{role:"Responsável",person:ORGAN[6]},{role:"Auxiliar",person:ORGAN[7]},{role:"Auxiliar",person:ORGAN[8]},{role:"Auxiliar",person:""},{role:"Auxiliar",person:""},{role:"Auxiliar",person:""},{role:"Auxiliar",person:""}] },
  { title:"Limpeza da cozinha após o lanche", color:"#ffcdd2", slots:[{role:"Responsável",person:ORGAN[9]},{role:"Auxiliar",person:ORGAN[10]},{role:"Auxiliar",person:""},{role:"Auxiliar",person:""}] },
]);
