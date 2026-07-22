/**
 * @file frontend/src/screens/AppGuideScreen.jsx
 * @summary Guia funcional e tecnico pesquisavel da aplicacao.
 */

import React, { useMemo, useState } from "react";
import { Icon, ScreenHeader } from "../components/ui";
import { GUIDE_ARTICLES, getGuideCategories, rankGuideArticles } from "./appGuideContent";

const ArticleSection = ({ title, children }) => (
  <section className="app-guide-article__section">
    <h3>{title}</h3>
    {children}
  </section>
);

export const AppGuideScreen = () => {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(GUIDE_ARTICLES[0].id);
  const results = useMemo(() => rankGuideArticles(GUIDE_ARTICLES, query), [query]);
  const selectedArticle = GUIDE_ARTICLES.find(article => article.id === selectedId) || GUIDE_ARTICLES[0];
  const categories = getGuideCategories(GUIDE_ARTICLES);
  const isSearching = Boolean(query.trim());

  const openArticle = article => {
    setSelectedId(article.id);
    setQuery("");
    globalThis.requestAnimationFrame?.(() => globalThis.document?.querySelector(".app-guide-article")?.focus());
  };

  return (
    <div className="app-guide-screen">
      <ScreenHeader
        title="Guia da aplicacao"
        subtitle="Consulte os fluxos, possibilidades e detalhes tecnicos do NSJB Forms."
        leading={<span className="app-guide-header-icon"><Icon name="book" size={24} /></span>}
      />

      <div className="app-guide-search" role="search">
        <Icon name="search" size={20} />
        <label htmlFor="app-guide-query" className="sr-only">Buscar no guia</label>
        <input
          id="app-guide-query"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="O que voce quer entender? Ex.: planilha da Organ"
          autoComplete="off"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} aria-label="Limpar busca">
            <Icon name="close" size={17} />
          </button>
        )}
      </div>

      {isSearching ? (
        <section className="app-guide-results" aria-live="polite">
          <div className="app-guide-results__heading">
            <strong>{results.length} {results.length === 1 ? "assunto encontrado" : "assuntos encontrados"}</strong>
            <span>Resultados ordenados por relevancia textual e termos relacionados.</span>
          </div>
          {results.length ? results.map(({ article }, index) => (
            <button key={article.id} type="button" className="app-guide-result" onClick={() => openArticle(article)}>
              <span className="app-guide-result__rank">{index + 1}</span>
              <span>
                <small>{article.category}</small>
                <strong>{article.title}</strong>
                <span>{article.summary}</span>
              </span>
              <span className="app-guide-result__arrow" aria-hidden="true">→</span>
            </button>
          )) : (
            <div className="app-guide-empty">
              <Icon name="search" size={26} />
              <strong>Nenhum assunto encontrado</strong>
              <span>Tente uma palavra mais geral, como “escala”, “evento”, “socios” ou “resultados”.</span>
            </div>
          )}
        </section>
      ) : (
        <div className="app-guide-layout">
          <aside className="app-guide-index" aria-label="Indice do guia">
            <div className="app-guide-index__intro">
              <strong>Conteudo do guia</strong>
              <span>{GUIDE_ARTICLES.length} assuntos em {categories.length} areas</span>
            </div>
            {categories.map(category => (
              <div className="app-guide-category" key={category}>
                <h3>{category}</h3>
                {GUIDE_ARTICLES.filter(article => article.category === category).map(article => (
                  <button
                    key={article.id}
                    type="button"
                    data-active={selectedArticle.id === article.id}
                    onClick={() => setSelectedId(article.id)}
                  >
                    {article.title}
                  </button>
                ))}
              </div>
            ))}
          </aside>

          <article className="app-guide-article" tabIndex="-1">
            <div className="app-guide-article__top">
              <span>{selectedArticle.category}</span>
              <h2>{selectedArticle.title}</h2>
              <p>{selectedArticle.summary}</p>
            </div>
            <ArticleSection title="O que e e para que serve">
              <p>{selectedArticle.purpose}</p>
            </ArticleSection>
            <ArticleSection title="O que voce pode fazer">
              <ul>{selectedArticle.possibilities.map(item => <li key={item}>{item}</li>)}</ul>
            </ArticleSection>
            <ArticleSection title="Como funciona na pratica">
              <ol>{selectedArticle.workflow.map(item => <li key={item}>{item}</li>)}</ol>
            </ArticleSection>
            <ArticleSection title="Visao tecnica">
              <div className="app-guide-technical"><Icon name="info" size={18} /><p>{selectedArticle.technical}</p></div>
            </ArticleSection>
            {selectedArticle.architectureLayers && (
              <ArticleSection title="Camadas e responsabilidades">
                <div className="app-guide-layers">
                  {selectedArticle.architectureLayers.map((layer, index) => (
                    <div className="app-guide-layer" key={layer.name}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <strong>{layer.name}</strong>
                        <small>{layer.technology}</small>
                        <p>{layer.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ArticleSection>
            )}
            <div className="app-guide-keywords" aria-label="Termos relacionados">
              {selectedArticle.keywords.map(keyword => <span key={keyword}>{keyword}</span>)}
            </div>
          </article>
        </div>
      )}
    </div>
  );
};
