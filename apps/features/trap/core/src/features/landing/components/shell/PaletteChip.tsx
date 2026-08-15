import { ThemePreview, getThemePreview } from '../../../../theme/ThemeContext';
import { CheckOutlined } from '@ant-design/icons';
import styles from './ThemePanel.module.scss';
import { Tooltip } from 'antd';
import clsx from 'clsx';
import { ThemeMode, ThemeName } from '../../../../theme/types';

export function PaletteChip({
    themeName,
    mode,
    isActive,
    onSelect,
    preview,
}: {
    themeName?: string;
    mode: ThemeMode;
    isActive: boolean;
    onSelect: (t: string) => void;
    preview?: ThemePreview;
}) {
    if (!themeName) {
        return <span className={styles['pc pc-empty']} aria-hidden title={`No ${mode} variant`} />;
    }
    const themePreview = preview ?? getThemePreview(themeName as ThemeName);
    return (
        <Tooltip title={mode === 'light' ? 'Light' : 'Dark'} mouseEnterDelay={0.3}>
            <span
                className={clsx(styles.pc, { [styles['pc-on']]: isActive })}
                role="button"
                onClick={() => onSelect(themeName)}
                style={{ borderColor: isActive ? undefined : themePreview.border }}
            >
                <span
                    className={styles['pc-str']}
                    style={{ background: themePreview.bg, width: 10 }}
                />
                <span className={styles['pc-str']} style={{ background: themePreview.primary }} />
                <span className={styles['pc-str']} style={{ background: themePreview.accent }} />
                <span className={styles['pc-str']} style={{ background: themePreview.text }} />
                {isActive ? (
                    <span
                        className={styles['pc-check']}
                        style={{ background: themePreview.primary }}
                    >
                        <CheckOutlined />
                    </span>
                ) : null}
            </span>
        </Tooltip>
    );
}
