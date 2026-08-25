import clsx from "clsx";
import { FundProjectionScreenOutlined, HistoryOutlined } from "@ant-design/icons";
import styles from "../ScenarioMatrixWidget.module.scss";

export type PagerInfo = {
    total: number;
    visibleCount: number;
    offset: number;
    widthPx: number;
    onPrev: () => void;
    onNext: () => void;
};

export type TrancheControl = {
    options: Array<{ id: string; name: string }>;
    currentId?: string;
    onChange: (id: string) => void;
};

type Props = {
    title?: string;
    /** The tranche being priced — shown as a labeled selector (local override). */
    tranche?: TrancheControl | null;
    pager: PagerInfo | null;
    /**
     * Measured widget width (content box) used to drive header degradation.
     * Passed in from the parent's self-measured width so the thresholds actually
     * fire — the old useWidgetPixels context could read 0/stale and never collapse.
     * Falls back to pager.widthPx when omitted.
     */
    widthPx?: number;
    onOpenAudit: () => void;
};

/**
 * Scenario Matrix header — icon + eyebrow, the tranche-in-scope selector, the
 * scenario pager (degrades by width), and the audit button. Shared by the widget
 * and the standalone sandbox so both stay identical.
 *
 * Degradation ladder (measured content-box width, narrow → wide):
 *   < 560  hide the "Scenario Matrix" wordmark (icon only)
 *   < 480  hide the page count "n–m of T"
 *   < 600  hide the "Scenarios" eyebrow
 *   < 740  hide the "+N hidden" badge
 * The tranche selector and pager arrows always stay — they're the load-bearing bits.
 */
export default function MatrixHeader({
    title = "Scenario Matrix",
    tranche,
    pager,
    widthPx,
    onOpenAudit,
}: Props) {
    const show = !!pager && pager.total > pager.visibleCount;
    const hidden = pager ? pager.total - pager.visibleCount : 0;
    const maxOffset = pager ? Math.max(0, pager.total - pager.visibleCount) : 0;
    // Prefer the explicit measured width; fall back to the pager's for back-compat.
    const w = widthPx ?? pager?.widthPx ?? 0;

    return (
        <div className={styles.head}>
            <span
                className={clsx(styles.titleWrap, { [styles.noTitle]: w > 0 && w < 560 })}
                title={title}
            >
                <FundProjectionScreenOutlined className={styles.titleIcon} />
                <span className={styles.title}>{title}</span>
            </span>

            {tranche && tranche.options.length > 0 && (
                <label className={styles.trancheWrap} title="Tranche being priced">
                    <span className={styles.trancheLbl}>Tranche</span>
                    <select
                        className={styles.trancheSel}
                        value={tranche.currentId ?? ""}
                        onChange={(e) => tranche.onChange(e.target.value)}
                    >
                        {!tranche.currentId && <option value="">Select…</option>}
                        {tranche.options.map((o) => (
                            <option key={o.id} value={o.id}>
                                {o.name}
                            </option>
                        ))}
                    </select>
                </label>
            )}

            <div className={styles.actions}>
                {show && pager && (
                    <div
                        className={clsx(styles.pagerWrap, styles.show, {
                            [styles.noCount]: w > 0 && w < 480,
                            [styles.noLabel]: w > 0 && w < 600,
                            [styles.noMore]: hidden <= 0 || (w > 0 && w < 740),
                        })}
                    >
                        <span className={styles.pagerLbl}>Scenarios</span>
                        <div className={styles.pager}>
                            <button
                                type="button"
                                disabled={pager.offset <= 0}
                                title="Previous scenario"
                                onClick={pager.onPrev}
                            >
                                ‹
                            </button>
                            <span className={styles.mxCount}>
                                {pager.offset + 1}–{Math.min(pager.total, pager.offset + pager.visibleCount)} of{" "}
                                {pager.total}
                            </span>
                            <button
                                type="button"
                                disabled={pager.offset >= maxOffset}
                                title="Next scenario"
                                onClick={pager.onNext}
                            >
                                ›
                            </button>
                        </div>
                        <span className={styles.pagerMore}>+{hidden} hidden</span>
                    </div>
                )}
                <button
                    type="button"
                    className={styles.iconBtn}
                    title="Audit trail"
                    onClick={onOpenAudit}
                >
                    <HistoryOutlined />
                </button>
            </div>
        </div>
    );
}