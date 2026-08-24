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
    onOpenAudit: () => void;
};

/**
 * Scenario Matrix header — icon + eyebrow, the tranche-in-scope selector, the
 * scenario pager (degrades by width), and the audit button. Shared by the widget
 * and the standalone sandbox so both stay identical.
 */
export default function MatrixHeader({ title = "Scenario Matrix", tranche, pager, onOpenAudit }: Props) {
    const show = !!pager && pager.total > pager.visibleCount;
    const hidden = pager ? pager.total - pager.visibleCount : 0;
    const maxOffset = pager ? Math.max(0, pager.total - pager.visibleCount) : 0;
    const w = pager?.widthPx ?? 0;

    return (
        <div className={styles.head}>
            <span className={styles.titleWrap}>
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
                            [styles.noCount]: w > 0 && w < 520,
                            [styles.noLabel]: w > 0 && w < 640,
                            [styles.noMore]: hidden <= 0 || (w > 0 && w < 780),
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