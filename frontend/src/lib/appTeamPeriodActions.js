/**
 * @file frontend/src/lib/appTeamPeriodActions.js
 * @summary Acoes de periodos de equipes usadas pelo shell principal.
 */

export const saveAppTeamPeriod = async ({
  payload,
  saveTeamPeriod,
  setBootstrap,
  upsertBootstrapListItem,
}) => {
  const response = await saveTeamPeriod(payload);
  setBootstrap(prev => upsertBootstrapListItem(prev, "teamPeriods", response.teamPeriod, { prepend: true }));
  return response.teamPeriod;
};

export const deleteAppTeamPeriod = async ({
  id,
  deleteTeamPeriod,
  removeBootstrapListItem,
  setBootstrap,
}) => {
  await deleteTeamPeriod(id);
  setBootstrap(prev => removeBootstrapListItem(prev, "teamPeriods", period => period.id === id));
};
