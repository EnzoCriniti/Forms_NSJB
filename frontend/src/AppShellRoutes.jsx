/**
 * @file frontend/src/AppShellRoutes.jsx
 * @summary Rotas visuais do shell autenticado.
 * @responsibility Escolher e montar os fluxos internos a partir do objeto `app`.
 */

import React from "react";
import { EventMessageDetailFlow, EventMessageEditorFlow } from "./AppShellEventMessageFlows";
import { InternalRespondFlow, InternalResultsFlow } from "./AppShellFormFlows";
import { CreateFormFlow, DashboardFlow, EventsFlow, FormListFlow, SettingsFlow } from "./AppShellMainFlows";

export const AppShellRoutes = ({ app }) => {
  const {
    screen,
    currentUser,
    onNavigate,
    forms,
    labels,
    people,
    presets,
    fieldCatalog,
    scaleTaskCatalog,
    events,
    messageTemplates,
    personPresets,
    messagingConfig,
    pinnedEventIds,
    pinnedFormIds,
    activeEventId,
    activeMessageId,
    activeEvent,
    activeForm,
    editingForm,
    draftForm,
    membersConfig,
    externalBases,
    users,
    formDeleteKeyConfigured,
    handleSaveEvent,
    handlePublishEvent,
    handleDeleteEvent,
    handleTogglePinnedEvent,
    handleCreateFormInEvent,
    handleDuplicateForm,
    handleArchiveForm,
    handleTogglePinnedForm,
    handleDeleteForm,
    handleSaveEventMessage,
    applyMessageUpdate,
    applyMessageDeletion,
    handleSaveEscala,
    handleClaimEscalaSlot,
    handleSaveUser,
    handleDeleteUser,
    handleSaveLabel,
    handleDeleteLabel,
    handleSavePreset,
    handleDeletePreset,
    handleSaveMembersConfig,
    handleSyncMembersConfig,
    handleSaveExternalBase,
    handleDeleteExternalBase,
    handleSyncExternalBase,
    handleSavePeople,
    handleSaveFieldCatalogItem,
    handleDeleteFieldCatalogItem,
    handleSaveScaleTaskCatalogItem,
    handleDeleteScaleTaskCatalogItem,
    handleSaveFormDeleteKey,
    handleSaveMessagingConfig,
    handleSaveMessageTemplate,
    handleDeleteMessageTemplate,
    handleSavePersonPreset,
    handleDeletePersonPreset,
  } = app;

  return (
    <>
      {screen === "dashboard" && (
        <DashboardFlow
          onNavigate={onNavigate}
          forms={forms}
          labels={labels}
          people={people}
          presets={presets}
          fieldCatalog={fieldCatalog}
          scaleTaskCatalog={scaleTaskCatalog}
          currentUser={currentUser}
        />
      )}
      {screen === "events" && currentUser && (
        <EventsFlow
          app={app}
          events={events}
          forms={forms}
          labels={labels}
          currentUser={currentUser}
          pinnedEventIds={pinnedEventIds}
          pinnedFormIds={pinnedFormIds}
          activeEventId={activeEventId}
          onSaveEvent={handleSaveEvent}
          onPublishEvent={handlePublishEvent}
          onDeleteEvent={handleDeleteEvent}
          onTogglePinnedEvent={handleTogglePinnedEvent}
          onCreateFormInEvent={handleCreateFormInEvent}
          onDuplicateForm={handleDuplicateForm}
          onArchiveForm={handleArchiveForm}
          onTogglePinnedForm={handleTogglePinnedForm}
          onDeleteForm={handleDeleteForm}
          onCreateEventMessage={event => app.openEventMessageEditor(event, null)}
          onOpenEventMessage={(event, message) => app.openEventMessageDetail(event, message)}
          onNavigate={onNavigate}
        />
      )}
      {screen === "eventMessageEditor" && currentUser && activeEvent && (
        <EventMessageEditorFlow
          app={app}
          activeEvent={activeEvent}
          activeMessageId={activeMessageId}
          forms={forms}
          messageTemplates={messageTemplates}
          personPresets={personPresets}
          people={people}
          membersConfig={membersConfig}
          messagingConfig={messagingConfig}
          onSaveEventMessage={handleSaveEventMessage}
        />
      )}
      {screen === "eventMessageDetail" && currentUser && activeEvent && activeMessageId && (
        <EventMessageDetailFlow
          app={app}
          activeEvent={activeEvent}
          activeMessageId={activeMessageId}
          onMessageUpdated={applyMessageUpdate}
          onMessageDeleted={applyMessageDeletion}
        />
      )}
      {screen === "list" && (
        <FormListFlow
          onNavigate={onNavigate}
          onDuplicateForm={handleDuplicateForm}
          onArchiveForm={handleArchiveForm}
          onTogglePinnedForm={handleTogglePinnedForm}
          pinnedFormIds={pinnedFormIds}
          currentUser={currentUser}
          labels={labels}
          forms={forms}
          onDeleteForm={handleDeleteForm}
          formDeleteKeyConfigured={formDeleteKeyConfigured}
        />
      )}
      {screen === "create" && (
        <CreateFormFlow
          app={app}
          onNavigate={onNavigate}
          people={people}
          membersConfig={membersConfig}
          externalBases={externalBases}
          labels={labels}
          presets={presets}
          fieldCatalog={fieldCatalog}
          scaleTaskCatalog={scaleTaskCatalog}
          onSavePreset={handleSavePreset}
          editingForm={editingForm}
          activeEvent={activeEvent}
          draftForm={draftForm}
        />
      )}
      {screen === "settings" && (
        <SettingsFlow
          onNavigate={onNavigate}
          users={users}
          labels={labels}
          presets={presets}
          fieldCatalog={fieldCatalog}
          scaleTaskCatalog={scaleTaskCatalog}
          membersConfig={membersConfig}
          externalBases={externalBases}
          people={people}
          currentUser={currentUser}
          onSaveUser={handleSaveUser}
          onDeleteUser={handleDeleteUser}
          onSaveLabel={handleSaveLabel}
          onDeleteLabel={handleDeleteLabel}
          onSavePreset={handleSavePreset}
          onDeletePreset={handleDeletePreset}
          onSaveMembersConfig={handleSaveMembersConfig}
          onSyncMembersConfig={handleSyncMembersConfig}
          onSaveExternalBase={handleSaveExternalBase}
          onDeleteExternalBase={handleDeleteExternalBase}
          onSyncExternalBase={handleSyncExternalBase}
          onSavePeople={handleSavePeople}
          onSaveFieldCatalogItem={handleSaveFieldCatalogItem}
          onDeleteFieldCatalogItem={handleDeleteFieldCatalogItem}
          onSaveScaleTaskCatalogItem={handleSaveScaleTaskCatalogItem}
          onDeleteScaleTaskCatalogItem={handleDeleteScaleTaskCatalogItem}
          formDeleteKeyConfigured={formDeleteKeyConfigured}
          onSaveFormDeleteKey={handleSaveFormDeleteKey}
          messageTemplates={messageTemplates}
          personPresets={personPresets}
          messagingConfig={messagingConfig}
          onSaveMessagingConfig={handleSaveMessagingConfig}
          onSaveMessageTemplate={handleSaveMessageTemplate}
          onDeleteMessageTemplate={handleDeleteMessageTemplate}
          onSavePersonPreset={handleSavePersonPreset}
          onDeletePersonPreset={handleDeletePersonPreset}
        />
      )}
      {screen === "results" && activeForm && (
        <InternalResultsFlow
          app={app}
          onNavigate={onNavigate}
          activeForm={activeForm}
          currentUser={currentUser}
          labels={labels}
          people={people}
          onSaveEscala={handleSaveEscala}
        />
      )}
      {screen === "respond" && activeForm && (
        <InternalRespondFlow
          app={app}
          activeForm={activeForm}
          people={people}
          externalBases={externalBases}
          onNavigate={onNavigate}
          onSaveEscala={handleSaveEscala}
          onClaimEscalaSlot={handleClaimEscalaSlot}
        />
      )}
    </>
  );
};
