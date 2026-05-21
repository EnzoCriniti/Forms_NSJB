/**
 * @file frontend/src/features/admin/AdminSettingsModal.jsx
 * @summary Central administrativa do frontend.
 * @responsibility Gerenciar usuarios, socios, catalogos, classificacoes e templates.
 */

import React, { useState } from "react";
import { Btn, ConfirmModal, FeedbackBanner, resolveActionErrorMessage } from "../../components/ui";
import { MemberListConfigModalContent } from "../members/MemberListConfigModal";
import { MessagingSettingsPanel } from "./MessagingSettingsPanel";
import { CatalogManagementPanel } from "./adminCatalogPanels";
import { ExternalBasesPanel, UsersManagementPanel } from "./adminAccessPanels";
import { LabelsPanel, TemplatesPanel } from "./adminOrganizationPanels";
import { SecurityPanel } from "./adminSecurityPanels";
import { AdminSettingsHeader } from "./adminShellPanels";
import { AuditLogsPanel, DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS, normalizeFieldSelectionSource, normalizeIdentifier } from "./adminSettingsShared";

const emptyUser = { name: "", username: "", password: "", role: "viewer" };
const emptyLabel = { name: "", color: "#2e7d32" };
const emptyFieldCatalog = { key: "", name: "", type: "yes_no", category: "presenca", defaultLabel: "", gridSchema: { rows: DEFAULT_GRID_ROWS, cols: DEFAULT_GRID_COLS }, selectionSource: { kind: "members" }, description: "", active: true };
const emptyScaleTaskCatalog = { key: "", name: "", category: "cozinha", defaultLabel: "", description: "", active: true };
const emptyExternalBase = { name: "", description: "", sourceType: "google_sheets", sheetUrl: "", range: "Itens!A:B", valueColumn: "A", labelColumn: "B", descriptionColumn: "", activeColumn: "", syncEnabled: true, syncFrequencyHours: 24, active: true, items: [] };
const emptySecurityDraft = { currentMasterKey: "", newMasterKey: "" };


