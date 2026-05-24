/**
 * @file frontend/src/features/admin/adminSettingsShared.jsx
 * @summary Agregador historico dos helpers compartilhados do admin.
 * @responsibility Manter reexports de compatibilidade para modulos administrativos ja extraidos.
 */

export {
  ADMIN_INPUT_STYLE,
  PAGE_SIZE,
  fieldCategoryLabels,
  fieldTypeLabels,
  getExternalBaseName,
  normalizeFieldSelectionSource,
  normalizeIdentifier,
  taskCategoryLabels,
} from "./adminSettingsConstants";
export { PaginatedList } from "./adminPaginatedList";
export { FieldCatalogPreview } from "./adminFieldPreview";
export { GridSchemaEditor } from "./adminGridSchemaEditor";
export { AuditLogsPanel } from "./adminAuditLogsPanel";
export { AdminField } from "./adminField";
