# Plano de Migracao para Docker

## Objetivo

Definir uma migracao segura, incremental e reversivel do NSJB Forms do ambiente atual local para uma topologia containerizada, preparando o sistema para operacao mais previsivel, deploy repetivel e eventual troca de banco.

## Resumo Executivo

Recomendacao:

1. Containerizar primeiro sem trocar o banco.
2. Stabilizar startup, volumes, healthchecks e configuracao.
3. Trocar o frontend de servidor dev para servidor estatico de producao.
4. So depois decidir e executar a migracao de SQLite para PostgreSQL.
5. Endurecer autenticacao e operacao de sessao depois da infraestrutura estabilizada.

Essa ordem reduz risco e evita retrabalho.

## Pergunta sobre Nginx

Nao ha necessidade de um quarto container "no meio" apenas para proxy nesta primeira fase.

Topologia recomendada com 3 containers:

- `frontend`: container com `nginx` ou `caddy` servindo o build do Vite
- `backend`: container Node executando a API local
- `database`: container do banco quando houver migracao para banco dedicado

Observacao:

- Na fase inicial com SQLite, o "database" pode continuar sendo um volume local, sem container de banco dedicado.
- Se a meta for manter exatamente 3 containers desde o inicio, isso faz mais sentido quando o banco ja for PostgreSQL.

## Estado Atual

Hoje o projeto roda como:

- frontend React com Vite
- backend Node local
- persistencia em SQLite
- operacao pensada para maquina unica

Pontos fortes atuais:

- stack simples
- baixo custo operacional
- sem dependencia externa obrigatoria

Limitacoes atuais:

- acoplamento ao ambiente local
- persistencia em arquivo unico
- deploy pouco padronizado
- menor previsibilidade para crescimento multiusuario

## Recomendacao de Banco

Banco recomendado para evolucao:

- `PostgreSQL`

Motivos:

- open source
- maduro
- concorrencia muito melhor que SQLite
- melhor isolamento e seguranca operacional
- backup e restore mais padronizados
- futuro mais seguro para sessoes, auditoria e crescimento de dados

Banco que eu nao recomendo como alvo final:

- manter SQLite como banco principal em ambiente multiusuario serio

SQLite pode continuar como etapa intermediaria, mas nao como desenho final caso o sistema passe a ter uso concorrente mais frequente.

## Decisao Arquitetural Recomendada

### Opcao A - Melhor caminho incremental

Fase 1:

- `frontend` em container
- `backend` em container
- `SQLite` mantido em volume local

Fase 2:

- migracao para `PostgreSQL`
- entra o terceiro container de banco

Vantagens:

- menor risco
- menor mudanca por vez
- troubleshooting simples

### Opcao B - Troca completa de uma vez

- `frontend` em container
- `backend` em container
- `PostgreSQL` em container

Vantagens:

- chega mais rapido no desenho final

Desvantagens:

- mistura infraestrutura, persistencia e migracao de dados no mesmo movimento
- risco maior
- debugging mais lento

Recomendacao final:

- usar a Opcao A

## Topologia Alvo

### Fase inicial containerizada

- `frontend`
  - imagem com `nginx` ou `caddy`
  - serve apenas arquivos estaticos do `dist`
- `backend`
  - imagem Node
  - expoe API
  - usa variaveis de ambiente
- `storage`
  - volume persistente para SQLite

### Fase final recomendada

- `frontend`
  - `nginx` ou `caddy`
- `backend`
  - Node
- `postgres`
  - PostgreSQL com volume persistente

## Por que Nginx ou Caddy no Frontend

Para frontend de producao, o Vite dev server nao e a melhor opcao.

Motivos:

- servidor de desenvolvimento nao e desenho de producao
- desempenho e caching piores
- comportamento menos previsivel
- menos controle de headers

`nginx` ou `caddy` no container do frontend resolvem isso.

### Quando usar Nginx

- quer algo padrao e previsivel
- quer controle fino de cache, gzip, fallback SPA e proxy

