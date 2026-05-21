/**
 * @file frontend/src/features/admin/adminAccessPanels.jsx
 * @summary Paineis compartilhados da administracao de acessos e bases externas.
 * @responsibility Conter a UI de usuarios e bases externas fora do modal principal.
 */

import React from "react";
import { Btn, COLORS, FieldControl, NotePanel, SplitSection } from "../../components/ui";
import { ADMIN_INPUT_STYLE, AdminField, PaginatedList } from "./adminSettingsShared";
import { ROLES } from "../../lib/auth";

export const UsersManagementPanel = ({
  userDraft,
  setUserDraft,
  submitUser,
  busyAction,
  users,
  requestDelete,
  onDeleteUser,
  currentUser,
}) => (
  <SplitSection
    leftTitle={userDraft.id ? "Editar usuario" : "Novo usuario"}
    rightTitle="Usuarios cadastrados"
    left={(
      <div style={{ display: "grid", gap: 10 }}>
        <AdminField>
          <input value={userDraft.name} onChange={e => setUserDraft({ ...userDraft, name: e.target.value })} placeholder="Nome exibido" style={ADMIN_INPUT_STYLE} />
        </AdminField>
        <AdminField>
          <input value={userDraft.username} onChange={e => setUserDraft({ ...userDraft, username: e.target.value })} placeholder="Usuario de login" style={ADMIN_INPUT_STYLE} />
        </AdminField>
        <AdminField>
          <input value={userDraft.password} onChange={e => setUserDraft({ ...userDraft, password: e.target.value })} placeholder={userDraft.id ? "Nova senha (opcional)" : "Senha"} type="password" style={ADMIN_INPUT_STYLE} />
        </AdminField>
        <AdminField>
          <select value={userDraft.role} onChange={e => setUserDraft({ ...userDraft, role: e.target.value })} style={ADMIN_INPUT_STYLE}>
            <option value="viewer">Visualizador</option>
            <option value="admin">Administrativo</option>
          </select>
        </AdminField>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={submitUser} loading={busyAction === "user"}>{userDraft.id ? "Salvar usuario" : "Criar usuario"}</Btn>
          {userDraft.id && <Btn v="ghost" onClick={() => setUserDraft({ name: "", username: "", password: "", role: "viewer" })}>Cancelar</Btn>}
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
);

export const ExternalBasesPanel = ({
  externalBaseDraft,
  setExternalBaseDraft,
  submitExternalBase,
  submitExternalBaseSync,
  busyAction,
  externalBases,
  requestDelete,
  onDeleteExternalBase,
}) => (
  <SplitSection
    leftTitle={externalBaseDraft.id ? "Editar base externa" : "Nova base externa"}
    rightTitle="Bases cadastradas"
    left={(
      <div style={{ display: "grid", gap: 10 }}>
        <NotePanel>
          Cadastre uma lista externa sincronizada para usar em campos do formulario. Essas bases nao substituem a base central de socios.
        </NotePanel>
        <FieldControl label="Seletor por base">
          <input value={externalBaseDraft.name} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, name: e.target.value })} placeholder="Ex: Congregacoes, Turnos, Equipes" style={ADMIN_INPUT_STYLE} />
        </FieldControl>
        <FieldControl label="Descricao">
          <textarea value={externalBaseDraft.description} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, description: e.target.value })} placeholder="Explique onde essa base sera usada no sistema." rows={3} style={ADMIN_INPUT_STYLE} />
        </FieldControl>
        <FieldControl label="Link publico do Google Sheets">
          <input value={externalBaseDraft.sheetUrl} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, sheetUrl: e.target.value })} placeholder="https://docs.google.com/spreadsheets/d/..." style={ADMIN_INPUT_STYLE} />
        </FieldControl>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <FieldControl label="Aba / intervalo">
            <input value={externalBaseDraft.range} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, range: e.target.value })} placeholder="Itens!A:B" style={ADMIN_INPUT_STYLE} />
          </FieldControl>
          <FieldControl label="Frequencia da sincronizacao (horas)">
            <input type="number" min="1" value={externalBaseDraft.syncFrequencyHours || 24} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, syncFrequencyHours: Number(e.target.value) || 24 })} style={ADMIN_INPUT_STYLE} />
          </FieldControl>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
          <FieldControl label="Coluna do valor">
            <input value={externalBaseDraft.valueColumn} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, valueColumn: e.target.value })} placeholder="A" style={ADMIN_INPUT_STYLE} />
          </FieldControl>
          <FieldControl label="Coluna do rotulo">
            <input value={externalBaseDraft.labelColumn} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, labelColumn: e.target.value })} placeholder="B" style={ADMIN_INPUT_STYLE} />
          </FieldControl>
          <FieldControl label="Coluna da descricao">
            <input value={externalBaseDraft.descriptionColumn} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, descriptionColumn: e.target.value })} placeholder="C" style={ADMIN_INPUT_STYLE} />
          </FieldControl>
          <FieldControl label="Coluna de ativo">
            <input value={externalBaseDraft.activeColumn} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, activeColumn: e.target.value })} placeholder="D" style={ADMIN_INPUT_STYLE} />
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
          {externalBaseDraft.id && <Btn v="ghost" onClick={() => setExternalBaseDraft({ name: "", description: "", sourceType: "google_sheets", sheetUrl: "", range: "Itens!A:B", valueColumn: "A", labelColumn: "B", descriptionColumn: "", activeColumn: "", syncEnabled: true, syncFrequencyHours: 24, active: true, items: [] })}>Cancelar</Btn>}
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
            <Btn v="secondary" sz="sm" onClick={() => setExternalBaseDraft({ ...base, syncEnabled: base.syncEnabled !== false })}>Editar</Btn>
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
);
