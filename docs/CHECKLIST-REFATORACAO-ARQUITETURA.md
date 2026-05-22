# Checklist de Refatoracao de Arquitetura

Documento operacional para terminar a limpeza da aplicacao sem perder a divisao atual entre frontend, backend, compartilhado e docs.

## Como usar

- Execute os itens na ordem sugerida.
- Marque cada item somente quando houver ajuste de codigo, teste e, se necessario, atualizacao da documentacao da area.
- Se um item for descartado, registre o motivo para nao reabrir a mesma discussao depois.
- A ideia aqui nao e "reescrever tudo"; e reduzir redundancia, cortar acoplamento e deixar as fronteiras claras.

## Definicao de pronto

- O frontend principal nao concentra regra de negocio nem montagem de rotas complexas.
- A camada de UI base nao reexporta componentes de dominio.
- Os fluxos publicos nao duplicam estrutura visual entre si sem uma razao clara.
- Os arquivos acima de 300 a 400 linhas viram excecao justificada, nao padrao.
- Cada area grande tem testes de comportamento suficientes para evitar regressao na proxima extracao.
- A documentacao aponta para o arquivo certo, sem caminhos legados ou contraditorios.

## Prioridade 0: Cortar o que ja esta sobrando

- [x] Remover a dependencia circular entre `frontend/src/components/ui.jsx` e `frontend/src/components/publicUi.jsx`; `ui.jsx` deve ficar apenas com primitives genericos, e `publicUi.jsx` deve ser a fonte de verdade dos componentes publicos.
- [ ] Escolher um unico fluxo canonico para o topo publico: manter `PublicTopCompact` e revisar se `PublicTop` ainda tem uso real; se nao tiver uso, remover o componente e seus testes associados.
- [ ] Consolidar a responsabilidade de header de resultados entre `frontend/src/components/ResultsPresenceHeader.jsx` e `frontend/src/screens/resultsPanels.jsx`; se o header for realmente reutilizavel, ele deve ser o unico ponto de composicao dessa area.
- [ ] Eliminar qualquer reexportacao "de compatibilidade" que nao esteja servindo transicao real; reexportacao de conveniencia que nao evita quebra concreta vira ruido e deve sair.
- [ ] Revisar se existem componentes extraidos mas nao usados em producao; quando um componente so serve a si mesmo e nao e reaproveitado, ele deve voltar para a tela de origem ou ser removido.

## Prioridade 1: Limpar o shell principal

- [ ] Reduzir `frontend/src/App.jsx` para orquestracao de alto nivel apenas; a tela nao deve carregar a responsabilidade de bootstrap, persistencia, controle de estado, decisao de navegacao, atualizacao de cache e montagem do app shell ao mesmo tempo.
- [ ] Extrair a logica de restore de sessao, refresh do bootstrap, refresh de detalhes de respostas e escala para um modulo ou camada especifica de estado do app.
- [ ] Remover a massa de handlers de `frontend/src/App.jsx` do corpo principal e agrupa-los por dominio; hoje o arquivo concentra login, eventos, formularios, respostas, escala, admin, mensagens e sincronizacao.
- [ ] Trocar o objeto gigante `shellApp` por uma composicao mais enxuta; cada tela deve receber apenas o subconjunto de dados e callbacks que usa de verdade.
- [ ] Revisar `frontend/src/AppShellContent.jsx` para que ele deixe de ser um switch gigante de props e telas; a meta e separar chrome, router visual e injecao de dominio.
- [ ] Extrair o bloco de drawer e a navegacao do `frontend/src/components/AppHeader.jsx` se ele continuar crescendo; o header nao deve virar o novo lugar de toda a logica de conta.
- [ ] Tirar qualquer regra de navegacao que dependa de conhecimento de dominio do header e deixar isso em helpers puros.

## Prioridade 2: Organizar o fluxo publico

