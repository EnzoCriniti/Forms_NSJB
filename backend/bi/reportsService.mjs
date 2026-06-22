/**
 * @file backend/bi/reportsService.mjs
 * @summary Relatorios/BI sobre snapshots de participacao e escala.
 * @responsibility Agregar o read model e os dados de dominio em metricas consultaveis.
 */

import { summarizeMemberParticipation } from "../../shared/eventParticipation.mjs";
import { buildOverview } from "../../shared/biOverview.mjs";
import { listAllEscalaAssignments } from "../repositories/escalaRepository.mjs";
import { listPeople } from "../repositories/peopleRepository.mjs";
import { aggregateMemberParticipation } from "./biRepository.mjs";

export const getMemberParticipationReport = async () => {
  const rows = await aggregateMemberParticipation();
  return rows.map(summarizeMemberParticipation);
};

export const getOverviewReport = async () => {
  const [memberReport, escalaAssignments, people] = await Promise.all([
    getMemberParticipationReport(),
    listAllEscalaAssignments(),
    listPeople(),
  ]);
  return buildOverview({ memberReport, escalaAssignments, people });
};
