export const saveAppListResult = async ({
  payload,
  key,
  saveFn,
  applyBootstrapListResult,
}) => {
  const result = await saveFn(payload);
  applyBootstrapListResult(key, result);
  return result;
};

export const deleteAppListResult = async ({
  id,
  key,
  deleteFn,
  applyBootstrapListResult,
}) => {
  const result = await deleteFn(id);
  applyBootstrapListResult(key, result);
  return result;
};
