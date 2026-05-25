# Checklist Operacional de Refatoracao

Este checklist nao e generico. Ele foi montado a partir da leitura dos arquivos reais do projeto e aponta onde hoje existe concentracao de responsabilidade, duplicacao de regra ou risco de manutencao.

## Como interpretar este checklist

- `Concluido` significa que o arquivo deixou de ser o gargalo principal daquela responsabilidade.
- `Em andamento` significa que ja existe um corte seguro iniciado, mas ainda nao vale quebrar tudo de uma vez.
- `Reavaliar` significa que a ideia pode fazer sentido, mas so deve virar codigo se a leitura atual do arquivo confirmar ganho real.
- Nao transforme todos os itens em tarefas obrigatorias. O objetivo e reduzir risco e acoplamento, nao aumentar a quantidade de arquivos.

## Como executar sem quebrar a aplicacao

- Fazer mudancas pequenas e localizadas.
- Mudar uma area por vez.
- Nao alterar regra de negocio sem entender o contrato atual.
- Nao remover comportamento sem confirmar que existe substituto equivalente.
- Nao renomear rotas, campos ou funcoes publicas sem necessidade real.
- Antes de mover codigo, garantir que teste atual cobre o comportamento ou adicionar cobertura focada.
- Depois de cada corte, validar o fluxo impactado antes de seguir.
- Se uma mudanca tocar frontend e backend ao mesmo tempo, separar em etapas distintas.
- Se houver risco de alterar contrato, parar e documentar antes de continuar.

## Ordem obrigatoria de uso

1. Primeiro, identificar o arquivo hub e a responsabilidade que sera removida.
2. Depois, extrair apenas uma fatia pequena da responsabilidade.
3. Em seguida, atualizar os pontos que consumiam aquela regra.
4. Depois disso, ajustar ou criar teste para a regressao.
5. Somente entao seguir para o proximo corte.

## Ordem recomendada de refatoracao

1. backend/validators
2. backend/routes
3. backend/services
4. frontend/src/screens/createFormDomain.js e CreateFormScreen.jsx
5. frontend/src/App.jsx, AppViewport.jsx e AppShellContent.jsx
6. frontend/src/screens/ResultsScreen.jsx e resultsPanels.jsx
7. frontend/src/features/admin/AdminSettingsModal.jsx e adminSettingsShared.jsx
8. frontend/src/components/ui.jsx e publicUi.jsx
9. limpeza de duplicacoes e codigo morto
10. consolidacao final da documentacao e dos testes

## 1. Regras que valem para todo o projeto

- Qualquer arquivo que misture composicao visual, estado, validacao e persistencia deve ser dividido.
- Regra de negocio nao deve aparecer em 3 lugares diferentes com pequenas variacoes.
- Se uma logica foi extraida para um arquivo, o arquivo original precisa perder a responsabilidade antiga de verdade.
- Toda extracao relevante precisa de teste novo, ajuste de teste existente ou validacao explicita de teste ja existente. Bug ou mudanca de comportamento exige teste novo.
- Se uma responsabilidade e compartilhada entre frontend e backend, a regra deve morar em um ponto comum claro, nao em copias paralelas.

## 2. Frontend - shell principal

### `frontend/src/App.jsx`

Problemas que precisam ser corrigidos:
- o arquivo concentra bootstrap, sessao, tema, fonte, route state, pinning, carregamento de detalhes, CRUD de quase todas as entidades e montagem do `shellApp`
- existem muitos handlers no mesmo nivel de indentacao, o que dificulta enxergar o fluxo real
- o estado de `session`, `bootstrap`, `responseDetails`, `escalaDetails`, `pinnedFormsByUser` e `pinnedEventsByUser` cresce sem separacao por dominio

Checklist operacional:
- mover a carga de bootstrap, respostas e escala para um controller ou hook de alto nivel
- separar as acoes por dominio: forms, events, admin, messaging, people, security
- reduzir o objeto `shellApp` e entregar props por bloco de tela
- manter aqui apenas estado global inevitavel: sessao, preferencia visual, rota publica, bootstrap bruto e selecao atual
- iniciado: montagem dos itens de navegacao saiu para `frontend/src/lib/appNav.js`
- revisar a dependência entre `screen`, `activeFormId`, `activeEventId`, `editingFormId` e `draftForm` para evitar sincronizacao implícita demais
- centralizar os efeitos de persistencia de `session`, `theme`, `fontScale`, `pinnedFormsByUser` e `pinnedEventsByUser` em helpers separados
- iniciado: leitura e aplicacao local de sessao, tema, fonte e pins sairam para `frontend/src/lib/appPreferences.js`
- simplificar `refreshBootstrap`, `loadResponsesForForm` e `loadEscalaForForm` para um padrao unico de carregamento e erro
- iniciado: decisao de detalhe para respostas/escala saiu para `resolveAppDetailLoadRequest` em `frontend/src/lib/appShell.js`
- iniciado: loaders incrementais de respostas e escala sairam para `frontend/src/lib/appDataLoad.js`
- iniciado: refresh de bootstrap saiu para `refreshAppBootstrap` em `frontend/src/lib/appDataLoad.js`
- iniciado: refresh do status da chave de exclusao saiu para `refreshFormDeleteKeyConfiguredStatus` em `frontend/src/lib/appDataLoad.js`
- iniciado: acoes de formulario, resposta e escala sairam para `frontend/src/lib/appFormActions.js`
- iniciado: acoes administrativas e de mensagens sairam para `frontend/src/lib/appAdminActions.js`
- iniciado: acoes de eventos sairam para `frontend/src/lib/appEventActions.js`
- iniciado: montagem do objeto `shellApp` saiu para `frontend/src/lib/appShellObject.js`
- iniciado: efeitos de ciclo de vida do shell sairam para `frontend/src/lib/appLifecycleEffects.js`
- iniciado: acoes de sessao, navegacao e escala de fonte sairam para `frontend/src/lib/appSessionActions.js`
- pendente apos revisao: `App.jsx` ainda importa muitas funcoes da API e mantem wrappers finos para quase todos os dominios; proximo corte deve agrupar esses handlers por controller/hook ou reduzir a montagem manual antes de criar novas acoes ali.
- pendente apos revisao: `buildShellApp` ainda achata estado, dados, acoes e setters em um objeto grande; reavaliar se o shell pode receber blocos por dominio para reduzir acoplamento entre `App.jsx`, `AppViewport` e `AppShellContent`.

Teste a reforcar:
- `tests/ui/appBootstrap.test.js`
- `tests/ui/appShell.test.js`
- `tests/ui/appDashboardFlow.test.jsx`
- `tests/ui/appPublicDataFlow.test.jsx`
- `tests/ui/appSaveFlow.test.jsx`

### `frontend/src/AppViewport.jsx`

