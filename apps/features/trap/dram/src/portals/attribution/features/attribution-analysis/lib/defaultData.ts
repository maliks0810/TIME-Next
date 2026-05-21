import { WorkflowState } from "./services";

export const defaultWizardState: WorkflowState = {
  frequencyMode: "Daily",
  portfolios: ["6614T"],
  benchmarks: ["Russell 1000 Growth Index"],

  asOfDate: "",
  startDate: "2026-05-01",
  endDate: "2026-05-31",

  baseCurrency: "USD",
  carveOut: "None",

  periods: ["MTD", "QTD", "YTD", "1Y"],
  filters: [""],

  primaryGrouping: "GICS1",
  secondaryGrouping: "",
  tertiaryGrouping: "",

  metrics: [
    "Port. Total Contribution",
    "Bench. Total Contribution",
    "Allocation Effect",
    "Selection Effect",
    "Interaction Effect",
  ],

  layoutMode: "Grouped Grid",
  detailPanels: ["Notes", "Validation", "Contributors"],
};
