import type { AssetClass } from "../../lib/types";
import type { BreakdownLevel, BreakdownPreset } from "./ConfigTabbedCompact";

/**
 * True if the dimension applies to the given asset class.
 * Universal dimensions (undefined assetClass) always apply.
 */
export function isDimensionAvailableForAssetClass(
  dimension: BreakdownLevel,
  assetClass: AssetClass | null,
): boolean {
  if (!assetClass) return true;
  if (!dimension.assetClass) return true; // universal
  return dimension.assetClass === assetClass;
}

/**
 * True if the preset applies to the given asset class.
 * Explicit assetClass wins; otherwise inferred from levels
 * (preset is valid if ALL its levels validate).
 */
export function isPresetAvailableForAssetClass(
  preset: BreakdownPreset,
  assetClass: AssetClass | null,
): boolean {
  if (!assetClass) return true;

  if (preset.assetClass) {
    return preset.assetClass === assetClass;
  }

  return preset.levels.every((level) =>
    isDimensionAvailableForAssetClass(level, assetClass),
  );
}

export function filterDimensionsForAssetClass(
  dimensions: BreakdownLevel[],
  assetClass: AssetClass | null,
): BreakdownLevel[] {
  return dimensions.filter((d) => isDimensionAvailableForAssetClass(d, assetClass));
}

export function filterPresetsForAssetClass(
  presets: BreakdownPreset[],
  assetClass: AssetClass | null,
): BreakdownPreset[] {
  return presets.filter((p) => isPresetAvailableForAssetClass(p, assetClass));
}

/**
 * True if every level in the chain is valid for the given asset class.
 * Used to detect stale chains after asset class changes.
 */
export function isChainValidForAssetClass(
  chain: { levels: BreakdownLevel[] },
  assetClass: AssetClass | null,
): boolean {
  return chain.levels.every((level) =>
    isDimensionAvailableForAssetClass(level, assetClass),
  );
}