### Quando usar Caddy

- quer configuracao mais curta
- quer simplicidade operacional

Recomendacao pragmatica:

- `nginx` se o time estiver confortavel
- `caddy` se quiser configuracao mais simples

## Requisitos Minimos

Seu notebook com `16 GB RAM` atende com folga esse sistema para desenvolvimento e homologacao local.

Consumo esperado para essa stack:

- frontend: baixo
- backend Node: baixo a medio
- PostgreSQL: baixo para medio
- Docker Desktop: custo adicional moderado

Nao vejo risco de memoria para esse sistema no estado atual.

## Plano por Fases

### Fase 0 - Preparacao

Objetivo:

- mapear dependencias e pontos acoplados ao ambiente local

Entregas:

- inventario de variaveis de ambiente
- inventario de portas
- definicao de volumes
- definicao do modo de startup
- definicao de estrategia de backup

Checklist:

- mapear `NSJB_API_PORT`
- mapear caminho de banco
- mapear bootstrap e healthcheck
- mapear fluxo de seed
- mapear arquivos que assumem path local

### Fase 1 - Containerizar backend sem trocar banco

Objetivo:

- rodar a API em container mantendo SQLite

Entregas:

- `Dockerfile` do backend
- volume para persistencia do SQLite
- healthcheck do backend
- ambiente com variaveis externas

Criticos:

- garantir que o arquivo SQLite fique fora da imagem
- persistir em volume
- definir usuario nao-root no container quando possivel

Riscos:

- permissoes no volume
- path do SQLite acoplado ao Windows atual

### Fase 2 - Containerizar frontend

Objetivo:

- parar de depender do Vite dev server no ambiente containerizado

Entregas:

- build do frontend
- container `nginx` ou `caddy`
- fallback correto para SPA
- configuracao de base URL e API

Checklist:

- `vite build`
- fallback para rotas internas
- servir `index.html` para navegacao SPA
- revisar links `#/f/<slug>` e `/f/<slug>`

### Fase 3 - docker-compose local

Objetivo:

- subir ambiente inteiro com um comando

Entregas:

- `docker-compose.yml`
- rede interna
- volumes nomeados
- healthchecks
- sequenciamento de startup

Comportamento desejado:

- `docker compose up -d`
- frontend sobe
- backend sobe
- storage persiste

### Fase 4 - Estabilizacao operacional

Objetivo:

- garantir previsibilidade antes da troca de banco

Entregas:

- smoke tests em container
- validacao de bootstrap
- validacao de login
- validacao de criacao/edicao/exclusao
- validacao de links publicos

Checklist:

- `/api/health`
- `/api/bootstrap`
- login admin e viewer
- salvar formulario
- responder formulario publico
- resultados

### Fase 5 - Preparacao para trocar de banco

Objetivo:

- reduzir acoplamento ao SQLite

Entregas:

- revisao de `server/db.mjs`
- revisao de migrations
- revisao de queries especificas
- revisao de serializacao JSON
- inventario de tipos e constraints

Arquivos mais sensiveis:

- `server/db.mjs`
- `server/repositories/*`
- `server/seed.mjs`
- testes de API

### Fase 6 - Introducao do PostgreSQL

Objetivo:

- subir ambiente final com banco dedicado

Entregas:

- container `postgres`
- variaveis de conexao
- camada de conexao nova
- migracoes de schema

Decisoes tecnicas:

- manter schema simples
- preservar contratos atuais
- evitar ORM nesta primeira migracao se nao houver necessidade clara

Recomendacao:

- continuar com SQL explicito
- criar camada de acesso bem isolada

### Fase 7 - Migracao de dados

Objetivo:

- levar os dados existentes do SQLite para PostgreSQL

Entregas:

- script de exportacao
- script de importacao
- validacao de contagem
- validacao de integridade

Tabelas criticas:

- `forms`
- `responses`
- `response_values`
- `users`
- `auth_sessions`
- `settings`
- `audit_logs`
- `labels`
- `presets`
- `people`

