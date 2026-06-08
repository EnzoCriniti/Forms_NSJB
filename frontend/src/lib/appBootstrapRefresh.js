export const refreshAppBootstrap = async ({
  preserveSelection = true,
  silent = false,
  rethrow = false,
  activeFormId = null,
  currentUser = null,
  setLoading,
  setError,
  setBootstrap,
  setActiveFormId,
  fetchBootstrap,
  normalizeBootstrap,
  pickActiveFormIdAfterBootstrap,
  visibleFormsFor,
}) => {
  if (!silent) setLoading(true);
  setError("");
  try {
    const next = normalizeBootstrap(await fetchBootstrap());
    setBootstrap(next);
    const nextActiveFormId = pickActiveFormIdAfterBootstrap({
      currentFormId: activeFormId,
      currentUser,
      forms: next.forms,
      visibleForms: visibleFormsFor(currentUser, next.forms),
      preserveSelection,
    });
    setActiveFormId(nextActiveFormId);
    return next;
  } catch (loadError) {
    setError(loadError.message || "Erro ao carregar dados.");
    if (rethrow) throw loadError;
    return null;
  } finally {
    if (!silent) setLoading(false);
  }
};
