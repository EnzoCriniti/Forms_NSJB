/**
 * @file frontend/src/lib/appAdminActions.js
 * @summary Agregador historico das acoes administrativas e de mensagens usadas pelo shell principal.
 * @responsibility Manter compatibilidade enquanto os helpers por dominio vivem em modulos menores.
 */

export {
  deleteAppListResult,
  saveAppListResult,
} from "./appAdminListActions";
export {
  deleteAppUser,
  saveAppUser,
} from "./appAdminUserActions";
export {
  saveAppMembersConfig,
  syncAppMembersConfig,
} from "./appAdminMembersActions";
export {
  deleteAppMessageTemplate,
  deleteAppPersonPreset,
  saveAppMessageTemplate,
  saveAppMessagingConfig,
  saveAppPersonPreset,
} from "./appAdminMessagingActions";
export {
  applyAppMessageDeletion,
  applyAppMessageUpdate,
  openAppEventMessageDetail,
  openAppEventMessageEditor,
  saveAppEventMessage,
} from "./appAdminEventMessageActions";
