import { BreakdownPreset } from "./ConfigTabbedCompact";

// breakdownPresets.ts
export const BREAKDOWN_PRESETS: BreakdownPreset[] = [
  // ---- Equity ----
  {
    id: "gics-l1-l2",
    label: "GICS Sector → Industry Group",
    category: "equity",
    assetClass: "EQ",
    description: "Standard 2-level GICS drill-down",
    levels: [
      { dimensionId: "GICS", label: "GICS Sector",         group: "classification", assetClass: "EQ" },
      { dimensionId: "GICS_L2", label: "GICS Industry Group", group: "classification", assetClass: "EQ" },
    ],
  },
  {
    id: "gics-l1-l2-l3",
    label: "GICS Sector → Industry Group → Industry",
    category: "equity",
    assetClass: "EQ",
    levels: [
      { dimensionId: "GICS", label: "GICS Sector",         group: "classification", assetClass: "EQ" },
      { dimensionId: "GICS_L2", label: "GICS Industry Group", group: "classification", assetClass: "EQ" },
      { dimensionId: "GICS_L3", label: "GICS Industry",       group: "classification", assetClass: "EQ" },
    ],
  },

  // ---- Fixed Income ----
  {
    id: "region-rating-type",
    label: "Region → Rating → Type",
    category: "fixedIncome",
    assetClass: "EM",
    description: "Region→Corporate drill-down",
    levels: [
      { dimensionId: "REGION",         label: "Region",        group: "geo" },
      { dimensionId: "RATING",         label: "Credit Rating", group: "credit",         assetClass: "EM" },
      { dimensionId: "SECURITY_TYPE",  label: "Security Type", group: "classification", assetClass: "EM" },
    ],
  },
  {
    id: "bics-l1-l2",
    label: "BICS Sector → Industry Group",
    category: "fixedIncome",
    assetClass: "FI",
    levels: [
      { dimensionId: "BICS_L1", label: "BICS Sector",         group: "classification", assetClass: "FI" },
      { dimensionId: "BICS_L2", label: "BICS Industry Group", group: "classification", assetClass: "FI" },
    ],
  },
  {
    id: "region-rating-type",
    label: "Region → Rating → Type",
    category: "fixedIncome",
    assetClass: "FI",
    description: "Common EMD/Corporate drill-down",
    levels: [
      { dimensionId: "REGION",         label: "Region",        group: "geo" },
      { dimensionId: "RATING",         label: "Credit Rating", group: "credit",         assetClass: "FI" },
      { dimensionId: "SECURITY_TYPE",  label: "Security Type", group: "classification", assetClass: "FI" },
    ],
  },

  // ---- Universal (no assetClass) ----
  {
    id: "region-country",
    label: "Region → Country",
    category: "geo",
    // No assetClass — works everywhere
    levels: [
      { dimensionId: "REGION",  label: "Region",  group: "geo" },
      { dimensionId: "COUNTRY", label: "Country", group: "geo" },
    ],
  },
  {
    id: "region-country-currency",
    label: "Region → Country → Currency",
    category: "geo",
    levels: [
      { dimensionId: "REGION",   label: "Region",   group: "geo" },
      { dimensionId: "COUNTRY",  label: "Country",  group: "geo" },
      { dimensionId: "CURRENCY", label: "Currency", group: "geo" },
    ],
  },
  {
    id: "country-assetclass",
    label: "Country → Asset Class",
    category: "geo",
    levels: [
      { dimensionId: "COUNTRY",     label: "Country",     group: "geo" },
      { dimensionId: "ASSET_CLASS", label: "Asset Class", group: "classification" },
    ],
  },
];