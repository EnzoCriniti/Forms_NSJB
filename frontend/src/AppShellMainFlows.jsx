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
import { ReportsScreen } from "./screens/ReportsScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { getShellActions, getShellData, getShellSetters, getShellState } from "./lib/appShellObject";

export const DashboardFlow = ({ app }) => {
  const state = getShellState(app);
  const data = getShellData(app);
  const actions = getShellActions(app);
  const { currentUser } = state;
  const { events, forms } = data;
  const { onNavigate } = actions;

  return (
    <DashboardScreen
      onNavigate={onNavigate}
      forms={forms}
      events={events}
      user={currentUser}
    />
  );
};

export const EventsFlow = ({ app }) => {
  const state = getShellState(app);
  const data = getShellData(app);
  const actions = getShellActions(app);
  const setters = getShellSetters(app);
  const {
    activeEventId,
    currentUser,
    pinnedEventIds,
    pinnedFormIds,
  } = state;
  const {
    events,
    forms,
    labels,
    people,
  } = data;
  const {
    applyMessageDeletion,
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
    openEventMessageDetail,
    openEventMessageEditor,
  } = actions;
  const { setActiveEventId } = setters;

  if (!currentUser) return null;

  return (
    <EventsScreen
      events={events}
      forms={forms}
      labels={labels}
      people={people}
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
      onCreateEventMessage={event => openEventMessageEditor(event, null)}
      onOpenEventMessage={(event, message) => openEventMessageDetail(event, message)}
      onEditEventMessage={(event, message) => openEventMessageEditor(event, message)}
      onDeleteEventMessage={applyMessageDeletion}
      onSelectEvent={setActiveEventId}
      onNavigate={onNavigate}
    />
  );
};

export const FormListFlow = ({ app }) => {
  const state = getShellState(app);
  const data = getShellData(app);
  const actions = getShellActions(app);
  const {
    currentUser,
    formDeleteKeyConfigured,
    pinnedFormIds,
  } = state;
  const {
    forms,
    labels,
  } = data;
  const {
    handleArchiveForm,
    handleDeleteForm,
    handleDuplicateForm,
    handleTogglePinnedForm,
    onNavigate,
  } = actions;

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
  const state = getShellState(app);
  const data = getShellData(app);
  const actions = getShellActions(app);
  const {
    activeEvent,
    draftForm,
    editingForm,
  } = state;
  const {
    externalBases,
    fieldCatalog,
    labels,
    membersConfig,
    people,
    presets,
    scaleTaskCatalog,
  } = data;
  const {
    handleSaveForm,
    handleSavePreset,
    onNavigate,
  } = actions;

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

export const ReportsFlow = ({ app }) => {
  const state = getShellState(app);
  const actions = getShellActions(app);
  const { currentUser } = state;
  const { onNavigate } = actions;

  if (!canCreateForms(currentUser)) return null;

  return <ReportsScreen onNavigate={onNavigate} user={currentUser} />;
};

export const SettingsFlow = ({ app }) => {
  const state = getShellState(app);
  const data = getShellData(app);
  const actions = getShellActions(app);
  const {
    currentUser,
    formDeleteKeyConfigured,
  } = state;
  const {
    externalBases,
    fieldCatalog,
    labels,
    membersConfig,
    messageTemplates,
    messagingConfig,
    people,
    personPresets,
    presets,
    scaleTaskCatalog,
    users,
  } = data;
  const {
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
  } = actions;

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
