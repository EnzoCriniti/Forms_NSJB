/**
 * @file frontend/src/screens/EventsScreenViews.jsx
 * @summary Views de lista, detalhe e edicao da tela de eventos.
 */

import React from "react";
import { Btn, ConfirmModal, FeedbackBanner, ScreenHeader } from "../components/ui";
import {
  EventDeleteConfirmModal,
  EventDetailFormsPanel,
  EventDetailHeader,
  EventDetailTabs,
  EventEditorPanel,
  EventListPanel,
  EventMessagesPanel,
} from "../features/events/components/eventsPanels";

export const EventEditView = ({ draft, feedback, onCancel, onChangeDraft, onSave, saving, people }) => (
  <div>
    {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} fixed />}
    <EventEditorPanel
      draft={draft}
      onChangeDraft={onChangeDraft}
      onCancel={onCancel}
      onSave={onSave}
      saving={saving}
      people={people}
      title={draft.id ? "Editar evento" : "Novo evento"}
    />
  </div>
);

export const EventDetailView = ({
  canManageEvents,
  detailTab,
  eventForms,
  eventMessages,
  feedback,
  formsPagination,
  labels,
  messagesEligible,
  onArchiveForm,
  onBack,
  onClose,
  onCreateForm,
  onCreateMessage,
  onDeleteForm,
  onDuplicateForm,
  onEdit,
  onNextFormsPage,
  onOpenMessage,
  onEditMessage,
  onDeleteMessage,
  pendingMessageDelete,
  deletingMessage,
  onCancelMessageDelete,
  onConfirmMessageDelete,
  onPreviousFormsPage,
  onPublish,
  onTogglePinnedForm,
  onChangeDetailTab,
  onNavigate,
  pinnedFormSet,
  selectedEvent,
  statusAction,
  user,
}) => (
  <div>
    {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} fixed />}
    <EventDetailHeader
      event={selectedEvent}
      canManageEvents={canManageEvents}
      detailTab={detailTab}
      messagesEligible={messagesEligible}
      statusAction={statusAction}
      onBack={onBack}
      onPublish={onPublish}
      onClose={onClose}
      onEdit={onEdit}
      onCreateForm={onCreateForm}
      onCreateMessage={onCreateMessage}
    />
    <EventDetailTabs
      activeTab={detailTab}
      onChangeTab={onChangeDetailTab}
      formsCount={eventForms.length}
      messagesCount={eventMessages.length}
      hasMessages={messagesEligible}
    />
    {detailTab === "messages" ? (
      <EventMessagesPanel
        messages={eventMessages}
        eligible={messagesEligible}
        canManage={canManageEvents}
        onCreate={onCreateMessage}
        onOpen={onOpenMessage}
        onEdit={onEditMessage}
        onDelete={onDeleteMessage}
      />
    ) : (
      <EventDetailFormsPanel
        forms={eventForms}
        pagination={formsPagination}
        user={user}
        labels={labels}
        pinnedFormSet={pinnedFormSet}
        canManageEvents={canManageEvents}
        onNavigate={onNavigate}
        onDuplicateForm={onDuplicateForm}
        onTogglePinnedForm={onTogglePinnedForm}
        onArchiveForm={onArchiveForm}
        onDeleteForm={onDeleteForm}
        onPreviousPage={onPreviousFormsPage}
        onNextPage={onNextFormsPage}
      />
    )}
    <ConfirmModal
      open={Boolean(pendingMessageDelete)}
      title="Excluir mensagem"
      message="Esta acao remove a mensagem e o historico de disparos vinculado. Nao pode ser desfeita."
      confirmLabel="Excluir"
      tone="danger"
      busy={deletingMessage}
      onCancel={onCancelMessageDelete}
      onConfirm={onConfirmMessageDelete}
    />
  </div>
);

export const EventListView = ({
  canManageEvents,
  deleting,
  eventsPagination,
  eventsTotalItems,
  eventSearchDraft,
  eventSearchLoading,
  feedback,
  onCancelDelete,
  onChangeEventSearch,
  onClearEventSearch,
  onConfirmDelete,
  onDelete,
  onEdit,
  onNextEventsPage,
  onOpen,
  onPreviousEventsPage,
  onStartNew,
  onSubmitEventSearch,
  onTogglePinnedEvent,
  pendingDelete,
  pinnedEventSet,
  sortedEvents,
}) => (
  <div>
    {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} fixed />}
    <ScreenHeader
      className="settings-top-card"
      title="Eventos"
      titleSize={20}
      actions={canManageEvents ? <Btn icon="plus" onClick={onStartNew} aria-label="Novo evento" title="Novo evento" /> : null}
    />
    <EventListPanel
      events={sortedEvents}
      pagination={eventsPagination}
      totalItems={eventsTotalItems}
      searchValue={eventSearchDraft}
      searchLoading={eventSearchLoading}
      pinnedEventSet={pinnedEventSet}
      canManageEvents={canManageEvents}
      onChangeSearch={onChangeEventSearch}
      onClearSearch={onClearEventSearch}
      onOpen={onOpen}
      onEdit={onEdit}
      onDelete={onDelete}
      onSubmitSearch={onSubmitEventSearch}
      onTogglePinned={onTogglePinnedEvent}
      onPreviousPage={onPreviousEventsPage}
      onNextPage={onNextEventsPage}
    />
    <EventDeleteConfirmModal
      event={pendingDelete}
      busy={deleting}
      onCancel={onCancelDelete}
      onConfirm={onConfirmDelete}
    />
  </div>
);
