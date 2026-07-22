/**
 * @file frontend/src/screens/appGuideContent.js
 * @summary Conteudo versionado e busca por relevancia do Guia da Aplicacao.
 */

export const GUIDE_ARTICLES = [
  {
    id: "visao-geral",
    category: "Primeiros passos",
    title: "Visao geral da aplicacao",
    summary: "Entenda como eventos, formularios, respostas, escalas e relatorios se conectam.",
    keywords: ["inicio", "funcionamento", "fluxo", "mapa", "sistema"],
    purpose: "A aplicacao organiza eventos do nucleo e tudo o que acontece dentro deles: coleta de presenca, preenchimento da escala da Organ, comunicacao e acompanhamento por indicadores.",
    possibilities: [
      "Criar eventos e reunir formularios relacionados no mesmo contexto.",
      "Publicar links para preenchimento sem expor a area administrativa.",
      "Consultar resultados, pendencias, escalas e indicadores consolidados.",
      "Controlar o que cada perfil pode visualizar ou alterar.",
    ],
    workflow: ["Cadastre ou abra um evento.", "Crie os formularios de presenca e/ou escala.", "Publique o evento e compartilhe os links.", "Acompanhe resultados e use o Dashboard para a visao historica."],
    technical: "O frontend React concentra a navegacao autenticada no shell da aplicacao. Os dados sao obtidos pela API Node, validados por dominio e persistidos no PostgreSQL. Eventos guardam os vinculos dos formularios; respostas e secoes de escala permanecem vinculadas ao formulario correspondente.",
  },
  {
    id: "eventos",
    category: "Operacao",
    title: "Eventos",
    summary: "Crie o agrupador de uma atividade, vincule formularios e acompanhe sua publicacao e encerramento.",
    keywords: ["evento", "atividade", "publicar", "encerrar", "formularios", "links"],
    purpose: "Evento e o ponto de organizacao de uma atividade. Ele reune os formularios usados naquele periodo e mantem o contexto de publicacao, mensagens e resultados.",
    possibilities: ["Criar, editar, publicar e excluir eventos conforme a permissao.", "Criar formularios diretamente dentro do evento.", "Fixar eventos e formularios usados com frequencia.", "Abrir resultados e mensagens sem perder o contexto do evento."],
    workflow: ["Acesse Eventos e crie o registro com titulo e periodo.", "Abra o evento e adicione os formularios necessarios.", "Revise os links e publique quando estiver pronto.", "Ao encerrar, os formularios deixam de aceitar novas respostas; a escala continua disponivel para consulta."],
    technical: "As rotas de eventos pesquisam, filtram e paginam os registros. O evento referencia formularios por identificador, mas excluir o agrupador nao apaga automaticamente os formularios. A navegacao publica usa uma rota canonica com o evento e o formulario no hash da URL.",
  },
  {
    id: "arquitetura",
    category: "Arquitetura",
    title: "Arquitetura da aplicacao",
    summary: "Conheca as camadas do sistema, a responsabilidade de cada uma e o caminho percorrido pelos dados.",
    keywords: ["arquitetura", "frontend", "backend", "api", "postgresql", "docker", "react", "node", "camadas", "modulos"],
    purpose: "A aplicacao usa uma arquitetura em camadas para separar interface, regras de negocio, validacao e persistencia. Essa divisao reduz o impacto de mudancas e torna cada parte mais simples de localizar, testar e evoluir.",
    possibilities: ["Entender onde uma funcionalidade comeca e termina.", "Localizar a camada correta para manutencao ou diagnostico.", "Distinguir regras visuais de regras que protegem os dados.", "Acompanhar o caminho completo entre uma acao na tela e o PostgreSQL."],
    workflow: ["Uma acao parte de uma tela ou componente React.", "O controller da tela prepara o estado e chama o cliente HTTP.", "A rota Node autentica, autoriza e valida o payload.", "O servico aplica a regra de negocio e o repositorio acessa o PostgreSQL.", "A resposta retorna pelo mesmo caminho e a tela atualiza o estado e o feedback."],
    technical: "Frontend e backend compartilham apenas contratos e regras realmente transversais. O restante permanece agrupado por dominio, como eventos, formularios, equipes, mensagens e BI. O Docker coordena a execucao dos servicos e o PostgreSQL e a fonte persistente dos dados.",
    architectureLayers: [
      { name: "Interface", technology: "React + Vite", description: "Telas, componentes reutilizaveis, navegacao, estados visuais e acessibilidade." },
      { name: "Controllers e dominio", technology: "JavaScript", description: "Estado derivado, montagem de payloads, filtros e regras puras proximas de cada tela." },
      { name: "API", technology: "Node.js", description: "Rotas HTTP, autenticacao, autorizacao, validacao e composicao das respostas." },
      { name: "Servicos", technology: "Modulos por dominio", description: "Regras de negocio de eventos, formularios, escalas, equipes, mensagens e relatorios." },
      { name: "Persistencia", technology: "PostgreSQL", description: "Repositorios e consultas que isolam o acesso ao banco de dados." },
      { name: "Execucao", technology: "Docker", description: "Ambiente reproduzivel para aplicacao, API e banco, com scripts centralizados no projeto." },
    ],
  },
  {
    id: "formularios-presenca",
    category: "Formularios",
    title: "Formulario de presenca",
    summary: "Configure a coleta de presenca, seus campos, a pessoa principal e as regras de resultados.",
    keywords: ["presenca", "formulario", "campos", "resposta", "faltantes", "nucleo", "geral", "resultados publicos", "ver resultados"],
    purpose: "O formulario de presenca coleta respostas estruturadas e pode relacionar cada envio a uma pessoa da base de socios ou de uma base externa.",
    possibilities: ["Usar campos do catalogo ou configurar campos especificos.", "Definir um seletor de pessoa principal e seletores secundarios.", "Ativar totalizacoes, resultados publicos e controle de faltantes.", "Publicar uma consulta externa simplificada com totais e a lista de quem respondeu.", "Escolher o modo Nucleo ou Geral conforme a origem das pessoas."],
    workflow: ["Escolha Presenca ao criar o formulario.", "Defina modo, titulo, status e campos.", "Em Configuracao dos Resultados, marque Permitir visualizacao publica dos resultados quando a consulta externa for desejada.", "Configure os totalizadores que devem aparecer.", "Salve, revise a previa e compartilhe o link quando o formulario estiver aberto."],
    technical: "O modo Nucleo exige um campo principal ligado a base central de socios. O modo Geral bloqueia essa base e atende publicos externos. A configuracao fica em resultsConfig; publicResultsEnabled libera o botao Ver resultados e a rota publica, enquanto showLinkedRoster controla faltantes apenas na planilha interna.",
  },
  {
    id: "escala-organ",
    category: "Formularios",
    title: "Escala da Organ",
    summary: "Monte secoes, tarefas e vagas para que as pessoas assumam funcoes no evento.",
    keywords: ["organ", "escala", "tarefas", "vagas", "secoes", "inscricao", "funcoes"],
    purpose: "A escala da Organ distribui tarefas do evento em secoes e vagas. Cada vaga pode ser assumida por uma pessoa, respeitando o limite configurado.",
    possibilities: ["Criar secoes e adicionar tarefas do catalogo.", "Definir quantidade de vagas por tarefa.", "Permitir inscricao pelo link publico ou pela area interna.", "Editar ou remover ocupantes conforme a permissao."],
    workflow: ["Crie um formulario do tipo Escala da Organ.", "Organize as secoes e inclua as tarefas necessarias.", "Defina os limites e abra o formulario.", "Compartilhe o link e acompanhe o preenchimento na planilha da escala."],
    technical: "A estrutura da escala e salva como secoes vinculadas ao formulario. As alteracoes de vagas sao validadas no backend para preservar limites e consistencia. Formularios criados dentro de evento recebem titulo padronizado e o contexto e preservado na navegacao.",
  },
  {
    id: "preenchimento-publico",
    category: "Formularios",
    title: "Preenchimento e links publicos",
    summary: "Saiba como responder, editar um envio existente e compartilhar o endereco correto.",
    keywords: ["responder", "preencher", "link", "publico", "editar resposta", "compartilhar", "resultados publicos", "ver resultados"],
    purpose: "O fluxo publico permite responder um formulario sem entrar no painel administrativo. Usuarios autenticados tambem podem preencher pelo modo interno.",
    possibilities: ["Compartilhar um link direto de evento e formulario.", "Localizar uma resposta existente quando a regra do formulario permitir.", "Abrir Ver resultados sem entrar na plataforma quando a visualizacao publica estiver habilitada.", "Exibir aviso de formulario fechado sem perder o acesso aos resultados publicados.", "Usar o mesmo formulario em telas pequenas."],
    workflow: ["Copie o link exibido no formulario ou evento.", "A pessoa informa os dados solicitados e envia.", "Se houver resposta anterior identificavel, o fluxo oferece a edicao.", "Quando houver publicacao de resultados, use Ver resultados para consultar totais e quem ja respondeu.", "Use Voltar ao formulario para retornar ao preenchimento."],
    technical: "As rotas publicas canonicas usam #/formularios/<id> ou #/eventos/<evento>/<formulario>. Os resultados usam #/formularios/<id>/resultados e permanecem fora do shell autenticado. Essa visao oferece filtros e zoom, mas nao mostra faltantes, tamanho da base vinculada nem exportacao.",
  },
  {
    id: "planilha-presenca",
    category: "Resultados",
    title: "Planilha de presenca",
    summary: "Consulte respostas, faltantes, totais, filtros, ordenacao e exportacao da presenca.",
    keywords: ["planilha", "resultado", "presenca", "respostas", "faltantes", "csv", "exportar", "filtro"],
    purpose: "A planilha de presenca transforma as respostas do formulario em uma tabela de consulta e em totais configuraveis.",
    possibilities: ["Filtrar por coluna, valor e grau.", "Ordenar linhas e ajustar o zoom da tabela, inclusive por gesto de toque.", "Comparar respostas recebidas com a base vinculada quando o controle de faltantes estiver ativo.", "Exportar os dados visiveis em CSV.", "Oferecer uma versao publica reduzida com totalizadores e somente as respostas recebidas."],
    workflow: ["Abra o formulario e escolha Resultados.", "Use os filtros para localizar pessoas ou respostas.", "Confira os totais e pendencias apresentados no topo.", "Exporte o CSV quando precisar trabalhar fora da aplicacao."],
    technical: "O controller combina respostas, configuracao do formulario e base vinculada para montar linhas e totais. A lista de faltantes so existe quando showLinkedRoster esta ativo na visao interna. No modo publico, a tabela usa apenas respostas recebidas, preserva filtros e zoom para facilitar a leitura e omite a exportacao.",
  },
  {
    id: "planilha-organ",
    category: "Resultados",
    title: "Planilha da Organ",
    summary: "Veja a ocupacao da escala por secao, identifique vagas pendentes e gerencie inscricoes.",
    keywords: ["planilha da organ", "organ", "escala", "resultado", "vagas", "ocupacao", "pendentes", "csv"],
    purpose: "A planilha da Organ e a visao operacional da escala. Ela mostra cada secao, tarefa, limite e pessoa inscrita, deixando claro o que ainda precisa ser preenchido.",
    possibilities: ["Ver totais de vagas, ocupadas e pendentes.", "Abrir secoes e consultar seus ocupantes.", "Inscrever, trocar ou remover uma pessoa quando houver permissao.", "Exportar a escala para CSV."],
    workflow: ["Abra o evento e selecione o formulario Escala da Organ.", "Entre em Resultados para ver o resumo de ocupacao.", "Expanda as secoes e ajuste as vagas necessarias.", "Use a exportacao para distribuir ou arquivar a escala final."],
    technical: "A tela usa as secoes persistidas do formulario e calcula as metricas a partir dos slots. Cada alteracao passa pelo fluxo de persistencia, com feedback de sucesso ou erro. Em evento encerrado, a escala publica permanece em consulta, mas vagas pendentes ficam desabilitadas.",
  },
  {
    id: "equipes",
    category: "Operacao",
    title: "Equipes e periodos",
    summary: "Defina as pessoas de referencia por periodo e entenda o efeito das dispensas nos indicadores.",
    keywords: ["equipes", "periodo", "mestre assistente", "organ", "auxiliares", "dispensa"],
    purpose: "Equipes registra, por intervalo de datas, quem exerce as funcoes de Mestre Assistente, Organ e auxiliares diretos.",
    possibilities: ["Criar periodos sem sobreposicao.", "Selecionar pessoas elegiveis a partir da base de socios.", "Consultar formularios e eventos abrangidos pelo periodo.", "Desconsiderar automaticamente pessoas dispensadas nos indicadores esperados."],
    workflow: ["Acesse Equipes e informe o intervalo.", "Selecione Mestre Assistente, Organ e auxiliares.", "Salve e confira o resumo do periodo.", "Abra os resultados relacionados pelos atalhos do resumo."],
    technical: "O servico valida graus elegiveis, separacao dos auxiliares e sobreposicao de datas. Ao consolidar a participacao de um evento encerrado, o BI marca dispensados como nao esperados e preserva o motivo para consulta.",
  },
  {
    id: "dashboard",
    category: "Analise",
    title: "Dashboard e indicadores",
    summary: "Acompanhe presenca, escala e participacao dos socios ao longo do tempo.",
    keywords: ["dashboard", "bi", "indicadores", "graficos", "ranking", "socios", "historico"],
    purpose: "O Dashboard consolida dados de eventos encerrados para mostrar tendencias, taxas de participacao, preenchimento de escala e perfis individuais.",
    possibilities: ["Filtrar por periodo e grau.", "Alternar entre visao geral, Presenca, Escala e Socios.", "Consultar rankings e distribuicoes.", "Abrir o perfil historico de uma pessoa."],
    workflow: ["Selecione o periodo de analise.", "Aplique o filtro de grau quando necessario.", "Navegue pelas abas para mudar o foco.", "Clique em uma pessoa para detalhar seu historico."],
    technical: "As agregacoes de BI consideram participacoes esperadas e eventos consolidados. Dispensados pela regra de equipes permanecem auditaveis, mas nao reduzem indevidamente a taxa de presenca.",
  },
  {
    id: "mensagens",
    category: "Comunicacao",
    title: "Mensagens e lembretes",
    summary: "Prepare modelos, destinatarios e mensagens ligadas a cada evento.",
    keywords: ["mensagens", "lembrete", "comunicacao", "whatsapp", "modelo", "destinatarios", "agendar"],
    purpose: "A area de Mensagens padroniza comunicados e lembretes, calcula destinatarios e mantem o historico de cada envio ligado ao evento.",
    possibilities: ["Criar modelos reutilizaveis.", "Montar presets de pessoas.", "Preparar mensagens de abertura, fechamento e lembrete.", "Agendar, disparar, cancelar e consultar o historico conforme a integracao configurada."],
    workflow: ["Configure a URL publica e os modelos em Mensagens.", "No evento, crie uma mensagem e escolha o formulario alvo.", "Revise o texto renderizado e os destinatarios calculados.", "Agende ou dispare e acompanhe o status no detalhe."],
    technical: "Templates, presets e configuracao global sao dados administrativos. O telefone vem da coluna definida na base de socios; sem esse mapeamento, lembretes diretos nao conseguem calcular o destino.",
  },
  {
    id: "administracao",
    category: "Administracao",
    title: "Configuracoes e catalogos",
    summary: "Gerencie usuarios, bases, campos, tarefas, classificacoes, templates, seguranca e auditoria.",
    keywords: ["configuracoes", "administracao", "usuarios", "catalogo", "campos", "tarefas", "auditoria", "seguranca"],
    purpose: "Configuracoes concentra as estruturas compartilhadas que sustentam o restante da aplicacao e aparece somente para perfis com capacidades administrativas.",
    possibilities: ["Administrar usuarios e suas camadas de acesso.", "Sincronizar a base de socios e bases externas.", "Manter catalogos de campos e tarefas da escala.", "Gerenciar classificacoes, templates, chave de exclusao e logs de auditoria."],
    workflow: ["Abra Configuracoes pelo menu do usuario.", "Escolha a aba do dominio que deseja administrar.", "Edite ou crie o item e revise a previa quando houver.", "Salve e confirme o reflexo nos novos formularios ou fluxos."],
    technical: "Cada dominio administrativo tem validacao, servico e repositorio proprios. As permissoes sao verificadas no frontend para orientar a interface e novamente no backend para proteger as operacoes.",
  },
  {
    id: "bases-pessoas",
    category: "Administracao",
    title: "Base de socios e bases externas",
    summary: "Entenda sincronizacao, mapeamento de colunas e vinculo de pessoas aos formularios.",
    keywords: ["socios", "membros", "pessoas", "base", "csv", "sincronizar", "colunas", "grau", "telefone"],
    purpose: "As bases fornecem listas controladas de pessoas para seletores dos formularios, filtros, mensagens e regras de equipes.",
    possibilities: ["Importar e sincronizar dados tabulares.", "Mapear nome, grau, telefone e outras colunas.", "Usar a base central no modo Nucleo.", "Criar bases externas reutilizaveis para formularios gerais."],
    workflow: ["Em Configuracoes, escolha a base e informe a origem.", "Mapeie as colunas do arquivo para os campos reconhecidos.", "Confira a previa e sincronize.", "No catalogo, vincule o campo de pessoa a base correta."],
    technical: "A sincronizacao converte os dados recebidos e grava uma representacao local normalizada. O campo person_select guarda a origem em memberBinding; o papel primary identifica a pessoa principal usada por resultados e pendencias.",
  },
  {
    id: "acessos-seguranca",
    category: "Administracao",
    title: "Acessos, permissoes e seguranca",
    summary: "Saiba por que menus e acoes variam entre usuarios e como operacoes sensiveis sao protegidas.",
    keywords: ["acesso", "permissoes", "perfil", "admin", "viewer", "chave mestra", "login", "seguranca"],
    purpose: "O controle de acesso limita menus, dados e mutacoes conforme as capacidades da camada associada ao usuario.",
    possibilities: ["Separar visualizacao e administracao por capacidade.", "Restringir criacao e edicao por tipo de formulario.", "Proteger exclusoes sensiveis com chave mestra.", "Rastrear mutacoes importantes na auditoria."],
    workflow: ["Cadastre o usuario em Configuracoes.", "Associe a camada de acesso adequada.", "Revise as capacidades liberadas.", "Use a auditoria para investigar alteracoes administrativas."],
    technical: "O frontend usa capacidades para montar navegacao e habilitar acoes. A API repete a autorizacao antes de executar a operacao. Sessoes armazenam token e apenas dados publicos do usuario; segredos nao sao mantidos no estado persistido do navegador.",
  },
];