Problemas que precisam ser corrigidos:
- o arquivo mistura gate de loading, gate de erro, login, rotas publicas, tela publica fechada e shell autenticado
- ha repeticao de wrapper visual para `public-root`
- a logica de espera por dados usa a forma da rota e o tipo do formulario dentro do mesmo componente que escolhe a tela final

Checklist operacional:
- extrair gates nomeados para loading, erro, login e rota publica
- iniciado: renderizacao das rotas publicas saiu para `frontend/src/AppPublicViewport.jsx`
- iniciado: gates visuais de loading, erro, detalhe e login sairam para `frontend/src/AppViewportGates.jsx`
- remover o `style` inline repetido do wrapper publico e usar layout compartilhado
- iniciado: wrapper publico repetido saiu para o componente local `PublicRoot` em `AppViewport.jsx`
- isolar a decisao de `waitingForTarget` em um helper puro
- iniciado: decisao de `waitingForTarget` saiu para `resolveAppViewportTargetState` em `frontend/src/lib/appDetailTarget.js`
- iniciado: efeito de saida da rota publica saiu para `frontend/src/lib/appViewportNavigation.js`
- manter `AppViewport` como roteador visual, nao como local de regra de negocio
- reduzir a dependência direta de `screen` e `activeForm` neste ponto

Teste a reforcar:
- `tests/ui/appPublicDataFlow.test.jsx`
- `tests/ui/appShell.test.js`

### `frontend/src/AppShellContent.jsx`

Problemas que precisam ser corrigidos:
- a composicao do shell autenticado ainda passa uma quantidade grande de props para cada tela
- o arquivo virou um switch manual de telas com muita montagem inline
- os fluxos de `respond` e `results` internos reaproveitam telas publicas com muita logica de roteamento no mesmo lugar

Checklist operacional:
- trocar a cadeia de `screen === ...` por um registry de telas ou um mapa de resolucao
- agrupar props por dominio em blocos menores antes de passar para as telas
- extrair a montagem de cada fluxo para um componente/adapter proprio
- manter a tela atual apenas como orquestradora do shell autenticado
- eliminar filtros inline desnecessarios, como `forms.filter(...)` repetidos na renderizacao
- iniciado: seletores pequenos de mensagens/eventos e detalhes de formulario sairam para `frontend/src/lib/appShellContentSelectors.js`
- iniciado: adapters dos fluxos internos de resultados e resposta sairam para `frontend/src/AppShellFormFlows.jsx`
- iniciado: adapters dos fluxos internos de mensagens de evento sairam para `frontend/src/AppShellEventMessageFlows.jsx`
- iniciado: adapters das telas principais sairam para `frontend/src/AppShellMainFlows.jsx`

Teste a reforcar:
- `tests/ui/appDashboardFlow.test.jsx`
- `tests/ui/eventsScreen.test.jsx`
- `tests/ui/resultsScreen.test.jsx`
- `tests/ui/formListScreen.test.jsx`

## 3. Frontend - componentes compartilhados

### `frontend/src/components/ui.jsx`

Problemas que precisam ser corrigidos:
- o arquivo concentra primitives, feedback, modal, badges, headers, panel wrappers e reexports de UI publica
- o mapa de icones e montado dentro do componente `Icon`
- concluido nesta etapa: `ui.jsx` ficou como agregador historico de reexports de compatibilidade
- concluido em etapa anterior: componentes publicos ficam em `frontend/src/components/publicUi.jsx`, nao no agregador `ui.jsx`

Checklist operacional:
- separar primitives visuais em modulos menores por funcao: botao, badge, feedback, modal, layout, header
- iniciado: `Btn` saiu para `frontend/src/components/uiButton.jsx`, com reexport preservado em `ui.jsx`
- iniciado: badges de label, status e tipo sairam para `frontend/src/components/uiBadges.jsx`, com reexports preservados em `ui.jsx`
- iniciado: `FeedbackBanner` saiu para `frontend/src/components/uiFeedback.jsx`, com reexport preservado em `ui.jsx`
- iniciado: `ConfirmModal` saiu para `frontend/src/components/uiModal.jsx`, com reexport preservado em `ui.jsx`
- iniciado: wrappers de layout (`SurfacePanel`, `MetricCard`, `FieldControl`, `NotePanel`, `SplitSection`) sairam para `frontend/src/components/uiLayout.jsx`, com reexports preservados em `ui.jsx`
- iniciado: `ScreenHeader` saiu para `frontend/src/components/uiHeader.jsx`, com reexport preservado em `ui.jsx`
- mover o mapa de icones para constante fora do render ou para arquivo proprio
- iniciado: mapa e renderizacao de `Icon`/`ThemeIcon` sairam para `frontend/src/components/uiIcons.jsx`, com reexports preservados em `ui.jsx`
- remover os reexports publicos daqui depois que os consumidores estiverem atualizados
- manter `COLORS` em um ponto unico de tema, sem virar dependencia acidental de tudo
- iniciado: `COLORS` saiu para `frontend/src/components/uiTheme.js`, com reexport preservado em `ui.jsx`
- revisar se `resolveActionErrorMessage` deve ficar com UI ou com um helper de erro comum
- iniciado: `resolveActionErrorMessage` saiu para `frontend/src/components/uiErrors.js`, com reexport preservado em `ui.jsx`

Teste a reforcar:
- `tests/ui/uiButton.test.jsx`
- `tests/ui/uiBadges.test.jsx`
- `tests/ui/uiErrors.test.js`
- `tests/ui/uiFeedback.test.jsx`
- `tests/ui/uiLayout.test.jsx`
- `tests/ui/uiModal.test.jsx`
- `tests/ui/uiHeader.test.jsx`
- `tests/ui/uiTheme.test.js`
- `tests/ui/appHeader.test.jsx`
- `tests/ui/resultsPresenceHeader.test.jsx`
- `tests/ui/createFormTemplateBar.test.jsx`
- `tests/ui/messagingSettingsPanel.test.jsx`

### `frontend/src/components/publicUi.jsx`

Problemas que precisam ser corrigidos:
- concluido nesta etapa: `PublicReadingToolbar` nao manipula mais storage diretamente; preferencias publicas ficam em helper dedicado
- `PublicTopCompact` e o topo publico canonico
- o arquivo conhece tanto persistencia de preferencias quanto navegacao publica

Checklist operacional:
- extrair a logica de leitura de preferencia para um helper compartilhado com o shell
- iniciado: leitura/aplicacao local de tema e fonte dos controles publicos saiu para `frontend/src/lib/publicReadingPreferences.js`
- criar um topo-base unico e especializar apenas variacoes de layout
- iniciado: `PublicTopCompact` saiu para `frontend/src/components/PublicTopCompact.jsx`, com reexport preservado em `publicUi.jsx`
- iniciado: `PublicReadingToolbar` saiu para `frontend/src/components/PublicReadingToolbar.jsx`, com reexport preservado em `publicUi.jsx`
- iniciado: `ClosedPublicScreen` saiu para `frontend/src/components/ClosedPublicScreen.jsx`, com reexport preservado em `publicUi.jsx`
- concluido: `PublicReadingToolbar` ficou somente como controle visual, consumindo helpers de preferencia sem manipular storage diretamente
- concluido: `PublicTop` sem consumo real foi removido; `PublicTopCompact` ficou como topo publico canonico
- garantir que navegacao publica continue centralizada em `appShell.js`

