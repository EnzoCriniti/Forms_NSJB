# Funcionalidades

Documento funcional do NSJB Forms.

## Mapa visual

![Fluxo funcional resumido](diagramas/funcional.svg)

## Como ler

- comece por esta pagina se voce quer entender o que a aplicacao faz
- use [docs/DIAGRAMAS.md](DIAGRAMAS.md) para abrir os mapas visuais
- use [README.md](../README.md) para a entrada mais curta do projeto

## Visao geral

O NSJB Forms centraliza a operacao de:

- formularios de presenca
- formularios de escala
- eventos e mensagens operacionais (abertura assistida no grupo + lembretes por DM via Twilio)
- resultados e acompanhamento
- relatorios e BI de presenca, escala e socios
- equipes da Organ com periodos e dispensas
- administracao da base, camadas de acesso e configuracoes

A aplicacao foi desenhada para rodar oficialmente em Docker com PostgreSQL.
O fluxo oficial assume uma maquina ou ambiente unico com os tres containers da stack.

## Perfis de uso

O acesso interno e controlado por **camadas de acesso** (RBAC): cada camada guarda um
conjunto de capacidades por area (eventos, formularios por tipo, operacao, mensagens,
relatorios, equipes, socios, usuarios/acessos e configuracoes). Cada usuario pertence a
uma camada e as telas e rotas checam capacidades especificas (ex.: `forms.escala.edit`),
nao mais um papel fixo. Detalhes em [docs/AI_CODEMAP.md](AI_CODEMAP.md) e em
`shared/permissions.mjs`.

- `visitante` - acessa somente links publicos de formularios abertos.
- Camada **Visualizador** (sistema) - acesso somente leitura a resultados, relatorios e base.
- Camada **Administrativo** (sistema) - todas as capacidades.
- Camadas customizadas - o admin compoe capacidades sob medida (ex.: "Coordenador de escala":
  so escala, operacao de escala e resultados).

As camadas de sistema preservam a mecanica legada de `role` (`admin`/`viewer`) derivada das
capacidades, para compatibilidade de sessao.
Administradores diferentes podem usar a plataforma ao mesmo tempo; um novo login invalida apenas a sessao anterior da mesma conta.

## Funcionalidades por area

### 1. Listagem de formularios

- exibe titulo, tipo, status, classificacoes, fechamento e resumo de preenchimento
- permite buscar, ordenar, filtrar e fixar formularios para perfis de edicao
- permite abrir link publico
- permite acessar resultados, quando o perfil autoriza
- permite ao visitante abrir `Ver resultados` quando a publicacao externa foi habilitada no formulario
- permite arquivar ou restaurar formularios
- permite excluir formulario com chave mestra

Como essa area funciona:

1. o frontend pede a lista inicial ao backend
2. o backend monta os metadados a partir do banco
3. a tela aplica filtros locais de busca e ordenacao
4. as acoes de arquivar, restaurar e excluir voltam para a API

### 2. Criacao e edicao de formularios

- cria formularios de presenca
- cria formularios de escala
- aplica presets como base inicial
- oferece presets completo e enxuto da Escala da Organ, inclusive em bancos atualizados
- edita titulo, sessao, descricao, datas e status
- configura classificacoes
- define campos de presenca
- define secoes e vagas de escala
- salva rascunho, aberto, fechado ou arquivado

Como essa area funciona:

1. o usuario escolhe o tipo de formulario
2. a tela monta o modelo inicial com base em presets ou formulario existente
3. o frontend valida a estrutura basica antes de enviar
4. o backend valida de novo e grava a versao final

### 3. Formulario publico de presenca

- coleta respostas por link publico
- usa a base de socios para selecionar nomes
- salva resposta nova ou atualiza resposta existente
- respeita regras de validacao do formulario
- bloqueia duplicidade quando configurado
- permite consulta do formulario aberto ou fechado

Como essa area funciona:

1. o link publico identifica o formulario pelo slug
2. o frontend carrega a configuracao permitida para aquele formulario
3. o usuario escolhe um socio e preenche os campos
4. o backend salva a resposta e reaproveita a existente quando o fluxo permite edicao

### 4. Formulario publico de escala

- exibe secoes e vagas da escala
- permite preencher vaga por nome
- respeita limite de participacao por nome
- detecta conflito quando a vaga ja foi ocupada
- recarrega o estado ao encontrar conflito
- salva a estrutura atualizada da escala

Como essa area funciona:

1. a tela publica consulta a estrutura da escala
2. cada secao mostra vagas livres e ocupadas
3. ao escolher um nome, o backend verifica limites e conflitos
4. se houver disputa, o frontend recarrega o estado atual e tenta novamente

### 5. Resultados

- exibe respostas por formulario
- exibe escala preenchida e pendente
- mostra totais e resumo operacional
- estima por refeicao os respondentes, criancas, jovens e visitantes presentes, considerando acompanhantes apenas quando a pessoa confirmou aquela refeicao
- permite exportacao em CSV, quando habilitada pela tela
- permite edicao de configuracao da escala por admin

Como essa area funciona:

1. o backend entrega a lista consolidada de respostas ou escala
2. o frontend monta a tabela e os totais
3. o admin pode entrar em ajustes quando a tela oferece edicao
4. a exportacao CSV gera uma visao externa da mesma base

### 6. Administracao

- gerencia usuarios e atribui a camada de acesso de cada um
- gerencia camadas de acesso (matriz de capacidades; camadas de sistema travadas)
- gerencia socios
- gerencia classificacoes
- gerencia presets
- gerencia catalogo de campos base
- gerencia catalogo de tarefas base de escala
- configura modelos, presets e provedor de mensagens (Twilio, com token write-only)
- configura a chave mestra de exclusao de formularios
- consulta logs de auditoria

