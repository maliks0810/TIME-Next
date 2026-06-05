import { AnalyticsApiResponse, AnalyticsRow } from "./attributionRowModel";
import { PortBenchRow, SelectOption } from "./types";

export function mapToRows(api: AnalyticsApiResponse): AnalyticsRow[] {
  return api.data.map((node, i) => {
    const row: Record<string, string | number | null | undefined> = {
      id: `row-${i}`,
      benchmarkWeight: node.benchmarkWeight,
    };

    Object.assign(row, node.dimensions);

    node.portfolios.forEach((p) => {
      if (p.portfolioWeight !== undefined) {
        row[`${p.portfolio}|portfolioWeight`] = p.portfolioWeight;
      }

      p.periods.forEach((pb) => {
        pb.metrics.forEach((m) => {
          row[`${p.portfolio}|${pb.period}_${m.metric}`] = m.value;
        });
      });
    });

    return row as AnalyticsRow;
  });
}

export function buildPortfolioOptions(rows: ReadonlyArray<PortBenchRow>): SelectOption[] {
  const byKey = new Map<string, SelectOption>();

  for (const r of rows) {
    if (!byKey.has(r.PORTFOLIO_KEY)) {
      byKey.set(r.PORTFOLIO_KEY, {
        value: r.PORTFOLIO_KEY,
        label: `${r.PORTFOLIO_NAME} (${r.PORTFOLIO_KEY})`,
        group: r.PORTFOLIO_GROUP_CODE ?? undefined,
      });
    }
  }

  return Array.from(byKey.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  );
}
export function buildBenchmarkOptionsForPortfolio(
  rows: ReadonlyArray<PortBenchRow>,
  selectedPortfolioKey: string | null
): SelectOption[] {
  if (!selectedPortfolioKey) return [];

  const portfolioRows = rows.filter((r) => r.PORTFOLIO_KEY === selectedPortfolioKey);

  const options = new Map<string, SelectOption>();

  for (const r of portfolioRows) {
    if (r.PORTFOLIO_BENCHMARK_CODE || r.PORTFOLIO_BENCHMARK_NAME) {
      const value = r.PORTFOLIO_BENCHMARK_CODE ?? r.PORTFOLIO_BENCHMARK_NAME ?? '';
      if (value) {
        options.set(value, {
          value,
          label: r.PORTFOLIO_BENCHMARK_NAME
            ? `${r.PORTFOLIO_BENCHMARK_NAME}${r.PORTFOLIO_BENCHMARK_CODE ? ` (${r.PORTFOLIO_BENCHMARK_CODE})` : ''}`
            : value,
          group: 'Primary',
        });
      }
    }

    if (r.PORTFOLIO_SECONDARY_BENCHMARK_CODE || r.PORTFOLIO_SECONDARY_BENCHMARK_NAME) {
      const value = r.PORTFOLIO_SECONDARY_BENCHMARK_CODE ?? r.PORTFOLIO_SECONDARY_BENCHMARK_NAME ?? '';
      if (value) {
        options.set(value, {
          value,
          label: r.PORTFOLIO_SECONDARY_BENCHMARK_NAME
            ? `${r.PORTFOLIO_SECONDARY_BENCHMARK_NAME}${r.PORTFOLIO_SECONDARY_BENCHMARK_CODE ? ` (${r.PORTFOLIO_SECONDARY_BENCHMARK_CODE})` : ''}`
            : value,
          group: 'Secondary',
        });
      }
    }
  }

  return Array.from(options.values());
}
type GroupedOptions = ReadonlyArray<{
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}>;

export function buildGroupedPortfolioOptions(rows: ReadonlyArray<PortBenchRow>): GroupedOptions {
  const opts = buildPortfolioOptions(rows);
  const groups = new Map<string, Array<{ value: string; label: string }>>();

  for (const o of opts) {
    const g = o.group ?? 'Other';
    const arr = groups.get(g) ?? [];
    arr.push({ value: o.value, label: o.label });
    groups.set(g, arr);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, options]) => ({
      label,
      options: options.sort((x, y) => x.label.localeCompare(y.label)),
    }));
}