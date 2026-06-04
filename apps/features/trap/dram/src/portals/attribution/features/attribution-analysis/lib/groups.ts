import { SelectProps } from "antd";

export const groupingOptions: NonNullable<SelectProps["options"]> = [
  // Equity standard groupings
  { label: "GICS Sector", value: "GICS1" },
//   { label: "GICS Industry Group", value: "GICS2" },
//   { label: "GICS Industry", value: "GICS3" },
//   { label: "GICS Sub-Industry", value: "GICS4" },

  // { label: "Style (Russell / S&P)", value: "STYLE" },                 // Style – Russell and S&P
  { label: "Market Cap Bucket", value: "MktCap" },                      // Market Capitalization
  { label: "PE Forward", value: "PEfwd" },                              // PE Forward
  // { label: "Country", value: "COUNTRY" },                              // Country/Region groupings
  // { label: "Region", value: "REGION" },                                // Country/Region groupings
  // { label: "Currency", value: "CURRENCY" },                            // Currency

  // { label: "Long / Short", value: "LONG_SHORT" },                      // Long/Short grouping
  // { label: "Portfolio / Benchmark", value: "PORT_BENCH" },             // Portfolio/Benchmark grouping

  // { label: "Security", value: "SECURITY" },                            // Security-level grouping
];


export const noneOption: NonNullable<SelectProps["options"]>[number] = {
  label: "(None)",
  value: "",
};

export const groupingWithNoneOptions: NonNullable<SelectProps["options"]> = [
  noneOption,
  ...groupingOptions,
];