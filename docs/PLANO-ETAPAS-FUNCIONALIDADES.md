# Pendencias Funcionais

Documento curto para manter apenas itens ainda nao executados ou parados por decisao de produto. Historico de entregas concluidas deve ser consultado no git.

## Experiencia e Comunicacao

- `Confirmacao pos-envio mais util`: pendente/parado.
- `Alertas internos`: pendente/parado.

## Seguranca de Sessao

- Endurecimento de autenticacao de sessao.
- Migracao do token exposto ao JavaScript para cookie `HttpOnly`.
- Metadados de sessao por dispositivo, IP e user-agent.
- Lista de sessoes ativas para administracao.
- Auditoria especifica de login bloqueado, timeout e logout.

## Mensagens em Eventos

- Acompanhar as pendencias restantes em `docs/messaging-feature.md`.
- Prioridade atual: testes de UI, auditoria e atualizacao da documentacao funcional/mapa quando o fluxo estiver fechado.

## Regras de Execucao

- Implementar uma funcionalidade por vez.
- Validar comportamento antes de passar para a proxima.
- Evitar refatoracao ampla quando o item for funcional.
- Preservar contratos atuais de API enquanto possivel.
