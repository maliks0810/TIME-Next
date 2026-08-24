import React from "react";
import clsx from "clsx";
import { DownloadOutlined } from "@ant-design/icons";
import styles from "../ScenarioMatrixWidget.module.scss";
import { pastel } from "../constants";
import { formatMoney } from "../format";
import type { CashFlowView, CashflowPeriod, Scenario } from "../types";

type Props = {
    scenario: Scenario | null;
    view: CashFlowView;
    onView: (v: CashFlowView) => void;
    onExport: () => void;
    onSend: () => void;
    canSend: boolean;
    /** Wide widget: show chart + table side by side, hide the toggle. */
    dualPane: boolean;
};

const GHOST_COLS = 12;

export default function CashFlowZone(props: Props) {
    const { scenario, view, onView, onExport, onSend, canSend, dualPane } = props;
    const periods = scenario?.cashflow ?? null;
    const fill = scenario ? pastel(scenario.color) : "var(--sep)";

    // Sample down to ~14 columns so the chart never overflows horizontally.
    const chartRows = React.useMemo(() => {
        if (!periods) return null;
        const step = Math.max(1, Math.ceil(periods.length / 14));
        return periods.filter((_, i) => i % step === 0);
    }, [periods]);

    const maxFlow = React.useMemo(() => {
        if (!chartRows) return 1;
        return Math.max(1, ...chartRows.map((p) => p.principal + p.interest));
    }, [chartRows]);

    const chart = (
        <>
            <div className={styles.chartZone}>
                {(chartRows ??
                    Array.from(
                        { length: GHOST_COLS },
                        () => undefined as CashflowPeriod | undefined,
                    )
                ).map((p, i) => {
                    if (!p) {
                        return (
                            <div key={i} className={styles.chCol}>
                                <div className={styles.chStack}>
                                    <div className={styles.ghBar} style={{ height: 20 }} />
                                </div>
                            </div>
                        );
                    }
                    const pH = (p.principal / maxFlow) * 120;
                    const iH = (p.interest / maxFlow) * 120;
                    return (
                        <div key={p.period} className={styles.chCol}>
                            <div className={styles.chStack}>
                                <div className={styles.chP} style={{ height: pH, background: fill }} />
                                <div className={styles.chI} style={{ height: iH, background: fill }} />
                            </div>
                            <span className={styles.chLbl}>{p.period}</span>
                        </div>
                    );
                })}
            </div>
            <div className={styles.cfLegend}>
                <span className={styles.lg}>
                    <span className={styles.sw} style={{ background: fill }} />
                    {scenario ? `${scenario.name} · Principal` : "Principal"}
                </span>
                <span className={styles.lg}>
                    <span className={styles.sw} style={{ background: fill, opacity: 0.45 }} />
                    Interest
                </span>
            </div>
        </>
    );

    const table = (
        <div className={styles.schedWrap}>
            <table className={styles.sched}>
                <thead>
                    <tr>
                        <th>Period</th>
                        <th>Beg Bal</th>
                        <th>Principal</th>
                        <th>Interest</th>
                        <th>Defaults</th>
                        <th>Recovery</th>
                        <th>End Bal</th>
                    </tr>
                </thead>
                <tbody>
                    {(periods ?? []).map((p) => (
                        <tr key={p.period}>
                            <td>{p.period}</td>
                            <td>{formatMoney(p.beginBal)}</td>
                            <td>{formatMoney(p.principal)}</td>
                            <td>{formatMoney(p.interest)}</td>
                            <td>{formatMoney(p.defaults)}</td>
                            <td>{formatMoney(p.recovery)}</td>
                            <td>{formatMoney(p.endBal)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className={styles.cfZone}>
            <div className={styles.cfHead}>
                <span className={styles.cfTitle}>Cash Flow</span>
                <div className={styles.cfActions}>
                    {!dualPane && (
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

            <div className={clsx(styles.cfBody, { [styles.dual]: dualPane })}>
                {!periods && (
                    <div className={styles.cfIdle}>Calc a scenario to generate cash flows</div>
                )}

                {dualPane ? (
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