Teste a reforcar:
- `tests/ui/publicFormScreen.test.jsx`
- `tests/ui/publicEscalaScreen.test.jsx`
- `tests/ui/appPublicDataFlow.test.jsx`

## 4. Frontend - lib e seletores

### `frontend/src/lib/appShell.js`

Problemas que precisam ser corrigidos:
- o arquivo mistura sanitizacao de sessao, clone de draft, navegação interna, rotas publicas, path builders e seletores do shell
- `getPublicRouteFromLocation` entende hash e pathname ao mesmo tempo
- o modulo ainda concentra regras que podem crescer mais do que deveriam

Checklist operacional:
- separar em blocos menores: sessao, rotas publicas, navegação interna, draft de formulario
- iniciado: builders e parser das rotas publicas sairam para `frontend/src/lib/appPublicRoutes.js`, com reexports preservados no agregador historico
- iniciado: normalizacao da sessao armazenada e sanitizacao de usuario sairam para `frontend/src/lib/appSession.js`, com reexports preservados no agregador historico
- iniciado: duplicacao e payload de formulario existente sairam para `frontend/src/lib/appFormDrafts.js`, com reexports preservados no agregador historico
- iniciado: decisao de navegacao interna saiu para `frontend/src/lib/appNavigation.js`, com reexports preservados no agregador historico
- iniciado: seletores derivados do shell sairam para `frontend/src/lib/appShellDerivedState.js`, com reexports preservados no agregador historico
- iniciado: decisao de carregamento de alvo/detalhe saiu para `frontend/src/lib/appDetailTarget.js`, com reexports preservados no agregador historico
- iniciado: limites e normalizacao da escala de fonte sairam para `frontend/src/lib/appFontScale.js`, com reexports preservados no agregador historico
- manter `getPublicRouteFromLocation` como unica fonte de parse de rota publica
- revisar se `buildDuplicateFormDraft` e `buildSaveFormPayloadFromExisting` pertencem mais ao dominio de formulario do que ao shell
- manter `resolveAppNavigation` sem efeitos colaterais e com regras de permissao bem isoladas

Teste a reforcar:
- `tests/ui/appShell.test.js`
- `tests/ui/appPublicDataFlow.test.jsx`

### `frontend/src/lib/appBootstrap.js`

Problemas que precisam ser corrigidos:
- o arquivo junta normalizacao de bootstrap, upsert e remove de listas, mutate de itens aninhados, pinning, metricas e escolha de formulario ativo
- a responsabilidade e grande demais para um unico modulo de helpers

Checklist operacional:
- separar normalizacao de bootstrap das operacoes de mutacao
- iniciado: operacoes de listas do bootstrap sairam para `frontend/src/lib/appBootstrapLists.js`, com reexports preservados no agregador historico
- mover metricas de escala e de formulario para um helper de calculo proprio
- iniciado: metricas de formularios e escala sairam para `frontend/src/lib/appBootstrapMetrics.js`, com reexports preservados no agregador historico
- isolar helpers de pinning por usuario em um arquivo menor
- iniciado: helpers de pinning por usuario sairam para `frontend/src/lib/appPinning.js`, com reexports preservados no agregador historico
- separar utilitarios de listas simples dos utilitarios de listas aninhadas
- manter `pickActiveFormIdAfterBootstrap` como selecao pura, sem depender de mutacoes laterais

Teste a reforcar:
- `tests/ui/appBootstrap.test.js`
- `tests/ui/appDashboardFlow.test.jsx`

### `frontend/src/lib/forms.js`

Problemas que precisam ser corrigidos:
- o modulo combina formatacao de data, busca, mode rules, selecao de pessoa, resultados, visibilidade e leitura de resposta
- parte dessa regra se sobrepoe com `createFormDomain.js` e com `backend/services/formsService.mjs`

Checklist operacional:
- separar formatacao, leitura de campos, modo do formulario e regras de resposta
- manter aqui o contrato de leitura usado pela UI, nao uma copia de regras do backend
- alinhar `FORM_MODES`, `getFormMode`, `isMembersSelectionField`, `isExternalBaseSelectionField` e `getResultsConfig` com a regra server-side
- reduzir acoplamento entre selecao de pessoa e form mode
- revisar `buildFormSearchIndex` e `normalizeSearchText` se a busca crescer para outro modulo

Teste a reforcar:
- `tests/ui/createFormModes.test.jsx`
- `tests/ui/publicFormDomain.test.js`
- `tests/ui/resultsDomain.test.js`
- `tests/ui/appSaveFlow.test.jsx`

## 5. Frontend - criacao de formulario

### `frontend/src/screens/CreateFormScreen.jsx`

Problemas que precisam ser corrigidos:
- a tela continua segurando muito estado local e muitos handlers de composicao
- o componente conhece passo de setup, editor de campo, template, preview, escala, resultados e submit
- existem muitos updates pontuais que deviam estar em um controller ou reducer

Checklist operacional:
- mover a maior parte dos handlers para um controller de tela ou reducer
- deixar este arquivo apenas com composicao dos paineis e coordenação do fluxo
- separar handlers de campo, template, escala e submit
- reduzir o numero de callbacks inline passados para `FieldEditorPanel`
- evitar que a tela decida regra de normalizacao de campo, deixando isso para `createFormDomain.js`

Teste a reforcar:
- `tests/ui/createFormScreen.test.jsx`
- `tests/ui/createFormModes.test.jsx`
- `tests/ui/createFormDomain.test.js`

### `frontend/src/screens/createFormDomain.js`

Problemas que precisam ser corrigidos:
- este e um dos arquivos mais densos do frontend
- ele concentra defaults, drafts, catalog application, payloads, template state, state transitions, normalization, results config, scale helpers e listas auxiliares
- ha duplicacao de constantes com `adminSettingsShared.jsx`

Checklist operacional:
- dividir em modulos menores por responsabilidade:
  - defaults e presets
  - field draft
  - field save
  - scale draft
  - template payload
  - results config
  - list helpers
