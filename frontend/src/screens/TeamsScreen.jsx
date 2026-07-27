/**
 * @file frontend/src/screens/TeamsScreen.jsx
 * @summary Tela principal do menu Equipes.
 */

import React from "react";
import { can } from "../lib/auth";
import { ConfirmModal, FeedbackBanner, ScreenHeader } from "../components/ui";
import { TeamPeriodEditorPanel } from "../features/teams/components/TeamPeriodEditorPanel";
import { TeamPeriodListPanel } from "../features/teams/components/TeamPeriodListPanel";
import { TeamPeriodSummaryPanel } from "../features/teams/components/TeamPeriodSummaryPanel";
import { useTeamsScreenController } from "./teamsScreenController";

export const TeamsScreen = ({
  teamPeriods = [],
  people = [],
  user,
  onSaveTeamPeriod,
  onDeleteTeamPeriod,
  onOpenFormResults,
}) => {
  const controller = useTeamsScreenController({
    teamPeriods,
    onSaveTeamPeriod,
    onDeleteTeamPeriod,
  });
  const canManage = can(user, "teams.manage");

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <ScreenHeader
        className="settings-top-card"
        subtitle="Cadastre as equipes do Mestre Assistente e da Organ para controlar dispensas e contexto operacional por periodo."
      />
      {controller.feedback && <FeedbackBanner tone={controller.feedback.tone} message={controller.feedback.message} />}
      {controller.editing ? (
        <TeamPeriodEditorPanel
          draft={controller.draft}
          people={people}
          onChangeDraft={controller.setDraft}
          onCancel={controller.cancelEdit}
          onSave={controller.save}
          saving={controller.saving}
        />
      ) : (
        <div className="teams-layout" style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 18, alignItems: "start" }}>
          <TeamPeriodListPanel
            periods={controller.sortedPeriods}
            people={people}
            selectedPeriodId={controller.selectedPeriod?.id}
            canManage={canManage}
            onSelect={controller.setSelectedPeriodId}
            onEdit={controller.editPeriod}
            onDelete={controller.setPendingDelete}
            onStartNew={controller.startNew}
          />
          <TeamPeriodSummaryPanel
            summary={controller.summary}
            loading={controller.summaryLoading}
            onOpenResults={onOpenFormResults}
          />
        </div>
      )}
      {controller.pendingDelete && (
        <ConfirmModal
          open
          title="Excluir periodo?"
          message={`Isso vai remover o periodo "${controller.pendingDelete.title || "Periodo de equipes"}".`}
          confirmLabel="Excluir"
          busy={controller.deleting}
          onCancel={() => controller.setPendingDelete(null)}
          onConfirm={controller.confirmDelete}
        />
      )}
    </div>
  );
};
