import React from 'react';
import { Typography, Tooltip, Popover, Button, Popconfirm } from 'antd';
import {
    RightOutlined,
    InfoCircleOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import styles from './ThemePanel.module.scss';
import { THEME_FAMILIES, useTheme } from '../../../../theme/ThemeContext';
import ThemeEditor from '../../../../theme/ThemeEditor';
import clsx from 'clsx';
import { customPreview } from '../../../../theme/customThemes';
import { PaletteChip } from './PaletteChip';
import { BrandInfo } from './BrandInfo';
import { ThemeFamily } from '../../../../theme/types';
// The exact TCW brand tokens the Default theme draws from the design & UI kit — surfaced on hover
// so brand stakeholders can verify we're on-palette/on-type. Light + dark, mapped to roles.
export type BrandSwatch = { role: string; name: string; hex: string };

export default function ThemesPanel() {
    const { themeName, setTheme, customThemes, deleteCustomTheme } = useTheme();
    // Editing renders the editor INLINE in place of the theme list (no modal).
    const [editing, setEditing] = React.useState<{ editId?: string } | null>(null);
    // A user-authored theme row: name + a single preview chip (its mode), with edit/delete on hover.
    const CustomRow = (customTheme: (typeof customThemes)[number]) => (
        <div key={customTheme.id} className={styles['tf-row']}>
            <div className={styles['tf-name']}>
                <div className={styles['tf-title']}>
                    <span className={styles['tf-nm']}>{customTheme.name || 'Untitled'}</span>
                </div>
                <div className={styles['tf-desc']}>
                    {customTheme.mode === 'dark' ? 'Dark' : 'Light'} · custom
                </div>
            </div>
            <div className={styles['tf-actions']}>
                <Tooltip title="Edit">
                    <EditOutlined
                        className={styles['tf-act']}
                        onClick={() => setEditing({ editId: customTheme.id })}
                    />
                </Tooltip>
                <Popconfirm
                    title="Delete this theme?"
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => deleteCustomTheme(customTheme.id)}
                >
                    <DeleteOutlined className={styles['tf-act tf-act-del']} />
                </Popconfirm>
            </div>
            <div className={styles['tf-chips']}>
                <PaletteChip
                    themeName={customTheme.id}
                    mode={customTheme.mode}
                    isActive={customTheme.id === themeName}
                    onSelect={setTheme}
                    preview={customPreview(customTheme)}
                />
                <span className={styles['pc pc-empty']} aria-hidden />
            </div>
        </div>
    );

    const Row = (fam: ThemeFamily) => (
        <div key={fam.id} className={styles['tf-row']}>
            <div className={styles['tf-name']}>
                <div className={styles['tf-title']}>
                    <span className={styles['tf-nm']}>{fam.name}</span>
                    {fam.id === 'default' ? (
                        <Popover
                            content={<BrandInfo />}
                            placement="rightTop"
                            trigger="hover"
                            mouseEnterDelay={0.15}
                        >
                            <InfoCircleOutlined
                                className={styles['tf-info']}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </Popover>
                    ) : null}
                </div>
                <div className={styles['tf-desc']}>{fam.description}</div>
            </div>
            <div className={styles['tf-chips']}>
                <PaletteChip
                    themeName={fam.modes.light}
                    mode="light"
                    isActive={fam.modes.light === themeName}
                    onSelect={setTheme}
                />
                <PaletteChip
                    themeName={fam.modes.dark}
                    mode="dark"
                    isActive={fam.modes.dark === themeName}
                    onSelect={setTheme}
                />
            </div>
        </div>
    );

    const coreFams = THEME_FAMILIES.filter((themeFamily) => themeFamily.group === 'Core');
    const specialtyFams = THEME_FAMILIES.filter((themeFamily) => themeFamily.group === 'Specialty');
    // Specialty collapses to keep the panel tidy; Default (Core) stays put.
    const [openSpecialty, setOpenSpecialty] = React.useState(false);

    return (
        <div>
            {editing ? (
                <ThemeEditor editId={editing.editId} onClose={() => setEditing(null)} />
            ) : (
                <>
                    <Typography.Paragraph
                        type="secondary"
                        style={{ fontSize: 11.5, margin: '2px 0 0' }}
                    >
                        Pick a family, then light or dark. Applies instantly.
                    </Typography.Paragraph>

                    {coreFams.length ? (
                        <div>
                            <div className={styles['tsec']}>Core</div>
                            {coreFams.map(Row)}
                        </div>
                    ) : null}

                    {specialtyFams.length ? (
                        <div>
                            <div
                                className={clsx(styles['tsec-btn'], styles['tsec'])}
                                role="button"
                                onClick={() => setOpenSpecialty((o) => !o)}
                            >
                                <RightOutlined
                                    className={styles['tsec-cv']}
                                    style={{ transform: openSpecialty ? 'rotate(90deg)' : 'none' }}
                                />
                                Specialty
                                <span className={styles['tsec-ct']}>{specialtyFams.length}</span>
                            </div>
                            {openSpecialty ? specialtyFams.map(Row) : null}
                        </div>
                    ) : null}

                    <div className={styles['tsec']}>
                        My themes{customThemes?.length ? ` · ${customThemes?.length}` : ''}
                    </div>
                    {customThemes?.length ? (
                        customThemes?.map(CustomRow)
                    ) : (
                        <Typography.Text
                            type="secondary"
                            style={{ fontSize: 11, display: 'block', padding: '2px 4px' }}
                        >
                            Fork Default, tweak the colors, and save your own — validated for WCAG
                            AA.
                        </Typography.Text>
                    )}
                    <Button
                        block
                        type="dashed"
                        icon={<PlusOutlined />}
                        className={styles['tf-new']}
                        onClick={() => setEditing({})}
                    >
                        New theme
                    </Button>
                </>
            )}
        </div>
    );
}
