# Aplicacao

## Objetivo

Resumo funcional da aplicacao. Para a lista completa de capacidades, veja [docs/FUNCIONALIDADES.md](FUNCIONALIDADES.md) e para a visao visual veja [docs/DIAGRAMAS.md](DIAGRAMAS.md).

O NSJB Forms centraliza dois fluxos principais:

- formularios de presenca
- escala da Organ

Nesta fase, o projeto e um MVP operado em Docker com persistencia em PostgreSQL, pensado para uso simples em maquina unica e evolucao posterior para backend remoto.

## Visao rapida

```text
Usuario -> Frontend -> Backend -> PostgreSQL
```

## Como funciona

O frontend mostra a interface e dispara as requisicoes.
O backend valida os dados, aplica as regras e grava no banco.
O PostgreSQL guarda o estado oficial da aplicacao.

Quando a aplicacao sobe:

1. o container do PostgreSQL inicia primeiro
2. o backend conecta no banco e carrega configuracoes
3. o frontend sobe em seguida e consome a API
4. se houver snapshot legado do SQLite, o backend faz a importacao unica

## Perfis

- `visitante`: sem login, ve apenas formularios abertos e links publicos
- `viewer`: visualiza resultados de todos os formularios
- `admin`: cria formularios, edita escala, gerencia usuarios, presets, classificacoes e socios

Usuarios padrao:

```text
admin / admin123
viewer / viewer123
```

## Fluxos principais

### 1. Listagem

A tela `Formularios` exibe:

- titulo
- status
- tipo
- classificacoes
- fechamento
- preenchimento
- link publico

Visitantes veem apenas formularios `aberto`.
Quem tem acesso interno consegue abrir resultados, editar ou arquivar.

### 2. Criacao e edicao

A tela `Novo` permite:

- criar `presenca`
- criar `escala_organ`
- aplicar presets
- definir titulo, sessao, datas e status
- configurar classificacoes
- definir campos dinamicos de presenca
- definir secoes da escala

Os formularios sao salvos no PostgreSQL da stack Docker.
O mesmo formulario pode ser reaberto para edicao enquanto estiver em estado editavel.

### 3. Formulario publico de presenca

O respondente:

1. escolhe o nome na base de socios
2. preenche campos configurados no formulario
3. pode reabrir o mesmo link e editar a resposta existente

As respostas sao salvas por formulario.
Se o formulario permitir edicao, o mesmo link atualiza a resposta existente em vez de criar uma duplicidade.

### 4. Escala publica

O participante:

1. acessa o link publico da escala
2. escolhe uma vaga pendente
3. seleciona o nome

Cada nome so pode ocupar uma vaga por escala.
Quando a vaga ja esta ocupada, o sistema devolve conflito e recarrega o estado antes de salvar.

### 5. Resultados

Para presenca:

- tabela por formulario
- ordenacao por coluna
- visibilidade de colunas
- totalizacao de campos `Sim/Nao`
- totalizacao de campos numericos
- exportacao CSV

Para escala:

- vagas preenchidas
- vagas pendentes
- total de vagas
- edicao de responsaveis e auxiliares por administradores
- exportacao CSV

### 6. Configuracoes

O menu `Configuracoes` concentra:

- usuarios
- socios
- classificacoes
- presets

Nessa area, o admin ajusta o comportamento da base sem precisar mexer no codigo.

## Socios via Google Sheets

O projeto mantem intencionalmente a configuracao por link direto de Google Sheets para facilitar a operacao atual.

Sao armazenados:

- URL da planilha
- coluna do nome
- coluna do grau
- aba/intervalo

A leitura e usada para popular a lista global de socios na base do backend.
Na migracao atual, isso ajuda a manter o cadastro operacional sem depender de importacao manual a cada inicio.

## Documentos relacionados

- [README.md](../README.md)
- [docs/FUNCIONALIDADES.md](FUNCIONALIDADES.md)
- [docs/DIAGRAMAS.md](DIAGRAMAS.md)
