export const buildAppAdminSecurityHandlers = ({
  saveFormDeleteKey,
  setFormDeleteKeyConfigured,
}) => ({
  handleSaveFormDeleteKey: async payload => {
    const result = await saveFormDeleteKey(payload);
    setFormDeleteKeyConfigured(Boolean(result.configured));
    return result;
  },
});
