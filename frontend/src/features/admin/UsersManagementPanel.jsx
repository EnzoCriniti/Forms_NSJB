import React, { useEffect, useState } from "react";
import { Btn } from "../../components/ui";
import { fetchAccessLayers } from "../../lib/api";
import { PaginatedList } from "./adminPaginatedList";
import { AccessLayersPanel } from "./AccessLayersPanel";

export const UsersManagementPanel = ({
  userDraft,
  setUserDraft,
  submitUser,
  busyAction,
  users,
  requestDelete,
  onDeleteUser,
  currentUser,
}) => {
  const [layers, setLayers] = useState([]);

  const reloadLayers = () => (typeof fetchAccessLayers === "function"
    ? fetchAccessLayers().then(data => setLayers(data.layers || [])).catch(() => {})
    : Promise.resolve());
  useEffect(() => { reloadLayers(); }, []);

  const layerName = layerId => layers.find(layer => layer.id === layerId)?.name || "—";

  return (
    <>
      <section className="msg-card">
        <header className="msg-card__head">
          <h3 className="msg-card__title">Usuários</h3>
          <p className="msg-card__hint">
            Crie contas de acesso, atribua uma camada de acesso e gerencie quem pode entrar na plataforma.
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
              <span className="msg-label">Camada de acesso</span>
              <select className="msg-input" value={userDraft.layerId || ""} onChange={e => setUserDraft({ ...userDraft, layerId: e.target.value ? Number(e.target.value) : null })}>
                <option value="">Selecione uma camada…</option>
                {layers.map(layer => <option key={layer.id} value={layer.id}>{layer.name}</option>)}
              </select>
            </label>
            <div className="msg-actions">
              <Btn onClick={submitUser} loading={busyAction === "user"} disabled={!userDraft.layerId}>{userDraft.id ? "Salvar usuário" : "Criar usuário"}</Btn>
              {userDraft.id && <Btn v="ghost" onClick={() => setUserDraft({ name: "", username: "", password: "", layerId: null })}>Cancelar</Btn>}
            </div>
          </div>
          <div>
            <h4 className="msg-subtitle">Usuários cadastrados</h4>
            <PaginatedList
              items={users}
              emptyText="Nenhum usuário cadastrado."
              renderItem={user => (
                <div key={user.id} className="settings-row">
                  <div style={{ minWidth: 0, flex: 1 }}><strong>{user.name}</strong><div>{user.username} · {layerName(user.layer_id)}</div></div>
                  <Btn v="secondary" sz="sm" onClick={() => setUserDraft({ id: user.id, name: user.name, username: user.username, password: "", layerId: user.layer_id ?? null })}>Editar</Btn>
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

      <AccessLayersPanel layers={layers} onChanged={reloadLayers} requestDelete={requestDelete} />
    </>
  );
};
