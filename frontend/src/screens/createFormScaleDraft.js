/**
 * @file frontend/src/screens/createFormScaleDraft.js
 * @summary Helpers do rascunho de escala na criacao de formulario.
 * @responsibility Criar secoes locais e montar patches de secao por modo e catalogo.
 */

export const createDefaultScaleSections = () => [];

export const createLocalScaleSection = () => ({ source: "local", title: "Nova seção", responsaveis: 1, auxiliares: 2 });

export const updateScaleSection = (sections, index, patch) => sections.map((section, sectionIndex) => (
  sectionIndex === index ? { ...section, ...patch } : section
));

export const appendScaleSection = sections => [...sections, createLocalScaleSection()];

export const buildScaleModePatch = mode => (
  mode === "local"
    ? { source: "local", catalogTaskId: "", catalogKey: "", catalogName: "" }
    : { source: "catalog" }
);

export const buildScaleCatalogPatch = (catalogId, activeScaleTaskCatalog = []) => {
  const catalogItem = activeScaleTaskCatalog.find(item => String(item.id) === String(catalogId));
  return catalogItem
    ? { source: "catalog", catalogTaskId: catalogItem.id, catalogKey: catalogItem.key, catalogName: catalogItem.name, title: catalogItem.defaultLabel }
    : { source: "catalog", catalogTaskId: "", catalogKey: "", catalogName: "" };
};
