# Mensagens em eventos

> Status: planejamento. Implementação por fases — cada item do checklist vira um commit revisável.

## 1. Visão geral

Eventos passam a oferecer **mensagens** vinculadas aos formulários que usam a base central de pessoas (`presenca` e `escala_organ`). O admin compõe a partir de modelos reutilizáveis, define destinatários e dispara — manualmente ou via agendamento. Nesta primeira entrega **nada é enviado de fato**: o sistema apenas grava um log do que seria enviado, com o texto renderizado e a lista de destinatários, para validar a operação. A integração WhatsApp real (Twilio) entra em fase posterior trocando apenas o adapter de dispatch.

## 2. Tipos de mensagem

| Tipo | Nome | Canal | Form requerido | Destinatário |
|------|------|-------|----------------|--------------|
| 1 | Anúncio de nova escala/presença | Grupo único | `presenca` ou `escala_organ` | Grupo global configurado |
| 2 | Lembrete de preenchimento da presença | DM | `presenca` | Pessoas da base que ainda não responderam o form |
| 3 | Lembrete de vagas em aberto da escala | DM | `escala_organ` | Pessoas da base ainda não alocadas em nenhum slot, **se** a escala tem slot vago |

Regras:

- A aba **Mensagens** só aparece em eventos com pelo menos um form de `presenca` ou `escala_organ`.
- Cada tipo só fica habilitado se o evento tiver o form correspondente.
- Tipos 2 e 3 dependem de `membersConfig.phoneColumn` configurada. Sem isso, o sistema bloqueia a criação e mostra banner com link para `Configurações > Membros`.
- Tipo 1 funciona sem coluna de telefone (vai pro grupo).

## 3. Configuração global (Configurações > Mensagens)

Recursos que ficam fora do evento, reutilizáveis:

- **Modelos de mensagem** (`message_templates`)
  - `id`, `name`, `type` (`new_scale` | `fill_reminder` | `open_slots`), `body`, timestamps
  - Suporta placeholders (ver §6)
- **Presets de pessoas** (`person_selection_presets`)
  - `id`, `name`, `personKeys[]` (chave estável: hash de `nome + grau` ou `externalId` quando existir)
- **Configurações globais**
  - `whatsappGroupName` (texto livre — pra exibir no preview e no log; quando integrar Twilio, será o ID do grupo)
  - `autoDispatchEnabled` (boolean) — desliga **todo** o disparo automático de uma vez. Mensagens agendadas continuam visíveis e podem ser disparadas manualmente.

## 4. Configuração por evento

Cada mensagem é uma instância dentro do evento (`event_messages`):

- `id`, `eventId`, `type`, `templateId?`, `body` (renderizado/editado, snapshot)
- Configuração específica em `configJson`:
  - Tipo 1: `formIds[]` (presença e/ou escala vinculados ao evento)
  - Tipo 2: `formId` (qual presença), `recipients` (`auto` | `preset:<id>` | `manual:[personKeys]`)
  - Tipo 3: `formId` (qual escala). Sem override de destinatários — calculado direto.
- `scheduledFor?` (timestamp; null = sem agendamento)
- `windowOption?` (apenas tipo 2: `morning_of_closing` | `12h_before` | `1h_before` — usado para calcular `scheduledFor` em função do `closing` do form selecionado)
- `autoDispatchEnabled` (boolean por mensagem; default `true`)
- `status` (estado, ver §5)
- `createdAt`, `updatedAt`, `sentAt?`

## 5. Estados da mensagem

```
              criar
                │
                ▼
            rascunho ───agendar──▶ agendada ───on time + auto──▶ pronta
                │                      │                            │
            disparar               disparar                      disparar
            (manual)               (manual)                      (manual)
                ▼                      ▼                            ▼
            disparada ◀────────────────┴────────────────────────────┘

            (a qualquer momento) ───cancelar──▶ cancelada
```

- `rascunho` — criada, sem agendamento.
- `agendada` — tem `scheduledFor` no futuro.
- `pronta` — `scheduledFor <= now`, automático desligado (global ou na mensagem); aguarda disparo manual.
- `disparada` — `dispatch` foi executado (gerou log). No modo log-only, equivalente a "tudo certo, log gravado".
- `cancelada` — admin desistiu.

