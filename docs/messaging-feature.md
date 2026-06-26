# Mensagens em Eventos

Documento curto do estado atual da feature de mensagens. O historico de fases concluídas fica no git.

## Estado Atual

- Eventos com formularios de `presenca` ou `escala_organ` exibem a aba **Mensagens**.
- Dois usos conceituais, mantidos como tipos separados no backend:
  - **abertura** (`new_scale`): texto pronto que o organizador copia e posta no **grupo** do WhatsApp (o Twilio nao posta em grupo);
  - **lembrete de presenca** (`fill_reminder`) e **lembrete de vagas** (`open_slots`): envio **individual** por DM via Twilio.
- O editor tem **chips de variaveis** (inserem o placeholder no cursor), **preview ao vivo** e **filtro por grau** nos destinatarios do lembrete.
- Modelos reutilizaveis **carregam config** (`message_templates.config_json` = `{recipients, windowOptions}`): aplicar um modelo preenche corpo + destinatarios + janelas. Tambem ha "Salvar como modelo" a partir do preenchimento da tela.
- Lembretes podem ter **multiplos disparos** (`config.windowOptions`): o orquestrador envia, marca `config.dispatchedWindows` e re-arma para a proxima janela ate a ultima.
- Configuracoes globais ficam em `Configuracoes > Mensagens`:
  - modelos reutilizaveis e presets de pessoas;
  - provider/channel/`twilioAccountSid`/`twilioFrom`;
  - **`twilioAuthToken` write-only** (guardado no servidor, nunca exibido de volta; mesmo padrao da chave mestra);
  - controle global de disparo automatico.
- Selecao do dispatcher em `eventMessagesService.resolveDispatcher`: usa Twilio quando `provider === "twilio"` + sid + token + from; senao `log-only` (registra o que seria enviado).
- Mensagens por DM dependem de `membersConfig.phoneColumn`; o telefone vem da base de socios (coluna `people.phone`).
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
- `backend/services/messagingConfigService.mjs`
- `backend/dispatchers/logOnlyDispatcher.mjs`
- `backend/dispatchers/twilioDispatcher.mjs`
- `backend/repositories/eventMessagesRepository.mjs`
- `backend/repositories/messageTemplatesRepository.mjs`
- `backend/repositories/messageDispatchLogRepository.mjs`
- `frontend/src/features/events/components/MessageBodyEditor.jsx`
- `frontend/src/lib/messageVariables.js`
- `frontend/src/features/admin/MessagingConfigBlock.jsx`

## Pendencias Reais

- Teste UI integrado cobrindo o fluxo completo: criar mensagem pelo wizard, agendar, abrir detalhe e disparar.
- Avaliar confirmacao de leitura, retry e deduplicacao por DM conforme a operacao real exigir.

## Fora do Escopo Atual

- Postar diretamente no grupo do WhatsApp (nem Twilio nem WhatsApp Cloud API permitem); a abertura segue assistida (organizador posta).
- Templates aprovados pela Meta, anexos, midia ou variantes A/B.
- Historico de respostas recebidas por DM.

## Decisoes Mantidas

- Pessoas sem telefone aparecem no preview/log com `skipped: true`.
- O texto da mensagem pode ser editado antes do disparo; o snapshot fica em `body`.
- O grupo unico permanece como string livre ate existir integracao real com provedor.
