import React from "react";
import { Btn } from "../../../components/ui";

export const EventDetailTabs = ({ activeTab, onChangeTab, formsCount, messagesCount, hasMessages }) => (
  <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
    <Btn v={activeTab === "forms" ? "primary" : "ghost"} sz="sm" onClick={() => onChangeTab("forms")}>
      Formulários{formsCount > 0 ? ` (${formsCount})` : ""}
    </Btn>
    {hasMessages && (
      <Btn v={activeTab === "messages" ? "primary" : "ghost"} sz="sm" onClick={() => onChangeTab("messages")}>
        Mensagens{messagesCount > 0 ? ` (${messagesCount})` : ""}
      </Btn>
    )}
  </div>
);
