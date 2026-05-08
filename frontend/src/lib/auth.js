/**
 * @file frontend/src/lib/auth.js
 * @summary Regras de permissao do frontend.
 * @responsibility Definir papeis e capacidades de visualizacao/edicao.
 */

export const ROLES = {
  admin: {
    label: "Administrativo",
    description: "Pode criar formularios, editar escalas e visualizar todos os resultados.",
  },
  viewer: {
    label: "Visualizador",
    description: "Pode visualizar resultados de todos os formularios, abertos e fechados.",
  },
};

export const canCreateForms = user => user?.role === "admin";

export const canEditEscala = user => user?.role === "admin";

export const canViewForm = (user, form) => {
  if (!form) return false;
  if (user) return true;
  return form.status === "aberto";
};

export const visibleFormsFor = (user, forms) => {
  if (user) return forms;
  return forms.filter(form => form.status === "aberto");
};
