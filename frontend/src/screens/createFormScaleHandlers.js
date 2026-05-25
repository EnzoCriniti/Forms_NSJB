import { appendScaleSection, buildScaleCatalogPatch, buildScaleModePatch, updateScaleSection } from "./createFormScaleDraft";
import { removeListItemAtIndex } from "./createFormListHelpers";

export const buildCreateFormScaleHandlers = ({
  scaleDraft,
  setScaleDraft,
  setScaleLimit,
  activeScaleTaskCatalog,
}) => {
  const updateScale = (index, patch) => setScaleDraft(updateScaleSection(scaleDraft, index, patch));

  return {
    addScale: () => setScaleDraft(appendScaleSection(scaleDraft)),
    applyScaleCatalog: (index, catalogId) => {
      updateScale(index, buildScaleCatalogPatch(catalogId, activeScaleTaskCatalog));
    },
    removeScaleSection: index => setScaleDraft(removeListItemAtIndex(scaleDraft, index)),
    setScaleMode: (index, mode) => {
      updateScale(index, buildScaleModePatch(mode));
    },
    updateScale,
    updateScaleLimit: value => setScaleLimit(value),
  };
};
