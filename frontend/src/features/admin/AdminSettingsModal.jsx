/**
 * @file frontend/src/features/admin/AdminSettingsModal.jsx
 * @summary Central administrativa do frontend.
 * @responsibility Gerenciar usuarios, socios, catalogos, classificacoes e templates.
 */

import React, { useState } from "react";
import { COLORS, Btn, ConfirmModal, FeedbackBanner, FieldControl, NotePanel, SplitSection, SurfacePanel, resolveActionErrorMessage } from "../../components/ui";
import { ROLES } from "../../lib/auth";
import { MemberListConfigModalContent } from "../members/MemberListConfigModal";
import { MessagingSettingsPanel } from "./MessagingSettingsPanel";
import { AdminField, AuditLogsPanel, DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS, FieldCatalogPreview, GridSchemaEditor, PaginatedList, fieldCategoryLabels, fieldTypeLabels, getExternalBaseName, normalizeFieldSelectionSource, normalizeIdentifier, taskCategoryLabels } from "./adminSettingsShared";

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
          <SplitSection
            leftTitle={userDraft.id ? "Editar usuario" : "Novo usuario"}
            rightTitle="Usuarios cadastrados"
            left={(
              <div style={{ display: "grid", gap: 10 }}>
                <AdminField>
                  <input value={userDraft.name} onChange={e => setUserDraft({ ...userDraft, name: e.target.value })} placeholder="Nome exibido" style={inputStyle} />
                </AdminField>
                <AdminField>
                  <input value={userDraft.username} onChange={e => setUserDraft({ ...userDraft, username: e.target.value })} placeholder="Usuario de login" style={inputStyle} />
                </AdminField>
                <AdminField>
                  <input value={userDraft.password} onChange={e => setUserDraft({ ...userDraft, password: e.target.value })} placeholder={userDraft.id ? "Nova senha (opcional)" : "Senha"} type="password" style={inputStyle} />
                </AdminField>
                <AdminField>
                  <select value={userDraft.role} onChange={e => setUserDraft({ ...userDraft, role: e.target.value })} style={inputStyle}>
                    <option value="viewer">Visualizador</option>
                    <option value="admin">Administrativo</option>
                  </select>
                </AdminField>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={submitUser} loading={busyAction === "user"}>{userDraft.id ? "Salvar usuario" : "Criar usuario"}</Btn>
                  {userDraft.id && <Btn v="ghost" onClick={() => setUserDraft(emptyUser)}>Cancelar</Btn>}
                </div>
              </div>
            )}
            right={(
              <PaginatedList
                items={users}
                emptyText="Nenhum usuario cadastrado."
                renderItem={user => (
                  <div key={user.id} className="settings-row">
                    <div><strong>{user.name}</strong><div>{user.username} - {ROLES[user.role]?.label}</div></div>
                    <Btn v="secondary" sz="sm" onClick={() => setUserDraft({ ...user, password: "" })}>Editar</Btn>
                    <Btn v="danger" sz="sm" onClick={() => requestDelete(
                      "Excluir usuario",
                      `Tem certeza que deseja excluir ${user.name}?`,
                      "Excluir",
                      () => onDeleteUser(user.id),
                    )} disabled={user.id === currentUser?.id}>Remover</Btn>
                  </div>
                )}
              />
            )}
          />
        )}

        {tab === "members" && <MemberListConfigModalContent config={membersConfig} people={people} onSave={onSaveMembersConfig} onSync={onSyncMembersConfig} />}

        {tab === "external-bases" && (
          <SplitSection
            leftTitle={externalBaseDraft.id ? "Editar base externa" : "Nova base externa"}
            rightTitle="Bases cadastradas"
            left={(
              <div style={{ display: "grid", gap: 10 }}>
                <NotePanel>
                  Cadastre uma lista externa sincronizada para usar em campos do formulario. Essas bases nao substituem a base central de socios.
                </NotePanel>
                <FieldControl label="Seletor por base">
                  <input value={externalBaseDraft.name} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, name: e.target.value })} placeholder="Ex: Congregacoes, Turnos, Equipes" style={inputStyle} />
                </FieldControl>
                <FieldControl label="Descricao">
                  <textarea value={externalBaseDraft.description} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, description: e.target.value })} placeholder="Explique onde essa base sera usada no sistema." rows={3} style={inputStyle} />
                </FieldControl>
                <FieldControl label="Link publico do Google Sheets">
                  <input value={externalBaseDraft.sheetUrl} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, sheetUrl: e.target.value })} placeholder="https://docs.google.com/spreadsheets/d/..." style={inputStyle} />
                </FieldControl>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <FieldControl label="Aba / intervalo">
                    <input value={externalBaseDraft.range} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, range: e.target.value })} placeholder="Itens!A:B" style={inputStyle} />
                  </FieldControl>
                  <FieldControl label="Frequencia da sincronizacao (horas)">
                    <input type="number" min="1" value={externalBaseDraft.syncFrequencyHours || 24} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, syncFrequencyHours: Number(e.target.value) || 24 })} style={inputStyle} />
                  </FieldControl>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
                  <FieldControl label="Coluna do valor">
                    <input value={externalBaseDraft.valueColumn} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, valueColumn: e.target.value })} placeholder="A" style={inputStyle} />
                  </FieldControl>
                  <FieldControl label="Coluna do rotulo">
                    <input value={externalBaseDraft.labelColumn} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, labelColumn: e.target.value })} placeholder="B" style={inputStyle} />
                  </FieldControl>
                  <FieldControl label="Coluna da descricao">
                    <input value={externalBaseDraft.descriptionColumn} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, descriptionColumn: e.target.value })} placeholder="C" style={inputStyle} />
                  </FieldControl>
                  <FieldControl label="Coluna de ativo">
                    <input value={externalBaseDraft.activeColumn} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, activeColumn: e.target.value })} placeholder="D" style={inputStyle} />
                  </FieldControl>
                </div>
                <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: COLORS.textSecondary }}>
                  <input type="checkbox" checked={externalBaseDraft.syncEnabled !== false} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, syncEnabled: e.target.checked })} /> Permitir sincronizacao automatica
                </label>
                <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: COLORS.textSecondary }}>
                  <input type="checkbox" checked={externalBaseDraft.active !== false} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, active: e.target.checked })} /> Disponivel para novos campos
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Btn onClick={submitExternalBase} loading={busyAction === "externalBase"}>{externalBaseDraft.id ? "Salvar base" : "Criar base"}</Btn>
                  <Btn v="secondary" onClick={() => submitExternalBaseSync(externalBaseDraft.id)} disabled={!externalBaseDraft.id || !externalBaseDraft.sheetUrl} loading={busyAction === `externalBaseSync:${externalBaseDraft.id}`}>Sincronizar agora</Btn>
                  {externalBaseDraft.id && <Btn v="ghost" onClick={() => setExternalBaseDraft(emptyExternalBase)}>Cancelar</Btn>}
                </div>
              </div>
            )}
            right={(
              <PaginatedList
                items={externalBases}
                emptyText="Nenhuma base externa cadastrada."
                renderItem={base => (
                  <div key={base.id} className="settings-row">
                    <div>
                      <strong>{base.name}</strong>
                      <div>{base.active === false ? "Inativa" : "Ativa"} • {base.items?.length || 0} opcao(oes) • {base.lastSyncedAt ? `Sincronizada em ${new Date(base.lastSyncedAt).toLocaleString("pt-BR")}` : "Ainda nao sincronizada"}</div>
                      {base.description && <div>{base.description}</div>}
                    </div>
                    <Btn v="secondary" sz="sm" onClick={() => setExternalBaseDraft({ ...emptyExternalBase, ...base })}>Editar</Btn>
                    <Btn v="danger" sz="sm" onClick={() => requestDelete(
                      "Excluir base externa",
                      `Tem certeza que deseja excluir a base externa ${base.name}?`,
                      "Excluir",
                      () => onDeleteExternalBase(base.id),
                    )}>Remover</Btn>
                  </div>
                )}
              />
            )}
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
          <section>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {[
                { key: "fields", label: "Campos de formulario" },
                { key: "tasks", label: "Tarefas da escala" },
              ].map(item => (
                <Btn
                  key={item.key}
                  v={catalogMode === item.key ? "primary" : "secondary"}
                  sz="sm"
                  onClick={() => setCatalogMode(item.key)}
                  style={{ borderRadius: 10, padding: "8px 10px", fontWeight: 800 }}
                >
                  {item.label}
                </Btn>
              ))}
            </div>
            {catalogMode === "fields" && (
              <section className="settings-grid">
                <div>
                  <h4 style={{ margin: "0 0 10px" }}>{fieldCatalogDraft.id ? "Editar campo base" : "Novo campo base"}</h4>
                  <div style={{ display: "grid", gap: 10 }}>
                    <NotePanel>
                      Preencha o nome exibido no formulario e ajuste o tipo. O identificador tecnico pode ser informado manualmente ou sera gerado automaticamente ao salvar.
                    </NotePanel>
                    <AdminField>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Identificador tecnico</label>
                      <input value={fieldCatalogDraft.key} onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, key: e.target.value })} placeholder="Opcional. Ex: presenca_sessao" style={inputStyle} />
                    </AdminField>
                    <AdminField>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Nome administrativo</label>
                      <input value={fieldCatalogDraft.name} onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, name: e.target.value })} placeholder="Ex: Presenca em sessao" style={inputStyle} />
                    </AdminField>
                    <AdminField>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Nome exibido no formulario</label>
                      <input value={fieldCatalogDraft.defaultLabel} onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, defaultLabel: e.target.value })} placeholder="Ex: Sessao" style={inputStyle} />
                    </AdminField>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <AdminField>
                        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Tipo do campo</label>
                        <select value={fieldCatalogDraft.type} onChange={e => setFieldCatalogDraft({
                          ...fieldCatalogDraft,
                          type: e.target.value,
                          selectionSource: e.target.value === "person_select"
                            ? (fieldCatalogDraft.selectionSource || { kind: "members" })
                            : fieldCatalogDraft.selectionSource,
                        })} style={inputStyle}>
                          {Object.entries(fieldTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                      </AdminField>
                      <AdminField>
                        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Grupo</label>
                        <select value={fieldCatalogDraft.category} onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, category: e.target.value })} style={inputStyle}>
                          {Object.entries(fieldCategoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                      </AdminField>
                    </div>
                    {fieldCatalogDraft.type === "grid" && (
                      <GridSchemaEditor
                        value={fieldCatalogDraft.gridSchema}
                        onChange={gridSchema => setFieldCatalogDraft({ ...fieldCatalogDraft, gridSchema })}
                      />
                    )}
                      {fieldCatalogDraft.type === "person_select" && (
                        <SurfacePanel style={{ display: "grid", gap: 10 }}>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, display: "block", marginBottom: 6 }}>Vinculo do campo</label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                              <button
                                onClick={() => setFieldCatalogDraft({ ...fieldCatalogDraft, selectionSource: { kind: "members" } })}
                                style={{ border: `1px solid ${fieldCatalogDraft.selectionSource?.kind !== "external_base" ? COLORS.primary : COLORS.border}`, background: fieldCatalogDraft.selectionSource?.kind !== "external_base" ? COLORS.primaryLight : COLORS.surface, color: fieldCatalogDraft.selectionSource?.kind !== "external_base" ? COLORS.primary : COLORS.textSecondary, borderRadius: 10, padding: "10px 12px", textAlign: "left", minHeight: 72 }}
                              >
                                <strong style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Base central de socios</strong>
                                <span style={{ fontSize: 11 }}>Usa a base central como origem.</span>
                              </button>
                              <button
                                onClick={() => setFieldCatalogDraft({ ...fieldCatalogDraft, selectionSource: { kind: "external_base", externalBaseId: fieldCatalogDraft.selectionSource?.externalBaseId || (externalBases.find(base => base.active !== false)?.id || "") } })}
                                style={{ border: `1px solid ${fieldCatalogDraft.selectionSource?.kind === "external_base" ? COLORS.primary : COLORS.border}`, background: fieldCatalogDraft.selectionSource?.kind === "external_base" ? COLORS.primaryLight : COLORS.surface, color: fieldCatalogDraft.selectionSource?.kind === "external_base" ? COLORS.primary : COLORS.textSecondary, borderRadius: 10, padding: "10px 12px", textAlign: "left", minHeight: 72 }}
                              >
                                <strong style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Base externa sincronizada</strong>
                                <span style={{ fontSize: 11 }}>Aponta para uma lista sincronizada.</span>
                              </button>
                            </div>
                            {fieldCatalogDraft.selectionSource?.kind === "external_base" && (
                              <div style={{ display: "grid", gap: 6 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Base externa vinculada</label>
                              <select
                                value={fieldCatalogDraft.selectionSource?.externalBaseId || ""}
                                onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, selectionSource: { kind: "external_base", externalBaseId: e.target.value } })}
                                style={inputStyle}
                              >
                                <option value="">Selecione uma base externa</option>
                                {externalBases.filter(base => base.active !== false).map(base => <option key={base.id} value={base.id}>{base.name}</option>)}
                                </select>
                                <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                                  O campo vai usar as opcoes sincronizadas desta base como origem.
                                </div>
                              </div>
                            )}
                            {fieldCatalogDraft.selectionSource?.kind !== "external_base" && (
                              <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                                O campo usa a base central de socios como origem.
                              </div>
                            )}
                            <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 10, border: `1px solid ${COLORS.borderLight}`, background: COLORS.surfaceAlt }}>
                              <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4, color: COLORS.textMuted, marginBottom: 4 }}>
                                Resumo do vinculo
                              </div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>
                                {fieldCatalogDraft.selectionSource?.kind === "external_base"
                                  ? `Base externa sincronizada: ${getExternalBaseName(externalBases, fieldCatalogDraft.selectionSource?.externalBaseId)}`
                                  : "Base central de socios"}
                              </div>
                            </div>
                          </div>
                        </SurfacePanel>
                      )}
                    <AdminField>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Observacoes internas</label>
                      <textarea value={fieldCatalogDraft.description} onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, description: e.target.value })} placeholder="Quando usar este campo ou o que a equipe precisa lembrar" rows={3} style={inputStyle} />
                    </AdminField>
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                      Identificador previsto: <strong style={{ color: COLORS.text }}>{normalizeIdentifier(fieldCatalogDraft.key || fieldCatalogDraft.name || fieldCatalogDraft.defaultLabel) || "sera gerado ao preencher o nome"}</strong>
                    </div>
                    <FieldCatalogPreview draft={fieldCatalogDraft} externalBases={externalBases} />
                    <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: COLORS.textSecondary }}>
                      <input type="checkbox" checked={fieldCatalogDraft.active !== false} onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, active: e.target.checked })} /> Ativo para novos formularios
                    </label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Btn onClick={submitFieldCatalog} loading={busyAction === "fieldCatalog"}>{fieldCatalogDraft.id ? "Salvar campo" : "Criar campo"}</Btn>
                      {fieldCatalogDraft.id && <Btn v="ghost" onClick={() => setFieldCatalogDraft(emptyFieldCatalog)}>Cancelar</Btn>}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 style={{ margin: "0 0 10px" }}>Campos cadastrados</h4>
                  <PaginatedList
                    items={fieldCatalog}
                    emptyText="Nenhum campo base cadastrado."
                    renderItem={item => (
                      <div key={item.id} className="settings-row catalog-row">
                        <div>
                          <strong>{item.name}</strong>
                          <div>{item.defaultLabel || item.name} • {fieldTypeLabels[item.type]} • {fieldCategoryLabels[item.category]} • {item.active ? "Ativo" : "Inativo"}</div>
                          <div>Id: {item.key}</div>
                          {item.type === "person_select" && (
                            <div>Vinculo: {item.selectionSource?.kind === "external_base" ? `Base externa ${getExternalBaseName(externalBases, item.selectionSource.externalBaseId)}` : "Base central de socios"}</div>
                          )}
                          {item.description && <div>{item.description}</div>}
                        </div>
                        <Btn v="secondary" sz="sm" onClick={() => setFieldCatalogDraft({ ...emptyFieldCatalog, ...item, gridSchema: item.gridSchema || emptyFieldCatalog.gridSchema, selectionSource: item.selectionSource || { kind: "members" } })}>Editar</Btn>
                        <Btn v="danger" sz="sm" onClick={() => requestDelete(
                          "Excluir campo base",
                          `Tem certeza que deseja excluir o campo base ${item.name}?`,
                          "Excluir",
                          () => onDeleteFieldCatalogItem(item.id),
                        )}>Remover</Btn>
                      </div>
                    )}
                  />
                </div>
              </section>
            )}
            {catalogMode === "tasks" && (
              <SplitSection
                leftTitle={scaleTaskDraft.id ? "Editar tarefa base" : "Nova tarefa base"}
                rightTitle="Tarefas cadastradas"
                left={(
                  <div style={{ display: "grid", gap: 10 }}>
                    <NotePanel>
                      Use esta biblioteca para reaproveitar tarefas recorrentes. O identificador tecnico pode ficar em branco e sera gerado ao salvar.
                    </NotePanel>
                    <FieldControl label="Identificador tecnico">
                      <input value={scaleTaskDraft.key} onChange={e => setScaleTaskDraft({ ...scaleTaskDraft, key: e.target.value })} placeholder="Opcional. Ex: preparo_jantar" style={inputStyle} />
                    </FieldControl>
                    <FieldControl label="Nome administrativo">
                      <input value={scaleTaskDraft.name} onChange={e => setScaleTaskDraft({ ...scaleTaskDraft, name: e.target.value })} placeholder="Ex: Preparo do jantar" style={inputStyle} />
                    </FieldControl>
                    <FieldControl label="Nome exibido na escala">
                      <input value={scaleTaskDraft.defaultLabel} onChange={e => setScaleTaskDraft({ ...scaleTaskDraft, defaultLabel: e.target.value })} placeholder="Ex: Preparacao do jantar" style={inputStyle} />
                    </FieldControl>
                    <FieldControl label="Grupo">
                      <select value={scaleTaskDraft.category} onChange={e => setScaleTaskDraft({ ...scaleTaskDraft, category: e.target.value })} style={inputStyle}>
                        {Object.entries(taskCategoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </FieldControl>
                    <FieldControl label="Observacoes internas">
                      <textarea value={scaleTaskDraft.description} onChange={e => setScaleTaskDraft({ ...scaleTaskDraft, description: e.target.value })} placeholder="Quando usar esta tarefa ou como ela costuma aparecer na escala" rows={3} style={inputStyle} />
                    </FieldControl>
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                      Identificador previsto: <strong style={{ color: COLORS.text }}>{normalizeIdentifier(scaleTaskDraft.key || scaleTaskDraft.name || scaleTaskDraft.defaultLabel) || "sera gerado ao preencher o nome"}</strong>
                    </div>
                    <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: COLORS.textSecondary }}>
                      <input type="checkbox" checked={scaleTaskDraft.active !== false} onChange={e => setScaleTaskDraft({ ...scaleTaskDraft, active: e.target.checked })} /> Ativa para novas escalas
                    </label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Btn onClick={submitScaleTask} loading={busyAction === "scaleTask"}>{scaleTaskDraft.id ? "Salvar tarefa" : "Criar tarefa"}</Btn>
                      {scaleTaskDraft.id && <Btn v="ghost" onClick={() => setScaleTaskDraft(emptyScaleTaskCatalog)}>Cancelar</Btn>}
                    </div>
                  </div>
                )}
                right={(
                  <PaginatedList
                    items={scaleTaskCatalog}
                    emptyText="Nenhuma tarefa base cadastrada."
                    renderItem={item => (
                      <div key={item.id} className="settings-row catalog-row">
                        <div>
                          <strong>{item.name}</strong>
                          <div>{item.defaultLabel || item.name} • {taskCategoryLabels[item.category]} • {item.active ? "Ativa" : "Inativa"}</div>
                          <div>Id: {item.key}</div>
                          {item.description && <div>{item.description}</div>}
                        </div>
                        <Btn v="secondary" sz="sm" onClick={() => setScaleTaskDraft(item)}>Editar</Btn>
                        <Btn v="danger" sz="sm" onClick={() => requestDelete(
                          "Excluir tarefa base",
                          `Tem certeza que deseja excluir a tarefa base ${item.name}?`,
                          "Excluir",
                          () => onDeleteScaleTaskCatalogItem(item.id),
                        )}>Remover</Btn>
                      </div>
                    )}
                  />
                )}
              />
            )}
          </section>
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


