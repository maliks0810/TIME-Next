import clsx from 'clsx';
import type { SummaryMetric } from '../utils/helpers';
import type { RowStyle } from './planLayout';
import styles from '../SummaryPanel.module.scss';

export interface MetricRowProps {
    metric: SummaryMetric;
    rowStyle: RowStyle;
}

export function MetricRow({ metric, rowStyle }: MetricRowProps) {
    const inline = rowStyle === 'inline';

    const value = (
        <span className={clsx(inline ? styles.valueInline : styles.valueStacked, metric.accent && styles.accentValue)}>
            {metric.value}
            {metric.unit ? <span className={styles.unit}>{metric.unit}</span> : null}
        </span>
    );

    if (inline) {
        return (
            <div className={styles.metricInline}>
                <span className={styles.labelInline}>{metric.label}</span>
                {value}
            </div>
        );
    }

    return (
        <div className={styles.metricStacked}>
            <span className={styles.labelStacked}>{metric.label}</span>
            {value}
        </div>
    );
}