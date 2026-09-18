import { Metric, useAttributionStore } from '../state/useStore';
import styles from './MetricsTab.module.scss';
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className={styles['tog']}>
            <input
                aria-label="Toggle metric"
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className={styles['tk']} />
            <span className={styles['th']} />
        </label>
    );
}

export function MetricsTab() {
    const metrics = useAttributionStore((store) => store.metrics);
    const toggleMetric = useAttributionStore((store) => store.toggleMetric);

    const renderFormat = (format: string) => {
        switch (format) {
            case 'percent':
                return '%';
            default:
                return format;
        }
    };
    return (
        <div className={styles['cfg-cols']}>
            <div>
                {metrics.map((el: Metric) => (
                    <div className={styles['mrow']} key={el.metricId}>
                        <span className={styles['n']}>
                            {el.displayName}
                            <span className={styles['fmt']}>{renderFormat(el.format)}</span>
                        </span>
                        <Toggle
                            checked={
                                !!metrics.find((metric) => metric.metricId === el.metricId)?.enabled
                            }
                            onChange={() => toggleMetric('static', el.metricId)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