Transições não cobertas pelo diagrama:

- Editar mensagem só permitida em `rascunho` ou `agendada`.
- `disparada` é terminal; pra reenviar, criar nova mensagem.

## 6. Render de placeholders

Suportados (validados na criação do template):

- `{{event.title}}`, `{{event.date}}`, `{{event.opening}}`, `{{event.closing}}`
- `{{form.title}}`, `{{form.publicLink}}`, `{{form.closing}}`
  - Quando há múltiplos forms (tipo 1), usar `{{forms.list}}` que renderiza `- Título: link` por linha
- `{{person.name}}`, `{{person.grau}}` — só nos tipos 2/3
- `{{group.name}}` — só no tipo 1

Placeholder ausente vira string vazia (sem quebrar). Validação avisa se o template usa placeholder de pessoa em modelo de tipo 1.

## 7. Cálculo de destinatários

- **Tipo 1**: destinatário é o grupo global (`whatsappGroupName`). Não enumera pessoas.
- **Tipo 2** (`recipients.mode`):
  - `auto` (padrão) — pessoas da base central com telefone preenchido **e que não respondem** o form de presença selecionado
  - `preset:<id>` — pessoas do preset, filtradas por quem tem telefone
  - `manual:[personKeys]` — escolha manual, filtradas por quem tem telefone
- **Tipo 3**: pessoas com telefone que **não** aparecem em nenhum `slot.person` da escala selecionada, **e somente** se a escala ainda tiver slot vago. Se não tiver, mensagem fica bloqueada com aviso.

Pessoas sem telefone aparecem no preview com badge "sem telefone" e **não** entram no log (ou entram com flag `skipped: true`, a definir).

## 8. Log de disparo (`message_dispatch_log`)

Cada disparo (manual ou automático) cria um registro:

- `id`, `messageId`, `dispatchedAt`, `mode` (`manual` | `scheduled`)
- `renderedBody` — texto final
- `recipients` — array de `{ name, grau, phone, waLink, skipped?, skipReason? }`
- `groupName?` — quando tipo 1
- `status` — `logged_only` (hoje), futuramente `sent` / `failed` / `partial`
- `dispatcherVersion` — versão do adapter usado

Este log é a fonte de verdade pra auditoria e pra os testes que validam que o conteúdo gerado bate com o esperado.

## 9. Agendamento

- Tipos 1 e 3: `scheduledFor` livre (datetime-local).
- Tipo 2: dropdown fixo, sem datetime livre. Opções:
  - `morning_of_closing` — 07h00 do dia em que o `closing` do form de presença cai
  - `12h_before` — 12h antes do `closing`
  - `1h_before` — 1h antes do `closing`
- Validação: `scheduledFor` precisa ser futuro no momento da criação/edição.
- Orquestrador (existente) ganha passada extra: a cada ciclo, processa `event_messages` com `status = agendada AND scheduledFor <= now`. Se `autoDispatchEnabled` (global e mensagem) — dispara e marca `disparada`. Se desligado, marca `pronta` (aguarda manual).

## 10. Modelo de dados

