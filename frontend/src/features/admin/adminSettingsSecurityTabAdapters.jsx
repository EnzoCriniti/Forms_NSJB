import React from "react";
import { SecurityPanel } from "./adminSecurityPanels";

export const renderAdminSecurityTab = ({ security, shared }) => (
  <SecurityPanel
    formDeleteKeyConfigured={security.formDeleteKeyConfigured}
    securityDraft={security.securityDraft}
    setSecurityDraft={security.setSecurityDraft}
    submitSecurity={security.submitSecurity}
    busyAction={shared.busyAction}
    onCancelSecurity={security.onCancelSecurity}
  />
);