- iniciado: helpers de secoes e patches do rascunho de escala sairam para `frontend/src/screens/createFormScaleDraft.js`, com reexports preservados no dominio historico
- iniciado: mutacoes puras de listas do editor sairam para `frontend/src/screens/createFormListHelpers.js`, com reexports preservados no dominio historico
- iniciado: sincronizacao de `resultsConfig` e layout de totais sairam para `frontend/src/screens/createFormResultsConfig.js`, com reexports preservados no dominio historico
- iniciado: defaults de grade e transicoes do rascunho de campo sairam para `frontend/src/screens/createFormFieldDraft.js`, com reexports preservados no dominio historico
- iniciado: payload intermediario, validacao e merge do salvamento de campo sairam para `frontend/src/screens/createFormFieldSave.js`, com reexports preservados no dominio historico
- iniciado: opcoes iniciais, campos padrao e titulo preset sairam para `frontend/src/screens/createFormDefaults.js`, com reexports preservados no dominio historico
- iniciado: normalizacao de `person_select` e `memberBinding` saiu para `frontend/src/screens/createFormMemberBindings.js`, com reexports preservados no dominio historico
- iniciado: payload e estado de aplicacao de template sairam para `frontend/src/screens/createFormTemplates.js`, com reexports preservados no dominio historico
- iniciado: estado inicial, selecao de formato e retorno de salvamento sairam para `frontend/src/screens/createFormState.js`, com reexports preservados no dominio historico
- iniciado: transicao entre modos estruturais saiu para `frontend/src/screens/createFormModeTransition.js`, com reexport preservado no dominio historico
- iniciado: estado derivado do editor saiu para `frontend/src/screens/createFormDerivedState.js`, com reexport preservado no dominio historico
- iniciado: payload final do formulario saiu para `frontend/src/screens/createFormPayload.js`, com reexport preservado no dominio historico
- iniciado: `CreateFormScreen.jsx` passou a importar os modulos especificos `createForm*.js`, sem depender do barramento `createFormDomain.js`
- iniciado: `DEFAULT_GRID_ROWS`, `DEFAULT_GRID_COLS` e `SCALE_PRESETS` sairam para `frontend/src/lib/gridDefaults.js`, compartilhado por criacao de formulario e admin
- iniciado: `FORM_MODES` saiu para `shared/formModes.mjs`, compartilhado por frontend, backend e validadores
- manter a normalizacao de `person_select` e `memberBinding` concentrada no helper extraido
- separar o que e regra de formulario do que e regra de UI
- manter `buildCreateFormPayload` e `buildCreateFormTemplatePayload` como saidas finais, nao como lugar de toda a logica

Teste a reforcar:
- `tests/ui/createFormDomain.test.js`
- `tests/ui/createFormScreen.test.jsx`
- `tests/ui/createFormModes.test.jsx`

### `frontend/src/screens/createFormPanels.jsx`

Situacao atual:
- removido depois que `CreateFormScreen.jsx` passou a importar os paineis diretamente dos modulos em `frontend/src/features/forms/createFormPanels/*`

Checklist operacional:
- concluido: a ponte de reexport foi removida
- nao recriar barramento intermediario sem necessidade concreta de compatibilidade

### `frontend/src/components/ui.jsx` e `frontend/src/components/publicUi.jsx`

Checklist operacional:
- concluido: `ui.jsx` deixou de reexportar componentes publicos de `publicUi.jsx`
- concluido: consumidores de `ClosedPublicScreen`, `PublicTopCompact` e `PublicReadingToolbar` passaram a importar direto de `publicUi.jsx`
- concluido: `PublicTop` foi removido depois da varredura confirmar ausencia de consumo real

### `frontend/src/components/ResultsPresenceHeader.jsx` e `frontend/src/screens/resultsPanels.jsx`

Checklist operacional:
- concluido: `ResultsPresenceHeader.jsx` e o ponto unico do topo de resultados de presenca
- concluido: `resultsPanels.jsx` apenas compoe `ResultsPresenceHeader`, sem duplicar toolbar publica, filtros de grau ou cards de resumo

### `frontend/src/features/forms/createFormPanels/setupPanels.jsx`
### `frontend/src/features/forms/createFormPanels/fieldPanels.jsx`
### `frontend/src/features/forms/createFormPanels/finalPanels.jsx`

Checklist operacional:
- manter cada arquivo estritamente visual
- nao trazer normalizacao, validação ou payload para os paineis
- evitar que regras de catalogo ou mode transitions sejam reintroduzidas nos paineis
- se um painel crescer demais, quebrar em subcomponentes menores por bloco
- concluido: subcomponentes usados apenas dentro do proprio arquivo deixaram de ser exportados

Teste a reforcar:
- `tests/ui/createFormScreen.test.jsx`
- `tests/ui/createFormFieldPreview.test.jsx`
- `tests/ui/createFormTemplateBar.test.jsx`

## 6. Frontend - resultados

### `frontend/src/screens/ResultsScreen.jsx`

Problemas que precisam ser corrigidos:
- o componente ainda faz muita orquestração entre modo presenca e modo escala
- o bloco de presenca carrega sorting, filtros, stats, zoom, exportacao e touch handling
- o bloco de escala carrega mutacoes de slot, modal de inscricao, confirmacao e exportacao

Checklist operacional:
- extrair o controller de presenca de resultados para um helper ou hook proprio
- iniciado: controller da presenca saiu para `frontend/src/screens/PresenceResultsScreen.jsx`
- iniciado: montagem de linhas, respostas base e totalizacao da presenca sairam para `frontend/src/screens/resultsDomain.js`
- iniciado: layout de totais, filtros e largura minima da tabela de presenca sairam para `frontend/src/screens/resultsDomain.js`
- iniciado: filtros por grau/coluna, ordenacao e resumo de totais da presenca sairam para `frontend/src/screens/resultsDomain.js`
- extrair o controller de escala para um helper separado
- iniciado: controller da escala saiu para `frontend/src/screens/EscalaResultsScreen.jsx`
- iniciado: metricas, nomes e mutacoes puras de slots da escala sairam para `frontend/src/screens/resultsDomain.js`
- iniciado: download de CSV saiu para `frontend/src/lib/downloadCsv.js`
- reduzir o arquivo para escolher entre dois fluxos e montar os dados já derivados
- evitar duplicacao entre calculo de totais e exibicao de tabela
- manter regras de ordenacao e filtro em `resultsDomain.js`

Teste a reforcar:
- `tests/ui/resultsScreen.test.jsx`
- `tests/ui/resultsDomain.test.js`
- `tests/ui/resultsPresenceHeader.test.jsx`

### `frontend/src/screens/resultsPanels.jsx`

Problemas que precisam ser corrigidos:
- o arquivo ainda concentra tabela, toolbar, totalizacao e modal da escala
- ha muitas props derivadas passando direto da screen para a tabela
- o panel visual ainda recebe muita responsabilidade sobre comportamento

Checklist operacional:
- manter o arquivo somente como camada de renderizacao
- mover qualquer calculo novo para `resultsDomain.js` ou para a screen controller
- quebrar a tabela de presenca se novos blocos de header, footer ou actions surgirem
- evitar adicionar novas regras de busca ou totalizacao aqui

