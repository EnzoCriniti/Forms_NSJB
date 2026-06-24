/**
 * @file frontend/src/lib/auth.js
 * @summary Regras de permissão do frontend (capacidades por camada).
 * @responsibility Derivar o que cada usuário pode ver/fazer a partir das
 * capacidades entregues pela camada de acesso (user.permissions).
 */

import { SYSTEM_LAYERS, hasCapability } from "../../../shared/permissions.mjs";

export const ROLES = {
  admin: { label: "Administrativo" },
  viewer: { label: "Visualizador" },
};

/**
 * Checa uma capacidade do usuário logado. Usa as permissões da camada quando
 * presentes; senão, cai para o preset de sistema do papel (compat. legado).
 */
export const can = (user, capability) => {
  if (!user) return false;
  const permissions = Array.isArray(user.permissions) && user.permissions.length
    ? user.permissions
    : (user.role === "admin" ? SYSTEM_LAYERS.admin.permissions : SYSTEM_LAYERS.viewer.permissions);
  return hasCapability(permissions, capability);
};

const formTypeKey = form => (form?.type === "escala_organ" ? "escala" : "presenca");

export const canCreateForms = user => can(user, "forms.presenca.create") || can(user, "forms.escala.create");

export const canEditEscala = user => can(user, "forms.escala.edit");

export const canViewForm = (user, form) => {
  if (!form) return false;
  if (user) return can(user, "results.view") || can(user, `forms.${formTypeKey(form)}.view`);
  return form.status === "aberto";
};

export const visibleFormsFor = (user, forms) => {
  if (user) return forms;
  return forms.filter(form => form.status === "aberto");
};
