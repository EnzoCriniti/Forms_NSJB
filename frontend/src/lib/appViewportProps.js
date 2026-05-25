/**
 * @file frontend/src/lib/appViewportProps.js
 * @summary Montagem das props entregues ao AppViewport.
 */

export const buildAppViewportProps = ({
  app,
  error,
  fontScale,
  loading,
  refreshBootstrap,
  sessionHandlers,
  setPublicRoute,
  setScreen,
  setTheme,
  theme,
}) => ({
  app,
  loading,
  error,
  refreshBootstrap,
  login: sessionHandlers.login,
  logout: sessionHandlers.logout,
  theme,
  fontScale,
  increaseFontScale: sessionHandlers.increaseFontScale,
  decreaseFontScale: sessionHandlers.decreaseFontScale,
  setTheme,
  setScreen,
  setPublicRoute,
});