const SYNONYM_GROUPS = [
  ["planilha", "resultado", "relatorio", "tabela"],
  ["organ", "escala", "vagas", "funcoes", "tarefas"],
  ["socio", "socios", "membro", "membros", "pessoa", "pessoas"],
  ["evento", "eventos", "atividade", "atividades"],
  ["formulario", "formularios", "form", "forms"],
  ["mensagem", "mensagens", "lembrete", "lembretes", "comunicacao"],
  ["configuracao", "configuracoes", "administracao", "admin"],
];

export const normalizeGuideText = value => String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const trigrams = value => {
  const text = `  ${value}  `;
  const items = new Set();
  for (let index = 0; index <= text.length - 3; index += 1) items.add(text.slice(index, index + 3));
  return items;
};

const fuzzySimilarity = (left, right) => {
  if (!left || !right) return 0;
  const a = trigrams(left);
  const b = trigrams(right);
  let overlap = 0;
  a.forEach(item => { if (b.has(item)) overlap += 1; });
  return (2 * overlap) / (a.size + b.size);
};

const expandToken = token => {
  const group = SYNONYM_GROUPS.find(items => items.includes(token));
  return group || [token];
};

const articleText = article => normalizeGuideText([
  article.title,
  article.summary,
  article.purpose,
  article.keywords.join(" "),
  article.possibilities.join(" "),
  article.workflow.join(" "),
  article.technical,
].join(" "));

