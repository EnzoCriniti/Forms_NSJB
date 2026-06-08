/**
 * @file frontend/src/features/admin/adminSecurityPanels.jsx
 * @summary Painel compartilhado da seguranca administrativa.
 * @responsibility Conter a UI da chave mestra fora do modal principal.
 */

import React from "react";
import { SplitSection } from "../../components/ui";
import { SecurityKeyFormPanel } from "./SecurityKeyFormPanel";
import { SecurityStatusPanel } from "./SecurityStatusPanel";

export const SecurityPanel = ({
  formDeleteKeyConfigured,
  securityDraft,
  setSecurityDraft,
  submitSecurity,
  busyAction,
  onCancelSecurity,
}) => (
  <SplitSection
    leftTitle={formDeleteKeyConfigured ? "Alterar chave mestra" : "Cadastrar chave mestra"}
    rightTitle="Status da seguranca"
    left={(
      <SecurityKeyFormPanel
        formDeleteKeyConfigured={formDeleteKeyConfigured}
        securityDraft={securityDraft}
        setSecurityDraft={setSecurityDraft}
        submitSecurity={submitSecurity}
        busyAction={busyAction}
        onCancelSecurity={onCancelSecurity}
      />
    )}
    right={<SecurityStatusPanel formDeleteKeyConfigured={formDeleteKeyConfigured} />}
  />
);
