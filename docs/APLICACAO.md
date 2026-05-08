# Aplicação

## Objetivo

O NSJB Forms centraliza dois fluxos:

- formulários de presença
- escala da Organ

Nesta fase, o projeto é um MVP local com persistência em SQLite, pensado para operação simples em máquina única e evolução posterior para backend remoto.

## Perfis

- `visitante`: sem login, vê apenas formulários abertos e links públicos
- `viewer`: visualiza resultados de todos os formulários
- `admin`: cria formulários, edita escala, gerencia usuários, presets, classificações e sócios

Usuários padrão:

```text
admin / admin123
viewer / viewer123
```

## Fluxos principais

### 1. Listagem

A tela `Formulários` exibe:

- título
- status
- tipo
- classificações
- fechamento
- preenchimento
- link público

Visitantes veem apenas formulários `aberto`.

### 2. Criação e edição

A tela `Novo` permite:

- criar `presenca`
- criar `escala_organ`
- aplicar presets
- definir título, sessão, datas e status
- configurar classificações
- definir campos dinâmicos de presença
- definir seções da escala

Os formulários são salvos no SQLite local.

### 3. Formulário público de presença

O respondente:

1. escolhe o nome na base de sócios
2. preenche campos configurados no formulário
3. pode reabrir o mesmo link e editar a resposta existente

As respostas são salvas por formulário.

### 4. Escala pública

O participante:

1. acessa o link público da escala
2. escolhe uma vaga pendente
3. seleciona o nome

Cada nome só pode ocupar uma vaga por escala.

### 5. Resultados

Para presença:

- tabela por formulário
- ordenação por coluna
- visibilidade de colunas
- totalização de campos `Sim/Não`
- totalização de campos numéricos
- exportação CSV

Para escala:

- vagas preenchidas
- vagas pendentes
- total de vagas
- edição de responsáveis e auxiliares por administradores
- exportação CSV

### 6. Configurações

O menu `Configurações` concentra:

- usuários
- sócios
- classificações
- presets

## Sócios via Google Sheets

O projeto mantém intencionalmente a configuração por link direto de Google Sheets para facilitar a operação atual.

São armazenados:

- URL da planilha
- coluna do nome
- coluna do grau
- aba/intervalo

A leitura é usada para popular a lista global de sócios no SQLite local.
