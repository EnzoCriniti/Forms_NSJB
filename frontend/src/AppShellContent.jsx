/**
 * @file frontend/src/AppShellContent.jsx
 * @summary Shell autenticado do frontend.
 * @responsibility Renderizar a navegacao principal e as telas internas apos o login.
 */

import React from "react";
import { COLORS } from "./components/ui";
import { canCreateForms } from "./lib/auth";
import { buildPublicFormResultsPath } from "./lib/appPublicRoutes";
import { AppHeader } from "./components/AppHeader";
import { DashboardScreen } from "./screens/DashboardScreen";
import { EventsScreen } from "./screens/EventsScreen";
import { EventMessageEditorScreen } from "./screens/EventMessageEditorScreen";
import { EventMessageDetailScreen } from "./screens/EventMessageDetailScreen";
import { FormListScreen } from "./screens/FormListScreen";
import { CreateFormScreen } from "./screens/CreateFormScreen";
import { ResultsScreen } from "./screens/ResultsScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { PublicFormScreen } from "./screens/PublicFormScreen";
import { PublicEscalaScreen } from "./screens/PublicEscalaScreen";
import { selectEventForms, selectEventMessage, selectFormResponses, selectFormSections } from "./lib/appShellContentSelectors";

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
          <EventMessageEditorScreen
            event={activeEvent}
            eventForms={selectEventForms(forms, activeEvent)}
            message={selectEventMessage(activeEvent, activeMessageId)}
            messageTemplates={messageTemplates}
            personPresets={personPresets}
            people={people}
            membersConfig={membersConfig}
            messagingConfig={messagingConfig}
            onSave={payload => handleSaveEventMessage(activeEvent.id, payload)}
            onCancel={saved => {
              if (saved?.id) {
                app.setActiveMessageId(saved.id);
                app.setScreen("eventMessageDetail");
              } else {
                app.setActiveMessageId(null);
                app.setScreen("events");
              }
            }}
          />
        )}
        {screen === "eventMessageDetail" && currentUser && activeEvent && activeMessageId && (
          <EventMessageDetailScreen
            event={activeEvent}
            message={selectEventMessage(activeEvent, activeMessageId)}
            onMessageUpdated={applyMessageUpdate}
            onMessageDeleted={id => { applyMessageDeletion(id); app.setActiveMessageId(null); app.setScreen("events"); }}
            onEdit={() => app.setScreen("eventMessageEditor")}
            onBack={() => { app.setActiveMessageId(null); app.setScreen("events"); }}
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
          <ResultsScreen
            onNavigate={onNavigate}
            form={activeForm}
            responses={selectFormResponses(app.responsesByForm, activeForm.id)}
            sections={selectFormSections(app.escalaByForm, activeForm.id)}
            people={people}
            user={currentUser}
            labels={labels}
            onSaveSections={sections => handleSaveEscala(activeForm.id, sections)}
          />
        )}
        {screen === "respond" && activeForm && activeForm.type === "presenca" && (
          <PublicFormScreen
            form={activeForm}
            responses={selectFormResponses(app.responsesByForm, activeForm.id)}
            onSaveResponse={app.handleSaveResponse}
            onBack={() => onNavigate("list")}
            people={people}
            externalBases={externalBases}
            resultsHref={activeForm.resultsConfig?.publicResultsEnabled ? buildPublicFormResultsPath(activeForm) : ""}
            variant="internal"
          />
        )}
        {screen === "respond" && activeForm && activeForm.type === "escala_organ" && (
          <PublicEscalaScreen
            form={activeForm}
            onBack={() => onNavigate("list")}
            people={people}
            sections={selectFormSections(app.escalaByForm, activeForm.id)}
            onSaveSections={sections => handleSaveEscala(activeForm.id, sections)}
            onClaimSlot={(sectionIndex, slotIndex, person) => handleClaimEscalaSlot(activeForm.id, sectionIndex, slotIndex, person)}
            variant="internal"
          />
        )}
      </main>
    </div>
  );
};
