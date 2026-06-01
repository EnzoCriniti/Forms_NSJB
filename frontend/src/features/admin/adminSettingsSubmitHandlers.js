import { runAdminSubmitAction } from "./adminSettingsActions";
import { buildAdminSettingsAccessSubmitHandlers } from "./adminSettingsAccessSubmitHandlers";
import { buildAdminSettingsCatalogSubmitHandlers } from "./adminSettingsCatalogSubmitHandlers";
import { buildAdminSettingsDeleteSubmitHandlers } from "./adminSettingsDeleteSubmitHandlers";
import { buildAdminSettingsOrganizationSubmitHandlers } from "./adminSettingsOrganizationSubmitHandlers";
import { buildAdminSettingsSecuritySubmitHandlers } from "./adminSettingsSecuritySubmitHandlers";

export const buildAdminSettingsSubmitHandlers = ({
  currentUser,
  drafts,
  formDeleteKeyConfigured,
  pendingDelete,
  setters,
  actions,
}) => {
  const runSubmit = config =>
    runAdminSubmitAction({
      ...config,
      setBusyAction: setters.setBusyAction,
      setFeedback: setters.setFeedback,
    });

  return {
    ...buildAdminSettingsAccessSubmitHandlers({
      drafts,
      setters,
      actions,
      runSubmit,
    }),
    ...buildAdminSettingsCatalogSubmitHandlers({
      drafts,
      setters,
      actions,
      runSubmit,
    }),
    ...buildAdminSettingsDeleteSubmitHandlers({
      pendingDelete,
      setters,
      runSubmit,
    }),
    ...buildAdminSettingsOrganizationSubmitHandlers({
      currentUser,
      drafts,
      setters,
      actions,
      runSubmit,
    }),
    ...buildAdminSettingsSecuritySubmitHandlers({
      drafts,
      formDeleteKeyConfigured,
      setters,
      actions,
      runSubmit,
    }),
  };
};
