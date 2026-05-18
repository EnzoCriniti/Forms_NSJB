/**
 * @file frontend/src/features/admin/AdminSettingsModal.jsx
 * @summary Central administrativa do frontend.
 * @responsibility Gerenciar usuarios, socios, catalogos, classificacoes e templates.
 */

import React, { useState } from "react";
import { COLORS, Btn, ConfirmModal, FeedbackBanner, FieldControl, NotePanel, SplitSection, SurfacePanel, resolveActionErrorMessage } from "../../components/ui";
import { MemberListConfigModalContent } from "../members/MemberListConfigModal";
import { MessagingSettingsPanel } from "./MessagingSettingsPanel";
import { CatalogManagementPanel } from "./adminCatalogPanels";
import { ExternalBasesPanel, UsersManagementPanel } from "./adminAccessPanels";
import { AuditLogsPanel, DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS, PaginatedList, normalizeFieldSelectionSource, normalizeIdentifier } from "./adminSettingsShared";

const inputStyle = {
  width: "100%",
  minHeight: 42,
  padding: "10px 12px",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 10,
  background: COLORS.surface,
  color: COLORS.text,
  boxShadow: "var(--shadow-sm)",
};

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

        <div className="settings-tabs" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          {tabs.map(item => (
            <Btn
              key={item.key}
              v={tab === item.key ? "primary" : "secondary"}
              sz="sm"
              className="settings-tab"
              onClick={() => setTab(item.key)}
              style={{
                alignItems: "flex-start",
                border: tab === item.key ? "1px solid rgba(26, 107, 60, 0.28)" : `1px solid ${COLORS.borderLight}`,
                borderRadius: 12,
                boxShadow: tab === item.key ? "0 10px 24px rgba(26, 107, 60, 0.14)" : "none",
                flexDirection: "column",
                gap: 2,
                minHeight: 54,
                padding: "9px 12px",
                textAlign: "left",
              }}
            >
              <span className="settings-tab__label">{item.label}</span>
              <span className="settings-tab__description" aria-hidden="true">{item.description}</span>
            </Btn>
          ))}
        </div>

        <div className="settings-active-panel">
          <div className="settings-active-panel__eyebrow">Modulo administrativo</div>
          <div>
            <strong>{activeTab.label}</strong>
            <span>{activeTab.description}</span>
          </div>
        </div>

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
          <SplitSection
            leftTitle={formDeleteKeyConfigured ? "Alterar chave mestra" : "Cadastrar chave mestra"}
            rightTitle="Status da seguranca"
            left={(
              <div style={{ display: "grid", gap: 10 }}>
                <FeedbackBanner
                  tone={formDeleteKeyConfigured === null ? "loading" : "info"}
                  message={formDeleteKeyConfigured === null
                    ? "Carregando status da chave mestra..."
                    : formDeleteKeyConfigured
                      ? "A chave mestra esta configurada. Para alterar, informe a chave atual e a nova chave."
                      : "Nenhuma chave mestra configurada. Cadastre uma nova chave para liberar exclusoes seguras."}
                />
                {formDeleteKeyConfigured && (
                  <FieldControl label="Chave mestra atual">
                    <input
                      type="password"
                      value={securityDraft.currentMasterKey}
                      onChange={e => setSecurityDraft({ ...securityDraft, currentMasterKey: e.target.value })}
                      placeholder="Chave mestra atual"
                      style={inputStyle}
                    />
                  </FieldControl>
                )}
                <FieldControl label="Nova chave mestra">
                  <input
                    type="password"
                    value={securityDraft.newMasterKey}
                    onChange={e => setSecurityDraft({ ...securityDraft, newMasterKey: e.target.value })}
                    placeholder="Nova chave mestra"
                    style={inputStyle}
                  />
                </FieldControl>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Btn
                    onClick={submitSecurity}
                    loading={busyAction === "security"}
                    disabled={!securityDraft.newMasterKey.trim() || (formDeleteKeyConfigured && !securityDraft.currentMasterKey.trim())}
                  >
                    {formDeleteKeyConfigured ? "Salvar alteracao" : "Cadastrar chave"}
                  </Btn>
                  {(securityDraft.currentMasterKey || securityDraft.newMasterKey) && <Btn v="ghost" onClick={() => setSecurityDraft(emptySecurityDraft)}>Cancelar</Btn>}
                </div>
              </div>
            )}
            right={(
              <SurfacePanel background={COLORS.surfaceAlt} border={COLORS.borderLight} radius={8} padding={12} style={{ fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.55 }}>
                <div style={{ fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>
                  {formDeleteKeyConfigured === null
                    ? "Carregando..."
                    : formDeleteKeyConfigured
                      ? "Chave mestra configurada"
                      : "Nenhuma chave mestra configurada"}
                </div>
                <div>A exclusao de formularios exige validacao no backend antes de remover respostas, response_values e escala associados.</div>
              </SurfacePanel>
            )}
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
          <SplitSection
            leftTitle={labelDraft.id ? "Editar classificacao" : "Nova classificacao"}
            rightTitle="Classificacoes existentes"
            left={(
              <div style={{ display: "grid", gap: 12 }}>
                <FieldControl label="Nome da classificacao">
                  <input value={labelDraft.name} onChange={e => setLabelDraft({ ...labelDraft, name: e.target.value })} placeholder="Nome da classificacao" style={inputStyle} />
                </FieldControl>
                <FieldControl label="Cor">
                  <input value={labelDraft.color} onChange={e => setLabelDraft({ ...labelDraft, color: e.target.value })} type="color" style={{ ...inputStyle, padding: 4, height: 44, minHeight: 44, boxSizing: "border-box", overflow: "hidden" }} />
                </FieldControl>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={submitLabel} loading={busyAction === "label"}>{labelDraft.id ? "Salvar classificacao" : "Criar classificacao"}</Btn>
                  {labelDraft.id && <Btn v="ghost" onClick={() => setLabelDraft(emptyLabel)}>Cancelar</Btn>}
                </div>
              </div>
            )}
            right={(
              <PaginatedList
                items={labels}
                emptyText="Nenhuma classificacao cadastrada."
                renderItem={label => (
                  <div key={label.id} className="settings-row">
                    <div><strong><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 99, background: label.color, marginRight: 8 }} />{label.name}</strong><div>Criado por {label.createdBy || "Sistema"}</div></div>
                    <Btn v="secondary" sz="sm" onClick={() => setLabelDraft(label)}>Editar</Btn>
                    <Btn v="danger" sz="sm" onClick={() => requestDelete(
                      "Excluir classificacao",
                      `Tem certeza que deseja excluir a classificacao ${label.name}?`,
                      "Excluir",
                      () => onDeleteLabel(label.id),
                    )}>Remover</Btn>
                  </div>
                )}
              />
            )}
          />
        )}
        {tab === "presets" && (
          <SplitSection
            leftTitle="Como os templates funcionam"
            rightTitle="Templates de formulario existentes"
            left={(
              <div style={{ display: "grid", gap: 10 }}>
                <NotePanel>
                  Templates sao criados na tela de criacao de formulario. Aqui voce acompanha os existentes e pode remover o que nao faz mais sentido.
                </NotePanel>
                <SurfacePanel style={{ fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.55, borderRadius: 10, padding: 12 }}>
                  Para salvar um novo template, use a acao <strong style={{ color: COLORS.text }}>Salvar como Template</strong> dentro do builder do formulario.
                </SurfacePanel>
              </div>
            )}
            right={(
              <PaginatedList
                items={presets}
                emptyText="Nenhum template cadastrado."
                renderItem={preset => {
                  const count = preset.type === "escala_organ"
                    ? `${preset.scaleSections?.length ?? 0} secoes`
                    : `${preset.fieldDefinitions?.length ?? 0} campos`;
                  const modeLabel = preset.type === "escala_organ"
                    ? "Escala da Organ"
                    : (preset.resultsConfig?.formMode === "nucleo" ? "Presenca do nucleo" : "Formulario geral");
                  return (
                    <div key={preset.id} className="settings-row">
                      <div>
                        <strong>{preset.name}</strong>
                        <div>{modeLabel} - {count} - Criado por {preset.createdBy || "Sistema"}</div>
                      </div>
                      <Btn v="danger" sz="sm" onClick={() => requestDelete(
                        "Excluir template",
                        `Tem certeza que deseja excluir o template ${preset.name}?`,
                        "Excluir",
                        () => onDeletePreset(preset.id),
                      )}>Remover</Btn>
                    </div>
                  );
                }}
              />
            )}
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



