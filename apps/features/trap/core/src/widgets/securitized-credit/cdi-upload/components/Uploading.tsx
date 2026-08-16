import { FileZipOutlined } from '@ant-design/icons';
import { Progress, theme } from 'antd';
import clsx from 'clsx';

import { useTheme } from '../../../../theme/ThemeContext';
import styles from './Uploading.module.scss';

type Props = {
    progress: number;
    fileName?: string;
};

export const Uploading = ({
    progress,
    fileName,
}: Props) => {
    const { token } = theme.useToken();
    const { themeName } = useTheme();

    const isWealthTheme =
        themeName === 'wealthLight' ||
        themeName === 'wealthDark';
    const isWealthLight = themeName === 'wealthLight';
    const isWealthDark = themeName === 'wealthDark';

    const progressColor =
        progress >= 60
            ? token.colorSuccess
            : token.colorPrimary;

    return (
        <div
            className={clsx(styles.container, {
                [styles.wealth]: isWealthTheme,
                [styles.wealthLight]: isWealthLight,
                [styles.wealthDark]: isWealthDark,
            })}
        >
            <div className={styles.head}>
                <FileZipOutlined
                    className={styles.icon}
                    style={{
                        color: token.colorPrimary,
                    }}
                />

                {fileName && (
                    <span
                        className={styles.fileName}
                        title={fileName}
                    >
                        {fileName}
                    </span>
                )}
            </div>

            <Progress
                percent={progress}
                strokeColor={progressColor}
                trailColor={token.colorFillSecondary}
                size="small"
                showInfo
                className={styles.progress}
            />

            <span className={styles.status}>
                {progress < 60
                    ? 'Reading file…'
                    : 'Processing via PRISM → INTEX…'}
            </span>
        </div>
    );
};
