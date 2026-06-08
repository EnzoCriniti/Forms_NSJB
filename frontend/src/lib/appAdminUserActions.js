export const saveAppUser = async ({
  user,
  currentUser,
  saveUser,
  applyBootstrapListResult,
  sanitizeUser,
  setSession,
}) => {
  const result = await saveUser(user);
  applyBootstrapListResult("users", result);
  if (currentUser?.id === user.id) {
    const refreshed = result.users.find(item => item.id === user.id);
    setSession(prev => prev ? {
      ...prev,
      user: sanitizeUser(refreshed || currentUser),
    } : prev);
  }
  return { ok: true };
};

export const deleteAppUser = async ({
  id,
  currentUser,
  deleteUser,
  applyBootstrapListResult,
  logout,
}) => {
  const result = await deleteUser(id);
  applyBootstrapListResult("users", result);
  if (currentUser?.id === id) {
    await logout();
  }
};