```sql
-- modelos reutilizáveis
CREATE TABLE message_templates (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('new_scale','fill_reminder','open_slots')),
  body          TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE person_selection_presets (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  person_keys_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- instâncias por evento
CREATE TABLE event_messages (
  id                  BIGSERIAL PRIMARY KEY,
  event_id            BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  type                TEXT NOT NULL CHECK (type IN ('new_scale','fill_reminder','open_slots')),
  template_id         BIGINT REFERENCES message_templates(id) ON DELETE SET NULL,
  body                TEXT NOT NULL,
  config_json         JSONB NOT NULL DEFAULT '{}'::jsonb,
  scheduled_for       TIMESTAMPTZ,
  window_option       TEXT,
  auto_dispatch_enabled BOOLEAN NOT NULL DEFAULT true,
  status              TEXT NOT NULL CHECK (status IN ('rascunho','agendada','pronta','disparada','cancelada')),
  sent_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX event_messages_event_id_idx ON event_messages(event_id);
CREATE INDEX event_messages_pending_idx  ON event_messages(status, scheduled_for) WHERE status = 'agendada';

-- log de disparo
CREATE TABLE message_dispatch_log (
  id                  BIGSERIAL PRIMARY KEY,
  message_id          BIGINT NOT NULL REFERENCES event_messages(id) ON DELETE CASCADE,
  dispatched_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  mode                TEXT NOT NULL CHECK (mode IN ('manual','scheduled')),
  rendered_body       TEXT NOT NULL,
  recipients_json     JSONB NOT NULL,
  group_name          TEXT,
  status              TEXT NOT NULL DEFAULT 'logged_only',
  dispatcher_version  TEXT NOT NULL
);
CREATE INDEX message_dispatch_log_message_id_idx ON message_dispatch_log(message_id);
```

## 11. Arquitetura de código

```
backend/
  repositories/
    messageTemplatesRepository.mjs
    personPresetsRepository.mjs
    eventMessagesRepository.mjs
    messageDispatchLogRepository.mjs
  services/
    messageTemplatesService.mjs
    personPresetsService.mjs
    eventMessagesService.mjs    # CRUD + state machine + render + cálculo destinatários
    messageDispatcherService.mjs # orquestra dispatch — usa adapter
  dispatchers/
    logOnlyDispatcher.mjs        # versão atual: só grava log
    twilioDispatcher.mjs         # placeholder pra fase futura
  routes/
    messageTemplateRoutes.mjs
    personPresetRoutes.mjs
    eventMessageRoutes.mjs
  validators/
    messagePayloadValidators.mjs
  orchestrator/
    formLifecycleOrchestrator.mjs # ganha passada: scheduledMessagesProcessor

frontend/src/
  screens/
    SettingsMessagesScreen.jsx     # integra na Settings existente
    EventMessagesPanel.jsx         # aba dentro do detalhe do evento
    EventMessageEditorScreen.jsx   # wizard
    EventMessageDetailScreen.jsx   # mostra log do dispatch
  components/
    MessageStatusBadge.jsx
    MessageTypePicker.jsx
    PersonSelectionField.jsx
    MessagePreview.jsx
  lib/
    messages.js                    # render placeholder, helpers
```

## 12. Fora do escopo desta entrega

- Disparo real via Twilio/Cloud API
- Confirmação de leitura, retry com backoff, deduplicação
- Templates aprovados pela Meta para iniciar conversa em DM
- Histórico de respostas das pessoas no DM
- Anexos / mídia
- Variantes A/B do texto

## 13. Como migrar pra envio real (Twilio) depois

Trocar o `dispatcher` injetado em `messageDispatcherService.mjs`:

