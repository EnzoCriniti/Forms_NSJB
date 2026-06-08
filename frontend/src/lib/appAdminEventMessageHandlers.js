import {
  applyAppMessageDeletion,
  applyAppMessageUpdate,
  openAppEventMessageDetail,
  openAppEventMessageEditor,
  saveAppEventMessage,
} from "./appAdminEventMessageActions";

export const buildAppAdminEventMessageHandlers = ({
  removeNestedBootstrapItem,
  saveEventMessage,
  setActiveEventId,
  setActiveMessageId,
  setBootstrap,
  setScreen,
  upsertNestedBootstrapItem,
}) => ({
  handleSaveEventMessage: async (eventId, payload) => saveAppEventMessage({ eventId, payload, saveEventMessage, setBootstrap, upsertNestedBootstrapItem }),
  openEventMessageEditor: (event, message = null) => {
    openAppEventMessageEditor({ event, message, setActiveEventId, setActiveMessageId, setScreen });
  },
  openEventMessageDetail: (event, message) => {
    openAppEventMessageDetail({ event, message, setActiveEventId, setActiveMessageId, setScreen });
  },
  applyMessageUpdate: updated => {
    applyAppMessageUpdate({ updated, setBootstrap, upsertNestedBootstrapItem });
  },
  applyMessageDeletion: messageId => {
    applyAppMessageDeletion({ messageId, setBootstrap, removeNestedBootstrapItem });
  },
});