Teste a reforcar:
- `tests/ui/resultsScreen.test.jsx`
- `tests/ui/resultsPresenceHeader.test.jsx`

### `frontend/src/screens/resultsDomain.js`

Problemas que precisam ser corrigidos:
- o arquivo esta no lugar certo para logica pura, mas precisa ficar pequeno e dedicado
- ele junta ordenacao de grau, exportacao CSV, stats, filtro ativo e formatacao

Checklist operacional:
- manter como modulo puro de calculo
- se crescer, separar em:
  - ordenacao
  - csv
  - filtros
  - estatisticas
  - formatacao
- reforcar testes de CSV e filtros antes de mexer no comportamento

Teste a reforcar:
- `tests/ui/resultsDomain.test.js`
- `tests/ui/resultsScreen.test.jsx`

### `frontend/src/screens/publicFormDomain.js`
### `frontend/src/screens/publicScaleDomain.js`

Checklist operacional:
- manter estes modulos como helpers puros
- nao trazer UI, storage ou roteamento para dentro deles
- alinhar as regras de selecao de pessoa e limite de escala com `lib/forms.js` e backend
- se algum helper ficar mais complexo, separar por fonte de dado e por mutacao

Teste a reforcar:
- `tests/ui/publicFormDomain.test.js`
- `tests/ui/publicScaleDomain.test.js`
- `tests/ui/publicFormScreen.test.jsx`
- `tests/ui/publicEscalaScreen.test.jsx`

### `frontend/src/screens/publicScreenFrame.jsx`

Checklist operacional:
- manter como frame compartilhado apenas
- nao deixar esse arquivo virar lugar de regra especifica de formulario ou escala

## 7. Frontend - eventos

### `frontend/src/screens/EventsScreen.jsx`

Problemas que precisam ser corrigidos:
- a tela mistura lista, detalhe, edicao, paginacao, ações de estado e confirmacao de exclusao
- a transicao entre list/detail/edit e muito manual
- existem varios estados locais que poderiam ser agrupados

Checklist operacional:
- extrair o controlador de estado de eventos para reduzir o tamanho da tela
- separar regras de selecao, edicao, publicacao, encerramento e exclusao
- deixar a pagina do detalhe consumir apenas os dados necessarios de `EventDetailTabs`, `EventMessagesPanel` e `EventFormsList`
- reduzir o numero de condicoes inline na renderizacao principal
- manter a paginacao de eventos e formularios em helpers pequenos
- iniciado: draft, seletores de formularios, elegibilidade de mensagens, ordenacao e paginacao sairam para `frontend/src/screens/eventsDomain.js`
- iniciado: cabecalho de detalhe e controles visuais de paginacao sairam para `frontend/src/features/events/components/eventsPanels.jsx`
- iniciado: listagem, bloco de formularios do detalhe e modal de exclusao foram movidos para `frontend/src/features/events/components/eventsPanels.jsx`
- iniciado: estado, seletores e acoes assicronas da tela sairam para `frontend/src/screens/eventsScreenController.js`

Teste a reforcar:
- `tests/ui/eventsDomain.test.js`
- `tests/ui/eventsScreen.test.jsx`
- `tests/ui/eventsScreenMessages.test.jsx`

### `frontend/src/features/events/components/eventsPanels.jsx`

Estado atual:
- este arquivo esta bem mais saudável do que os hubs anteriores, mas ainda concentra quatro paineis e um card de listagem

Checklist operacional:
- manter os blocos como UI pura
- nao trazer regras de negocio de eventos para dentro dos paineis
- se `EventMessagesPanel` crescer, separar lista, empty state e actions
- se `EventEditorPanel` ganhar mais campos, quebrar o formulário em sub-blocos
- manter `EventFormsList` como adaptador fino para `FormListCard`

### `frontend/src/features/events/components/eventMessagesPanels.jsx`

Problemas que precisam ser corrigidos:
- o arquivo junta destinatarios, agendamento, preview, historico e picker manual
- a lógica visual e clara, mas a responsabilidade ainda e grande para um unico modulo

Checklist operacional:
- separar o que e editor, preview e historico se o arquivo continuar crescendo
- iniciado: preview, destinatarios calculados e historico sairam para `frontend/src/features/events/components/eventMessageDetailPanels.jsx`
- mover `toLocalDateTime` e logicas de data para um utilitario comum se reaproveitadas
- manter o picker manual simples, sem trazer regra de selecao de destinatario para o painel geral
- evitar misturar renderizacao do corpo da mensagem com montagem da lista de receptores

Teste a reforcar:
- `tests/ui/eventMessageEditor.test.jsx`
- `tests/ui/eventMessageDetail.test.jsx`

### `frontend/src/screens/EventMessageEditorScreen.jsx`

Checklist operacional:
- iniciado: tipos elegiveis, draft inicial, transicao de tipo, payload de salvamento, regras de status e confirmacao sairam para `frontend/src/screens/eventMessageDomain.js`
- manter a tela como composicao do editor, feedback e submit
- novas regras de mensagem devem entrar em helper puro antes de chegar na UI

### `frontend/src/features/admin/AdminSettingsModal.jsx`

Problemas que precisam ser corrigidos:
- e o maior hub da area administrativa do frontend
- concentra tabs, drafts vazios, submit de varias entidades, feedback, delete confirm e montagem do shell da central
- parte da regra de normalizacao ainda fica aqui, em especial para catalogo e base externa

Checklist operacional:
- separar a orquestracao da modal dos submits por entidade
- mover os drafts vazios para um arquivo de defaults compartilhado da area admin
- iniciado: drafts vazios e tabs por perfil sairam para `frontend/src/features/admin/adminSettingsDefaults.js`
- transformar o conjunto de tabs em registry de recursos, nao em um bloco enorme de condicoes
- empurrar regras de normalizacao especificas para helpers de dominio, nao para a modal
- iniciado: payloads de usuarios, classificacoes, bases externas, catalogos, tarefas e chave mestra sairam para `frontend/src/features/admin/adminSettingsPayloads.js`
- iniciado: fluxo repetido de busy/feedback/sucesso/erro dos submits e exclusoes confirmadas saiu para `frontend/src/features/admin/adminSettingsActions.js`
- iniciado: composicao visual de abas, paineis e modal de exclusao saiu para `frontend/src/features/admin/AdminSettingsContent.jsx`
- iniciado: selecao/renderizacao dos paineis por aba saiu para `frontend/src/features/admin/AdminSettingsTabPanel.jsx`
- iniciado: props entregues a `AdminSettingsTabPanel.jsx` passaram a ser agrupadas por dominio (`access`, `members`, `catalog`, `organization`, `security`, `messaging`, `audit`, `shared`)
- iniciado: estado local, tabs, submits, cancelamentos e confirmacao de exclusao sairam para `frontend/src/features/admin/adminSettingsController.js`
- pendente apos revisao: `AdminSettingsTabPanel.jsx` ainda centraliza a decisao de todas as abas; proximo corte deve usar adapters por aba apenas quando houver ganho claro.
- pendente apos revisao: `adminSettingsController.js` ainda concentra drafts e submits de usuarios, classificacoes, catalogos, bases externas e seguranca; separar apenas quando houver ganho claro por dominio.
- evitar que o modal carregue detalhe de cada entidade, mantendo apenas coordenacao
- separar as responsabilidades de usuarios, socios, bases externas, catalogo, templates, mensagens, seguranca e auditoria

