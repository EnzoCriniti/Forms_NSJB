# Mensagens — guia de configuração do Twilio (WhatsApp)

Este guia liga o envio **individual** de lembretes (presença e escala) via Twilio.
A mensagem de **abertura** continua sendo assistida: o organizador copia o texto
pronto e posta no grupo do WhatsApp (o Twilio não posta em grupos).

## Visão geral
- **Abertura** → texto pronto + "copiar"/link, postado manualmente no grupo.
- **Lembretes** → enviados 1‑a‑1 pelo Twilio para quem tem telefone na base.
- O **Auth Token** é guardado em segredo no servidor (write‑only): você cola na
  tela de Configurações, ele nunca é exibido de volta (só aparece "configurado").

## Passo 1 — Criar a conta e pegar as credenciais
1. Crie uma conta em <https://www.twilio.com/try-twilio> (o trial já serve para testar).
2. No **Console** (dashboard), copie:
   - **Account SID** (começa com `AC...`)
   - **Auth Token** (clique em "show")

## Passo 2 — Ativar o WhatsApp Sandbox (para testar)
1. Console → **Messaging → Try it out → Send a WhatsApp message**.
2. O Twilio mostra um número de sandbox (ex.: `+1 415 523 8886`) e um código de
   entrada, tipo `join <palavra>`.
3. **Cada número que vai receber precisa dar opt‑in**: no WhatsApp, mande
   `join <palavra>` para o número do sandbox. Para testar com o seu número em
   vários sócios, basta dar opt‑in **uma vez** com o seu número.
   - A janela do sandbox fica aberta por ~24h após o opt‑in.

## Passo 3 — Configurar no app
Em **Configurações → Mensagens**, seção "Envio individual (lembretes)":
- **Provedor**: `Twilio`
- **Canal**: `WhatsApp`
- **Account SID**: `AC...`
- **Número remetente (From)**: o número do sandbox, ex.: `+14155238886`
- **Auth Token**: cole o token (fica salvo em segredo)
- Preencha também a **URL pública do app** (para os links `{{form.publicLink}}`
  funcionarem nas mensagens).

Salve. A partir daí, disparar um lembrete usa o Twilio; sem isso, o sistema só
registra o envio (modo log) sem mandar nada.

## Passo 4 — Telefones na base
Os números vêm da base de sócios (coluna de telefone, mapeada no Sheets em
**Configurações → Base de sócios**). Guarde os números preferencialmente com DDI
(`+55...`); sem DDI, o sistema assume Brasil e prefixa `+55`.

> ⚠️ **Teste com poucos sócios.** Se você puser o seu número em todos e disparar,
> todas as mensagens caem no seu único WhatsApp (e bate em limite do trial).
> Filtre por grau ou use uma lista pequena para os primeiros testes.

## Limitações do trial / sandbox
- Só envia para números que deram opt‑in no sandbox.
- Mensagens fora da janela de 24h, em produção, exigem **templates aprovados**
  pela Meta e um **WhatsApp Sender registrado** (passo posterior, fora do sandbox).
- SMS para o Brasil é possível, mas exige registro de remetente e é mais caro —
  por isso recomendamos WhatsApp.

## Segurança do token
- O **Auth Token** é write-only na interface: nunca volta para o frontend (só a flag
  `twilioConfigured`). Para trocar, basta digitar um novo; em branco, mantém o atual.
- Em repouso, o token é **cifrado** (AES‑256‑GCM) antes de ir para o banco. A chave vem
  de `NSJB_SECRET_KEY` (env). Defina uma chave forte em produção:
  `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
- O `NSJB_SECRET_KEY` **não** entra nos backups do banco — guarde-o à parte. Sem ele, o
  token cifrado não é recuperável (basta reconfigurar o token).

## Robustez do envio
- Destinatários duplicados (mesmo número) são deduplicados por envio.
- Cada requisição ao Twilio tem timeout e **retry** com backoff em falha transitória (429/5xx/rede).
- Múltiplas janelas usam `dispatchedWindows` para não reenviar a mesma janela.

## Indo para produção (depois)
1. Registrar um **WhatsApp Sender** (número próprio) via Twilio + Meta.
2. Criar e aprovar os **templates** de lembrete.
3. Trocar o "From" do sandbox pelo número aprovado.
4. Definir `NSJB_SECRET_KEY` e configurar backups automáticos (ver
   [docker/db/BACKUP-RESTORE.md](../docker/db/BACKUP-RESTORE.md)).