- [ ] Tornar `frontend/src/screens/publicScreenFrame.jsx` o lugar unico do frame compartilhado dos fluxos publicos e internos; se houver outro frame repetindo estrutura, ele deve desaparecer ou apontar para esse modulo.
- [ ] Revisar `PublicScreenHeader` para que ele realmente so escolha entre topo interno e topo publico; se comecar a fazer mais do que isso, a responsabilidade esta grande demais.
- [ ] Reduzir a repeticao visual entre `PublicFormScreen` e `PublicEscalaScreen`; ambos devem consumir blocos comuns para cabecalho, card principal, rodape e mensagens de erro/sucesso.
- [ ] Rever `frontend/src/screens/publicFormPanels.jsx` para juntar paineis de sucesso, erro, edicao e campo em uma composicao previsivel, sem empilhar blocos que nao conversam entre si.
- [ ] Rever `frontend/src/screens/publicScalePanels.jsx` para garantir que a tela principal nao concentre regras de limite, contagem e renderizacao da grade ao mesmo tempo.
- [ ] Garantir que `frontend/src/components/publicUi.jsx` fique com responsabilidades bem definidas: toolbar de leitura, topos publicos e tela de fechamento.
- [ ] Se `PublicReadingToolbar` continuar mexendo em estado local, persistencia e eventos globais, avaliar mover a persistencia para um helper puro e deixar o componente mais declarativo.
- [ ] Unificar a forma de construir links publicos e voltar ao painel; hoje existe navegacao por hash e por pathname, e isso precisa ficar isolado em helpers testados.

## Prioridade 3: Dividir telas grandes do frontend

- [ ] Quebrar `frontend/src/screens/CreateFormScreen.jsx` em uma tela fina que componha setup, campos, preview e configuracao de resultados sem conter a regra completa do editor.
- [ ] Continuar a migracao da logica de criacao de formulario para os modulos `frontend/src/screens/createForm*.js`; qualquer mutacao de draft, preset ou normalizacao deve viver nesses helpers puros, nao na tela.
- [ ] Revisar `frontend/src/features/forms/createFormPanels/*` para remover sobreposicao entre setup, field e final; cada arquivo deve ter fronteira visual clara.
- [ ] Consolidar a previsao do formulario em `CreateFormLivePreview` e `CreateFormFieldPreview`; se houver outra copia de preview na tela, ela deve sair.
- [ ] Quebrar `frontend/src/screens/FormListScreen.jsx` em blocos menores de filtros, lista e acoes; a listagem nao deve segurar logica de responsividade, selecao e acao de item ao mesmo tempo.
- [ ] Revisar `frontend/src/components/FormListCard.jsx` e `frontend/src/components/FormListToolbar.jsx` para garantir que eles sao realmente os blocos unicos da listagem.
- [ ] Dividir `frontend/src/screens/ResultsScreen.jsx` em partes menores se novas regras surgirem; os calculos, filtros e exportacao CSV devem continuar em `resultsDomain.js`.
- [ ] Validar se `frontend/src/screens/resultsPanels.jsx` ainda esta com o tamanho certo; se a tela crescer mais, extrair resumo, tabela e toolbar para componentes separados.
- [ ] Revisar `frontend/src/screens/EventsScreen.jsx` para separar CRUD de evento, lista de formularios e lista de mensagens.
- [ ] Revisar `frontend/src/screens/EventMessageEditorScreen.jsx` e `frontend/src/screens/EventMessageDetailScreen.jsx` para evitar duplicacao de cards, status e preview entre editor e detalhe.
- [ ] Manter `frontend/src/screens/DashboardScreen.jsx` como composicao de paineis e nao como lugar de regras novas de negocio.

## Prioridade 4: Consolidar UI compartilhada

- [ ] Manter `frontend/src/components/ui.jsx` como biblioteca de primitives verdadeiros: cor, badge, botao, painel, header de tela, feedback e modal.
- [ ] Evitar que `ui.jsx` passe a depender de fluxos especificos do dominio; se isso acontecer, o arquivo deixou de ser base e precisa ser quebrado.
- [ ] Eliminar duplicacao de wrappers visuais entre `SurfacePanel`, `MetricCard`, `SplitSection` e `ScreenHeader`; qualquer novo wrapper precisa justificar por que os existentes nao servem.
- [ ] Revisar se `FieldControl` cobre todos os casos de label, ajuda e acoes; se nao cobrir, ampliar sem criar outro componente equivalente.
- [ ] Revisar se `FeedbackBanner` e `ConfirmModal` sao suficientes para estados globais de erro e confirmacao; criar clones novos so em ultimo caso.
- [ ] Garantir que `TypeBadge`, `StatusBadge` e `Badge` nao se sobreponham semanticamente; cada um deve ter um uso claro e exclusivo.

## Prioridade 5: Ajustar o backend para nao recriar a mesma bagunca