1. Implementar `twilioDispatcher.mjs` com a mesma interface (`async dispatch({ message, renderedBody, recipients, groupName }) → { status, externalIds, errors }`)
2. Adicionar config: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`
3. Substituir `logOnlyDispatcher` por `twilioDispatcher` (feature flag por env var permite rollback)
4. `dispatcherVersion` no log ajuda auditar qual mecanismo enviou cada lote
5. Testes: smoke test contra sandbox Twilio antes de subir prod

## 14. Checklist de implementação

### Fase 1 — documentação ✅
- [x] Estrutura, decisões e escopo definidos neste documento

### Fase 2 — schema e migration ✅
- [x] `ensureSchema` em `postgresDriver.mjs` cria as 4 tabelas com `IF NOT EXISTS` (DBs existentes)
- [x] `docker/db/DDL-POSTGRESQL-INICIAL.sql` atualizado (DBs novos)
- [x] Seed de 3 templates de exemplo (um por tipo) em `MESSAGE_TEMPLATES`
- [x] Seed de `messagingConfig` em `settings` com `whatsappGroupName=""` e `autoDispatchEnabled=true`
- [x] `ensureMessageTemplatesSeed` e `ensureMessagingConfigSeed` chamados em `ensureSeedData`

### Fase 3 — repositories ✅
- [x] `messageTemplatesRepository.mjs`
- [x] `personPresetsRepository.mjs`
- [x] `eventMessagesRepository.mjs` (inclui `listScheduledEventMessagesDue` para o orquestrador)
- [x] `messageDispatchLogRepository.mjs` (append-only)

### Fase 4 — services
- [ ] `messageTemplatesService.mjs` (CRUD)
- [ ] `personPresetsService.mjs` (CRUD)
- [ ] `eventMessagesService.mjs`
  - [ ] CRUD com validação de elegibilidade do evento
  - [ ] Render de placeholders (`renderMessageBody`)
  - [ ] Cálculo de destinatários por tipo
  - [ ] State machine (`transitionStatus`)
- [ ] `messageDispatcherService.mjs` + `logOnlyDispatcher.mjs`
- [ ] Toggle global `autoDispatchEnabled` em `adminService` ou similar

### Fase 5 — rotas e validadores
- [ ] `/api/message-templates` (CRUD)
- [ ] `/api/person-presets` (CRUD)
- [ ] `/api/events/:id/messages` (CRUD)
- [ ] `/api/events/:eventId/messages/:id/dispatch` (manual)
- [ ] `/api/events/:eventId/messages/:id/cancel`
- [ ] Validadores de payload
- [ ] Testes API cobrindo elegibilidade, render, dispatch log, agendamento, transições proibidas

### Fase 6 — bootstrap e api.js
- [ ] Bootstrap expõe `messageTemplates`, `personPresets`, `messagingConfig`
- [ ] Mensagens vêm dentro do evento (`event.messages`)
- [ ] Helpers em `frontend/src/lib/api.js`

### Fase 7 — admin (Configurações > Mensagens)
- [ ] CRUD templates com preview e lista de placeholders
- [ ] CRUD presets de pessoas
- [ ] Toggle global `autoDispatchEnabled`
- [ ] Campo `whatsappGroupName`

### Fase 8 — aba Mensagens no evento
- [ ] Listagem com `MessageStatusBadge`
- [ ] Botão "Nova mensagem" → wizard (tipo → config → preview)
- [ ] Banner se `phoneColumn` vazio (bloqueia tipos 2/3)
- [ ] Banner se escala sem slot vago (bloqueia tipo 3)

### Fase 9 — detalhe da mensagem
- [ ] Tela com preview, lista de destinatários e `wa.me/...` por pessoa
- [ ] Botão "Disparar agora" (manual)
- [ ] Histórico de logs de dispatch (caso precise reenviar log no futuro)
- [ ] Editar / cancelar (respeitando estados permitidos)

### Fase 10 — orquestrador
- [ ] Hook em `formLifecycleOrchestrator` processa agendadas
- [ ] Respeita flag global `autoDispatchEnabled`
- [ ] Respeita flag por mensagem `autoDispatchEnabled`
- [ ] Testes unitários cobrindo cenários: prazo vencido com auto on, com auto off (vira `pronta`), com flag global off

### Fase 11 — testes UI
- [ ] Aba Mensagens só aparece quando elegível
- [ ] Wizard cria, agenda e dispara mensagem (log gerado)
- [ ] Banner aparece sem `phoneColumn`
- [ ] Editar agendada / cancelar
- [ ] Render correto de placeholders no preview

### Fase 12 — polimento
- [ ] Auditoria via `auditLogService` (criar / disparar / cancelar mensagem)
- [ ] Atualizar `docs/FUNCIONALIDADES.md` e `docs/MAPA-CODIGO.md`
- [ ] Atualizar mapa de cores/icones se necessário

## 15. Decisões pendentes (resolver durante a implementação)

- Pessoa sem telefone no resultado: incluir no log com `skipped: true` ou omitir? **Provisório**: incluir com `skipped` para o admin ver o que ficou de fora.
- Editar texto da mensagem renderizada antes de disparar: liberar ou só por template? **Provisório**: liberar edição inline, snapshot fica no `body` da mensagem.
- Grupo único: por enquanto string livre. Quando entrar Twilio, virar referência ao ID do grupo no provedor.
