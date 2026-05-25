import { ADMIN_SETTINGS_TAB_RENDERERS } from "./adminSettingsTabAdapters";

export const AdminSettingsTabPanel = props => {
  const renderTab = ADMIN_SETTINGS_TAB_RENDERERS[props.tab];
  if (!renderTab) return null;
  return renderTab(props);
};
