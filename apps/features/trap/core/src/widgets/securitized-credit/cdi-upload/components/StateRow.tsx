import {
    CheckCircleFilled,
    CloseCircleFilled,
    ReloadOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import clsx from 'clsx';

import { useTheme } from '../../../../theme/ThemeContext';
import styles from './StateRow.module.scss';

type Props = {
    kind: 'success' | 'error';
    rich: boolean;
    title: string;
    detail?: string;
    onAction: () => void;
};

export const StateRow = ({
    kind,
    rich,
    title,
    detail,
    onAction,
}: Props) => {
    const { themeName } = useTheme();

    const isWealthTheme =
        themeName === 'wealthLight' ||
        themeName === 'wealthDark';
    const isWealthLight = themeName === 'wealthLight';
    const isWealthDark = themeName === 'wealthDark';

    const isSuccess = kind === 'success';
    const Icon = isSuccess
        ? CheckCircleFilled
        : CloseCircleFilled;
    const actionLabel = isSuccess
        ? 'Re-upload'
        : 'Try again';

    const themeClasses = {
        [styles.wealth]: isWealthTheme,
        [styles.wealthLight]: isWealthLight,
        [styles.wealthDark]: isWealthDark,
    };

    if (rich) {
        return (
            <div
                className={clsx(
                    styles.box,
                    isSuccess
                        ? styles.okBox
                        : styles.errBox,
                    themeClasses,
                )}
            >
                <div className={styles.boxHead}>
                    <Icon className={styles.boxIcon} />

                    <span className={styles.boxTitle}>
                        {title}
                    </span>
                </div>

                {detail && (
                    <span
                        className={styles.boxMsg}
                        title={detail}
                    >
                        {detail}
                    </span>
                )}

                <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={onAction}
                    className={styles.actionButton}
                >
                    {actionLabel}
                </Button>
            </div>
        );
    }

    return (
        <div
            className={clsx(
                styles.row,
                isSuccess
                    ? styles.ok
                    : styles.err,
                themeClasses,
            )}
        >
            <Icon className={styles.rowIcon} />

            <span
                className={styles.rowText}
                title={detail || title}
            >
                {title}
            </span>

            <button
                type="button"
                className={styles.iconBtn}
                onClick={onAction}
                title={actionLabel}
                aria-label={actionLabel}
            >
                <ReloadOutlined />
            </button>
        </div>
    );
};
