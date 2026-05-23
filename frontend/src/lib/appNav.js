/**
 * @file frontend/src/lib/appNav.js
 * @summary Montagem pura da navegacao principal do shell autenticado.
 */

export const buildAppNavItems = ({ currentUser, canCreateForms }) => (
  currentUser
    ? [
        ...(canCreateForms(currentUser) ? [{ key: "dashboard", icon: "chart", label: "Dashboard" }] : []),
        { key: "events", icon: "calendar", label: "Eventos" },
      ]
    : []
);
