

/**
 * Adapter helpers to bridge between:
 *  - The catalog-based column model used by DRAM grid config
 *    (`GridConfigResponse.columnConfigs.all` with `id`, `label`, `order`, `visible`, ...)
 *  - The DriverColumnConfigurator model (`key`, `title`, `dataIndex`, ...)
 *
 * Keeps a single source of truth for the mapping so multiple screens
 * (ConfigTabbedCompact, DriverControlDrawer, etc.) stay in sync.
 */

import { GridConfigResponse } from "../../dram-grid/types";
import { DriverColumnConfigItem, DriverColumnConfigState } from "../../driver-analysis-config/columnConfigTypes";

// ---------- Types ----------

/**
 * Minimal shape we require from the source catalog entry.
 *
 * Optional fields accept `null` in addition to `undefined` to match
 * how API contracts (e.g., `ApiColumnConfig`) commonly emit "unset"
 * values. The adapter normalizes `null` -> dropped when forwarding
 * to `DriverColumnConfigItem`, which stays strict (`string | undefined`).
 */
export interface CatalogColumn {
  id: string;
  label: string;
  order?: number | null;
  visible?: boolean | null;
  width?: number | null;
  align?: "left" | "center" | "right" | null;
  group?: string | null;
}

export type CatalogColumnLike = Pick<CatalogColumn, "id" | "label"> &
  Partial<CatalogColumn>;

// ---------- Single-item adapters ----------

/**
 * Convert a catalog column entry into a DriverColumnConfigItem.
 * Extra catalog metadata (width, align, group) is forwarded when present.
 * `null` values are treated identically to `undefined` (field is omitted).
 */
export function catalogColumnToConfigItem(
  column: CatalogColumnLike,
): DriverColumnConfigItem {
  return {
    key: column.id,
    title: column.label,
    dataIndex: column.id,
    // `!= null` catches both `null` and `undefined` — idiomatic guard.
    ...(column.width != null ? { width: column.width } : {}),
    ...(column.align != null ? { align: column.align } : {}),
    ...(column.group != null ? { group: column.group } : {}),
  } as DriverColumnConfigItem;
}

/**
 * Convert a DriverColumnConfigItem back to its catalog id.
 * (Selection is stored as an ordered id list in most callers.)
 */
export function configItemToId(item: DriverColumnConfigItem): string {
  return item.key;
}

// ---------- Helpers ----------

/** Safe numeric fallback for sort keys that may be null/undefined. */
const orderKey = (c: CatalogColumnLike): number => c.order ?? 0;

// ---------- State adapters ----------

/**
 * Build a DriverColumnConfigState from a catalog + ordered selected ids.
 *
 * Guarantees:
 *  - `selectedColumns` preserves the order of `selectedColumnIds`.
 *  - `availableColumns` contains everything else, sorted by catalog `order`
 *    (falls back to 0 when `order` is null/undefined).
 *  - Unknown ids in `selectedColumnIds` are silently skipped.
 */
export function toColumnConfigState(
  catalog: readonly CatalogColumnLike[],
  selectedColumnIds: readonly string[],
): DriverColumnConfigState {
  const byId = new Map(catalog.map((c) => [c.id, c]));
  const selectedSet = new Set(selectedColumnIds);

  const selectedColumns = selectedColumnIds
    .map((id) => byId.get(id))
    .filter((c): c is CatalogColumnLike => Boolean(c))
    .map(catalogColumnToConfigItem);

  const availableColumns = catalog
    .filter((c) => !selectedSet.has(c.id))
    .slice()
    .sort((a, b) => orderKey(a) - orderKey(b))
    .map(catalogColumnToConfigItem);

  return { availableColumns, selectedColumns };
}

/**
 * Extract the ordered list of selected column ids from a
 * DriverColumnConfigState. Use in change handlers to update
 * state models that store selection as a string[] of ids.
 */
export function fromColumnConfigState(
  state: DriverColumnConfigState,
): string[] {
  return state.selectedColumns.map(configItemToId);
}

// ---------- Convenience: default builders ----------

/**
 * Build an initial DriverColumnConfigState from a catalog using
 * each entry's `visible` flag as the default selection. Preserves
 * catalog `order` in both the selected and available lists.
 *
 * Selection rule: a column is selected by default unless `visible === false`.
 * `null` and `undefined` are treated as "visible" (opt-out semantics).
 */
export function buildDefaultColumnConfigState(
  catalog: readonly CatalogColumnLike[],
): DriverColumnConfigState {
  const orderedCatalog = catalog
    .slice()
    .sort((a, b) => orderKey(a) - orderKey(b));

  const defaultSelectedIds = orderedCatalog
    .filter((c) => c.visible !== false)
    .map((c) => c.id);

  return toColumnConfigState(orderedCatalog, defaultSelectedIds);
}

/**
 * Same as buildDefaultColumnConfigState, but starts from a
 * full GridConfigResponse (skips the intermediate catalog extract).
 */
export function buildDefaultColumnConfigStateFromGrid(
  config: GridConfigResponse,
): DriverColumnConfigState {
  return buildDefaultColumnConfigState(config.columnConfigs.all);
}

/**
 * Build a DriverColumnConfigState from a GridConfigResponse plus
 * an explicit list of selected ids (e.g., loaded from a saved view).
 */
export function toColumnConfigStateFromGrid(
  config: GridConfigResponse,
  selectedColumnIds: readonly string[],
): DriverColumnConfigState {
  return toColumnConfigState(config.columnConfigs.all, selectedColumnIds);
}