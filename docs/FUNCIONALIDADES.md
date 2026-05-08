# Funcionalidades

Documento funcional completo do NSJB Forms.

## Visao visual

![Fluxo funcional resumido](diagramas/funcional.svg)

Para o mapa visual da arquitetura e dos fluxos, veja [docs/DIAGRAMAS.md](DIAGRAMAS.md).

## Como ler

- comece por esta pagina se voce quer entender o que a aplicacao faz
- use [docs/DIAGRAMAS.md](DIAGRAMAS.md) para ver os fluxos sem abrir o codigo
- use [README.md](../README.md) para a entrada mais curta do projeto

## Visao geral

O NSJB Forms centraliza a operacao de:

- formularios de presenca
- formularios de escala
- resultados e acompanhamento
- administracao da base e configuracoes

A aplicacao foi desenhada para rodar oficialmente em Docker com PostgreSQL.

## Perfis de uso

- `visitante` - acessa somente links publicos de formularios abertos.
- `viewer` - visualiza resultados e area interna de leitura.
- `admin` - cria, edita e administra formularios, usuarios, socios e catalogos.

## Funcionalidades por area

### 1. Listagem de formularios

- exibe titulo, tipo, status, classificacoes, fechamento e resumo de preenchimento
- permite buscar, ordenar, filtrar e fixar formularios
- permite abrir link publico
- permite acessar resultados, quando o perfil autoriza
- permite arquivar ou restaurar formularios
- permite excluir formulario com chave mestra

### 2. Criacao e edicao de formularios

- cria formularios de presenca
- cria formularios de escala
- aplica presets como base inicial
- edita titulo, sessao, descricao, datas e status
- configura classificacoes
- define campos de presenca
- define secoes e vagas de escala
- salva rascunho, aberto, fechado ou arquivado

### 3. Formulario publico de presenca

- coleta respostas por link publico
- usa a base de socios para selecionar nomes
- salva resposta nova ou atualiza resposta existente
- respeita regras de validacao do formulario
- bloqueia duplicidade quando configurado
- permite consulta do formulario aberto ou fechado

### 4. Formulario publico de escala

- exibe secoes e vagas da escala
- permite preencher vaga por nome
- respeita limite de participacao por nome
- detecta conflito quando a vaga ja foi ocupada
- recarrega o estado ao encontrar conflito
- salva a estrutura atualizada da escala

### 5. Resultados

- exibe respostas por formulario
- exibe escala preenchida e pendente
- mostra totais e resumo operacional
- permite exportacao em CSV, quando habilitada pela tela
- permite edicao de configuracao da escala por admin

### 6. Administracao

- gerencia usuarios
- gerencia socios
- gerencia classificacoes
- gerencia presets
- gerencia catalogo de campos base
- gerencia catalogo de tarefas base de escala
- configura a chave mestra de exclusao de formularios
- consulta logs de auditoria

### 7. Bootstrap e inicio

- carrega dados iniciais ao abrir a aplicacao
- restaura sessao salva localmente
- resolve o formulario publico via slug
- carrega respostas e escala conforme a tela ativa

### 8. Persistencia

- o banco oficial e PostgreSQL no Docker
- o backend continua com uma camada de acesso separada por repository
- o SQLite legado existe apenas como compatibilidade historica

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
- o SQLite legado existe so para a transicao historica

## Relacao com a arquitetura

- Interface e tela ficam em `frontend/src/`
- Regras de negocio ficam em `backend/services/`
- Persistencia fica em `backend/repositories/`
- Rotas HTTP ficam em `backend/routes/`
- Infraestrutura oficial fica em `docker/`

## Documentos relacionados

- [README.md](../README.md)
- [docs/APLICACAO.md](APLICACAO.md)
- [docs/FUNCIONALIDADES-E-ARQUITETURA.md](FUNCIONALIDADES-E-ARQUITETURA.md)
- [docs/ARCHITECTURE.md](ARCHITECTURE.md)
- [docs/DIAGRAMAS.md](DIAGRAMAS.md)