export const AdminSettingsModal = ({
  users,
  labels,
  presets,
  fieldCatalog = [],
  scaleTaskCatalog = [],
  membersConfig,
  externalBases = [],
  people,
  currentUser,
  onSaveUser,
  onDeleteUser,
  onSaveLabel,
  onDeleteLabel,
  onDeletePreset,
  onSaveFieldCatalogItem,
  onDeleteFieldCatalogItem,
  onSaveScaleTaskCatalogItem,
  onDeleteScaleTaskCatalogItem,
  onSaveMembersConfig,
  onSaveExternalBase,
  onDeleteExternalBase,
  onSyncExternalBase,
  onSavePeople,
  onSyncMembersConfig,
  formDeleteKeyConfigured = null,
  onSaveFormDeleteKey,
  messagingConfig,
  messageTemplates = [],
  personPresets = [],
  onSaveMessagingConfig,
  onSaveMessageTemplate,
  onDeleteMessageTemplate,
  onSavePersonPreset,
  onDeletePersonPreset,
  onClose,
  mode = "modal",
}) => {
  const [tab, setTab] = useState("users");
  const [userDraft, setUserDraft] = useState(emptyUser);
  const [labelDraft, setLabelDraft] = useState(emptyLabel);
  const [fieldCatalogDraft, setFieldCatalogDraft] = useState(emptyFieldCatalog);
  const [scaleTaskDraft, setScaleTaskDraft] = useState(emptyScaleTaskCatalog);
  const [externalBaseDraft, setExternalBaseDraft] = useState(emptyExternalBase);
  const [securityDraft, setSecurityDraft] = useState(emptySecurityDraft);
  const [catalogMode, setCatalogMode] = useState("fields");
  const [feedback, setFeedback] = useState(null);
  const [busyAction, setBusyAction] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const tabs = [
    { key: "users", label: "Acessos", description: "Usuarios e perfis" },
    { key: "members", label: "Base de socios", description: "Fonte sincronizada e mapeamento" },
    { key: "external-bases", label: "Bases externas", description: "Listas sincronizadas para campos do formulario" },
    { key: "catalog", label: "Campos e tarefas", description: "Biblioteca reutilizavel" },
    { key: "labels", label: "Classificacoes", description: "Etiquetas dos formularios" },
    { key: "presets", label: "Templates", description: "Templates de formulario" },
    { key: "messages", label: "Mensagens", description: "Modelos, presets e disparo" },
    { key: "security", label: "Exclusao segura", description: "Chave mestra" },
    ...(currentUser?.role === "admin" ? [{ key: "audit", label: "Historico", description: "Auditoria do sistema" }] : []),
  ];
  const activeTab = tabs.find(item => item.key === tab) || tabs[0];

  const requestDelete = (title, message, confirmLabel, onConfirm) => {
    setPendingDelete({ title, message, confirmLabel, onConfirm });
  };

  const submitUser = async () => {
    if (!userDraft.username.trim() || (!userDraft.id && !userDraft.password.trim())) return;
    const isEdit = Boolean(userDraft.id);
    setBusyAction("user");
    setFeedback({ tone: "loading", message: isEdit ? "Salvando usuario..." : "Criando usuario..." });
    try {
      await onSaveUser({ ...userDraft, name: userDraft.name.trim() || userDraft.username.trim(), username: userDraft.username.trim() });
      setUserDraft(emptyUser);
      setFeedback({ tone: "success", message: isEdit ? "Alterações salvas." : "Criado com sucesso." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusyAction(null);
    }
  };

  const submitLabel = async () => {
    if (!labelDraft.name.trim()) return;
    const isEdit = Boolean(labelDraft.id);
    setBusyAction("label");
    setFeedback({ tone: "loading", message: isEdit ? "Salvando classificacao..." : "Criando classificacao..." });
    try {
      await onSaveLabel({ ...labelDraft, name: labelDraft.name.trim(), createdBy: labelDraft.createdBy || currentUser?.name || "Admin" });
      setLabelDraft(emptyLabel);
      setFeedback({ tone: "success", message: isEdit ? "Alterações salvas." : "Criado com sucesso." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusyAction(null);
    }
  };

  const submitExternalBase = async () => {
    if (!externalBaseDraft.name.trim()) return;
    const isEdit = Boolean(externalBaseDraft.id);
    setBusyAction("externalBase");
    setFeedback({ tone: "loading", message: isEdit ? "Salvando base externa..." : "Criando base externa..." });
    try {
      await onSaveExternalBase({ ...externalBaseDraft, name: externalBaseDraft.name.trim(), description: String(externalBaseDraft.description || "").trim() });
      setExternalBaseDraft(emptyExternalBase);
      setFeedback({ tone: "success", message: isEdit ? "Alteracoes salvas." : "Criado com sucesso." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusyAction(null);
    }
  };

  const submitExternalBaseSync = async id => {
    if (!id) return;
    setBusyAction(`externalBaseSync:${id}`);
    setFeedback({ tone: "loading", message: "Sincronizando base externa..." });
    try {
      const result = await onSyncExternalBase(id);
      setExternalBaseDraft({ ...emptyExternalBase, ...(result.externalBase || externalBaseDraft) });
      setFeedback({ tone: "success", message: `${result.importedCount} opcao(oes) sincronizadas.` });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusyAction(null);
    }
  };

  const submitFieldCatalog = async () => {
    const resolvedKey = normalizeIdentifier(fieldCatalogDraft.key || fieldCatalogDraft.name || fieldCatalogDraft.defaultLabel);
    if (!resolvedKey || !fieldCatalogDraft.name.trim() || !fieldCatalogDraft.defaultLabel.trim()) return;
    const isEdit = Boolean(fieldCatalogDraft.id);
    const selectionSource = normalizeFieldSelectionSource(fieldCatalogDraft);
    if (fieldCatalogDraft.type === "person_select" && selectionSource?.kind === "external_base" && !selectionSource.externalBaseId) return;
    setBusyAction("fieldCatalog");
    setFeedback({ tone: "loading", message: isEdit ? "Salvando campo base..." : "Criando campo base..." });
    try {
      await onSaveFieldCatalogItem({ ...fieldCatalogDraft, key: resolvedKey, ...(selectionSource ? { selectionSource } : {}) });
      setFieldCatalogDraft(emptyFieldCatalog);
      setFeedback({ tone: "success", message: isEdit ? "Alterações salvas." : "Criado com sucesso." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusyAction(null);
    }
  };

  const submitScaleTask = async () => {
    const resolvedKey = normalizeIdentifier(scaleTaskDraft.key || scaleTaskDraft.name || scaleTaskDraft.defaultLabel);
    if (!resolvedKey || !scaleTaskDraft.name.trim() || !scaleTaskDraft.defaultLabel.trim()) return;
    const isEdit = Boolean(scaleTaskDraft.id);
    setBusyAction("scaleTask");
    setFeedback({ tone: "loading", message: isEdit ? "Salvando tarefa base..." : "Criando tarefa base..." });
    try {
      await onSaveScaleTaskCatalogItem({ ...scaleTaskDraft, key: resolvedKey });
      setScaleTaskDraft(emptyScaleTaskCatalog);
      setFeedback({ tone: "success", message: isEdit ? "Alterações salvas." : "Criado com sucesso." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusyAction(null);
    }
  };

  const submitSecurity = async () => {
    if (!securityDraft.newMasterKey.trim()) return;
    setBusyAction("security");
    setFeedback({ tone: "loading", message: formDeleteKeyConfigured ? "Atualizando chave mestra..." : "Configurando chave mestra..." });
    try {
      await onSaveFormDeleteKey({
        currentMasterKey: formDeleteKeyConfigured ? securityDraft.currentMasterKey : undefined,
        newMasterKey: securityDraft.newMasterKey,
      });
      setSecurityDraft(emptySecurityDraft);
      setFeedback({ tone: "success", message: formDeleteKeyConfigured ? "Alteracoes salvas." : "Chave mestra configurada." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusyAction(null);
    }
  };

  const isScreen = mode === "screen";

  const content = (
      <div
        className={isScreen ? "settings-screen-card admin-settings-shell" : "modal-card modal-card-wide admin-settings-shell"}
        style={isScreen ? { width: "100%", maxWidth: "100%", margin: 0 } : undefined}
      >
        {!isScreen && (
          <div className="settings-modal-header" style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
            <Btn v="ghost" onClick={onClose}>Fechar</Btn>
          </div>
        )}

        <AdminSettingsHeader tabs={tabs} tab={tab} setTab={setTab} activeTab={activeTab} />

        {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} fixed />}

        {tab === "users" && (
          <UsersManagementPanel
            userDraft={userDraft}
            setUserDraft={setUserDraft}
            submitUser={submitUser}
            busyAction={busyAction}
            users={users}
            requestDelete={requestDelete}
            onDeleteUser={onDeleteUser}
            currentUser={currentUser}
          />
        )}

        {tab === "members" && <MemberListConfigModalContent config={membersConfig} people={people} onSave={onSaveMembersConfig} onSync={onSyncMembersConfig} />}

        {tab === "external-bases" && (
          <ExternalBasesPanel
            externalBaseDraft={externalBaseDraft}
            setExternalBaseDraft={setExternalBaseDraft}
            submitExternalBase={submitExternalBase}
            submitExternalBaseSync={submitExternalBaseSync}
            busyAction={busyAction}
            externalBases={externalBases}
            requestDelete={requestDelete}
            onDeleteExternalBase={onDeleteExternalBase}
          />
        )}

        {tab === "security" && (
          <SecurityPanel
            formDeleteKeyConfigured={formDeleteKeyConfigured}
            securityDraft={securityDraft}
            setSecurityDraft={setSecurityDraft}
            submitSecurity={submitSecurity}
            busyAction={busyAction}
            onCancelSecurity={() => setSecurityDraft(emptySecurityDraft)}
          />
        )}
        {tab === "catalog" && (
          <CatalogManagementPanel
            catalogMode={catalogMode}
            setCatalogMode={setCatalogMode}
            fieldCatalogDraft={fieldCatalogDraft}
            setFieldCatalogDraft={setFieldCatalogDraft}
            externalBases={externalBases}
            fieldCatalog={fieldCatalog}
            submitFieldCatalog={submitFieldCatalog}
            busyAction={busyAction}
            onDeleteFieldCatalogItem={onDeleteFieldCatalogItem}
            requestDelete={requestDelete}
            onCancelFieldCatalog={() => setFieldCatalogDraft(emptyFieldCatalog)}
            scaleTaskDraft={scaleTaskDraft}
            setScaleTaskDraft={setScaleTaskDraft}
            scaleTaskCatalog={scaleTaskCatalog}
            submitScaleTask={submitScaleTask}
            onDeleteScaleTaskCatalogItem={onDeleteScaleTaskCatalogItem}
            onCancelScaleTask={() => setScaleTaskDraft(emptyScaleTaskCatalog)}
          />
        )}

        {tab === "labels" && (
          <LabelsPanel
            labelDraft={labelDraft}
            setLabelDraft={setLabelDraft}
            submitLabel={submitLabel}
            busyAction={busyAction}
            labels={labels}
            requestDelete={requestDelete}
            onDeleteLabel={onDeleteLabel}
          />
        )}
        {tab === "presets" && (
          <TemplatesPanel
            presets={presets}
            requestDelete={requestDelete}
            onDeletePreset={onDeletePreset}
          />
        )}

        {tab === "messages" && (
          <MessagingSettingsPanel
            messagingConfig={messagingConfig}
            messageTemplates={messageTemplates}
            personPresets={personPresets}
            people={people}
            onSaveMessagingConfig={onSaveMessagingConfig}
            onSaveMessageTemplate={onSaveMessageTemplate}
            onDeleteMessageTemplate={onDeleteMessageTemplate}
            onSavePersonPreset={onSavePersonPreset}
            onDeletePersonPreset={onDeletePersonPreset}
          />
        )}

        {tab === "audit" && currentUser?.role === "admin" && <AuditLogsPanel currentUser={currentUser} />}
        <ConfirmModal
          open={Boolean(pendingDelete)}
          title={pendingDelete?.title || "Confirmar exclusão"}
          message={pendingDelete?.message || "Tem certeza que deseja continuar?"}
          confirmLabel={pendingDelete?.confirmLabel || "Excluir"}
          tone="danger"
          busy={busyAction === "delete"}
          onCancel={() => setPendingDelete(null)}
          onConfirm={async () => {
            if (!pendingDelete) return;
            setBusyAction("delete");
            setFeedback({ tone: "loading", message: "Excluindo..." });
            try {
              await pendingDelete.onConfirm();
              setFeedback({ tone: "success", message: "Excluído com sucesso." });
              setPendingDelete(null);
            } catch (error) {
              setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
            } finally {
              setBusyAction(null);
            }
          }}
        />
      </div>
  );

  if (isScreen) {
    return content;
  }

  return (
    <div className="modal-backdrop">
      {content}
    </div>
  );
};



