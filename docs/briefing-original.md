# Sistema de Gerenciamento de Formulários de Presença e Escalas — NSJB

## 1. Visão Geral

Sistema web para gerenciamento de formulários de presença em sessões e eventos do Núcleo NSJB. Substitui o fluxo atual baseado em Google Forms + Google Sheets por uma plataforma própria, centralizada, com visualização de resultados integrada, presets reutilizáveis e controle de acesso por camadas.

---

## 2. Contexto e Problema

Atualmente, o controle de presença é feito manualmente com Google Forms para coleta e planilhas do Google Sheets para visualização e totalização. Isso gera retrabalho na criação de formulários repetitivos, dificulta a visualização consolidada dos dados e não oferece controle de acesso adequado.

**Tipos de sessões/eventos gerenciados:**
- Sessão de Escala (semanal)
- Sessão de Escala Anual
- Sessão Extra
- Sessão da Direção
- Sessão Instrutiva
- Eventos Beneficentes

**Dois formatos principais de coleta:**
1. **Formulário de Presença** — O membro seleciona seu nome e responde perguntas de presença por horário (Sim/Não), além de informar acompanhantes (crianças, jovens, visitantes).
2. **Planilha de Escala da Organ** — Quadro de tarefas (ex: "Limpeza do banheiro antes da sessão - Masculino") com vagas para Responsável e Auxiliares, onde os membros se inscrevem manualmente.

---

## 3. Funcionalidades do MVP

### 3.1 Cadastro de Formulário

**Criação simplificada (estilo Google Forms):**
- Título do formulário
- Descrição/instruções (texto rico simples)
- Data da sessão/evento
- Data e hora de fechamento automático
- Texto exibido após fechamento
- Labels de classificação (tags dinâmicas para categorizar: "Sessão de Escala", "Evento Beneficente", etc.)

**Tipos de campos disponíveis:**
- **Seleção de pessoa** — Dropdown populado via importação de planilha. Cada pessoa possui pelo menos: Nome e Grau. Campo obrigatório como identificador do respondente.
- **Sim/Não** — Pergunta de presença binária (ex: "15h - Apresentação DMC")
- **Grade/Matriz** — Tabela com linhas (categorias) × colunas (valores numéricos). Ex: "Crianças (1-11 anos)" × "1, 2, 3, 4, 5"
- **Campo numérico** — Para quantidades simples
- **Texto curto** — Resposta aberta
- **Campo personalizado** — O criador define label e tipo

**Configuração de visualização na criação:**
- Ao criar o formulário, o criador já define quais campos serão exibidos como colunas na tabela de resultados
- Define quais campos terão totalização automática (contagem de Sim/Não, soma de valores numéricos)
- Isso evita configuração posterior e garante visualização padronizada desde o primeiro envio

**Link compartilhável:**
- Cada formulário recebe um link único (slug ou UUID)
- Formato sugerido: `sistema.com/f/{slug-ou-id}`
- Respondente acessa sem necessidade de login/cadastro

### 3.2 Presets de Formulário

- O criador pode salvar qualquer formulário como preset, atribuindo um nome
- Na criação de um novo formulário, pode-se selecionar um preset existente como base
- O preset carrega todos os campos, configurações de visualização e labels — o criador só precisa ajustar título, data e detalhes específicos
- Presets podem ser editados e excluídos

### 3.3 Edição de Formulário

- Edição completa de campos, título, descrição, datas, labels
- Formulários já com respostas podem ter campos editados com aviso de impacto nos dados já coletados
- Alteração de status (aberto/fechado) manual

### 3.4 Listagem de Formulários

- Lista todos os formulários criados
- Filtros por: label/categoria, status (aberto/fechado/rascunho), data
- Busca por texto (título, descrição)
- Ordenação por data de criação, data da sessão, status
- Indicadores visuais: status, total de respostas, porcentagem de preenchimento

### 3.5 Visualização de Resultados

**Tabela de respostas (formato planilha):**
- Uma linha por respondente
- Colunas configuráveis (definidas na criação do formulário)
- Coluna fixa: Grau + Nome
- Colunas de respostas: cada campo do formulário

**Painel de totalização:**
- Para campos Sim/Não: total de Sim, total de Não
- Para campos numéricos/grade: soma total
- Total de respostas recebidas
- **Total de pessoas que faltam responder** (comparação com lista importada)
- Seleção dinâmica de quais colunas exibem totalização

**Exportação:**
- Exportar resultados como planilha (.xlsx ou .csv)

### 3.6 Importação de Lista de Pessoas

- Upload manual de arquivo de planilha (.xlsx, .csv)
- Seleção de colunas para mapeamento (ex: coluna A = Grau, coluna B = Nome)
- A lista importada alimenta o dropdown "Nome" nos formulários
- Atualização periódica: o administrador faz novo upload quando necessário (não é sincronização em tempo real)
- A lista serve também como base para calcular "Faltam responder"

### 3.7 Status e Ciclo de Vida do Formulário

| Status    | Descrição                                                    |
|-----------|--------------------------------------------------------------|
| Rascunho  | Formulário criado mas ainda não publicado                    |
| Aberto    | Aceitando respostas, link ativo                              |
| Fechado   | Não aceita mais respostas, exibe texto de fechamento         |

- Fechamento automático por data/hora configurada
- Fechamento manual pelo administrador
- Texto de fechamento customizável
- Respondente pode editar sua resposta enquanto o formulário estiver aberto (identificado pelo nome selecionado — sobrescreve resposta anterior)

---

## 4. Camadas de Acesso (simplificado para MVP)

