import { FlatPerformanceRecord } from "./mappers";

export const HORIZON_FIELD_CONFIG = [
  {
    key: "DAILY",
    label: "Daily",
    netField: "DAILY_NET_RETURN",
    grossField: "DAILY_GROSS_RETURN",
  },
  {
    key: "MTD",
    label: "MTD",
    netField: "CURRENT_MTD_NET_RETURN",
    grossField: "CURRENT_MTD_GROSS_RETURN",
  },
  {
    key: "3M",
    label: "3M",
    netField: "ROLLING_3M_NET_RETURN",
    grossField: "ROLLING_3M_GROSS_RETURN",
  },
  {
    key: "6M",
    label: "6M",
    netField: "ROLLING_6M_NET_RETURN",
    grossField: "ROLLING_6M_GROSS_RETURN",
  },
  {
    key: "12M",
    label: "12M",
    netField: "ROLLING_12M_NET_RETURN",
    grossField: "ROLLING_12M_GROSS_RETURN",
  },
] as const satisfies ReadonlyArray<{
  key: string;
  label: string;
  netField: keyof FlatPerformanceRecord;
  grossField: keyof FlatPerformanceRecord;
}>;
