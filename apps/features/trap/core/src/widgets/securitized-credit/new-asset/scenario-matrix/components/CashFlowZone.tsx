import React from "react";
import clsx from "clsx";
import { DownloadOutlined } from "@ant-design/icons";
import styles from "../ScenarioMatrixWidget.module.scss";
import { CF_DUAL_PANE_MIN } from "../constants";
import { formatMoney } from "../format";
import { useElementWidth } from "../hooks/useElementWidth";
import type { CashFlowView, CashflowPeriod, Scenario } from "../types";
import CashFlowChart from "./CashFlowChart";

type Props = {
    scenario: Scenario | null;
    view: CashFlowView;
    onView: (v: CashFlowView) => void;
    onExport: () => void;
    onSend: () => void;
    canSend: boolean;
    /**
     * Parent hint (from useWidgetPixels). Used only as a pre-measure fallback;
     * the authoritative decision is the self-measured zone width below, so the
     * dual-pane switch works even when the size context is stale.
     */
    dualPane: boolean;
};

/** Column totals for the schedule header (matches the desk "Total" line). */
function totalsOf(periods: CashflowPeriod[] | null) {
    if (!periods || periods.length === 0) {
        return { principal: 0, interest: 0, cashflow: 0, balance: 0 };
    }
    let principal = 0;
    let interest = 0;
    let cashflow = 0;
    for (const p of periods) {
        principal += p.principal;
        interest += p.interest;
        cashflow += p.cashflow ?? p.principal + p.interest;
    }
    // Balance total = opening balance (period 0 / first row), mirroring the desk view.
    const balance = periods[0]?.beginBal ?? periods[0]?.balance ?? 0;
    return { principal, interest, cashflow, balance };
}

export default function CashFlowZone(props: Props) {
    const { scenario, view, onView, onExport, onSend, canSend, dualPane } = props;
    const periods = scenario?.cashflow ?? null;

    // Self-measured zone width drives the layout switch. Fall back to the parent
    // hint only until the first measurement lands (selfWidth === 0).
    const [zoneRef, selfWidth] = useElementWidth<HTMLDivElement>();
    const isDual = selfWidth ? selfWidth >= CF_DUAL_PANE_MIN : dualPane;

    // Sample down to ~14 columns so the chart never overflows horizontally.
    const chartRows = React.useMemo(() => {
        if (!periods) return null;
        const step = Math.max(1, Math.ceil(periods.length / 14));
        return periods.filter((_, i) => i % step === 0);
    }, [periods]);

    const totals = React.useMemo(() => totalsOf(periods), [periods]);

    const chart = (
        <div className={styles.chartZone}>
            <CashFlowChart scenario={scenario} rows={chartRows} />
        </div>
    );

    const table = (
        <div className={styles.schedWrap}>
            <table className={styles.sched}>
                <thead>
                    <tr>
                        <th>Period</th>
                        <th>Date</th>
                        <th>Principal</th>
                        <th>Interest</th>
                        <th>Cashflow</th>
                        <th>Balance</th>
                    </tr>
                    {periods && periods.length > 0 && (
                        <tr className={styles.schedTotal}>
                            <td>Total</td>
                            <td />
                            <td>{formatMoney(totals.principal)}</td>
                            <td>{formatMoney(totals.interest)}</td>
                            <td>{formatMoney(totals.cashflow)}</td>
                            <td>{formatMoney(totals.balance)}</td>
                        </tr>
                    )}
                </thead>
                <tbody>
                    {(periods ?? []).map((p) => (
                        <tr key={p.period}>
                            <td>{p.period}</td>
                            <td>{p.date}</td>
                            <td>{formatMoney(p.principal)}</td>
                            <td>{formatMoney(p.interest)}</td>
                            <td>{formatMoney(p.cashflow ?? p.principal + p.interest)}</td>
                            <td>{formatMoney(p.balance ?? p.endBal)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div ref={zoneRef} className={styles.cfZone}>
            <div className={styles.cfHead}>
                <span className={styles.cfTitle}>Cash Flow</span>
                <div className={styles.cfActions}>
                    {!isDual && (
                        <div className={styles.seg}>
                            <button
                                type="button"
                                className={clsx({ [styles.active]: view === "chart" })}
                                onClick={() => onView("chart")}
                            >
                                Chart
                            </button>
                            <button
                                type="button"
                                className={clsx({ [styles.active]: view === "table" })}
                                onClick={() => onView("table")}
                            >
                                Table
                            </button>
                        </div>
                    )}
                    <button
                        type="button"
                        className={styles.iconBtn}
                        title="Export cash flow"
                        onClick={onExport}
                        disabled={!periods}
                    >
                        <DownloadOutlined />
                    </button>
                    <button
                        type="button"
                        className={styles.btnSend}
                        onClick={onSend}
                        disabled={!canSend}
                    >
                        Send to Staging →
                    </button>
                </div>
            </div>

            <div className={clsx(styles.cfBody, { [styles.dual]: isDual })}>
                {!periods && (
                    <div className={styles.cfIdle}>Calc a scenario to generate cash flows</div>
                )}

                {isDual ? (
                    <>
                        <div className={styles.paneChart}>{chart}</div>
                        <div className={styles.paneTable}>{table}</div>
                    </>
                ) : view === "chart" ? (
                    chart
                ) : (
                    table
                )}
            </div>
        </div>
    );
}