Teste a reforcar:
- `tests/ui/adminCatalog.test.jsx`
- `tests/ui/messagingSettingsPanel.test.jsx`
- `tests/ui/appBootstrap.test.js`

### `frontend/src/features/admin/adminSettingsShared.jsx`

Problemas que precisam ser corrigidos:
- o modulo mistura constantes, labels, normalizacao, preview de campo, editor de matriz, paginação e painel de auditoria
- ha duplicacao com `createFormDomain.js` em defaults de grade e presets
- `AuditLogsPanel` tem carga, filtros, paginação e tabela no mesmo arquivo

Checklist operacional:
- quebrar o arquivo em modulos menores por assunto:
  - constantes e labels
  - normalizacao de catalogo
  - preview de campo
  - editor de grade
  - logs de auditoria
  - lista paginada
- iniciado: constantes/labels/normalizadores, lista paginada, preview, editor de grade, auditoria e wrapper de campo sairam para modulos `adminSettingsConstants.js`, `adminPaginatedList.jsx`, `adminFieldPreview.jsx`, `adminGridSchemaEditor.jsx`, `adminAuditLogsPanel.jsx` e `adminField.jsx`
- consumidores administrativos migrados para imports diretos dos modulos menores; `adminSettingsShared.jsx` permanece apenas como reexport de compatibilidade
- concluido: query, filtros e paginacao da auditoria sairam para `adminAuditLogsState.js`
- concluido: `DEFAULT_GRID_ROWS`, `DEFAULT_GRID_COLS` e `SCALE_PRESETS` foram centralizados em `frontend/src/lib/gridDefaults.js`
- manter `normalizeIdentifier` e `normalizeFieldSelectionSource` apenas se continuarem sendo especificos da area admin

Teste a reforcar:
- `tests/ui/adminCatalog.test.jsx`
- `tests/ui/appBootstrap.test.js`

### `frontend/src/features/admin/MessagingSettingsPanel.jsx`
### `frontend/src/features/admin/messagingSettingsPanels.jsx`

Checklist operacional:
- manter `MessagingSettingsPanel` como composição fina
- manter os blocos de configuracao, templates e presets separados
- nao mover validacao ou normalizacao para esses arquivos
- se `messagingSettingsPanels.jsx` continuar crescendo, separar editor, preview e lista de presets
- concluido neste ciclo: `messagingSettingsPanels.jsx` virou agregador historico; configuracao, modelos e presets foram movidos para `MessagingConfigBlock.jsx`, `MessagingTemplatesBlock.jsx` e `MessagingPresetsBlock.jsx`.

Teste a reforcar:
- `tests/ui/messagingSettingsPanel.test.jsx`

### `frontend/src/features/admin/adminAccessPanels.jsx`
### `frontend/src/features/admin/adminCatalogPanels.jsx`
### `frontend/src/features/admin/adminOrganizationPanels.jsx`
### `frontend/src/features/admin/adminSecurityPanels.jsx`
### `frontend/src/features/admin/adminShellPanels.jsx`

Checklist operacional:
- manter estes arquivos como UI de dominio
- nao reintroduzir submit, validacao ou persistencia diretamente neles
- se qualquer um deles passar a conter regra de fluxo, extrair para helper ou controller da modal
- pendente apos revisao: `adminCatalogPanels.jsx` ainda e o maior painel administrativo; se crescer mais, separar editor de campo, lista de campos, editor de tarefa e lista de tarefas.
- pendente apos revisao: `messagingSettingsPanels.jsx` ainda concentra editor, preview e listas de presets/modelos; manter como proximo alvo pequeno da area de mensagens administrativas.
- concluido neste ciclo: `adminCatalogPanels.jsx` ficou como seletor fino; editores/listas de campos e tarefas foram movidos para `FieldCatalogPanel.jsx` e `ScaleTaskCatalogPanel.jsx`.

## 8. Backend - roteamento e entrada HTTP

### `backend/routes/apiRouter.mjs`

Situacao atual:
- o arquivo esta correto como roteador central e ja esta fino

Checklist operacional:
- manter o roteador como encaminhador apenas
- nao mover regra de negocio para aqui
- se novos dominos surgirem, registrar handlers novos sem crescer com logica interna

### `backend/routes/systemRoutes.mjs`

Problemas que precisam ser corrigidos:
- o arquivo junta auth, logout, me, health, bootstrap, chave mestra e audit logs
- cada endpoint repete estrutura de leitura de corpo, autorizacao, sendJson e auditoria

Checklist operacional:
- separar auth/health/bootstrap de security/audit se o arquivo continuar crescendo
- extrair padroes repetidos de `sendJson` + `writeAudit`
- manter os handlers curtos e com erro padronizado
- evitar duplicacao de mensagens e metadados de auditoria

Teste a reforcar:
- `tests/api.integration.test.mjs`
- `tests/validators.test.mjs`

### `backend/routes/formRoutes.mjs`

Problemas que precisam ser corrigidos:
- o arquivo mistura CRUD de formulario, delete seguro, respostas publicas, leitura de respostas, escala e claim da escala
- ha repeticao de autorizacao, auditoria e envio de resposta de erro
- parte da regra de delete seguro ainda vive aqui em vez de ficar isolada

Checklist operacional:
- separar as rotas por dominio quando o arquivo crescer mais: forms, responses, escala, segurança de delete
- extrair helpers para a geracao de metadados de auditoria
- iniciado neste ciclo: metadados e escrita de auditoria de salvar/excluir formulario e atualizar/reivindicar escala sairam para `backend/routes/formRouteAudit.mjs`.
- manter validação na borda e regra de negocio nos services
- evitar repeticao do mesmo bloco de catch com pequenas variacoes
- padronizar o comportamento quando a rota nao encontra formulario

Teste a reforcar:
- `tests/api.integration.test.mjs`
- `tests/orchestrator.test.mjs`
- `tests/validators.test.mjs`

### `backend/routes/adminRoutes.mjs`

Status: Reavaliar se o agregador voltar a crescer.

Problemas que precisam ser corrigidos:
- este e o maior arquivo de rotas do backend
- ele repete o mesmo fluxo de `requireAdmin -> readBody -> validate -> service -> sendJson -> writeAudit` em dezenas de handlers
- a auditoria manual por entidade esta copiada muitas vezes com metadados muito parecidos

