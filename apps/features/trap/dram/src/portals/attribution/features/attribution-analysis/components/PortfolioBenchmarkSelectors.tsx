import React, { useMemo, useState } from 'react';
import { Select } from 'antd';
import type { SelectProps } from 'antd';
import { PortBenchRow } from '../lib/types';
import { buildBenchmarkOptionsForPortfolio, buildPortfolioOptions } from '../lib/apiUIMapper';

type Props = Readonly<{
  rows: ReadonlyArray<PortBenchRow>;
}>;

export function PortfolioBenchmarkSelectors({ rows }: Props) {
  const [portfolioKey, setPortfolioKey] = useState<string | null>(null);
  const [benchmarkId, setBenchmarkId] = useState<string | null>(null);

  const portfolioOptions = useMemo(() => buildPortfolioOptions(rows), [rows]);

  const benchmarkOptions = useMemo(
    () => buildBenchmarkOptionsForPortfolio(rows, portfolioKey),
    [rows, portfolioKey]
  );

  // optional: auto-select first benchmark when portfolio changes
  React.useEffect(() => {
    if (!portfolioKey) {
      setBenchmarkId(null);
      return;
    }
    const first = benchmarkOptions[0]?.value ?? null;
    setBenchmarkId(first);
  }, [portfolioKey, benchmarkOptions]);

  const portfolioSelectOptions: SelectProps['options'] =
    portfolioOptions.map((o) => ({ value: o.value, label: o.label }));

  const benchmarkSelectOptions: SelectProps['options'] =
    benchmarkOptions.map((o) => ({ value: o.value, label: o.label }));

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <Select
        style={{ minWidth: 320 }}
        placeholder="Portfolio"
        options={portfolioSelectOptions}
        value={portfolioKey ?? undefined}
        onChange={(v) => setPortfolioKey(v)}
        showSearch
        optionFilterProp="label"
      />

      <Select
        style={{ minWidth: 360 }}
        placeholder="Benchmark"
        options={benchmarkSelectOptions}
        value={benchmarkId ?? undefined}
        onChange={(v) => setBenchmarkId(v)}
        disabled={!portfolioKey}
        showSearch
        optionFilterProp="label"
      />
    </div>
  );
}