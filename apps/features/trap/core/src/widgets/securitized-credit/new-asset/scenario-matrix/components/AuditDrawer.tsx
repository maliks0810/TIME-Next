import clsx from "clsx";
import { HistoryOutlined } from "@ant-design/icons";
import styles from "../ScenarioMatrixWidget.module.scss";
import type { AuditRow } from "../types";

/** Blend a hex 88% toward white for a soft chip background. */
function tint(hex: string | undefined): string | undefined {
    if (!hex) return undefined;
    const c = hex.replace("#", "");
    if (c.length !== 6) return undefined;
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    const m = (x: number) => Math.round(x + (255 - x) * 0.86);
    return `rgb(${m(r)}, ${m(g)}, ${m(b)})`;
}

type Props = {
    open: boolean;
    /** Audit scope label — asset / sub-asset (e.g. "ABS Auto"), not the deal. */
    scope?: string;
    rows: AuditRow[];
    onClose: () => void;
};

/**
 * Read-only audit trail: what was run. No restore, no actions, no count badge.
 * Runs are recorded server-side in PRISM; scoped by asset / sub-asset, not by deal.
 */
export default function AuditDrawer(props: Props) {
    const { open, scope, rows, onClose } = props;
    return (
        <div className={clsx(styles.drawer, { [styles.open]: open })}>
            <div className={styles.drHead}>
                <HistoryOutlined className={styles.drIcon} />
                <span className={styles.drTitle}>Audit Trail</span>
                {scope && <span className={styles.drDeal}>{scope}</span>}
                <button type="button" className={styles.drX} aria-label="Close" onClick={onClose}>
                    ✕
                </button>
            </div>
            <div className={styles.drBody}>
                {rows.length === 0 ? (
                    <div className={styles.drEmpty}>No runs recorded yet</div>
                ) : (
                    rows.map((entry, i) => (
                        <div
                            key={i}
                            className={styles.drEntry}
                            style={{ borderLeftColor: entry.color ?? "var(--tile-border)" }}
                        >
                            <div className={styles.drL1}>
                                <span
                                    className={styles.drChip}
                                    style={
                                        entry.color
                                            ? {
                                                  background: tint(entry.color),
                                                  borderColor: entry.color,
                                                  color: entry.color,
                                              }
                                            : undefined
                                    }
                                >
                                    {entry.scenario}
                                </span>
                                <span className={styles.drTr}>{entry.tranche}</span>
                                <span className={styles.drTime}>{entry.timestamp}</span>
                            </div>
                            <div className={styles.drAssump}>{entry.assumptions}</div>
                            <div className={styles.drRes}>{entry.results}</div>
                            <div className={styles.drUser}>{entry.user}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}