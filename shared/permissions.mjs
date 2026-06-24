/**
 * @file shared/permissions.mjs
 * @summary Registro canônico de capacidades e engine de permissões (RBAC).
 * @responsibility Definir as capacidades configuráveis por camada de acesso,
 * os presets de sistema e os helpers puros usados por backend e frontend.
 *
 * Uma "camada de acesso" guarda um conjunto de chaves de capacidade. As telas
 * e rotas checam capacidades específicas (ex.: "forms.escala.edit"), não papéis.
 */

export const CAPABILITY_GROUPS = [
  {
    key: "events",
    label: "Eventos",
    capabilities: [
      { key: "events.view", label: "Ver" },
      { key: "events.create", label: "Criar" },
      { key: "events.edit", label: "Editar" },
      { key: "events.delete", label: "Excluir" },
      { key: "events.publish", label: "Publicar / encerrar" },
    ],
  },
  {
    key: "forms_presenca",
    label: "Formulários · Presença",
    capabilities: [
      { key: "forms.presenca.view", label: "Ver" },
      { key: "forms.presenca.create", label: "Criar" },
      { key: "forms.presenca.edit", label: "Editar" },
      { key: "forms.presenca.delete", label: "Excluir" },
    ],
  },
  {
    key: "forms_escala",
    label: "Formulários · Escala da Organ",
    capabilities: [
      { key: "forms.escala.view", label: "Ver" },
      { key: "forms.escala.create", label: "Criar" },
      { key: "forms.escala.edit", label: "Editar" },
      { key: "forms.escala.delete", label: "Excluir" },
    ],
  },
  {
    key: "operation",
    label: "Operação",
    capabilities: [
      { key: "responses.respond", label: "Responder presença" },
      { key: "escala.claim", label: "Preencher vaga de escala" },
      { key: "results.view", label: "Ver resultados" },
    ],
  },
  {
    key: "messages",
    label: "Mensagens",
    capabilities: [
      { key: "messages.view", label: "Ver" },
      { key: "messages.create", label: "Criar" },
      { key: "messages.edit", label: "Editar" },
      { key: "messages.delete", label: "Excluir" },
      { key: "messages.dispatch", label: "Disparar" },
    ],
  },
  {
    key: "reports",
    label: "Relatórios / BI",
    capabilities: [{ key: "reports.view", label: "Ver dashboard e relatórios" }],
  },
  {
    key: "teams",
    label: "Equipes",
    capabilities: [
      { key: "teams.view", label: "Ver periodos" },
      { key: "teams.manage", label: "Criar, editar e excluir periodos" },
    ],
  },
  {
    key: "members",
    label: "Sócios / base",
    capabilities: [
      { key: "members.view", label: "Ver base" },
      { key: "members.manage", label: "Editar / sincronizar base" },
    ],
  },
  {
    key: "access",
    label: "Usuários e acessos",
    capabilities: [
      { key: "users.manage", label: "Gerenciar usuários" },
      { key: "layers.manage", label: "Gerenciar camadas de acesso" },
    ],
  },
  {
    key: "settings",
    label: "Configurações",
    capabilities: [
      { key: "settings.security", label: "Segurança" },
      { key: "settings.catalogs", label: "Catálogos" },
      { key: "settings.bases", label: "Bases externas" },
    ],
  },
];

export const ALL_CAPABILITIES = CAPABILITY_GROUPS.flatMap(group => group.capabilities.map(capability => capability.key));

const VIEW_ONLY_CAPABILITIES = [
  "events.view",
  "forms.presenca.view",
  "forms.escala.view",
  "results.view",
  "members.view",
];

/**
 * Camadas de sistema (não deletáveis). `key` identifica o preset para a migração
 * e para derivar o `role` legado.
 */
export const SYSTEM_LAYERS = {
  admin: {
    key: "admin",
    name: "Administrativo",
    description: "Acesso total à plataforma.",
    permissions: [...ALL_CAPABILITIES],
    isSystem: true,
  },
  viewer: {
    key: "viewer",
    name: "Visualizador",
    description: "Acesso somente leitura aos resultados e relatórios.",
    permissions: [...VIEW_ONLY_CAPABILITIES],
    isSystem: true,
  },
};

/** Remove chaves inválidas e duplicadas, preservando só capacidades conhecidas. */
export const normalizePermissions = permissions => {
  const valid = new Set(ALL_CAPABILITIES);
  const list = Array.isArray(permissions) ? permissions : [];
  return [...new Set(list.map(String).filter(key => valid.has(key)))];
};

/** Checa se um conjunto de permissões concede uma capacidade. */
export const hasCapability = (permissions, key) => {
  if (!key) return false;
  const set = permissions instanceof Set
    ? permissions
    : new Set(Array.isArray(permissions) ? permissions : []);
  return set.has(key);
};

/** Deriva o papel legado (admin/viewer) a partir das capacidades da camada. */
export const deriveLegacyRole = permissions => (
  hasCapability(permissions, "users.manage") ? "admin" : "viewer"
);
