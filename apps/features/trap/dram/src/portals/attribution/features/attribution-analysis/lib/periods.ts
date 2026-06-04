export const periodKeyMap = {
  DAILY: "DAILY",
  MTD: "MTD",
  QTD: "QTD",
  YTD: "YTD",
  "1Y": "Y1",
  "2Y": "Y2",
  "3Y": "Y3",
  "4Y": "Y4",
  "5Y": "Y5",
  "6Y": "Y6",
  "7Y": "Y7",
  "8Y": "Y8",
  "9Y": "Y9",
  "10Y": "Y10",
  "15Y": "Y15",
  "20Y": "Y20",
  SI: "SI",
} as const;

export type PeriodCode = keyof typeof periodKeyMap;
