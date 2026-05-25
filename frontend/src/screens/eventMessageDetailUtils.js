/**
 * @file frontend/src/screens/eventMessageDetailUtils.js
 * @summary Utilitarios do detalhe de mensagens de evento.
 */

export const formatEventMessageDateTime = value => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("pt-BR");
};

export const copyTextToClipboard = async text => {
  if (!text) return false;
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
  return false;
};
