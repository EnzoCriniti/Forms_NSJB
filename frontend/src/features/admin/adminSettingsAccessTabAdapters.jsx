import React from "react";
import { ExternalBasesPanel, UsersManagementPanel } from "./adminAccessPanels";

export const renderAdminUsersTab = ({ access, audit, shared }) => (
  <UsersManagementPanel
    userDraft={access.userDraft}
    setUserDraft={access.setUserDraft}
    submitUser={access.submitUser}
    busyAction={shared.busyAction}
    users={access.users}
    requestDelete={shared.requestDelete}
    onDeleteUser={access.onDeleteUser}
    currentUser={audit.currentUser}
  />
);

export const renderAdminExternalBasesTab = ({ access, shared }) => (
  <ExternalBasesPanel
    externalBaseDraft={access.externalBaseDraft}
    setExternalBaseDraft={access.setExternalBaseDraft}
    submitExternalBase={access.submitExternalBase}
    submitExternalBaseSync={access.submitExternalBaseSync}
    busyAction={shared.busyAction}
    externalBases={access.externalBases}
    requestDelete={shared.requestDelete}
    onDeleteExternalBase={access.onDeleteExternalBase}
  />
);
