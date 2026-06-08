import {
  deleteAppMessageTemplate,
  deleteAppPersonPreset,
  saveAppMessageTemplate,
  saveAppMessagingConfig,
  saveAppPersonPreset,
} from "./appAdminMessagingActions";

export const buildAppAdminMessagingHandlers = ({
  deleteMessageTemplate,
  deletePersonPreset,
  removeBootstrapListItem,
  replaceBootstrapList,
  saveMessageTemplate,
  saveMessagingConfig,
  savePersonPreset,
  setBootstrap,
  upsertBootstrapListItem,
}) => ({
  handleSaveMessagingConfig: async nextConfig => saveAppMessagingConfig({ nextConfig, saveMessagingConfig, setBootstrap, replaceBootstrapList }),
  handleSaveMessageTemplate: async template => saveAppMessageTemplate({ template, saveMessageTemplate, setBootstrap, upsertBootstrapListItem }),
  handleDeleteMessageTemplate: async id => {
    await deleteAppMessageTemplate({ id, deleteMessageTemplate, setBootstrap, removeBootstrapListItem });
  },
  handleSavePersonPreset: async preset => saveAppPersonPreset({ preset, savePersonPreset, setBootstrap, upsertBootstrapListItem }),
  handleDeletePersonPreset: async id => {
    await deleteAppPersonPreset({ id, deletePersonPreset, setBootstrap, removeBootstrapListItem });
  },
});
