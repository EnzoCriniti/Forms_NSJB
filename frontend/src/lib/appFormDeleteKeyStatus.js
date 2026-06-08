export const refreshFormDeleteKeyConfiguredStatus = async ({
  fetchFormDeleteKeyStatus,
  setFormDeleteKeyConfigured,
}) => {
  try {
    const result = await fetchFormDeleteKeyStatus();
    setFormDeleteKeyConfigured(Boolean(result.configured));
    return result;
  } catch {
    setFormDeleteKeyConfigured(false);
    return null;
  }
};
