/**
 * @file shared/personIdentity.mjs
 * @summary Identidade estavel de socios compartilhada entre backend e frontend.
 * @responsibility Derivar uma chave canonica de pessoa a partir do nome.
 *
 * A base de socios e recriada a cada sincronizacao (DELETE + INSERT), entao o
 * id serial nao e estavel. O nome normalizado e a unica ancora de identidade
 * disponivel hoje (a base nao possui id externo), e por isso e usado para
 * cruzar respostas com a base e, futuramente, alimentar o BI por socio.
 */

const COMBINING_MARKS = /[̀-ͯ]/g;

export const normalizePersonKey = name => String(name || "")
  .trim()
  .normalize("NFD")
  .replace(COMBINING_MARKS, "")
  .replace(/\s+/g, " ")
  .toLowerCase();

/**
 * Chave de identidade de uma pessoa da base. Hoje deriva do nome; se a base
 * passar a ter id externo estavel, basta priorizar esse id aqui.
 */
export const getPersonKey = person => normalizePersonKey(person?.name);

/**
 * Chave de identidade de uma resposta. Usa a chave gravada na submissao e cai
 * para o nome normalizado em respostas legadas sem person_key.
 */
export const getResponsePersonKey = response =>
  response?.personKey || normalizePersonKey(response?.respondentName);
