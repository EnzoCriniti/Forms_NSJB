import React from "react";
import { Btn, COLORS, SplitSection } from "../../components/ui";
import { ROLES } from "../../lib/auth";
import { AdminField } from "./adminField";
import { PaginatedList } from "./adminPaginatedList";
import { ADMIN_INPUT_STYLE } from "./adminSettingsConstants";

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
