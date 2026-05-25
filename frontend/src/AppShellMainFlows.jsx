/**
 * @file frontend/src/AppShellMainFlows.jsx
 * @summary Adapters das telas principais do shell autenticado.
 * @responsibility Montar dashboard, eventos, lista, criacao e configuracoes fora de AppShellContent.
 */

import React from "react";
import { canCreateForms } from "./lib/auth";
import { CreateFormScreen } from "./screens/CreateFormScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { EventsScreen } from "./screens/EventsScreen";
import { FormListScreen } from "./screens/FormListScreen";
import { SettingsScreen } from "./screens/SettingsScreen";

export const DashboardFlow = ({ app }) => {
  const { currentUser, fieldCatalog, forms, labels, onNavigate, people, presets, scaleTaskCatalog } = app;

  return (
    <DashboardScreen
      onNavigate={onNavigate}
      forms={forms}
      labels={labels}
      people={people}
      presets={presets}
      fieldCatalog={fieldCatalog}
      scaleTaskCatalog={scaleTaskCatalog}
      user={currentUser}
    />
  );
};

export const EventsFlow = ({ app }) => {
  const {
    activeEventId,
    currentUser,
    events,
    forms,
    labels,
    handleArchiveForm,
    handleCreateFormInEvent,
    handleDeleteEvent,
    handleDeleteForm,
    handleDuplicateForm,
    handlePublishEvent,
    handleSaveEvent,
    handleTogglePinnedEvent,
    handleTogglePinnedForm,
    onNavigate,
    pinnedEventIds,
    pinnedFormIds,
  } = app;

  if (!currentUser) return null;

  return (
    <EventsScreen
      events={events}
      forms={forms}
      labels={labels}
      user={currentUser}
      pinnedEventIds={pinnedEventIds}
      pinnedFormIds={pinnedFormIds}
      initialSelectedEventId={activeEventId}
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
  );
};

export const FormListFlow = ({ app }) => {
  const {
    currentUser,
    formDeleteKeyConfigured,
    forms,
    labels,
    handleArchiveForm,
    handleDeleteForm,
    handleDuplicateForm,
    handleTogglePinnedForm,
    onNavigate,
    pinnedFormIds,
  } = app;

  return (
    <FormListScreen
      onNavigate={onNavigate}
      onDuplicateForm={handleDuplicateForm}
      onArchiveForm={handleArchiveForm}
      onTogglePinnedForm={handleTogglePinnedForm}
      pinnedFormIds={pinnedFormIds}
      user={currentUser}
      labels={labels}
      forms={forms}
      onDeleteForm={handleDeleteForm}
      formDeleteKeyConfigured={formDeleteKeyConfigured}
    />
  );
};

export const CreateFormFlow = ({ app }) => {
  const {
    activeEvent,
    draftForm,
    editingForm,
    externalBases,
    fieldCatalog,
    labels,
    membersConfig,
    onNavigate,
    handleSaveForm,
    handleSavePreset,
    people,
    presets,
    scaleTaskCatalog,
  } = app;

  return (
    <CreateFormScreen
      onNavigate={onNavigate}
      people={people}
      membersConfig={membersConfig}
      externalBases={externalBases}
      labels={labels}
      presets={presets}
      fieldCatalog={fieldCatalog}
      scaleTaskCatalog={scaleTaskCatalog}
      onSavePreset={handleSavePreset}
      onSaveForm={handleSaveForm}
      form={editingForm}
      event={activeEvent}
      isDuplicateMode={Boolean(draftForm)}
    />
  );
};

export const SettingsFlow = ({ app }) => {
  const {
    currentUser,
    externalBases,
    fieldCatalog,
    formDeleteKeyConfigured,
    labels,
    membersConfig,
    messageTemplates,
    messagingConfig,
    handleDeleteExternalBase,
    handleDeleteFieldCatalogItem,
    handleDeleteLabel,
    handleDeleteMessageTemplate,
    handleDeletePersonPreset,
    handleDeletePreset,
    handleDeleteScaleTaskCatalogItem,
    handleDeleteUser,
    onNavigate,
    handleSaveExternalBase,
    handleSaveFieldCatalogItem,
    handleSaveFormDeleteKey,
    handleSaveLabel,
    handleSaveMembersConfig,
    handleSaveMessageTemplate,
    handleSaveMessagingConfig,
    handleSavePeople,
    handleSavePersonPreset,
    handleSavePreset,
    handleSaveScaleTaskCatalogItem,
    handleSaveUser,
    handleSyncExternalBase,
    handleSyncMembersConfig,
    people,
    personPresets,
    presets,
    scaleTaskCatalog,
    users,
  } = app;

  if (!canCreateForms(currentUser)) return null;

  return (
    <SettingsScreen
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
  );
};
