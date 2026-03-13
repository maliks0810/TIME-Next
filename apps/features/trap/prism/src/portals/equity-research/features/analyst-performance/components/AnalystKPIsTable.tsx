import React, { useEffect, useMemo, useState } from 'react';
import { Descriptions, Pagination, Empty, Typography, Space, Divider } from 'antd';
import { formatAnalystPerformanceLabel } from '../../../lib/helpers';
import styles from '../lib/performance.module.scss';

type SideBlock = {
  totalReturnPct: number | null;
  cagr: number | null
  volAnnPct: number | null;
  sharpeAnn: number | null;
  maxDrawdownPct: number | null;
};

type KpiPeriod = {
  periodLabel: 'MTD' | 'MTD1' | 'QTD' | 'QTD1' | 'YTD' | '1Year' | '3Year' | '5Year' | 'Max' | string;
  portfolio: SideBlock;
  benchmark: SideBlock;
  excess: {
    diffPct: number | null;
    relativePct: number | null;
  };
};

type AnalystKpiSeries = {
  name: string;
  color?: string;
  periods: KpiPeriod[];
};

type FlattenedRow = {
  name: string;
  color?: string;
  portfolio: SideBlock;
  benchmark: SideBlock;
  excess: {
    diffPct: number | null;
    relativePct: number | null;
  };
};

type KpiData =
  | {
      series: AnalystKpiSeries[];
    }
  | null
  | undefined;

type Props = {
  kpiData: KpiData;
  loading?: boolean;
  selectedRange?: string;
};

const dash = '—';

const toPercent = (v: number | null, digits = 2) =>
  v === null || v === undefined ? dash : `${v.toFixed(digits)}%`;

const toNumber = (v: number | null, digits = 2) =>
  v === null || v === undefined ? dash : v.toFixed(digits);

const Dot: React.FC<{ color?: string }> = ({ color = '#999' }) => (
  <span
    aria-hidden
    style={{
      display: 'inline-block',
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: color,
      marginRight: 8,
      verticalAlign: 'middle',
    }}
  />
);

function normalizeSelectedRange(raw?: string) {
  const value = (raw ?? 'YTD').trim();
  const key = value.toUpperCase();

  if (key === 'MTD1') return 'MTD1';
  if (key === 'QTD1') return 'QTD1';

  if (key === 'MTD') return 'MTD';
  if (key === 'QTD') return 'QTD';

  if (key === 'YTD') return 'YTD';
  if (key === '1Y' || key === '1YEAR') return '1Year';
  if (key === '3Y' || key === '3YEAR') return '3Year';
  if (key === '5Y' || key === '5YEAR') return '5Year';
  if (key === 'MAX') return 'Max';
  return value;
}

function getPreferredKey(selectedKey: string) {
  if (selectedKey === 'MTD') return 'MTD1';
  if (selectedKey === 'QTD') return 'QTD1';
  return selectedKey;
}

