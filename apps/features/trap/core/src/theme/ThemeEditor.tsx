/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
    Input,
    Select,
    InputNumber,
    Switch,
    Segmented,
    Button,
    ColorPicker,
    Alert,
    Tooltip,
    Typography,
    Popconfirm,
} from 'antd';
import { CheckOutlined, CloseOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useTheme } from './ThemeContext';
import styles from './ThemeEditor.module.scss';

import {
    type CustomTheme,
    EDITABLE_COLORS,
    FONT_OPTIONS,
    seedTokensFromBase,
    newCustomId,
    customToConfig,
    customAppBackground,
} from './customThemes';
import { evaluatePairs } from './contrast';
import { BrandSwatchPicker } from './components/BrandSwatchPicker';
import { ThemeName } from './types';

// Custom themes always fork from the TCW brand Default (light or dark) — never a specialty theme.
const BASE_BY_MODE: Record<'light' | 'dark', ThemeName> = { light: 'default', dark: 'dark' };

// Rendered INLINE inside the Manage drawer's Themes panel (not a modal). Returns to the list
// via onClose. Pushes a live preview to the app while editing; clears it on unmount.
export default function ThemeEditor({ editId, onClose }: { editId?: string; onClose: () => void }) {
    const { customThemes, upsertCustomTheme, deleteCustomTheme, setPreview } = useTheme();
    const [draft, setDraft] = React.useState<CustomTheme | null>(() => {
        const existing = editId ? customThemes.find((c) => c.id === editId) : null;
        return existing
            ? { ...existing, tokens: { ...existing.tokens } }
            : {
                  id: newCustomId(),
                  name: 'My theme',
                  base: 'default',
                  mode: 'light',
                  tokens: seedTokensFromBase('default'),
              };
    });
    const [enforceAA, setEnforceAA] = React.useState(true);
    // Brand mode (default) constrains picks to TCW-approved swatches; Free pick unlocks any color.
    const [colorMode, setColorMode] = React.useState<'brand' | 'free'>('brand');

    // Live preview on every draft change; clear the preview when the editor unmounts.
    React.useEffect(() => {
        if (draft)
            setPreview({
                config: customToConfig(draft) as any,
                appBackground: customAppBackground(draft),
                themeName: draft.id,
            });
    }, [draft, setPreview]);
    React.useEffect(() => () => setPreview(null), [setPreview]);

    if (!draft) return null;

    const setToken = (key: string, val: string | number) =>
        setDraft((d) => (d ? { ...d, tokens: { ...d.tokens, [key]: val } } : d));
    const setMode = (mode: 'light' | 'dark') => {
        const base = BASE_BY_MODE[mode];
        setDraft((d) => (d ? { ...d, base, mode, tokens: seedTokensFromBase(base) } : d));
    };

    const results = evaluatePairs(draft.tokens);
    const failing = results.filter((r) => r.measurable && !r.pass);
    const nameOk = draft.name.trim().length > 0;
    const canSave = nameOk && (!enforceAA || failing.length === 0);

    const save = async () => {
        if (!canSave) return;
        const theme = { ...draft, name: draft.name.trim() };
        await upsertCustomTheme(theme);

        onClose();
    };
    const remove = () => {
        if (editId) deleteCustomTheme(editId);
        onClose();
    };

    const label = (s: string) => <div className={styles['te-lbl']}>{s}</div>;
    // Uniform section header: label on the left, its control on the right, consistent spacing.
    const section = (text: string, control: React.ReactNode) => (
        <div className={styles['te-sec']}>
            <span className={styles['te-sec-lbl']}>{text}</span>
            {control}
        </div>
    );

    return (
        <div>
            <div className={styles['te-head']}>
                <Tooltip title="Back">
                    <ArrowLeftOutlined className={styles['te-back']} onClick={onClose} />
                </Tooltip>
                <span className={styles['te-title']}>{editId ? 'Edit theme' : 'New theme'}</span>
                <Tooltip
                    title={
                        !nameOk
                            ? 'Give it a name'
                            : !canSave
                              ? 'Fix contrast or turn off Enforce AA'
                              : null
                    }
                >
                    <Button type="primary" size="small" onClick={save} disabled={!canSave}>
                        {editId ? 'Save' : 'Create'}
                    </Button>
                </Tooltip>
            </div>

            {label('Name')}
            <Input
                size="small"
                value={draft.name}
                onChange={(e) => setDraft((d) => (d ? { ...d, name: e.target.value } : d))}
                placeholder="e.g. Desk Midnight"
            />

            {section(
                'Base · TCW Default',
                <Segmented
                    size="small"
                    value={draft.mode}
                    onChange={(v) => setMode(v as 'light' | 'dark')}
                    options={[
                        { label: 'Light', value: 'light' },
                        { label: 'Dark', value: 'dark' },
                    ]}
                />
            )}

            {section(
                'Colors',
                <Segmented
                    size="small"
                    value={colorMode}
                    onChange={(v) => setColorMode(v as 'brand' | 'free')}
                    options={[
                        { label: 'TCW Brand', value: 'brand' },
                        { label: 'Free pick', value: 'free' },
                    ]}
                />
            )}
            <div className={styles['te-colors']}>
                {EDITABLE_COLORS.map((c) => {
                    const val = String(draft.tokens[c.key] ?? '#000');
                    return (
                        <div key={c.key} className={styles['te-color']}>
                            {colorMode === 'brand' ? (
                                <BrandSwatchPicker
                                    value={val}
                                    onChange={(hex) => setToken(c.key, hex)}
                                />
                            ) : (
                                <ColorPicker
                                    size="small"
                                    value={val}
                                    onChange={(_, hex) => setToken(c.key, hex)}
                                />
                            )}
                            <span className={styles['te-color-lbl']}>{c.label}</span>
                        </div>
                    );
                })}
            </div>
            {colorMode === 'brand' ? (
                <div className={styles['te-note']}>
                    Only TCW-approved colors &amp; shades. Off-brand values (from Free pick) show an
                    amber ring.
                </div>
            ) : null}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    {label('Font')}
                    <Select
                        size="small"
                        value={String(draft.tokens.fontFamily ?? FONT_OPTIONS[0].value)}
                        onChange={(v) => setToken('fontFamily', v)}
                        options={FONT_OPTIONS}
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{ width: 84 }}>
                    {label('Radius')}
                    <InputNumber
                        size="small"
                        min={0}
                        max={16}
                        value={Number(draft.tokens.borderRadius ?? 6)}
                        onChange={(v) => setToken('borderRadius', v ?? 0)}
                        style={{ width: '100%' }}
                    />
                </div>
            </div>

            {section(
                'Contrast · WCAG AA',
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Typography.Text style={{ fontSize: 11 }} type="secondary">
                        Enforce
                    </Typography.Text>
                    <Switch size="small" checked={enforceAA} onChange={setEnforceAA} />
                </span>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {results.map((r) => {
                    const color = !r.measurable
                        ? 'var(--ant-color-text-quaternary)'
                        : r.pass
                          ? 'var(--ant-color-success)'
                          : 'var(--ant-color-error)';
                    return (
                        <span
                            key={r.key}
                            className={styles['te-chip']}
                            style={{ borderColor: color, color }}
                        >
                            {r.label}: {r.measurable ? `${r.ratio.toFixed(1)}:1` : 'n/a'}
                            {r.measurable ? r.pass ? <CheckOutlined /> : <CloseOutlined /> : null}
                        </span>
                    );
                })}
            </div>
            {enforceAA && failing.length > 0 ? (
                <Alert
                    type="error"
                    showIcon
                    style={{ marginTop: 8, fontSize: 12 }}
                    message={
                        <span style={{ fontSize: 11.5 }}>
                            {failing
                                .map(
                                    (r) =>
                                        `${r.label} ${r.ratio.toFixed(1)}:1 (needs ${r.threshold}:1)`
                                )
                                .join(' · ')}
                            . Raise contrast or turn off Enforce.
                        </span>
                    }
                />
            ) : null}

            {editId ? (
                <Popconfirm
                    title="Delete this theme?"
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                    onConfirm={remove}
                >
                    <Button
                        danger
                        type="text"
                        size="small"
                        style={{ marginTop: 14, paddingLeft: 0 }}
                    >
                        Delete theme
                    </Button>
                </Popconfirm>
            ) : null}
        </div>
    );
}
