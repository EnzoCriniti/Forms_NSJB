/**
 * @file frontend/src/screens/createFormListHelpers.js
 * @summary Mutacoes puras de listas da criacao de formulario.
 * @responsibility Reordenar, alternar, atualizar, remover e anexar itens em listas do editor.
 */

export const moveItem = (items, index, direction) => {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(targetIndex, 0, item);
  return next;
};

export const toggleFieldShow = (fields, fieldId) => fields.map(item => (
  item.id === fieldId ? { ...item, show: !item.show } : item
));

export const removeFieldById = (fields, fieldId) => fields.filter(item => item.id !== fieldId);

export const updateListItemAtIndex = (items, index, value) => items.map((item, itemIndex) => (
  itemIndex === index ? value : item
));

export const removeListItemAtIndex = (items, index) => items.filter((_, itemIndex) => itemIndex !== index);

export const appendListItem = (items, value = "") => [...items, value];
