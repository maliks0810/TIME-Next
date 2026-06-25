import { MonthRow } from "./types";

type ApiMonth = {
  month_name: string;
  total_reports: number;
  is_validated: boolean;
};

type ApiResponse = {
  months: ApiMonth[];
};

export const mapMonthsToRows = (data: ApiResponse): MonthRow[] => {
  return data.months.map((m, index) => ({
    key: index + 1, // ✅ required for AntD Table
    month_name: m.month_name,
    total_reports: m.total_reports,
    is_validated: m.is_validated,
    month_end: toMonthEndDate(m.month_name),
  }));
};

const MONTH_MAP: Record<string, number> = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

export const toMonthEndDate = (monthName: string): string => {
  const [monthStr, yearStr] = monthName.split(" ");

  const month = MONTH_MAP[monthStr];
  const year = Number(yearStr);

  const lastDay = new Date(year, month + 1, 0);

  return lastDay.toISOString().slice(0, 10);
};


export const toMonthName = (dateStr: string): string => {
  const date = new Date(dateStr);

  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();

  return `${month} ${year}`;
};


export const generateMonthRange = (
  start: string // "YYYY-MM"
): string[] => {
  const [startYear, startMonth] = start.split("-").map(Number);

  const startDate = new Date(startYear, startMonth - 1);
  const now = new Date();

  //  current month - 1
  const endDate = new Date(now.getFullYear(), now.getMonth() - 1);

  const months: string[] = [];

  let current = new Date(startDate);

  while (current <= endDate) {
    const monthName = current.toLocaleString("default", {
      month: "long",
    });
    const year = current.getFullYear();

    months.push(`${monthName} ${year}`);

    current.setMonth(current.getMonth() + 1);
  }

  return months;
};

export const toMonthEndDateObj = (month: string): Date =>
  new Date(toMonthEndDate(month));
