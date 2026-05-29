import clsx from 'clsx';
import { Typography } from 'antd';
import styles from './DealDetailsComponents.module.scss';

const { Text } = Typography;

export function AttrRow({
    label,
    value,
    mono,
    accent,
}: {
    label: string;
    value: string | null;
    mono?: boolean;
    accent?: boolean;
}) {
    return (
        <div className={styles.attrRowContainer}>
            <Text className={styles.attrRowLabel}>{label}</Text>
            <Text
                className={clsx(styles.attrRowValue, {
                    [styles.fontFamilyMono]: mono,
                    [styles.attrRowValueAccent]: accent,
                })}
            >
                {value}
            </Text>
        </div>
    );
}
