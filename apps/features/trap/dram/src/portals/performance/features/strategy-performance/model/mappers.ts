import { PerformanceSnapshotApiResponse } from "../api/types";

export type NullableNumber = number | null;
export type FlatPerformanceRecord = {
  SHARECLASS_KEY: string;
  AS_OF_DATE: string;

  DAILY_NET_RETURN: NullableNumber;
  DAILY_GROSS_RETURN: NullableNumber;

  CURRENT_MTD_NET_RETURN: NullableNumber;
  CURRENT_MTD_GROSS_RETURN: NullableNumber;

  ROLLING_3M_NET_RETURN: NullableNumber;
  ROLLING_3M_GROSS_RETURN: NullableNumber;

  ROLLING_6M_NET_RETURN: NullableNumber;
  ROLLING_6M_GROSS_RETURN: NullableNumber;

  ROLLING_12M_NET_RETURN: NullableNumber;
  ROLLING_12M_GROSS_RETURN: NullableNumber;
};


export function mapFlatRecordsToSnapshot(
  records: FlatPerformanceRecord[],
): PerformanceSnapshotApiResponse {
  return records.map((record) => ({
    shareClassKey: record.SHARECLASS_KEY,
    asOfDate: record.AS_OF_DATE,
    horizons: [
      {
        key: "DAILY",
        label: "Daily",
        netReturn: record.DAILY_NET_RETURN,
        grossReturn: record.DAILY_GROSS_RETURN,
      },
      {
        key: "MTD",
        label: "MTD",
        netReturn: record.CURRENT_MTD_NET_RETURN,
        grossReturn: record.CURRENT_MTD_GROSS_RETURN,
      },
      {
        key: "3M",
        label: "3M",
        netReturn: record.ROLLING_3M_NET_RETURN,
        grossReturn: record.ROLLING_3M_GROSS_RETURN,
      },
      {
        key: "6M",
        label: "6M",
        netReturn: record.ROLLING_6M_NET_RETURN,
        grossReturn: record.ROLLING_6M_GROSS_RETURN,
      },
      {
        key: "12M",
        label: "12M",
        netReturn: record.ROLLING_12M_NET_RETURN,
        grossReturn: record.ROLLING_12M_GROSS_RETURN,
      },
    ],
  }));
}