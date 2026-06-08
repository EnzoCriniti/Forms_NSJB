import { buildAdminSettingsExternalBaseSubmitHandlers } from "./adminSettingsExternalBaseSubmitHandlers";
import { buildAdminSettingsUserSubmitHandlers } from "./adminSettingsUserSubmitHandlers";

export const buildAdminSettingsAccessSubmitHandlers = ({
  drafts,
  setters,
  actions,
  runSubmit,
}) => {
  const { submitUser } = buildAdminSettingsUserSubmitHandlers({
    drafts,
    setters,
    actions,
    runSubmit,
  });

  const { submitExternalBase, submitExternalBaseSync } = buildAdminSettingsExternalBaseSubmitHandlers({
    drafts,
    setters,
    actions,
    runSubmit,
  });

  return {
    submitExternalBase,
    submitExternalBaseSync,
    submitUser,
  };
};