- [ ] Dividir `backend/routes/adminRoutes.mjs` em modulos menores por subdominio; esse arquivo ja virou um ponto de agregacao grande demais.
- [ ] Revisar se `backend/routes/formRoutes.mjs` e `backend/routes/eventRoutes.mjs` permanecem pequenos; se crescerem, extrair handlers por caso de uso antes de aumentar o roteador principal.
- [ ] Manter `backend/routes/apiRouter.mjs` como dispatcher curto, sem logica de negocio ou manipulacao de regra.
- [ ] Verificar se `backend/services/adminService.mjs` nao esta virando um service faz tudo; se estiver, dividir por usuarios, catalogos, seguranca, mensagens e sincronizacao.
- [ ] Revisar `backend/services/eventsService.mjs` e `backend/services/formsService.mjs` para manter validacao estrutural separada da regra de persistencia.
- [ ] Continuar empurrando todo acesso ao banco para `backend/repositories/`; nenhum service deve voltar a conversar com SQL ou detalhe de armazenamento direto.
- [ ] Se a orquestracao de bootstrap crescer de novo, fragmentar `backend/services/bootstrapService.mjs` antes de acumular mais responsabilidade.
- [ ] Garantir que os helpers compartilhados em `backend/routes/requestHelpers.mjs` continuem sendo o unico lugar de pequenas utilidades de request, auth e auditoria.

## Prioridade 6: Remover legado, redundancia e ruido

- [ ] Apagar componentes exportados mas sem uso real depois de confirmar a ausencia de consumo; manter sem uso so para "talvez um dia" aumenta custo sem ganhar nada.
- [ ] Remover reexports temporarios quando a migracao acabou.
- [ ] Eliminar nomes e textos que insinuem mais de uma fonte de verdade para a mesma UI.
- [ ] Limpar arquivos de doc que ficaram historicos demais e nao ajudam a operar o projeto.
- [ ] Remover referencias a fluxos antigos que o usuario final nao ve mais.
- [ ] Confirmar que nao ha estilos mortos em `frontend/src/styles.css` nem classes que nao conversam com o markup atual.

## Prioridade 7: Testes que precisam acompanhar a limpeza

- [ ] Adicionar ou ajustar teste quando remover `PublicTop` ou qualquer outro componente publico morto.
- [ ] Cobrir o fluxo de navegacao do shell quando `App.jsx` for dividido, para evitar regressao de rotas internas e publicas.
- [ ] Cobrir a unificacao entre `ResultsPresenceHeader`, `ResultsScreen` e `resultsPanels` se houver consolidacao de header.
- [ ] Cobrir o frame compartilhado dos fluxos publicos quando `publicScreenFrame.jsx` mudar.
- [ ] Cobrir a extracao de `AppHeader` se o drawer ou o menu forem segmentados.
- [ ] Manter testes de `createFormDomain.js`, `resultsDomain.js` e `publicFormDomain.js` como rede de seguranca para qualquer nova extracao.
- [ ] Se um item tocar backend, revisar pelo menos os testes de API correspondentes antes de considerar a mudanca concluida.

## Prioridade 8: Documentacao que deve acompanhar as mudancas

- [ ] Atualizar `docs/AI_CODEMAP.md` sempre que um arquivo virar fonte de verdade ou perder esse papel.
- [ ] Atualizar `docs/MAPA-CODIGO.md` quando mover responsabilidades entre telas, features, components, lib, services ou repositories.
- [ ] Atualizar `docs/REUSO.md` quando um componente novo substituir um bloco antigo ou quando um bloco deixar de ser recomendado.
- [ ] Atualizar `docs/MANUTENCAO.md` para refletir o backlog atual, sem duplicar a lista completa deste documento.
- [ ] Atualizar `README.md` ou docs de area quando o comportamento visivel ao usuario mudar.

## Sequencia sugerida de execucao

- [ ] Passo 1: remover codigo morto e decidir fontes de verdade.
- [ ] Passo 2: quebrar `App.jsx` e `AppShellContent.jsx`.
- [ ] Passo 3: normalizar os fluxos publicos.
- [ ] Passo 4: separar telas grandes.
- [ ] Passo 5: reduzir o backend administrativo.
- [ ] Passo 6: ajustar testes.
- [ ] Passo 7: revisar documentacao e limpar o que sobrar.

## Lista de checagem final antes de fechar a refatoracao

- [ ] Nao existe componente publico mantido duplicado fora do lugar certo.
- [ ] Nao existe logica de regra de negocio em tela ou header.
- [ ] Nao existe fetch espalhado em componente visual.
- [ ] Nao existe arquivo grande sem justificativa clara.
- [ ] Nao existe doc com informacao conflitante sobre a mesma area.
- [ ] Nao existe teste desatualizado para os fluxos que foram mexidos.