Validacoes obrigatorias:

- contagem por tabela
- leitura de formularios
- login
- respostas antigas
- sessoes
- auditoria

### Fase 8 - Endurecimento de auth e operacao

Objetivo:

- subir o nivel de seguranca depois da infraestrutura estabilizada

Entregas sugeridas:

- cookie `HttpOnly`
- politica explicita de timeout
- metadados de sessao por dispositivo
- lista de sessoes ativas
- auditoria de login, timeout e logout

Motivo para deixar depois:

- o desenho final de sessao depende do ambiente final
- evita refazer parte do auth durante a troca de infraestrutura

## Ordem Recomendada de Execucao

1. Documento de variaveis e paths
2. `Dockerfile` backend com SQLite em volume
3. `Dockerfile` frontend com `nginx` ou `caddy`
4. `docker-compose` local
5. Validacao funcional completa
6. Revisao de acoplamentos a SQLite
7. Introducao de PostgreSQL
8. Migracao de dados
9. Endurecimento final de autenticacao

## O que Nao Fazer

- nao migrar Docker e banco ao mesmo tempo sem validacao intermediaria
- nao publicar com Vite dev server como ambiente de producao
- nao manter banco dentro da imagem
- nao guardar secrets fixos em `Dockerfile`
- nao misturar refatoracao ampla de codigo com migracao de infraestrutura

## Variaveis de Ambiente Recomendadas

Backend:

- `NSJB_API_PORT`
- `NSJB_DB_PATH` enquanto ainda houver SQLite
- `NSJB_DB_DRIVER` quando houver abstracao de driver
- `NSJB_PGHOST`
- `NSJB_PGPORT`
- `NSJB_PGDATABASE`
- `NSJB_PGUSER`
- `NSJB_PGPASSWORD`

Frontend:

- URL base da API, se o desenho final pedir configuracao em runtime

## Volumes Recomendados

Fase com SQLite:

- volume persistente para `/app/storage`

Fase com PostgreSQL:

- volume persistente para dados do Postgres

## Healthchecks Recomendados

Backend:

- `GET /api/health`

Frontend:

- checagem HTTP simples no root

Banco:

- healthcheck nativo do Postgres

## Validacao por Fase

### Validacao minima da Fase 1 e 2

- build frontend
- API sobe
- bootstrap responde
- login responde
- salvar formulario funciona

### Validacao minima antes da troca de banco

- todos os testes de API principais
- todos os fluxos publicos criticos
- criacao, edicao e exclusao
- respostas e resultados

### Validacao minima depois da troca de banco

- paridade de dados
- paridade de comportamento
- auditoria
- autenticacao
- performance basica de leitura e escrita

## Critérios de Pronto

### Docker pronto para uso local

- sobe com um comando
- persiste dados entre reinicios
- frontend e backend acessiveis
- healthchecks funcionando

### Infraestrutura pronta para migrar banco

- frontend e backend estaveis em container
- paths e volumes resolvidos
- sem acoplamentos novos ao host Windows

### Banco novo pronto

- migracao executada
- dados validados
- rollback planejado

## Riscos Principais

- subestimar acoplamento ao SQLite
- quebrar bootstrap durante a troca de banco
- perder consistencia em `auth_sessions` e `audit_logs`
- fazer a troca sem estrategia de rollback

## Estrategia de Rollback

Na migracao para Docker:

- manter o ambiente local atual funcionando em paralelo

Na migracao de banco:

- manter snapshot do SQLite
- manter script de restauracao
- nao desligar a trilha antiga ate a validacao final

## Proximo Passo Sugerido

Se a decisao estiver aprovada, o melhor proximo passo tecnico e:

1. criar o documento de variaveis e paths operacionais
2. montar `Dockerfile` do backend
3. montar `Dockerfile` do frontend com `nginx`
4. montar `docker-compose.yml` mantendo SQLite primeiro

Esse e o menor caminho com melhor relacao risco/ganho.
