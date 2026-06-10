import React from "react";
import { COLORS } from "../../../components/ui";
import { FormListCard } from "../../../components/FormListCard";
import { EventPaginationControls } from "./eventPaginationControls";

export const EventFormsList = ({ forms, user, labels, isPinnedForm, canManageEvents, onNavigate, onDuplicateForm, onTogglePinnedForm, onArchiveForm, onDeleteForm }) => (
  <div style={{ display: "grid", gap: 18 }}>
    {forms.map(form => (
      <FormListCard
        key={form.id}
        form={form}
        user={user}
        labels={labels}
        isPinned={isPinnedForm(form.id)}
        canPinForms={canManageEvents}
        onNavigate={onNavigate}
        onDuplicateForm={onDuplicateForm}
        onTogglePinnedForm={onTogglePinnedForm}
        onArchiveForm={onArchiveForm}
        onDeleteForm={onDeleteForm}
      />
    ))}
  </div>
);

export const EventDetailFormsPanel = ({
  forms,
  pagination,
  user,
  labels,
  pinnedFormSet,
  canManageEvents,
  onNavigate,
  onDuplicateForm,
  onTogglePinnedForm,
  onArchiveForm,
  onDeleteForm,
  onPreviousPage,
  onNextPage,
}) => {
  if (forms.length === 0) {
    return (
      <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: 8, padding: 18, color: COLORS.textSecondary, fontSize: 13 }}>
        Nenhum formulário criado neste evento.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <EventFormsList
        forms={pagination.pageItems}
        user={user}
        labels={labels}
        isPinnedForm={formId => pinnedFormSet.has(formId)}
        canManageEvents={canManageEvents}
        onNavigate={onNavigate}
        onDuplicateForm={onDuplicateForm}
        onTogglePinnedForm={onTogglePinnedForm}
        onArchiveForm={onArchiveForm}
        onDeleteForm={onDeleteForm}
      />
      <EventPaginationControls
        pagination={pagination}
        totalItems={forms.length}
        onPrevious={onPreviousPage}
        onNext={onNextPage}
      />
    </div>
  );
};
