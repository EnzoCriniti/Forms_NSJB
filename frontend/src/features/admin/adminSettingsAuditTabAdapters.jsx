import React from "react";
import { AuditLogsPanel } from "./adminAuditLogsPanel";

export const renderAdminAuditTab = ({ audit }) => {
  if (audit.currentUser?.role !== "admin") return null;
  return <AuditLogsPanel />;
};
