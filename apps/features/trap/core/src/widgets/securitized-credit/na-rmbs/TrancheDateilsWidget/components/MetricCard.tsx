import { Typography } from 'antd';
import clsx from 'clsx';
const { Text } = Typography;
import { useTheme, getThemeSurfaceMeta } from '../../../../../theme/ThemeContext';
import styles from './TrancheDetailsComponents.module.scss';

export function MetricCard({
    label,
    value,
    sub,
    accent,
}: {
    label: string;
    value: string;
    sub?: string;
    accent?: boolean;
}) {
    const { themeName } = useTheme();
    const surfaceMeta = getThemeSurfaceMeta(themeName);
    return (
        <div className={styles.metricCardContainer}>
            {accent && (
                <div
                    className={styles.metricCardAccentHighlight}
                    style={{
                        background: surfaceMeta.isGradientTheme
                            ? surfaceMeta.accentGradient
                            : undefined,
                    }}
                />
            )}
            <Text className={styles.metricCardLabel}>{label}</Text>
            <Text
                className={clsx(styles.metricCardValue, { [styles.metricCardValueAccent]: accent })}
            >
                {value}
            </Text>
            {sub && <Text className={styles.metricCardSubText}>{sub}</Text>}
        </div>
    );
}
