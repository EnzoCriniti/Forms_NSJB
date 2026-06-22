/**
 * @file backend/bi/index.mjs
 * @summary API publica do modulo de BI.
 * @responsibility Unico ponto de acoplamento do resto do app com o BI.
 *
 * O app depende apenas destas exportacoes; o BI le os dados de dominio, mas o
 * dominio nao conhece o interior do BI.
 */

import { captureEventParticipation } from "./participationService.mjs";

export { handleBiRoutes } from "./biRoutes.mjs";

/**
 * Gatilho de dominio: chamado quando um evento e encerrado para atualizar o
 * read model de participacao.
 */
export const onEventClosed = event => captureEventParticipation(event);
