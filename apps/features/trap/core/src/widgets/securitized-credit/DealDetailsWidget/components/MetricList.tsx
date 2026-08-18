import clsx from 'clsx';
import { useTheme } from '../../../../theme/ThemeContext';
import styles from './DealDetailsComponents.module.scss';

export type MetricItem = {
    label: string;
    value: string | null;
    mono?: boolean;
};

export function MetricList({
    items,
    columns,
}: {
    items: MetricItem[];
    columns: number;
}) {
    const { themeName } = useTheme();

    const isWealthTheme =
        themeName === 'wealthLight' ||
        themeName === 'wealthDark';

    const isWealthLight =
        themeName === 'wealthLight';

    const isWealthDark =
        themeName === 'wealthDark';

    const gridClass =
        columns === 3
            ? styles.metricListThree
            : columns === 2
              ? styles.metricListTwo
              : styles.metricListOne;

    return (
        <div
            className={clsx(
                styles.metricList,
                gridClass,
                {
                    [styles.wealth]:
                        isWealthTheme,

                    [styles.wealthLight]:
                        isWealthLight,

                    [styles.wealthDark]:
                        isWealthDark,
                },
            )}
        >
            {items.map((metric) => (
                <div
                    key={metric.label}
                    className={styles.metricListRow}
                >
                    <span
                        className={
                            styles.metricListLabel
                        }
                    >
                        {metric.label}
                    </span>

                    <span
                        className={clsx(
                            styles.metricListValue,
                            {
                                [styles.fontFamilyMono]:
                                    metric.mono ??
                                    true,
                            },
                        )}
                    >
                        {metric.value ?? '—'}
                    </span>
                </div>
            ))}
        </div>
    );
}