| Papel         | Permissões                                                              |
|---------------|-------------------------------------------------------------------------|
| Administrador | Criar, editar, excluir formulários. Gerenciar presets e labels. Importar listas. Visualizar todos os resultados. Gerenciar usuários. |
| Visualizador  | Visualizar formulários publicados e seus resultados. Sem permissão de criação ou edição. |
| Respondente   | Acesso público via link. Preenche e edita respostas. Sem cadastro necessário. |

> **Nota para evolução futura:** Implementar sistema completo de autenticação com níveis granulares de permissão (editor, moderador, etc.) e gestão de usuários com convite.

---

## 5. Módulo Futuro — Planilha de Escala da Organ

Este módulo tem comportamento diferente dos formulários de presença e será desenvolvido em fase posterior.

**Conceito:** Quadro de tarefas onde cada tarefa tem vagas (Responsável + N Auxiliares) e os membros se inscrevem nas vagas disponíveis.

**Estrutura:**
- Cabeçalho: Título da escala, data, informações gerais (Organ, Auxiliares Diretas, Compras, etc.)
- Seções de tarefas: "Preparação do Jantar", "Limpeza Após o Jantar", "Limpeza do Banheiro Masculino", etc.
- Cada seção tem vagas com papel (Responsável/Auxiliar) e campo para nome
- Membros acessam via link e se colocam em vagas disponíveis

> **Nota:** Avaliar se a melhor UX é manter o formato de planilha editável ou transformar em um fluxo de "inscrição em vagas" com cards/botões.

---

## 6. Módulo Futuro — Planilha de Contribuição para Lanche

A ser definido em fase posterior.

---

## 7. Arquitetura Sugerida (Alto Nível)

### Banco de Dados
**Recomendação: NoSQL (documento)** — devido à natureza dinâmica dos formulários, onde cada formulário pode ter estrutura de campos diferente. Opções:
- **MongoDB** — Mais robusto, ideal para produção, boa comunidade
- **Firebase Firestore** — Mais simples de configurar, inclui autenticação e hosting, bom para MVP rápido

### Coleções principais sugeridas

```
users/
  - id, nome, email, papel (admin/viewer), criado_em

forms/
  - id, titulo, descricao, slug, status, labels[]
  - data_sessao, data_fechamento, texto_fechamento
  - campos[] (array de objetos com tipo, label, opcoes, obrigatorio, exibir_resultado, totalizar)
  - config_visualizacao (colunas visíveis, colunas com total)
  - criado_por, criado_em, atualizado_em

presets/
  - id, nome, campos[], config_visualizacao, labels[]
  - criado_por, criado_em

responses/
  - id, form_id, pessoa_nome, pessoa_grau
  - respostas{} (objeto chave-valor: campo_id → valor)
  - enviado_em, atualizado_em

people_lists/
  - id, nome_lista, pessoas[] (array com {nome, grau, ...})
  - importado_em, atualizado_em

labels/
  - id, nome, cor (opcional)
```

### Considerações Técnicas
- **Links únicos:** Cada formulário recebe um slug amigável ou UUID curto para URL compartilhável
- **Segurança:** Respostas associadas ao nome selecionado (sem autenticação do respondente no MVP). Painel administrativo protegido por login
- **Responsividade:** Interface deve funcionar bem em mobile (respondentes acessam por WhatsApp → link)

---

## 8. Requisitos Não-Funcionais

- Interface limpa e funcional (não precisa ser "bonita", precisa ser prática)
- Suporte a modo claro e modo escuro
- Responsivo (mobile-first para o formulário público)
- Carregamento rápido dos formulários públicos
- Dados persistidos de forma segura

---

## 9. Fluxos Principais

### Fluxo 1 — Criar e Publicar Formulário
1. Admin acessa painel → "Novo Formulário"
2. Seleciona preset (opcional) ou começa do zero
3. Preenche título, descrição, data, labels
4. Adiciona campos (Sim/Não, Grade, Numérico, etc.)
5. Seleciona lista de pessoas para o dropdown de nomes
6. Configura quais colunas aparecem na visualização e quais totalizam
7. Define data de fechamento e texto de fechamento
8. Salva como rascunho ou publica diretamente
9. Recebe link compartilhável para enviar (ex: via WhatsApp)

### Fluxo 2 — Responder Formulário
1. Membro recebe link no WhatsApp
2. Abre no celular, vê título e instruções
3. Seleciona seu nome no dropdown
4. Responde perguntas (Sim/Não por horário, quantidades de acompanhantes)
5. Envia
6. Se precisar editar: acessa o mesmo link, seleciona o nome novamente, formulário carrega resposta anterior para edição

### Fluxo 3 — Visualizar Resultados
1. Admin ou Visualizador acessa painel → seleciona formulário
2. Vê tabela com todas as respostas (linha por pessoa, coluna por campo)
3. Vê painel de totalização (Sim: 69, Não: 52, Total: 121, Faltam: 27)
4. Pode selecionar/deselecionar colunas de totalização
5. Pode exportar como planilha

---

## 10. Roadmap Sugerido

| Fase | Escopo                                                        | Prioridade |
|------|---------------------------------------------------------------|------------|
| 1    | MVP: Formulários de presença (criar, editar, listar, responder, visualizar resultados) | Alta |
| 1    | Importação de lista de pessoas via upload                     | Alta       |
| 1    | Presets de formulário                                         | Alta       |
| 1    | Labels e filtros na listagem                                  | Média      |
| 1    | Status e fechamento automático                                | Alta       |
| 2    | Camadas de acesso (admin + visualizador com login)            | Alta       |
| 2    | Exportação de resultados (.xlsx)                              | Média      |
| 3    | Módulo de Escala da Organ (planilha de inscrição em tarefas)  | Média      |
| 3    | Modo escuro                                                   | Baixa      |
| 4    | Planilha de contribuição para lanche                          | Baixa      |
| 4    | Níveis de acesso granulares e gestão de usuários              | Média      |
