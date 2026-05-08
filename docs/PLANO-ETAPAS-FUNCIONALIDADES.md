# Plano por Etapas

Documento temporario para organizar a evolucao funcional do NSJB Forms em etapas pequenas, com foco em implementacao segura e incremental.

## Objetivo

Registrar o backlog funcional aprovado, a ordem recomendada e as dependencias principais para que a implementacao aconteca sem perder contexto.

## Escopo Aprovado

### Etapa 1 - Operacao do dia a dia

- Duplicar formulario existente
- Agendamento de abertura e fechamento
- Arquivar formulario
- Favoritos ou fixados
- Busca global melhor

### Etapa 2 - Qualidade e controle de resposta

- Regras de validacao por campo
- Bloqueio opcional por pessoa ja respondida, configuravel por formulario

Itens removidos desta frente:

- Campos condicionais
- Pre-visualizacao real do formulario
- Modo rascunho de resposta publica

### Etapa 3 - Escala da Organ

- Limite por pessoa
- Lista de espera
- Remanejamento assistido
- Resumo operacional da escala

### Etapa 4 - Gestao administrativa

- Endurecimento de autenticacao de sessao (pendente)
- Migracao de token exposto ao JS para cookie `HttpOnly` (pendente)
- Metadados de sessao por dispositivo/IP/user-agent (pendente)
- Lista de sessoes ativas para administracao (pendente)
- Auditoria especifica de login bloqueado, timeout e logout (pendente)

### Etapa 5 - Experiencia e comunicacao

- Dashboard inicial
- Link publico com identidade melhor
- Confirmacao pos-envio mais util (pendente/parado)
- Modo mobile mais operacional para admin (concluido)

## Ordem Recomendada

### Fase A - Ganho rapido e baixo risco

1. Duplicar formulario
2. Arquivar formulario
3. Favoritos ou fixados
4. Busca global melhor
5. Agendamento de abertura e fechamento

### Fase B - Confiabilidade de resposta

6. Regras de validacao por campo
7. Bloqueio opcional por pessoa ja respondida

### Fase C - Experiencia operacional

8. Dashboard inicial
9. Link publico com identidade melhor
10. Modo mobile mais operacional para admin
11. Confirmacao pos-envio mais util (pendente/parado)

### Fase D - Escala avancada

13. Resumo operacional da escala
14. Limite por pessoa na escala
15. Remanejamento assistido
16. Lista de espera


## Dependencias Principais

### Fase A

- Duplicar formulario depende de definirmos claramente o que copia e o que nao copia.
- Arquivar formulario depende de novo status ou flag sem quebrar filtros atuais.
- Favoritos depende de decidir se e por usuario ou global. Decisao atual: por usuario autenticado, com persistencia local e sem backend nesta etapa.
- Busca global depende de quais campos entram na pesquisa.
- Agendamento depende de compatibilizar estado manual e estado programado.

### Fase B

- Validacao por campo depende de schema incremental por tipo de campo.
- Bloqueio por pessoa depende de regra clara de identidade em formularios publicos.

### Fase C

- Dashboard e link publico dependem de termos metadados confiaveis de status e datas.
- Melhorias do link publico dependem de preservar os fluxos atuais sem refatorar bootstrap.
- Mobile admin depende de revisar a prioridade das acoes em listas e resultados.

### Fase D

- Todas as melhorias de escala dependem de regras bem definidas para conflito e consistencia.
- Lista de espera deve ser a ultima, porque introduz estado extra e efeitos encadeados.

## Regras de Implementacao

- Implementar uma funcionalidade por vez.
- Validar comportamento antes de passar para a proxima.
- Evitar refatoracao ampla.
- Preservar contratos atuais de API enquanto possivel.
- Registrar cada entrega em `docs/IA-LOG.md`.

## Progresso Atual

- `Duplicar formulario`: concluido
- `Arquivar formulario`: concluido
- `Favoritos ou fixados`: concluido com persistencia local por usuario
- `Busca global melhor`: concluido com indexacao local ampliada e limpeza rapida
- `Agendamento de abertura e fechamento`: concluido com refresh no bootstrap e ciclo do servidor
- `Regras de validacao por campo`: concluido com limites por texto, numero e grid obrigatorio
- `Bloqueio opcional por pessoa ja respondida`: concluido com bloqueio opt-in por formulario
- `Resumo operacional da escala`: concluido com painel Dashboard e menu proprio
- `Link publico com identidade melhor`: concluido com slug visivel e copia rapida
- `Modo mobile mais operacional para admin`: concluido com cabecalho empilhado e abas rolaveis

## Proximo Item Sugerido

Sem item ativo no momento.

Motivo:

- os itens restantes estao pendentes/parados por decisao do usuario
- `Alertas internos` segue parado
- `Confirmacao pos-envio mais util` segue parado
- os itens de endurecimento de autenticacao foram registrados, mas ainda nao entraram em execucao
## Atualizacao - 2026-05-05

- `Bloqueio opcional por pessoa ja respondida`: concluido.
- `Limite por pessoa na escala`: concluido.
- `Regras por funcao`: removido do backlog por decisao do usuario.
- `Resumo operacional da escala`: concluido com painel Dashboard e menu proprio.
- `Link publico com identidade melhor`: concluido com slug visivel e copia rapida.
- `Modo mobile mais operacional para admin`: concluido com ajuste de cabeçalho e abas no modal administrativo.
- `Alertas internos`: pendente/parado por decisao do usuario.
- `Confirmacao pos-envio mais util`: pendente/parado por decisao do usuario.
- Proximo item recomendado: nenhum item ativo no momento.

## Atualizacao - 2026-05-07

- `Endurecimento de autenticacao de sessao`: pendente.
- `Cookie HttpOnly para sessao`: pendente.
- `Metadados de sessao por dispositivo/IP/user-agent`: pendente.
- `Lista de sessoes ativas`: pendente.
- `Auditoria especifica de login bloqueado, timeout e logout`: pendente.
- Observacao: esses itens ficam atras da decisao de migracao de infraestrutura para evitar retrabalho no desenho da sessao.
