/**
 * @file backend/services/reportsService.mjs
 * @summary Relatorios de BI sobre os snapshots de participacao.
 * @responsibility Agregar o historico imutavel em metricas por socio.
 */

import { summarizeMemberParticipation } from "../../shared/eventParticipation.mjs";
import { aggregateMemberParticipation } from "../repositories/eventParticipationRepository.mjs";

export const getMemberParticipationReport = async () => {
  const rows = await aggregateMemberParticipation();
  return rows.map(summarizeMemberParticipation);
};