Como essa area funciona:

1. o menu administrativo centraliza configuracoes de dominio
2. os cadastros sao persistidos no backend
3. as alteracoes entram no mesmo banco oficial da stack
4. a auditoria registra operacoes relevantes para consulta posterior

### 7. Eventos e mensagens

- agrupa formularios vinculados a um evento
- permite publicar eventos e abrir formularios associados
- permite encerrar e reabrir eventos, alem de alterar novamente o status pelo editor
- exibe a data no titulo dos cards de evento para facilitar a navegacao
- permite criar mensagens de anuncio (abertura), lembrete de presenca e lembrete de vagas em aberto
- usa modelos reutilizaveis que carregam configuracao (destinatarios + janelas), presets de pessoas e configuracao global
- editor com chips de variaveis (insercao no cursor), preview ao vivo e filtro por grau nos lembretes
- calcula destinatarios a partir da base central de socios, respostas e escala
- abertura: texto pronto para o organizador postar no grupo do WhatsApp (Twilio nao posta em grupo)
- lembretes: envio individual por DM via Twilio quando o provedor esta configurado; senao, dispatch `log-only` que registra o que seria enviado
- lembretes podem disparar em multiplas janelas (ex.: manha do fechamento, 12h antes, 1h antes)
- processa mensagens agendadas pelo orquestrador quando a stack esta ativa

Como essa area funciona:

1. o admin cria ou seleciona um evento com formulario de presenca ou escala
2. a aba de mensagens aparece apenas quando existe formulario elegivel
3. o editor valida tipo, formulario alvo, telefone configurado e agendamento
4. o preview renderiza placeholders e mostra destinatarios calculados
5. o disparo (Twilio ou log-only) registra o texto e os destinatarios no historico da mensagem
6. lembretes com varias janelas re-armam para a proxima janela pendente ate a ultima

Guia do provedor: [docs/messaging-twilio.md](messaging-twilio.md). Estado atual: [docs/messaging-feature.md](messaging-feature.md).

### 8. Relatorios e BI

- dashboard de indicadores dentro da area de Socios, gated por `reports.view`
- presenca: tendencia, distribuicao, heatmap e rankings de comparecimento
- escala: vacancia, tempo de preenchimento, matriz e carga por pessoa
- socios: visao agregada e perfil individual de participacao
- a base do BI sao snapshots de participacao congelados no encerramento do evento

Como essa area funciona:

1. ao encerrar um evento, o backend captura a participacao esperada/realizada em `event_participation`
2. periodos de equipes aplicaveis marcam dispensados como `expected=false`
3. as agregacoes de BI contam apenas linhas `expected=true`
4. o frontend consome um endpoint consolidado e monta as abas e graficos

### 9. Equipes

- menu `Equipes` com periodos da Organ (intervalo de datas)
- cada periodo define Mestre Assistente (grau QM), Organ (grau CDC), auxiliares diretos e equipes auxiliares
- valida pessoas contra a base de socios e bloqueia sobreposicao de periodos
- resumo do periodo lista formularios e eventos do intervalo, clicaveis para resultados
- dispensas do periodo isentam pessoas do BI sem zerar a base

Como essa area funciona:

1. o admin cria o periodo escolhendo pessoas da base de socios
2. o backend valida graus, auxiliares e ausencia de sobreposicao
3. ao capturar participacao, dispensados do periodo entram como `expected=false`
4. o BI passa a refletir apenas quem era esperado de fato

### 10. Bootstrap e inicio

- carrega dados iniciais ao abrir a aplicacao
- restaura sessao salva localmente
- resolve o formulario publico via slug
- carrega respostas e escala conforme a tela ativa
- carrega eventos, modelos, presets e configuracao de mensagens

Como essa area funciona:

1. o backend sobe e carrega configuracoes e seed se necessario
2. o frontend restaura sessao e estado local
3. o usuario cai na ultima tela ativa ou no fluxo publico correto
4. o sistema usa isso para evitar telas vazias ou estados inconsistentes

### 11. Persistencia

- o banco oficial e PostgreSQL no Docker
- o backend continua com uma camada de acesso separada por repository

Como essa area funciona:

1. a aplicacao grava no PostgreSQL do Docker
2. a camada de repository isola consultas e comandos SQL
3. o fluxo oficial nao depende de arquivo local legado

## Fluxo funcional resumido

1. usuario entra na aplicacao
2. frontend carrega bootstrap inicial
3. usuario acessa lista, dashboard ou link publico
4. telas consultam a API
5. backend valida, aplica regras e persiste
6. frontend atualiza a visao e os resumos

## Resumo operacional

Se voce so precisa de uma visao rapida, pense assim:

- o frontend organiza a experiencia do usuario
- o backend valida e grava os dados
- o PostgreSQL concentra a persistencia oficial

## Relacao com a arquitetura

- Interface e tela ficam em `frontend/src/`
- Regras de negocio ficam em `backend/services/`
- Regras de BI ficam em `backend/bi/`
- Envio de mensagens fica em `backend/dispatchers/`
- Capacidades de acesso (RBAC) ficam em `shared/permissions.mjs`
- Persistencia fica em `backend/repositories/`
- Rotas HTTP ficam em `backend/routes/`
- Infraestrutura oficial fica em `docker/`

## Documentos relacionados

- [README.md](../README.md)
- [docs/ARQUITETURA.md](ARQUITETURA.md)
- [docs/DIAGRAMAS.md](DIAGRAMAS.md)

## Regra de evolucao

Quando uma funcionalidade mudar de comportamento, ajuste esta pagina no mesmo ciclo para manter a leitura do produto atualizada.
