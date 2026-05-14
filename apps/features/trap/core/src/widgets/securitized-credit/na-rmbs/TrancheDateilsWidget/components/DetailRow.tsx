import clsx from 'clsx';
import { Typography } from 'antd';
import styles from './TrancheDetailsComponents.module.scss';

const { Text } = Typography;

export function DetailRow({
    label,
    value,
    mono,
    accent,
}: {
    label: string;
    value: string;
    mono?: boolean;
    accent?: boolean;
}) {
    return (
        <div className={styles.detailRowContainer}>
            <Text className={styles.detailRowLabel}>{label}</Text>
            <Text
                className={clsx(styles.detailRowValue, {
                    [styles.fontFamilyMono]: mono,
                    [styles.detailRowValueAccent]: accent,
                })}
            >
                {value}
            </Text>
        </div>
    );
}