Checklist operacional:
- concluido: erro e auditoria de mutacoes administrativas foram padronizados em `backend/routes/adminRouteHelpers.mjs` nas rotas de usuario, classificacoes, presets, socios, configuracao de socios, sincronizacao de socios, bases externas e catalogos
- concluido neste ciclo: os blocos coesos de catalogos, bases externas e socios sairam para `backend/routes/adminCatalogRoutes.mjs`, `backend/routes/adminExternalBaseRoutes.mjs` e `backend/routes/adminMemberRoutes.mjs`
- reavaliar depois: usuarios, classificacoes e presets continuam juntos enquanto a divisao criar roteadores pequenos demais:
  - users
  - labels
  - presets
  - people
  - members config
  - external bases
  - field catalog
  - scale task catalog
- manter a parse de id e a validacao de payload separadas
- reduzir os blocos de `catch` repetidos
- evitar que cada rota tenha sua propria mini-versao de auditoria
- nao mover seguranca para este arquivo; seguranca/chave mestra pertence ao fluxo de `systemRoutes.mjs` e services ligados a security

Teste a reforcar:
- `tests/api.integration.test.mjs`
- `tests/validators.test.mjs`

### `backend/routes/requestHelpers.mjs`

Problemas que precisam ser corrigidos:
- o arquivo mistura body parsing, auth guards, audit writer, audit filters e helpers de erro
- ele ainda e pequeno o suficiente para existir, mas ja merece vigilância

Checklist operacional:
- manter este arquivo apenas com utilitarios transversais de request
- separar audit helpers de auth helpers se crescer mais
- evitar que vire o local de qualquer helper novo da API

## 9. Backend - services e regra de negocio

### `backend/services/formsService.mjs`

Problemas que precisam ser corrigidos:
- o service valida slug, conflito, modo do formulario, regras de presenca, fechamento vencido, upsert e inicializacao da escala
- a regra de `FORM_MODES` e de `person_select` esta duplicada em relacao ao frontend

Checklist operacional:
- concluido neste ciclo: resolucao de modo, normalizacao de `resultsConfig` e regra da base central de socios sairam para `backend/services/formModeRules.mjs`
- concluido neste ciclo: preparo e validacao do registro persistido por `saveForm` sairam para `backend/services/formSaveRules.mjs`
- concluido neste ciclo: inicializacao das secoes de formularios de escala saiu para `backend/services/formScaleInitializer.mjs`
- reavaliar depois: extrair a logica de reabertura de formulario vencido apenas se ela crescer
- mover regras compartilhadas de modo/base para um helper comum do backend
- manter a regra de `nucleo` e `geral` em um unico lugar e com teste claro

Teste a reforcar:
- `tests/api.integration.test.mjs`
- `tests/validators.test.mjs`
- `tests/ui/createFormModes.test.jsx`

### `backend/services/adminService.mjs`

Problemas que precisam ser corrigidos:
- o service mistura CRUD administrativo, hashing de chave mestra, validacao de chave, catalogos e sincronizacao
- o trecho de seguranca ainda esta junto com CRUDs comuns
- `normalizeKey` e `normalizeGridSchema` ficam nesse modulo apesar de poderem ser helpers reutilizaveis

Checklist operacional:
- concluido neste ciclo: hashing, status, gravacao e verificacao da chave mestra sairam para `backend/services/formDeleteKeyService.mjs`
- concluido neste ciclo: CRUD de campos e tarefas base saiu para `backend/services/adminCatalogService.mjs`
- reavaliar depois: separar usuarios, classificacoes, presets e socios apenas se `adminService.mjs` voltar a crescer
- manter a normalizacao de chave e grid schema junto do catalogo enquanto nao houver outro consumidor
- reduzir a dependencia cruzada entre catalogo, people, external bases e security

Teste a reforcar:
- `tests/api.integration.test.mjs`
- `tests/validators.test.mjs`

### `backend/services/escalaService.mjs`
### `backend/services/eventsService.mjs`
### `backend/services/eventMessagesService.mjs`
### `backend/services/responsesService.mjs`
### `backend/services/membersSyncService.mjs`
### `backend/services/externalBasesService.mjs`
### `backend/services/messageRecipientsService.mjs`

Checklist operacional:
- manter um service por fluxo de negocio, sem misturar dominio alheio
- se uma funcao de service comeca a repetir conversao de payload ou regra de estado, extrair para helper do dominio
- manter a responsabilidade de persistencia e regra de negocio separadas
- evitar que service de um dominio passe a orquestrar outro sem necessidade clara

Teste a reforcar:
- `tests/api.integration.test.mjs`
- `tests/membersSyncService.test.mjs`
- `tests/messageOrchestrator.test.mjs`

### `backend/services/bootstrapService.mjs`

Checklist operacional:
- manter o bootstrap como agregador de estado inicial, sem inserir regra nova de negocio ali
- se o payload do bootstrap crescer mais, separar os blocos por dominio e documentar o contrato

## 10. Backend - validacao

### `backend/validators/payloadValidators.mjs`

Status: Concluido como hub; manter apenas como agregador de compatibilidade.

Problemas que precisam ser corrigidos:
- este arquivo virou agregador historico com reexports e `validateDeleteId`
- a duplicacao restante de contratos nao esta mais neste arquivo; ela deve ser analisada entre `formPayloadValidators.mjs`, `catalogPayloadValidators.mjs`, `formsService.mjs` e helpers do frontend

Checklist operacional:
- concluido: quebrar por dominio de payload
- concluido: criar um modulo pequeno de validadores primitivos compartilhados
- manter, em proximos cortes, o contrato de `formMode`, `selectionSource`, `memberBinding` e `resultsConfig` alinhado com `formsService.mjs` e `lib/forms.js`
- concluido: `validateMessageTemplatePayload`, `validatePersonPresetPayload`, `validateMessagingConfigPayload` e `validateEventMessagePayload` sairam para `backend/validators/messagingPayloadValidators.mjs`, com reexports preservados em `payloadValidators.mjs`
- concluido: `validateAuthLoginPayload`, `validateFormDeleteKeyPayload` e `validateFormDeleteKeyUpdatePayload` sairam para `backend/validators/securityPayloadValidators.mjs`, com reexports preservados em `payloadValidators.mjs`
- concluido: `validateEventPayload` saiu para `backend/validators/eventPayloadValidators.mjs`, com reexport preservado em `payloadValidators.mjs`
- concluido: `validateResponsePayload` saiu para `backend/validators/responsePayloadValidators.mjs`, com reexport preservado em `payloadValidators.mjs`
- concluido: `validateEscalaPayload` e `validateEscalaClaimPayload` sairam para `backend/validators/escalaPayloadValidators.mjs`, com reexports preservados em `payloadValidators.mjs`
- concluido: validadores administrativos de usuarios, classificacoes, socios, configuracao de socios e bases externas sairam para `backend/validators/adminPayloadValidators.mjs`, com reexports preservados em `payloadValidators.mjs`
- concluido: validadores de catalogo de campos e tarefas sairam para `backend/validators/catalogPayloadValidators.mjs`, com reexports preservados em `payloadValidators.mjs`
- concluido: `validateFormPayload` e `validatePresetPayload` sairam para `backend/validators/formPayloadValidators.mjs`, com reexports preservados em `payloadValidators.mjs`
- manter `payloadValidators.mjs` pequeno; novas validacoes devem entrar no modulo de dominio correspondente

