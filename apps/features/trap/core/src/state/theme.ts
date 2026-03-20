/* eslint-disable  @typescript-eslint/no-explicit-any */
import type { ThemeConfig } from 'antd';

export function toAntdTheme(theme?: Record<string, any>): ThemeConfig {
    // Keep intentionally small + safe: accept only known token keys if present.
    const token: Record<string, any> = {};
    if (!theme) return { token };

    const mapping: Record<string, string> = {
        colorPrimary: 'colorPrimary',
        colorBgBase: 'colorBgBase',
        colorTextBase: 'colorTextBase',
        borderRadius: 'borderRadius',
        fontFamily: 'fontFamily',
    };

    for (const [k, v] of Object.entries(mapping)) {
        if (theme[k] !== undefined) token[v] = theme[k];
    }

    return { token };
}
