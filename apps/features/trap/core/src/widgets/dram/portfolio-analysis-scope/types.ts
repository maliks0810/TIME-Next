export interface PACWidgetEmitValues {
  [key: string]: string;
  
  portfolioScope: string;  
  portfolio: string;
  portfolioName: string;
  benchmarkCode: string;
  benchmarkName: string;
  secondaryBenchmarkCode: string;
  secondaryBenchmarkname: string;
  startDate: string;
  endDate: string;
  assetClass: string;
  frequency: string;
  breakdown: string;
  periodList: string;
}

export interface Portfolio {
  portfolioNumber: string;
  portfolioName: string;
  benchmarkCode: string;
  secondaryBenchmarkCode?: string;
  benchmarkName: string;
  secondaryBenchmarkName?: string;
  portfolioGroupCode: string;
  dateInception: string;
  assetClass: string;
  strategy: string;
  isAUMPortfolio: boolean;
  portfolioType: string;
  isSocialResponsible: boolean;
  baseMarketValue: string;
  localMarketValue: string;
  account: string;
  region: string;
  regionCode: string;
  portfolioManagerName: string;
  pmLoginName: string;
  isMine?: boolean;
}

export interface SelectedFilters {
  strategy: string[];
  benchmark: string[];
  region: string[];
  account: string[];
  aum: string[]
}

export interface Group {
  id?: string;
  name: string;
  portfolioSelectionIds?: string[];
  // to add
  isSmart?: boolean,
  filters?: Filters[]
  favPortfolioIds?: string[]
  views?: SavedView[];
}

export interface Model {
  id?: number;
  name: string;
  securities: Security[]
}

export interface Security {
  name: string;
  code: string;
  target?: number;
}

export type FilterPanel = | "strategy" | "benchmark" | "region" |  "account" | "aum" | null;

export interface Filters {
  strategyItems: string[],
  benchmarkItems: string[],
  regionItems: string[],
  accountItems: string[],
  aumItems: string[]
}


export interface ShareResult {
  link: string;
  recipients: string[];
  count: number;
}

export type Access = "view" | "edit";

export interface Colleague {
  name: string;
  role: string;
  initials: string;
}



/** A named saved view within a group — its own breakdown / periods / metrics / display. */
export interface SavedView {
  id: string;
  name: string;
  cfg: ViewConfig;
}

export interface ViewConfig {
  levels: BreakdownLevel[];
  periods: string[];
  staticM: Record<string, boolean>;
  periodM: Record<string, boolean>;
  showBench: boolean;
  showBars: boolean;
  sort: SortState;
}

export interface SortState {
  col: string | null;
  dir: 1 | -1;
}


export type BreakdownLevel =
  | AttributeLevel
  | BandLevel
  | NtileLevel
  | ConditionalLevel;

/** Stable per-level id (assigned lazily by the store) so drag-reorder can track
 *  items by identity, not by array index. Optional on the type; guaranteed present
 *  on the active levels via ensureLevelIds. */
export interface AttributeLevel {
  id?: string;
  cls: "attribute";
  config: { field: string };
}
export interface BandLevel {
  id?: string;
  cls: "band";
  config: { attr: string; bands: Band[]; unmatched?: UnmatchedPolicy };
}
export interface NtileLevel {
  id?: string;
  cls: "ntile";
  config: { attr: string; n: number; dir: "asc" | "desc" };
}
export interface ConditionalLevel {
  id?: string;
  cls: "conditional";
  config: { groups: RuleGroup[]; unmatched?: UnmatchedPolicy };
}

/* ===================== breakdown levels (discriminated union) ===================== */

export type CompareOp = "≤" | "<" | "≥" | ">" | "=" | "between";

export interface Band {
  label: string;
  op: CompareOp;
  val: number | string;
  val2?: number | string;
  color: string;
}

export interface Rule {
  attr: string;
  op: CompareOp;
  val: number | string;
  join?: "AND" | "OR";
}

export interface RuleGroup {
  name: string;
  color: string;
  rules: Rule[];
}

export type UnmatchedPolicy = "bucket" | "exclude";

/* ===================== periods ===================== */

export type CustomKind = "range" | "trailing" | "itd";

export interface CustomPeriod {
  key: string;
  label: string;
  kind: CustomKind;
  start?: string;
  end?: string;
  dur?: number | string;
  unit?: "D" | "M" | "Y";
  factor: number;
  seed: number;
}


/* ===================== Library Utility types ===================== */

export interface OptionType {
  label: string;
  value: string;
}