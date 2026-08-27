import React from "react";
import clsx from "clsx";
import { LineChartOutlined } from "@ant-design/icons";
import styles from "../ScenarioMatrixWidget.module.scss";
import { COLW } from "../constants";
import { formatMetric } from "../format";
import type { AnalyticsGroup, AssumptionRow, Scenario } from "../types";

type Props = {
    rows: Array<AssumptionRow & { on: boolean }>;
    unit: Record<string, string>;
    groups: AnalyticsGroup[];
    /** Visible (paged) scenario slice. */
    scenarios: Scenario[];
    sel: string | null;
    addShown: boolean;
    running: boolean;
    runLabel: string;
    runDisabled: boolean;
    allCurrent: boolean;
    onEditCell: (key: string, rowId: string, value: number) => void;
    onEditPrice: (key: string, value: number) => void;
    onSetUnit: (rowId: string, unit: string) => void;
    onToggleRow: (rowId: string, on: boolean) => void;
    onToggleScenario: (key: string, on: boolean) => void;
    onRename: (key: string, name: string) => void;
    onRemove: (key: string) => void;
    onAdd: () => void;
    onBindCF: (key: string) => void;
    onRun: () => void;
};

function num(value: string): number {
    return parseFloat(value);
}

export default function MatrixTable(props: Props) {
    const {
        rows, unit, groups, scenarios, sel, addShown, running,
        runLabel, runDisabled, allCurrent,
        onEditCell, onEditPrice, onSetUnit, onToggleRow, onToggleScenario,
        onRename, onRemove, onAdd, onBindCF, onRun,
    } = props;

    // Trailing empty cells so every row shares identical column geometry.
    const tail = (
        <>
            {addShown && <td className={styles.slack} />}
            <td className={styles.slack} />
        </>
    );

    const isSel = (key: string) => sel === key;

    return (
        <table className={styles.mx}>
            <colgroup>
                <col style={{ width: COLW.name }} />
                <col style={{ width: COLW.units }} />
                {scenarios.map((s) => (
                    <col key={s.key} style={{ width: COLW.scen }} />
                ))}
                {addShown && <col style={{ width: COLW.add }} />}
                <col />
            </colgroup>

            <thead className={styles.stickyHead}>
                <tr>
                    <th className={clsx(styles.cName, styles.hdLbl)}>Assumption</th>
                    <th className={clsx(styles.cUnits, styles.hdLbl)} style={{ left: COLW.name }}>
                        Units
                    </th>
                    {scenarios.map((s) => (
                        <th
                            key={s.key}
                            className={clsx(styles.scTh, {
                                [styles.sel]: isSel(s.key),
                                [styles.dimmed]: !s.onCalc,
                            })}
                        >
                            <span className={styles.thAccent} style={{ background: s.color }} />
                            <button
                                type="button"
                                className={styles.thX}
                                aria-label="Remove scenario"
                                title="Remove scenario"
                                onClick={() => onRemove(s.key)}
                            >
                                ✕
                            </button>
                            <div className={styles.thRow}>
                                <label className={styles.tog} title="Include in run">
                                    <input
                                        type="checkbox"
                                        checked={s.onCalc}
                                        onChange={(e) => onToggleScenario(s.key, e.target.checked)}
                                    />
                                </label>
                                <input
                                    className={styles.thName}
                                    defaultValue={s.name}
                                    key={`${s.key}:${s.name}`}
                                    onBlur={(e) => onRename(s.key, e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                                    }}
                                />
                                {s.stale && (
                                    <span
                                        className={styles.thStale}
                                        title="Assumptions changed — recalc"
                                    />
                                )}
                            </div>
                        </th>
                    ))}
                    {addShown && (
                        <th className={styles.addCol}>
                            <button type="button" onClick={onAdd} title="Add scenario">
                                ＋
                            </button>
                        </th>
                    )}
                    <th className={styles.slack} />
                </tr>
            </thead>

            <tbody>
                {/* Assumptions section */}
                <tr className={styles.sect}>
                    <td className={styles.cName}>Assumptions</td>
                    <td className={styles.cUnits} style={{ left: COLW.name }} />
                    <td colSpan={scenarios.length + (addShown ? 2 : 1)} />
                </tr>

                {rows.map((r) => (
                    <tr key={r.id} className={clsx(styles.row, { [styles.off]: !r.on })}>
                        <td className={styles.cName}>
                            <div className={styles.aName}>
                                <input
                                    type="checkbox"
                                    className={styles.aChk}
                                    checked={r.on}
                                    onChange={(e) => onToggleRow(r.id, e.target.checked)}
                                />
                                <span className={styles.aLbl}>
                                    {r.label}
                                    {r.sublabel && <span className={styles.aSub}>{r.sublabel}</span>}
                                </span>
                            </div>
                        </td>
                        <td className={clsx(styles.cUnits, styles.uCell)} style={{ left: COLW.name }}>
                            {r.units.length > 1 ? (
                                <select
                                    className={styles.uSel}
                                    value={unit[r.id]}
                                    onChange={(e) => onSetUnit(r.id, e.target.value)}
                                >
                                    {r.units.map((u) => (
                                        <option key={u} value={u}>
                                            {u}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <span className={styles.uStatic}>{r.units[0]}</span>
                            )}
                        </td>
                        {scenarios.map((s) => (
                            <td
                                key={s.key}
                                className={clsx(styles.vCell, { [styles.selCol]: isSel(s.key) })}
                            >
                                <input
                                    className={styles.vIn}
                                    type="number"
                                    disabled={!r.on}
                                    value={Number.isFinite(s.vals[r.id]) ? s.vals[r.id] : ""}
                                    onChange={(e) => {
                                        const v = num(e.target.value);
                                        if (!Number.isNaN(v)) onEditCell(s.key, r.id, v);
                                    }}
                                />
                            </td>
                        ))}
                        {tail}
                    </tr>
                ))}

                {/* Price row (always required) */}
                <tr className={styles.row}>
                    <td className={styles.cName}>
                        <div className={styles.aName}>
                            <span className={styles.aLbl}>
                                Price<span className={styles.aSub}>Required</span>
                            </span>
                        </div>
                    </td>
                    <td className={clsx(styles.cUnits, styles.uCell)} style={{ left: COLW.name }} />
                    {scenarios.map((s) => (
                        <td
                            key={s.key}
                            className={clsx(styles.vCell, { [styles.selCol]: isSel(s.key) })}
                        >
                            <input
                                className={styles.vIn}
                                type="number"
                                step="0.01"
                                value={Number.isFinite(s.price) ? s.price : ""}
                                onChange={(e) => {
                                    const v = num(e.target.value);
                                    if (!Number.isNaN(v)) onEditPrice(s.key, v);
                                }}
                            />
                        </td>
                    ))}
                    {tail}
                </tr>

                {/* Analytics section + Run */}
                <tr className={styles.runRow}>
                    <td className={styles.cName} colSpan={2}>
                        <div className={styles.calcWrap}>
                            <button
                                type="button"
                                className={clsx(styles.runBtn, { [styles.current]: allCurrent && !running })}
                                disabled={runDisabled || running}
                                onClick={onRun}
                            >
                                {running ? "Running…" : runLabel}
                            </button>
                        </div>
                    </td>
                    {scenarios.map((s) => (
                        <td key={s.key} className={styles.rCell} style={{ textAlign: "center" }}>
                            {s.status === "running" ? (
                                <span className={styles.runSpin} style={{ color: s.color }} />
                            ) : s.status === "queued" ? (
                                <span className={styles.runQ}>…</span>
                            ) : null}
                        </td>
                    ))}
                    {tail}
                </tr>

                {groups.map((g) => (
                    <React.Fragment key={g.id}>
                        <tr className={styles.grp}>
                            <td colSpan={2}>
                                <span className={styles.gLbl}>
                                    <span className={styles.gDot} style={{ background: g.dot }} />
                                    {g.label}
                                </span>
                            </td>
                            <td colSpan={scenarios.length + (addShown ? 2 : 1)} />
                        </tr>
                        {g.metrics.map((m) => (
                            <tr key={m.key} className={styles.row}>
                                <td className={styles.cName}>
                                    <span className={styles.rName}>{m.label}</span>
                                </td>
                                <td
                                    className={clsx(styles.cUnits, styles.uCell)}
                                    style={{ left: COLW.name }}
                                >
                                    <span className={styles.uStatic}>{m.unit}</span>
                                </td>
                                {scenarios.map((s) => (
                                    <td
                                        key={s.key}
                                        className={clsx(styles.rCell, {
                                            [styles.selCol]: isSel(s.key),
                                            [styles.dimRes]: s.stale,
                                        })}
                                    >
                                        {s.status === "running" || s.status === "queued" ? (
                                            <span className={styles.rDash}>…</span>
                                        ) : s.results ? (
                                            formatMetric(s.results[m.key], m)
                                        ) : (
                                            <span className={styles.rDash}>—</span>
                                        )}
                                    </td>
                                ))}
                                {tail}
                            </tr>
                        ))}
                    </React.Fragment>
                ))}

                {running && (
                    <tr>
                        <td colSpan={2 + scenarios.length + (addShown ? 2 : 1)}>
                            <div className={styles.runBar} />
                        </td>
                    </tr>
                )}

                {/* Docked Cash Flow bind row */}
                <tr className={styles.bindRow}>
                    <td className={styles.cName}>
                        <span className={styles.bindLbl}>Cash Flow</span>
                    </td>
                    <td className={styles.cUnits} style={{ left: COLW.name }} />
                    {scenarios.map((s) => (
                        <td key={s.key} className={styles.bindCell}>
                            <button
                                type="button"
                                className={clsx(styles.bindBtn, { [styles.on]: isSel(s.key) })}
                                style={isSel(s.key) ? { background: s.color } : undefined}
                                disabled={!s.cashflow}
                                title={s.cashflow ? "View cash flow" : "Run to view cash flow"}
                                onClick={() => onBindCF(s.key)}
                            >
                                <LineChartOutlined />
                                <span className={styles.bindText}>View</span>
                            </button>
                        </td>
                    ))}
                    {tail}
                </tr>
            </tbody>
        </table>
    );
}