Teste a reforcar:
- `tests/validators.test.mjs`
- `tests/api.integration.test.mjs`

## 11. Backend - orquestracao e inicializacao

### `backend/app.mjs`
### `backend/index.mjs`

Checklist operacional:
- manter `app.mjs` como fabrica do servidor e `index.mjs` como entrypoint
- evitar adicionar logica de dominio ou validacao de fluxo nesses arquivos
- se o contexto de request ou o tratamento de erro crescer, extrair middleware/helpers nomeados
- manter o bootstrap/seed separado da subida de porta

Teste a reforcar:
- `tests/api.integration.test.mjs`

### `backend/orchestrator/formLifecycleOrchestrator.mjs`

Problemas que precisam ser corrigidos:
- o orquestrador mistura ciclo de vida de formulario e processamento de mensagens agendadas
- os helpers de data estao no proprio arquivo
- o log em console e a unica forma de observabilidade local

Checklist operacional:
- separar ciclo de vida de formulario e dispatch agendado se novas tarefas forem adicionadas
- mover formatacao de data para utilitario reutilizavel se reaproveitada em mais lugares
- manter o orquestrador pequeno e previsivel
- documentar claramente o que roda em background e em que intervalo

Teste a reforcar:
- `tests/orchestrator.test.mjs`
- `tests/messageOrchestrator.test.mjs`

## 12. Shared

### `shared/formRules.mjs`

Checklist operacional:
- manter este arquivo como fonte compartilhada apenas do que precisa ser igual em frontend e backend
- se uma regra for especifica da UI ou do backend, nao empurrar para shared
- validar sempre que alterar regra de resposta ou limite de escala

Teste a reforcar:
- `tests/ui/createFormDomain.test.js`
- `tests/validators.test.mjs`
- `tests/api.integration.test.mjs`

## 13. Duplicacoes reais que precisam sair

- `DEFAULT_GRID_ROWS`, `DEFAULT_GRID_COLS` e `SCALE_PRESETS` aparecem em `frontend/src/screens/createFormDomain.js` e `frontend/src/features/admin/adminSettingsShared.jsx`
- `FORM_MODES` aparece em `frontend/src/lib/forms.js`, `frontend/src/screens/createFormDomain.js`, `backend/services/formsService.mjs` e `backend/validators/formPayloadValidators.mjs`
- a regra de `person_select` e `memberBinding` existe no frontend e no backend com implementacoes paralelas
- o layout de topo publico se repete em `frontend/src/components/publicUi.jsx`
- o padrao de auditoria manual se repete em `backend/routes/adminRoutes.mjs`, `backend/routes/formRoutes.mjs` e `backend/routes/systemRoutes.mjs`
- o fluxo de query/load/paginate/sort aparece em `frontend/src/screens/ResultsScreen.jsx` e deveria ficar mais concentrado em helpers puros

## 14. Sequencia pratica de refatoracao

1. Concluido: quebrar `backend/validators/payloadValidators.mjs` por dominio.
2. Concluido neste ciclo: `backend/routes/adminRoutes.mjs` teve erro/auditoria padronizados e os blocos coesos de catalogos, bases externas e socios extraidos.
3. Em andamento: revisar `backend/services/formsService.mjs` e `backend/services/adminService.mjs` com foco em regras duplicadas e seguranca.
4. Depois: separar `frontend/src/screens/createFormDomain.js` em modulos menores.
5. Depois: limpar `frontend/src/App.jsx`, `frontend/src/AppViewport.jsx` e `frontend/src/AppShellContent.jsx`.
6. Depois: remover duplicacao de defaults e modes entre frontend/admin/backend.
7. Depois: reduzir a orquestracao manual em `frontend/src/screens/ResultsScreen.jsx` e `frontend/src/screens/EventsScreen.jsx`.
8. Por ultimo: enxugar `frontend/src/components/ui.jsx` e `frontend/src/components/publicUi.jsx`.
9. Sempre: atualizar testes e documentacao a cada corte.

## 15. Regras de seguranca durante a refatoracao

- Se o contrato atual estiver funcionando, a refatoracao nao pode mudá-lo sem aprovacao consciente.
- Se existir comportamento legado coberto por teste, o novo corte precisa preservar esse teste ou atualizar o teste com justificativa clara.
- Se uma mudanca exigir tocar em mais de tres arquivos de uma vez, ela deve ser dividida.
- Se a extracao criar dependencias novas, revisar se nao ficou acoplamento escondido.
- Se um arquivo estiver grande, nao reescrever tudo de uma vez; cortar por responsabilidade.
- Se o backend mudar um payload, atualizar a UI apenas depois de validar o contrato novo.
- Se a UI mudar um fluxo, garantir que o backend continue aceitando o payload esperado.
- Se houver duvida sobre o limite da mudança, manter o comportamento atual e reduzir o escopo.

## 16. Testes que devem acompanhar a limpeza

- `tests/ui/createFormDomain.test.js`
- `tests/ui/createFormScreen.test.jsx`
- `tests/ui/createFormModes.test.jsx`
- `tests/ui/resultsDomain.test.js`
- `tests/ui/resultsScreen.test.jsx`
- `tests/ui/eventsScreen.test.jsx`
- `tests/ui/eventMessageEditor.test.jsx`
- `tests/ui/eventMessageDetail.test.jsx`
- `tests/ui/adminCatalog.test.jsx`
- `tests/ui/messagingSettingsPanel.test.jsx`
- `tests/ui/appBootstrap.test.js`
- `tests/ui/appShell.test.js`
- `tests/ui/appPublicDataFlow.test.jsx`
- `tests/api.integration.test.mjs`
- `tests/validators.test.mjs`
- `tests/orchestrator.test.mjs`
- `tests/messageOrchestrator.test.mjs`

## 17. Sinal de que a refatoracao caminhou na direcao certa

- `App.jsx` para de ser o centro de quase tudo
- `adminRoutes.mjs` e `payloadValidators.mjs` deixam de ser arquivos monoliticos
- `createFormDomain.js` deixa de concentrar todas as regras do editor
- `ResultsScreen.jsx` passa a ser coordenacao, nao calculo
- `publicUi.jsx` perde duplicacao de layout
- os testes ficam mais localizados por dominio e menos dependentes de mega fluxos
