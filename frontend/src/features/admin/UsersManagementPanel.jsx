import React from "react";
import { Btn } from "../../components/ui";
import { ROLES } from "../../lib/auth";
import { PaginatedList } from "./adminPaginatedList";

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
  <section className="msg-card">
    <header className="msg-card__head">
      <h3 className="msg-card__title">Usuários</h3>
      <p className="msg-card__hint">
        Crie contas de acesso, defina o nível de permissão e gerencie quem pode entrar na plataforma.
      </p>
    </header>
    <div className="msg-split">
      <div className="msg-form">
        <h4 className="msg-subtitle">{userDraft.id ? "Editar usuário" : "Novo usuário"}</h4>
        <label className="msg-field">
          <span className="msg-label">Nome exibido</span>
          <input className="msg-input" value={userDraft.name} onChange={e => setUserDraft({ ...userDraft, name: e.target.value })} placeholder="Ex.: Maria Silva" />
        </label>
        <label className="msg-field">
          <span className="msg-label">Usuário de login</span>
          <input className="msg-input" value={userDraft.username} onChange={e => setUserDraft({ ...userDraft, username: e.target.value })} placeholder="Ex.: maria.silva" />
        </label>
        <label className="msg-field">
          <span className="msg-label">{userDraft.id ? "Nova senha (opcional)" : "Senha"}</span>
          <input className="msg-input" value={userDraft.password} onChange={e => setUserDraft({ ...userDraft, password: e.target.value })} placeholder={userDraft.id ? "Deixe em branco para manter" : "Senha de acesso"} type="password" />
        </label>
        <label className="msg-field">
          <span className="msg-label">Perfil</span>
          <select className="msg-input" value={userDraft.role} onChange={e => setUserDraft({ ...userDraft, role: e.target.value })}>
            <option value="viewer">Visualizador</option>
            <option value="admin">Administrativo</option>
          </select>
        </label>
        <div className="msg-actions">
          <Btn onClick={submitUser} loading={busyAction === "user"}>{userDraft.id ? "Salvar usuário" : "Criar usuário"}</Btn>
          {userDraft.id && <Btn v="ghost" onClick={() => setUserDraft({ name: "", username: "", password: "", role: "viewer" })}>Cancelar</Btn>}
        </div>
      </div>
      <div>
        <h4 className="msg-subtitle">Usuários cadastrados</h4>
        <PaginatedList
          items={users}
          emptyText="Nenhum usuário cadastrado."
          renderItem={user => (
            <div key={user.id} className="settings-row">
              <div style={{ minWidth: 0, flex: 1 }}><strong>{user.name}</strong><div>{user.username} - {ROLES[user.role]?.label}</div></div>
              <Btn v="secondary" sz="sm" onClick={() => setUserDraft({ ...user, password: "" })}>Editar</Btn>
              <Btn v="danger" sz="sm" onClick={() => requestDelete(
                "Excluir usuário",
                `Tem certeza que deseja excluir ${user.name}?`,
                "Excluir",
                () => onDeleteUser(user.id),
              )} disabled={user.id === currentUser?.id}>Remover</Btn>
            </div>
          )}
        />
      </div>
    </div>
  </section>
);
