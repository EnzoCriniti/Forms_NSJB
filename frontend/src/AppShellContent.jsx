/**
 * @file frontend/src/AppShellContent.jsx
 * @summary Shell autenticado do frontend.
 * @responsibility Renderizar a navegacao principal e delegar fluxos internos apos o login.
 */

import React from "react";
import { COLORS } from "./components/ui";
import { canCreateForms } from "./lib/auth";
import { AppHeader } from "./components/AppHeader";
import { EventMessageDetailFlow, EventMessageEditorFlow } from "./AppShellEventMessageFlows";
import { InternalRespondFlow, InternalResultsFlow } from "./AppShellFormFlows";
import { DashboardScreen } from "./screens/DashboardScreen";
import { EventsScreen } from "./screens/EventsScreen";
import { FormListScreen } from "./screens/FormListScreen";
import { CreateFormScreen } from "./screens/CreateFormScreen";
import { SettingsScreen } from "./screens/SettingsScreen";

export const AppShellContent = ({ app }) => {
  const {
    nav,
    screen,
    currentUser,
    theme,
    fontScale,
    onNavigate,
    onIncreaseFontScale,
    onDecreaseFontScale,
    onToggleTheme,
    onOpenSettings,
    onLogin,
    onLogout,
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
    <div className="app-root" style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", minHeight: "100vh", background: COLORS.surfaceAlt, color: COLORS.text }}>
      <AppHeader
        nav={nav}
        screen={screen}
        currentUser={currentUser}
        theme={theme}
        fontScale={fontScale}
        onNavigate={onNavigate}
        onIncreaseFontScale={onIncreaseFontScale}
        onDecreaseFontScale={onDecreaseFontScale}
        onToggleTheme={onToggleTheme}
        onOpenSettings={onOpenSettings}
        onLogin={onLogin}
        onLogout={onLogout}
      />
      <main className="app-main" style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 20px" }}>
        {screen === "dashboard" && (
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
        )}
        {screen === "events" && currentUser && (
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
        )}
        {screen === "create" && (
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
            onSaveForm={app.handleSaveForm}
            form={editingForm}
            event={activeEvent}
            isDuplicateMode={Boolean(draftForm)}
          />
        )}
        {screen === "settings" && canCreateForms(currentUser) && (
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
      </main>
    </div>
  );
};
