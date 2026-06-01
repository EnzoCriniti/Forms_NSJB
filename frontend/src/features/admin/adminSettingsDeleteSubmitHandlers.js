export const buildAdminSettingsDeleteSubmitHandlers = ({ pendingDelete, setters, runSubmit }) => {
  const { setPendingDelete } = setters;

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await runSubmit({
      actionKey: "delete",
      loadingMessage: "Excluindo...",
      successMessage: "ExcluÃƒÂ­do com sucesso.",
      execute: pendingDelete.onConfirm,
      onSuccess: () => setPendingDelete(null),
    });
  };

  return {
    confirmDelete,
  };
};
