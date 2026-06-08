/**
 * @file frontend/src/lib/appLifecycleEffects.js
 * @summary Agregador historico dos efeitos de ciclo de vida do shell principal.
 * @responsibility Manter compatibilidade enquanto os efeitos por dominio vivem em modulos menores.
 */

export { useAppLifecycleBootstrapEffects } from "./appLifecycleBootstrapEffects";
export { useAppLifecycleDetailEffects } from "./appLifecycleDetailEffects";
export { useAppLifecycleNavigationEffects } from "./appLifecycleNavigationEffects";
export { useAppLifecyclePreferenceEffects } from "./appLifecyclePreferenceEffects";
export { useAppLifecycleSessionValidationEffects } from "./appLifecycleSessionValidationEffects";
