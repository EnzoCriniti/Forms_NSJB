# Checklist de Manutencao

Lista viva para manter a migracao e a limpeza do projeto sob controle.

## Ordem de trabalho

- [ ] Ler `docs/AI_CODEMAP.md` antes de procurar arquivos.
- [ ] Identificar se a mudanca pertence a `frontend/`, `backend/`, `docker/` ou `docs/`.
- [ ] Fazer a menor extracao util possivel antes de mexer em comportamento.
- [ ] Atualizar o mapa de codigo quando mover ou criar modulos novos.
- [ ] Registrar bug encontrado com teste novo ou ajuste de teste existente.
- [ ] Registrar toda correcao ou refatoracao relevante em commit separado.
- [ ] Remover artefatos de build antes de fechar a tarefa.
- [ ] Validar com `npm run test`, `npm run build` e `docker compose -f docker/compose.yml config` quando a mudanca tocar fluxo real.
- [ ] Use `docs/CHECKLIST-REFATORACAO-PENDENTE.md` como backlog para a proxima rodada.

## Frontend

- [ ] Reduzir `frontend/src/App.jsx` para orquestracao leve.
- [ ] Extrair helpers puros para `frontend/src/lib/`.
- [ ] Evitar `fetch` direto em tela ou componente.
- [ ] Manter regras de formulario em `frontend/src/lib/forms.js` ou `shared/formRules.mjs`.
- [ ] Comentarios curtos apenas em pontos complexos.

## Backend

- [ ] Separar `backend/routes/` por dominio.
- [ ] Manter auth, bootstrap e health isolados de CRUD pesado.
- [ ] Deixar regras de negocio em `backend/services/`.
- [ ] Deixar SQL e acesso ao banco em `backend/repositories/`.
- [ ] Manter helpers de request/auditoria fora do roteador principal.
- [ ] Continuar a eliminacao de acoplamento com SQLite legado.

## Docker e deploy

- [ ] Tratar `docker/compose.yml` como fluxo oficial.
- [ ] Garantir que o backend continue subindo com PostgreSQL por padrao.
- [ ] Manter README principal explicando como subir em outra maquina.
- [ ] Limpar qualquer artefato de build ou cache do repo.

## Documentacao

- [ ] Atualizar README raiz quando mudar fluxo de uso.
- [ ] Atualizar README de `frontend/`, `backend/` e `docker/` quando mover responsabilidades.
- [ ] Separar documento vivo de documento historico.
- [ ] Atualizar `docs/IA-LOG.md` apenas como historico, nao como guia principal.
