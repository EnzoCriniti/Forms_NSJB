# Mensagens em Eventos

Documento curto do estado atual da feature de mensagens. O historico de fases concluídas fica no git.

## Estado Atual

- Eventos com formularios de `presenca` ou `escala_organ` exibem a aba **Mensagens**.
- Administradores podem criar mensagens de:
  - anuncio para grupo;
  - lembrete de preenchimento de presenca;
  - lembrete de vagas em aberto da escala.
- Configuracoes globais ficam em `Configuracoes > Mensagens`:
  - modelos reutilizaveis;
  - presets de pessoas;
  - grupo/base publica;
  - controle global de disparo automatico.
- Mensagens por DM dependem de `membersConfig.phoneColumn`.
- O envio real ainda nao existe; o dispatch atual e `log-only` e grava o que seria enviado.
- Mensagens agendadas sao processadas pelo orquestrador da stack.
- Criar, disparar e cancelar mensagens registra auditoria.

## Arquivos Principais

- `frontend/src/screens/EventsScreen.jsx`
- `frontend/src/screens/EventMessageEditorScreen.jsx`
- `frontend/src/screens/EventMessageDetailScreen.jsx`
- `frontend/src/features/events/components/eventMessagesPanels.jsx`
- `frontend/src/features/admin/MessagingSettingsPanel.jsx`
- `backend/routes/messageRoutes.mjs`
- `backend/services/eventMessagesService.mjs`
- `backend/services/messageRecipientsService.mjs`
- `backend/dispatchers/logOnlyDispatcher.mjs`
- `backend/repositories/eventMessagesRepository.mjs`
- `backend/repositories/messageDispatchLogRepository.mjs`

## Pendencias Reais

- Teste UI integrado cobrindo o fluxo completo: criar mensagem pelo wizard, agendar, abrir detalhe e disparar com log gerado.
- Confirmar se ha necessidade de atualizar mapa de cores/icones; ate agora a feature reutiliza componentes e icones existentes.

## Fora do Escopo Atual

- Envio real via Twilio ou WhatsApp Cloud API.
- Confirmacao de leitura, retry, deduplicacao e historico de respostas por DM.
- Templates aprovados pela Meta.
- Anexos, midia ou variantes A/B.

## Decisoes Mantidas

- Pessoas sem telefone aparecem no preview/log com `skipped: true`.
- O texto da mensagem pode ser editado antes do disparo; o snapshot fica em `body`.
- O grupo unico permanece como string livre ate existir integracao real com provedor.
