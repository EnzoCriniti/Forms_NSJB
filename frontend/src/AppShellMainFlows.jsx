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

export const DashboardFlow = ({
  currentUser,
  fieldCatalog,
  forms,
  labels,
  onNavigate,
  people,
  presets,
  scaleTaskCatalog,
}) => (
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

export const EventsFlow = ({
  app,
  activeEventId,
  currentUser,
  events,
  forms,
  labels,
  onArchiveForm,
  onDeleteEvent,
  onDeleteForm,
  onDuplicateForm,
  onCreateFormInEvent,
  onNavigate,
  onPublishEvent,
  onSaveEvent,
  onTogglePinnedEvent,
  onTogglePinnedForm,
  pinnedEventIds,
  pinnedFormIds,
}) => {
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
      onSaveEvent={onSaveEvent}
      onPublishEvent={onPublishEvent}
      onDeleteEvent={onDeleteEvent}
      onTogglePinnedEvent={onTogglePinnedEvent}
      onCreateFormInEvent={onCreateFormInEvent}
      onDuplicateForm={onDuplicateForm}
      onArchiveForm={onArchiveForm}
      onTogglePinnedForm={onTogglePinnedForm}
      onDeleteForm={onDeleteForm}
      onCreateEventMessage={event => app.openEventMessageEditor(event, null)}
      onOpenEventMessage={(event, message) => app.openEventMessageDetail(event, message)}
      onNavigate={onNavigate}
    />
  );
};

export const FormListFlow = ({
  currentUser,
  formDeleteKeyConfigured,
  forms,
  labels,
  onArchiveForm,
  onDeleteForm,
  onDuplicateForm,
  onNavigate,
  onTogglePinnedForm,
  pinnedFormIds,
}) => (
  <FormListScreen
    onNavigate={onNavigate}
    onDuplicateForm={onDuplicateForm}
    onArchiveForm={onArchiveForm}
    onTogglePinnedForm={onTogglePinnedForm}
    pinnedFormIds={pinnedFormIds}
    user={currentUser}
    labels={labels}
    forms={forms}
    onDeleteForm={onDeleteForm}
    formDeleteKeyConfigured={formDeleteKeyConfigured}
  />
);

export const CreateFormFlow = ({
  activeEvent,
  app,
  draftForm,
  editingForm,
  externalBases,
  fieldCatalog,
  labels,
  membersConfig,
  onNavigate,
  onSavePreset,
  people,
  presets,
  scaleTaskCatalog,
}) => (
  <CreateFormScreen
    onNavigate={onNavigate}
    people={people}
    membersConfig={membersConfig}
    externalBases={externalBases}
    labels={labels}
    presets={presets}
    fieldCatalog={fieldCatalog}
    scaleTaskCatalog={scaleTaskCatalog}
    onSavePreset={onSavePreset}
    onSaveForm={app.handleSaveForm}
    form={editingForm}
    event={activeEvent}
    isDuplicateMode={Boolean(draftForm)}
  />
);

export const SettingsFlow = ({
  currentUser,
  externalBases,
  fieldCatalog,
  formDeleteKeyConfigured,
  labels,
  membersConfig,
  messageTemplates,
  messagingConfig,
  onDeleteExternalBase,
  onDeleteFieldCatalogItem,
  onDeleteLabel,
  onDeleteMessageTemplate,
  onDeletePersonPreset,
  onDeletePreset,
  onDeleteScaleTaskCatalogItem,
  onDeleteUser,
  onNavigate,
  onSaveExternalBase,
  onSaveFieldCatalogItem,
  onSaveFormDeleteKey,
  onSaveLabel,
  onSaveMembersConfig,
  onSaveMessageTemplate,
  onSaveMessagingConfig,
  onSavePeople,
  onSavePersonPreset,
  onSavePreset,
  onSaveScaleTaskCatalogItem,
  onSaveUser,
  onSyncExternalBase,
  onSyncMembersConfig,
  people,
  personPresets,
  presets,
  scaleTaskCatalog,
  users,
}) => {
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
      onSaveUser={onSaveUser}
      onDeleteUser={onDeleteUser}
      onSaveLabel={onSaveLabel}
      onDeleteLabel={onDeleteLabel}
      onSavePreset={onSavePreset}
      onDeletePreset={onDeletePreset}
      onSaveMembersConfig={onSaveMembersConfig}
      onSyncMembersConfig={onSyncMembersConfig}
      onSaveExternalBase={onSaveExternalBase}
      onDeleteExternalBase={onDeleteExternalBase}
      onSyncExternalBase={onSyncExternalBase}
      onSavePeople={onSavePeople}
      onSaveFieldCatalogItem={onSaveFieldCatalogItem}
      onDeleteFieldCatalogItem={onDeleteFieldCatalogItem}
      onSaveScaleTaskCatalogItem={onSaveScaleTaskCatalogItem}
      onDeleteScaleTaskCatalogItem={onDeleteScaleTaskCatalogItem}
      formDeleteKeyConfigured={formDeleteKeyConfigured}
      onSaveFormDeleteKey={onSaveFormDeleteKey}
      messageTemplates={messageTemplates}
      personPresets={personPresets}
      messagingConfig={messagingConfig}
      onSaveMessagingConfig={onSaveMessagingConfig}
      onSaveMessageTemplate={onSaveMessageTemplate}
      onDeleteMessageTemplate={onDeleteMessageTemplate}
      onSavePersonPreset={onSavePersonPreset}
      onDeletePersonPreset={onDeletePersonPreset}
    />
  );
};
