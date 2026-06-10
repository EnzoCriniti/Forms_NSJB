/**
 * @file frontend/src/screens/EscalaResultsPanel.jsx
 * @summary Painel visual da tela de resultados de escala.
 */

import React from "react";
import { ConfirmModal } from "../components/ui";
import { EscalaResultsOverview } from "./EscalaResultsOverview";
import { EscalaSectionsPanel } from "./EscalaSectionsPanel";
import { EscalaSignupModal } from "./EscalaSignupModal";

export const EscalaResultsPanel = ({
  canEdit,
  feedback,
  filled,
  total,
  sections,
  people,
  busyAction,
  showSignup,
  selSlot,
  signName,
  names,
  onOpenSignup,
  onCloseSignup,
  onSetSignName,
  onConfirmSignup,
  onUpdateSlot,
  onRemoveSlot,
  onConfirmRemoval,
  onAddSlot,
  onExportCsv,
  onCancelRemoval,
  pendingRemoval,
}) => (
  <div>
    <EscalaResultsOverview
      canEdit={canEdit}
      feedback={feedback}
      filled={filled}
      onExportCsv={onExportCsv}
      total={total}
    />
    <EscalaSectionsPanel
      busyAction={busyAction}
      canEdit={canEdit}
      onAddSlot={onAddSlot}
      onOpenSignup={onOpenSignup}
      onRemoveSlot={onRemoveSlot}
      onUpdateSlot={onUpdateSlot}
      people={people}
      sections={sections}
    />
    {showSignup && selSlot && canEdit && (
      <EscalaSignupModal
        busy={busyAction === "signup"}
        names={names}
        onClose={onCloseSignup}
        onConfirm={onConfirmSignup}
        onSetSignName={onSetSignName}
        sectionTitle={sections[selSlot.sectionIndex].title}
        signName={signName}
        slotRole={sections[selSlot.sectionIndex].slots[selSlot.slotIndex].role}
      />
    )}
    <ConfirmModal
      open={Boolean(pendingRemoval)}
      title="Remover vaga"
      message="Tem certeza que deseja remover a pessoa desta vaga? A alteração será salva imediatamente."
      confirmLabel="Remover"
      tone="danger"
      busy={busyAction === "remove"}
      onCancel={onCancelRemoval}
      onConfirm={onConfirmRemoval}
    />
  </div>
);
