/**
 * @file frontend/src/lib/appDataLoad.js
 * @summary Agregador historico do carregamento de dados do shell do app.
 * @responsibility Manter compatibilidade enquanto os loaders por dominio vivem em modulos menores.
 */

export {
  hasLoadedFormDetails,
  isDetailLoadInFlight,
  loadFormEscalaDetail,
  loadFormResponsesDetail,
  removeFormDetail,
  shouldSkipDetailLoad,
  upsertFormDetail,
} from "./appDetailLoaders";
export { refreshAppBootstrap } from "./appBootstrapRefresh";
export { refreshFormDeleteKeyConfiguredStatus } from "./appFormDeleteKeyStatus";
