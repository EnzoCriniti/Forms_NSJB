/**
 * @file frontend/src/lib/appNav.js
 * @summary Montagem pura da navegacao principal do shell autenticado.
 */

import { can } from "./auth";

export const buildAppNavItems = ({ currentUser }) => {
  if (!currentUser) return [];
  const items = [];
  if (can(currentUser, "reports.view")) items.push({ key: "dashboard", icon: "chart", label: "Dashboard" });
  if (can(currentUser, "events.view")) items.push({ key: "events", icon: "calendar", label: "Eventos" });
  if (can(currentUser, "teams.view")) items.push({ key: "teams", icon: "users", label: "Equipes" });
  if (can(currentUser, "messages.view")) items.push({ key: "messages", icon: "message", label: "Mensagens" });
  return items;
};