export const rankGuideArticles = (articles, query) => {
  const normalizedQuery = normalizeGuideText(query);
  if (!normalizedQuery) return articles.map(article => ({ article, score: 0 }));
  const queryTokens = normalizedQuery.split(" ").filter(token => token.length > 1);

  return articles
    .map(article => {
      const title = normalizeGuideText(article.title);
      const summary = normalizeGuideText(article.summary);
      const keywords = normalizeGuideText(article.keywords.join(" "));
      const content = articleText(article);
      const contentTokens = [...new Set(content.split(" "))];
      let score = title.includes(normalizedQuery) ? 40 : 0;
      if (keywords.includes(normalizedQuery)) score += 24;
      if (summary.includes(normalizedQuery)) score += 12;

      queryTokens.forEach(token => {
        const variants = expandToken(token);
        const titleMatch = variants.some(variant => title.includes(variant));
        const keywordMatch = variants.some(variant => keywords.includes(variant));
        const contentMatch = variants.some(variant => content.includes(variant));
        if (titleMatch) score += 12;
        if (keywordMatch) score += 7;
        if (contentMatch) score += 3;
        const bestFuzzy = contentTokens.reduce((best, candidate) => Math.max(best, fuzzySimilarity(token, candidate)), 0);
        if (!contentMatch && bestFuzzy >= 0.55) score += bestFuzzy * 5;
      });

      return { article, score };
    })
    .filter(result => result.score > 0)
    .sort((left, right) => right.score - left.score || left.article.title.localeCompare(right.article.title, "pt-BR"));
};

export const getGuideCategories = articles => [...new Set(articles.map(article => article.category))];
