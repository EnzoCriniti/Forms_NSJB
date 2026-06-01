import React from "react";
import { MemberListConfigModalContent } from "../members/MemberListConfigModal";

export const renderAdminMembersTab = ({ members }) => (
  <MemberListConfigModalContent
    config={members.membersConfig}
    people={members.people}
    onSave={members.onSaveMembersConfig}
    onSync={members.onSyncMembersConfig}
  />
);
