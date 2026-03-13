/* eslint-disable @typescript-eslint/no-explicit-any */

import { Menu } from 'antd';
import {
    AnalystLinesEnum,
    AnalystPerformanceResultType,
    SideMetrics
} from './types';

const normalizePeriodStart = (start: unknown): string | null => {
  if (typeof start !== 'string') return null;
  if (!start.endsWith('Z')) return null;

  const d = new Date(start);
  return isNaN(d.getTime()) ? null : start;
};

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`; // Change configuration here
};

export const formatCash = (num: number) =>
    num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatNegativeNumber = (value: any) => {
    const number = Number(value);
    if (number < 0) {
        return `(${Math.abs(number).toFixed(2)})`;
    }
    return number.toFixed(2);
};

export const menu = () => {
    return (
        <Menu>
            <Menu.Item key="0">
                <a href="/prism/equity-research/analyst-coverage">Analyst Coverage</a>
            </Menu.Item>
            <Menu.Item key="1">
                <a href="/prism/equity-research/analyst-performance">Analyst Performance</a>
            </Menu.Item>
            <Menu.Item key="2">
                <a href="/prism/equity-research/analyst-buylist">Buy/Drop List</a>
            </Menu.Item>
        </Menu>
    );
};

export default function FormatPercent({ value }: { value: number }) {
    if (value == null) return null;

    const abs = Math.abs(value * 100).toFixed(2);
    const formatted = value < 0 ? `(${abs}) %` : `${abs} %`;
    const color = value < 0 ? '#A33A29' : '#175340';

    return <span style={{ color }}> {formatted} </span>;
}

export function FormatBMPercent({ value }: { value: number }) {
    if (value === null) return null;
    const val = Math.abs(value * 100).toFixed(2);
    return `${val} %`;
}

export function normalizeKpiPeriodLabel(raw?: string):
  | 'MTD'
  | 'MTD1'
  | 'QTD'
  | 'QTD1'
  | 'YTD'
  | '1Year'
  | '3Year'
  | '5Year'
  | 'Max'
  | string {
  if (!raw) return 'YTD';

  const key = raw.trim().toUpperCase();
  if (key === 'MTD1') return 'MTD1';
  if (key === 'QTD1') return 'QTD1';

  if (key === 'MTD') return 'MTD';
  if (key === 'QTD') return 'QTD';

  if (key === 'YTD') return 'YTD';
  if (key === '1Y' || key === '1YEAR') return '1Year';
  if (key === '3Y' || key === '3YEAR') return '3Year';
  if (key === '5Y' || key === '5YEAR') return '5Year';
  if (key === 'MAX') return 'Max';

  return raw.trim();
}

export function analystPerformanceDataConverter({
  data,
  selectedLines,
  selectedNames,
  selectedPeriodKey,
}: {
  data: AnalystPerformanceResultType[] | any;
  selectedNames: string[];
  selectedLines: AnalystLinesEnum[];
  selectedPeriodKey?: string;
}) {
  const toPct = (v?: number | null) => (v === 0 || v ? v * 100 : null);

  // GQL can hand you: array OR wrapper objects depending on where you extract results
  const rows: any[] = Array.isArray(data)
    ? data
    : (data?.equitiesAnalystPerformanceFilter?.results?.results ??
        data?.results?.results ??
        data?.results ??
        []);

  const normalizePeriodLabelLocal = (raw?: string): string => {
    if (!raw) return 'YTD';
    const key = raw.trim().toUpperCase();
    if (key === 'MTD1') return 'MTD1';
    if (key === 'QTD1') return 'QTD1';
    if (key === 'MTD') return 'MTD';
    if (key === 'QTD') return 'QTD';
    if (key === 'YTD') return 'YTD';
    if (key === '1Y' || key === '1YEAR') return '1Year';
    if (key === '3Y' || key === '3YEAR') return '3Year';
    if (key === '5Y' || key === '5YEAR') return '5Year';
    if (key === 'MAX') return 'Max';
    return raw.trim();
  };

  const selectedAnalysts = (rows ?? []).filter((a: any) => selectedNames.includes(a?.name));

  // ----- Daily axis -----
  const allDatesDaily = new Set<string>();
  selectedAnalysts.forEach((a: any) => {
    (a?.returns ?? []).forEach((r: any) => {
      if (r?.date) allDatesDaily.add(r.date);
    });
  });

  const sortedDatesDaily = Array.from(allDatesDaily).sort((a, b) => Date.parse(a) - Date.parse(b));

  const analystPerformanceDataPoints = {
    dates: sortedDatesDaily,
    series: selectedAnalysts.flatMap((analyst: any) => {
      const color = generateColor(analyst.name);
      const byDate = new Map<string, any>();
      (analyst?.returns ?? []).forEach((r: any) => r?.date && byDate.set(r.date, r));

      const out: any[] = [];

      if (selectedLines.includes(AnalystLinesEnum.ANALYST_PERFORMANCE)) {
        out.push({
          name: formatAnalystPerformanceLabel(`${analyst.name}`),
          type: 'line',
          data: sortedDatesDaily.map((d) => toPct(byDate.get(d)?.analystPerformance)),
          lineStyle: { color, width: 2, type: 'solid' },
          itemStyle: { color },
          showSymbol: false,
          symbolSize: 4,
          emphasis: { focus: 'series', showSymbol: true, symbolSize: 5 },
          connectNulls: true,
        });
      }

      if (selectedLines.includes(AnalystLinesEnum.BENCHMARK_PERFORMANCE)) {
        out.push({
          name: 'Benchmark',
          type: 'line',
          data: sortedDatesDaily.map((d) => toPct(byDate.get(d)?.benchmarkPerformance)),
          lineStyle: { color, width: 2, type: 'dotted' },
          itemStyle: { color },
          showSymbol: false,
          symbolSize: 4,
          emphasis: { focus: 'series', showSymbol: true, symbolSize: 5 },
          connectNulls: true,
        });
      }

      if (selectedLines.includes(AnalystLinesEnum.EXCESS_RETURN)) {
        out.push({
          name: formatAnalystPerformanceLabel(`${analyst.name}_excess_return`),
          type: 'line',
          data: sortedDatesDaily.map((d) => toPct(byDate.get(d)?.excessReturn)),
          lineStyle: { color, width: 2, type: 'dashed' },
          itemStyle: { color },
          showSymbol: false,
          symbolSize: 4,
          emphasis: { focus: 'series', showSymbol: true, symbolSize: 5 },
          connectNulls: true,
        });
      }

      return out;
    }),
  };

  // ----- Annual excess returns (from annualizedReturns) -----
  const latestAnnualPointByYear = (arr: any[] | undefined | null) => {
    const perYear = new Map<number, { ts: number; excessReturn: number | null }>();
    (arr ?? []).forEach((r: any) => {
      const ts = Date.parse(r?.date);
      if (!Number.isFinite(ts)) return;
      const year = new Date(ts).getUTCFullYear();
      const prev = perYear.get(year);
      if (!prev || ts > prev.ts) perYear.set(year, { ts, excessReturn: r?.excessReturn ?? null });
    });
    return perYear;
  };

  const analystYearMaps = selectedAnalysts.map((a: any) => ({
    analyst: a,
    color: generateColor(a.name),
    yearMap: latestAnnualPointByYear(a?.annualizedReturns),
  }));

  const periodKey = (selectedPeriodKey ?? '').toUpperCase();

  const buildAnnualAxis = () => {
    const earliestDateByYear = new Map<number, string>();

    sortedDatesDaily.forEach((d) => {
      const ts = Date.parse(d);
      if (!Number.isFinite(ts)) return;
      const year = new Date(ts).getUTCFullYear();
      if (!earliestDateByYear.has(year)) earliestDateByYear.set(year, d);
    });

    if (earliestDateByYear.size === 0) {
      selectedAnalysts.forEach((a: any) => {
        (a?.annualizedReturns ?? []).forEach((r: any) => {
          const ts = Date.parse(r?.date);
          if (!Number.isFinite(ts)) return;
          const year = new Date(ts).getUTCFullYear();
          const curr = earliestDateByYear.get(year);
          if (!curr || ts < Date.parse(curr)) earliestDateByYear.set(year, r.date);
        });
      });
    }

    const sortedYears = Array.from(earliestDateByYear.keys()).sort((a, b) => a - b);
    const annualDates = sortedYears.map((y) => earliestDateByYear.get(y)!);

    const partialLabel =
      periodKey === 'MTD' || periodKey === 'QTD' || periodKey === 'YTD' ? periodKey : null;

    const annualLabels = sortedYears.map((y, idx) => {
      const isLast = idx === sortedYears.length - 1;
      return isLast && partialLabel ? partialLabel : String(y);
    });

    return { sortedYears, annualDates, annualLabels };
  };

  const { sortedYears, annualDates, annualLabels } = buildAnnualAxis();

  const excessReturnsDataPoints = {
    dates: annualDates,
    labels: annualLabels,
    series: analystYearMaps.flatMap(({ analyst, color, yearMap }) => [
      {
        name: formatAnalystPerformanceLabel(`${analyst.name}`),
        type: 'bar',
        barMaxWidth: '30px',
        data: sortedYears.map((year) => {
          const v = yearMap.get(year)?.excessReturn;
          return v != null ? v * 100 : null;
        }),
        itemStyle: { color },
        showSymbol: false,
        symbolSize: 4,
      },
    ]),
  };

  // ----- KPI table -----
  const kpiDataPoints: { series: any[] } = {
    series: selectedAnalysts.map((analyst: any) => {
      const color = generateColor(analyst.name);
      const periods = (analyst?.performanceMetrics?.periods ?? [])
        .filter((p: any) => {
          const raw = p?.periodLabel ?? p?.label ?? p?.name ?? '';
          const key = String(raw).trim().toUpperCase();
          return key !== 'MTD' && key !== 'QTD'; // keep MTD1/QTD1
        })
        .map((p: any, idx: number) => {
          const rawLabel = p?.periodLabel ?? p?.label ?? p?.name ?? `PERIOD_${idx}`;
          const periodLabel = normalizePeriodLabelLocal(rawLabel);

          const portfolio = (p?.portfolio ?? {}) as SideMetrics;
          const benchmark = (p?.benchmark ?? {}) as SideMetrics;
          const excess = (p?.excess ?? {}) as { diff?: number; relative?: number };

          // GQL can null these because DateTime serialization fails on backend; keep them safe
          const start = normalizePeriodStart(p?.start);
          const end = normalizePeriodStart(p?.end);

          return {
            periodLabel,
            start,
            end,
            portfolio: {
              totalReturnPct: toPct(portfolio.totalReturn),
              cagr: toPct(portfolio.cagr),
              volAnnPct: toPct(portfolio.volAnn),
              sharpeAnn: (portfolio as any).sharpeAnn ?? null,
              maxDrawdownPct: toPct(portfolio.maxDrawdown),
            },
            benchmark: {
              totalReturnPct: toPct(benchmark.totalReturn),
              cagr: toPct(benchmark.cagr),
              volAnnPct: toPct(benchmark.volAnn),
              sharpeAnn: (benchmark as any).sharpeAnn ?? null,
              maxDrawdownPct: toPct(benchmark.maxDrawdown),
            },
            excess: {
              diffPct: toPct(excess.diff),
              relativePct: toPct(excess.relative),
            },
          };
        });

      return { name: analyst.name, color, periods };
    }),
  };

  return { analystPerformanceDataPoints, excessReturnsDataPoints, kpiDataPoints };
}

export const ANALYST_COLOR_PALETTE = [
  '#000000',
  '#013D7D',
  '#4B773D',
  '#6C1444',
  '#DB9F00',
  '#654D88',
  '#904529',
  '#CB197B',
  '#D76712',
  '#CE1F00',
  '#D4D4D4',
  '#FF637F',
  '#2B5876',
  '#4E4376',
  '#79CBCA',
  '#EDE574',
  '#AA076B',
] as const;

const NAME_TO_COLOR = new Map<string, string>();
let nextColorIndex = 0;

export function generateColor(name: string): string {
  const existing = NAME_TO_COLOR.get(name);
  if (existing) return existing;

  const color =
    ANALYST_COLOR_PALETTE[nextColorIndex % ANALYST_COLOR_PALETTE.length];

  NAME_TO_COLOR.set(name, color);
  nextColorIndex += 1;

  return color;
}

export const getCurrentDate = () => new Date().toISOString().split('T')[0];
export const getStartDate = (period: string) => {
    const now = new Date();

    switch (period) {
        case 'MTD':
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        case 'QTD':
            const currQUarter = Math.floor(now.getMonth() / 3);
            const quarterStartMonth = currQUarter * 3;
            return `${now.getFullYear()}-${String(quarterStartMonth + 1).padStart(2, '0')}-01`;
        case 'YTD':
            return `${now.getFullYear()}-01-01`;
        case '1Y':
            now.setFullYear(now.getFullYear() - 1);
            return now.toISOString().split('T')[0];
        case '3Y':
            now.setFullYear(now.getFullYear() - 3);
            return now.toISOString().split('T')[0];
        case '5Y':
            now.setFullYear(now.getFullYear() - 5);
            return now.toISOString().split('T')[0];
        case 'Max':
            return '0001-01-01';
        default:
            return getCurrentDate();
    }
};

export const formatAnalystPerformanceLabel = (label: string) =>
    label
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
