/**
 * @file frontend/src/lib/appBootstrapMetrics.js
 * @summary Calculos e atualizacoes de metricas dentro do bootstrap.
 */

import { replaceBootstrapList } from "./appBootstrapLists";

export const updateBootstrapFormMetrics = (bootstrap, formId, metrics) => replaceBootstrapList(
  bootstrap,
  "forms",
  (Array.isArray(bootstrap?.forms) ? bootstrap.forms : []).map(form => (
    form.id === formId
      ? { ...form, metrics: { ...(form.metrics || {}), ...metrics } }
      : form
  )),
);

export const buildEscalaMetrics = sections => {
  const safeSections = Array.isArray(sections) ? sections : [];
  const total = safeSections.reduce((sum, section) => sum + (Array.isArray(section?.slots) ? section.slots.length : 0), 0);
  const filled = safeSections.reduce((sum, section) => {
    const slots = Array.isArray(section?.slots) ? section.slots : [];
    return sum + slots.filter(slot => slot?.person).length;
  }, 0);
  return { responses: filled, total, filled, pending: total - filled };
};
