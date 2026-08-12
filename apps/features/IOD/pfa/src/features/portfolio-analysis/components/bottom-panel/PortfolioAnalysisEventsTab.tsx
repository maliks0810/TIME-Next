import type { JSX } from 'react';
import type { DecimalMode, DecimalSettings } from '../../domain/format';
import { fmtDynamicNumber, fmtDynamicSignedNumber } from '../../domain/format';
import type {
  MonitorV2Cashflow,
  PortfolioAnalysisContext,
  PortfolioAnalysisTradeEvent,
  PortfolioAnalysisTreeRow,
} from '../../types';
import { PortfolioAnalysisMiniGrid } from './PortfolioAnalysisMiniGrid';
import type { PortfolioAnalysisPeriodKey } from './PortfolioAnalysisPeriodSelector';
import type { PortfolioAnalysisColumnGroupContext } from './PortfolioAnalysisColumnGroupContext';
import { effectivePeriod, eventPeriods } from './periodScope';

type TradeWithDuration = PortfolioAnalysisTradeEvent & {
  TradeDuration?: number | null;
  tradeDuration?: number | null;
  SecDuration?: number | null;
  secDuration?: number | null;
};

type TradeWithPrices = PortfolioAnalysisTradeEvent & {
  TradePrice?: number | string | null;
  tradePrice?: number | string | null;
  TRADE_PRICE?: number | string | null;
  price?: number | string | null;
  Price?: number | string | null;
  SecPrice?: number | string | null;
  secPrice?: number | string | null;
  securityPrice?: number | string | null;
  SecurityPrice?: number | string | null;
  secLocalPrice?: number | string | null;
  securityLocalPrice?: number | string | null;
};

function asText(value: unknown): string | number | null {
  if (typeof value === 'string' || typeof value === 'number') return value;
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }
  return null;
}

function absNumber(value: unknown): number {
  return Math.abs(asNumber(value) ?? 0);
}

function dateOnly(value: string | null | undefined): string {
  return value ? String(value).slice(0, 10) : '';
}

function tradeDuration(trade: PortfolioAnalysisTradeEvent): number | null {
  const withDuration = trade as TradeWithDuration;
  return asNumber(withDuration.TradeDuration ?? withDuration.tradeDuration);
}

function securityDuration(trade: PortfolioAnalysisTradeEvent): number | null {
  const withDuration = trade as TradeWithDuration;
  return asNumber(withDuration.SecDuration ?? withDuration.secDuration);
}

function tradePrice(trade: PortfolioAnalysisTradeEvent): number | null {
  const withPrices = trade as TradeWithPrices;
  return asNumber(withPrices.TradePrice ?? withPrices.tradePrice ?? withPrices.TRADE_PRICE ?? withPrices.price ?? withPrices.Price);
}

function securityPrice(trade: PortfolioAnalysisTradeEvent): number | null {
  const withPrices = trade as TradeWithPrices;
  return asNumber(
    withPrices.SecPrice ??
      withPrices.secPrice ??
      withPrices.securityPrice ??
      withPrices.SecurityPrice ??
      withPrices.secLocalPrice ??
      withPrices.securityLocalPrice,
  );
}

function tradeKey(trade: PortfolioAnalysisTradeEvent): string {
  return [
    asText(trade.tradeNum) ?? '',
    asText(trade.invNum) ?? '',
    trade.securityKey ?? '',
    dateOnly(trade.tradeDate),
    asNumber(trade.flippedCurrentFace) ?? '',
    asNumber(trade.flippedTradeNetMoney) ?? '',
    asNumber(trade.ctd) ?? '',
    tradePrice(trade) ?? '',
    securityPrice(trade) ?? '',
    tradeDuration(trade) ?? '',
    securityDuration(trade) ?? '',
  ].join('|');
}

function uniqueTrades(trades: PortfolioAnalysisTradeEvent[]): PortfolioAnalysisTradeEvent[] {
  const byKey = new Map<string, PortfolioAnalysisTradeEvent>();

  trades.forEach((trade) => {
    const key = tradeKey(trade);
    if (!byKey.has(key)) byKey.set(key, trade);
  });

  return [...byKey.values()];
}

function cashflowKey(cashflow: MonitorV2Cashflow): string {
  return [dateOnly(cashflow.settleDate), cashflow.portfolioKey, cashflow.cashType, cashflow.baseAmount ?? '', cashflow.source].join('|');
}

function uniqueCashflows(cashflows: MonitorV2Cashflow[]): MonitorV2Cashflow[] {
  const byKey = new Map<string, MonitorV2Cashflow>();

  cashflows.forEach((cashflow) => {
    const key = cashflowKey(cashflow);
    if (!byKey.has(key)) byKey.set(key, cashflow);
  });

  return [...byKey.values()];
}

function scopedEventDetails(row: PortfolioAnalysisTreeRow, periods: number[]) {
  return periods.reduce(
    (acc, period) => {
      const details = row.events?.[period] ?? {};
      return {
        trades: [...(acc.trades ?? []), ...(details.trades ?? [])],
        cashflows: [...(acc.cashflows ?? []), ...(details.cashflows ?? [])],
      };
    },
    {} as { trades?: PortfolioAnalysisTradeEvent[]; cashflows?: MonitorV2Cashflow[] },
  );
}