const AnalystKPIsTable: React.FC<Props> = ({ kpiData, loading, selectedRange }) => {
  const selectedKey = useMemo(() => normalizeSelectedRange(selectedRange), [selectedRange]);
  const preferredKey = useMemo(() => getPreferredKey(selectedKey), [selectedKey]);
  
  function toDisplayLabel(label: string) {
    if (label === 'MTD1') return 'MTD';
    if (label === 'QTD1') return 'QTD';
    return label;
  }

  const EMPTY_SIDE: SideBlock = useMemo(
    () => ({
      totalReturnPct: null,
      cagr: null,
      volAnnPct: null,
      sharpeAnn: null,
      maxDrawdownPct: null,
    }),
    []
  );

  const EMPTY_EXCESS = useMemo(
    () => ({
      diffPct: null,
      relativePct: null,
    }),
    []
  );

  const series: FlattenedRow[] = useMemo(() => {
    const src = kpiData?.series ?? [];

    return src.map((a) => {
      const periods = a.periods ?? [];

      // Prefer MTD1/QTD1 when applicable; otherwise use YTD
      const picked =
        periods.find((p) => p.periodLabel === preferredKey) ||
        ((selectedKey === 'MTD' || selectedKey === 'QTD') ? undefined : periods.find((p) => p.periodLabel === selectedKey)) ||
        periods.find((p) => p.periodLabel === 'YTD') ||
        periods[0];

      return {
        name: a.name,
        color: a.color,
        portfolio: picked?.portfolio ?? EMPTY_SIDE,
        benchmark: picked?.benchmark ?? EMPTY_SIDE,
        excess: picked?.excess ?? EMPTY_EXCESS,
      };
    });
  }, [kpiData, selectedKey, preferredKey, EMPTY_SIDE, EMPTY_EXCESS]);

  
  const displayPeriodLabel = useMemo(() => {
    const src = kpiData?.series ?? [];
    const hasPreferred = src.some((a) =>
      (a.periods ?? []).some((p) => p.periodLabel === preferredKey)
    );

    const chosen = hasPreferred ? preferredKey : selectedKey;
    return toDisplayLabel(chosen);
  }, [kpiData, selectedKey, preferredKey]);


  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
    // console.log(selectedRange, kpiData);
  }, [series.length, displayPeriodLabel]);

  const current = series[page - 1];

  if (!loading && (!kpiData || series.length === 0)) {
    return <Empty description="No analysts selected" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }
  
  const TwoCol: React.FC<{ left: React.ReactNode; right: React.ReactNode; header?: boolean }> = ({
    left,
    right,
    header,
  }) => (
    <div className={styles.twoCol} data-header={header ? 'true' : 'false'}>
      <div className={styles.twoColCell}>{left}</div>
      <div className={`${styles.twoColCell} ${styles.twoColRight}`}>{right}</div>
    </div>
  );

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space size={8} wrap>
          <Typography.Title level={5} style={{ margin: 0 }}>
            {current ? (
              <>
                <Dot color={current.color} />
                {formatAnalystPerformanceLabel(current.name)}
              </>
            ) : (
              '—'
            )}
          </Typography.Title>

          <Typography.Text type="secondary">Period: {displayPeriodLabel}</Typography.Text>
        </Space>

        {series.length > 1 ? (
          <Pagination
            size="small"
            simple
            current={page}
            total={series.length}
            pageSize={1}
            onChange={setPage}
          />
        ) : null}
      </div>

      <Divider style={{ margin: '10px 0 12px' }} />

      <Descriptions
        className={styles.kpiDescriptions}
        size="small"
        bordered
        column={1}
        colon={false}
        labelStyle={{ textAlign: 'left', fontWeight: 600, width: 300 }}
        contentStyle={{ minWidth: 200 }}
      >
        <Descriptions.Item label="Metric">
          <div className={styles.twoColCellBlock}>
            <TwoCol left="Analyst" right="Benchmark" header />
          </div>
        </Descriptions.Item>

        <Descriptions.Item label="Total Return">
          <div className={styles.twoColCellBlock}>
            <TwoCol
              left={current ? toPercent(current.portfolio.totalReturnPct) : dash}
              right={current ? toPercent(current.benchmark.totalReturnPct) : dash}
            />
          </div>
        </Descriptions.Item>

        <Descriptions.Item label="Annualized Return (CAGR)">
          <div className={styles.twoColCellBlock}>
            <TwoCol
              left={current ? toPercent(current.portfolio.cagr) : dash}
              right={current ? toPercent(current.benchmark.cagr) : dash}
            />
          </div>
        </Descriptions.Item>

        <Descriptions.Item label="Ann. Volatility">
          <div className={styles.twoColCellBlock}>
            <TwoCol
              left={current ? toPercent(current.portfolio.volAnnPct) : dash}
              right={current ? toPercent(current.benchmark.volAnnPct) : dash}
            />
          </div>
        </Descriptions.Item>

        <Descriptions.Item label="Sharpe (Ann.)">
          <div className={styles.twoColCellBlock}>
            <TwoCol
              left={current ? toNumber(current.portfolio.sharpeAnn) : dash}
              right={current ? toNumber(current.benchmark.sharpeAnn) : dash}
            />
          </div>
        </Descriptions.Item>

        <Descriptions.Item label="Max Drawdown">
          <div className={styles.twoColCellBlock}>
            <TwoCol
              left={current ? toPercent(current.portfolio.maxDrawdownPct) : dash}
              right={current ? toPercent(current.benchmark.maxDrawdownPct) : dash}
            />
          </div>
        </Descriptions.Item>

        <Descriptions.Item label="Excess (Abs. Diff)">
          <div className={styles.twoColCellBlock}>
            <TwoCol left={current ? toPercent(current.excess.diffPct) : dash} right={dash} />
          </div>
        </Descriptions.Item>

        {/*
        <Descriptions.Item label="Excess (Relative)">
          <div className={styles.twoColCellBlock}>
            <TwoCol left={current ? toPercent(current.excess.relativePct) : dash} right={dash} />
          </div>
        </Descriptions.Item>
        */}
      </Descriptions>
    </div>
  );
};

export default AnalystKPIsTable;