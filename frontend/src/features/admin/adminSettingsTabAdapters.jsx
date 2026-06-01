import { renderAdminUsersTab, renderAdminExternalBasesTab } from "./adminSettingsAccessTabAdapters";
import { renderAdminMembersTab } from "./adminSettingsMemberTabAdapters";
import { renderAdminCatalogTab } from "./adminSettingsCatalogTabAdapters";
import { renderAdminLabelsTab, renderAdminPresetsTab } from "./adminSettingsOrganizationTabAdapters";
import { renderAdminMessagesTab } from "./adminSettingsMessagingTabAdapters";
import { renderAdminSecurityTab } from "./adminSettingsSecurityTabAdapters";
import { renderAdminAuditTab } from "./adminSettingsAuditTabAdapters";

export const ADMIN_SETTINGS_TAB_RENDERERS = {
  users: renderAdminUsersTab,
  members: renderAdminMembersTab,
  "external-bases": renderAdminExternalBasesTab,
  security: renderAdminSecurityTab,
  catalog: renderAdminCatalogTab,
  labels: renderAdminLabelsTab,
  presets: renderAdminPresetsTab,
  messages: renderAdminMessagesTab,
  audit: renderAdminAuditTab,
};