export function PortfolioAnalysisEventsTab({
  selectedRow,
  context,
  activeTMinus,
  selectedColumnGroup,
  decimalSettings,
  decimalMode,
}: {
  selectedRow: PortfolioAnalysisTreeRow;
  context: PortfolioAnalysisContext;
  activeTMinus: PortfolioAnalysisPeriodKey;
  selectedColumnGroup?: PortfolioAnalysisColumnGroupContext | null;
  onActiveTMinusChange?: (period: PortfolioAnalysisPeriodKey) => void;
  decimalSettings: DecimalSettings;
  decimalMode: DecimalMode;
}): JSX.Element {
  const period = effectivePeriod(context, activeTMinus, selectedColumnGroup);
  const details = scopedEventDetails(selectedRow, eventPeriods(context, period));
  const trades = uniqueTrades(details.trades ?? []);
  const cashflows = uniqueCashflows(details.cashflows ?? []);

  return (
    <div className="portfolio-analysis-bottom-tab-content portfolio-analysis-bottom-tab-content-fill">
      <div className="portfolio-analysis-bottom-two-col portfolio-analysis-bottom-two-col-fill">
        <section className="portfolio-analysis-bottom-section portfolio-analysis-bottom-section-fill">
          <div className="portfolio-analysis-bottom-section-title">Trades</div>
          <PortfolioAnalysisMiniGrid
            rows={trades}
            emptyText="No trades."
            defaultSortKey="date"
            defaultSortDirection="desc"
            columns={[
              {
                key: 'tradeNum',
                label: 'Trade #',
                align: 'left',
                render: (row) => asText(row.tradeNum),
                sortValue: (row) => asText(row.tradeNum),
              },
              {
                key: 'date',
                label: 'Date',
                align: 'left',
                render: (row) => dateOnly(row.tradeDate),
                sortValue: (row) => dateOnly(row.tradeDate),
              },
              {
                key: 'security',
                label: 'Security',
                align: 'left',
                render: (row) => row.securityKey,
                sortValue: (row) => row.securityKey,
              },
              {
                key: 'tradeDuration',
                label: 'Trade Dur',
                render: (row) => fmtDynamicNumber(tradeDuration(row), decimalSettings.contrib, decimalMode),
                sortValue: (row) => absNumber(tradeDuration(row)),
                toneValue: (row) => tradeDuration(row),
              },
              {
                key: 'secDuration',
                label: 'Sec Dur',
                render: (row) => fmtDynamicNumber(securityDuration(row), decimalSettings.contrib, decimalMode),
                sortValue: (row) => absNumber(securityDuration(row)),
                toneValue: (row) => securityDuration(row),
              },
              {
                key: 'tradePrice',
                label: 'Trade Price',
                render: (row) => fmtDynamicNumber(tradePrice(row), decimalSettings.money, decimalMode),
                sortValue: (row) => absNumber(tradePrice(row)),
                toneValue: (row) => tradePrice(row),
              },
              {
                key: 'secPrice',
                label: 'Sec Price',
                render: (row) => fmtDynamicNumber(securityPrice(row), decimalSettings.money, decimalMode),
                sortValue: (row) => absNumber(securityPrice(row)),
                toneValue: (row) => securityPrice(row),
              },
              {
                key: 'face',
                label: 'Face',
                render: (row) => fmtDynamicNumber(asNumber(row.flippedCurrentFace), decimalSettings.qty, decimalMode),
                sortValue: (row) => absNumber(row.flippedCurrentFace),
                toneValue: (row) => asNumber(row.flippedCurrentFace),
              },
              {
                key: 'net',
                label: 'Net',
                render: (row) => fmtDynamicNumber(asNumber(row.flippedTradeNetMoney), decimalSettings.money, decimalMode),
                sortValue: (row) => absNumber(row.flippedTradeNetMoney),
                toneValue: (row) => asNumber(row.flippedTradeNetMoney),
              },
              {
                key: 'ctd',
                label: 'CTD',
                render: (row) => fmtDynamicNumber(asNumber(row.ctd), decimalSettings.contrib, decimalMode),
                sortValue: (row) => absNumber(row.ctd),
                toneValue: (row) => asNumber(row.ctd),
              },
            ]}
          />
        </section>

        <section className="portfolio-analysis-bottom-section portfolio-analysis-bottom-section-fill">
          <div className="portfolio-analysis-bottom-section-title">Cashflows</div>
          <PortfolioAnalysisMiniGrid
            rows={cashflows}
            emptyText="No cashflows."
            defaultSortKey="settle"
            defaultSortDirection="desc"
            columns={[
              {
                key: 'settle',
                label: 'Settle',
                align: 'left',
                render: (row) => dateOnly(row.settleDate),
                sortValue: (row) => dateOnly(row.settleDate),
              },
              {
                key: 'type',
                label: 'Type',
                align: 'left',
                render: (row) => row.cashType,
                sortValue: (row) => row.cashType,
              },
              {
                key: 'amount',
                label: 'Amount',
                render: (row) => fmtDynamicSignedNumber(row.baseAmount, decimalSettings.money, decimalMode),
                sortValue: (row) => Math.abs(row.baseAmount ?? 0),
                toneValue: (row) => row.baseAmount,
              },
              {
                key: 'ccy',
                label: 'CCY',
                align: 'left',
                render: (row) => row.currency,
                sortValue: (row) => row.currency,
              },
              {
                key: 'source',
                label: 'Source',
                align: 'left',
                render: (row) => row.source,
                sortValue: (row) => row.source,
              },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
