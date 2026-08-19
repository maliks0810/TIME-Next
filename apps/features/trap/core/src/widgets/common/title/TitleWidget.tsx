/* eslint-disable @typescript-eslint/no-explicit-any */
import type { WidgetComponentProps } from '../../../types/widget';
import styles from './TitleWidget.module.scss';

/**
 * TitleWidget — a borderless section header (Title + Subtitle), set entirely via
 * configuration (NOT API-driven). It deliberately does NOT use WidgetCardShell,
 * so it renders with no card border/background — the widget runtime only wraps
 * the "no registered component" fallback in a shell, never a registered widget.
 * It also has no widget-header row of its own (a title on a title makes no
 * sense) — the configured text IS the content. Styling uses the shared
 * `var(--ant-color-*)` tokens for consistency with the other widgets.
 */
export function TitleWidget({ widgetInstance, widgetDefinition }: WidgetComponentProps) {
    const params = widgetInstance?.config?.params ?? {};
    const properties = (widgetDefinition?.configSchema?.properties ?? {}) as Record<string, any>;
    const def = (k: string) => properties?.[k]?.['default'];

    const title = String(params.titleText ?? def('titleText') ?? '').trim();
    const subtitle = String(params.subtitleText ?? def('subtitleText') ?? '').trim();
    const align = String(params.align ?? def('align') ?? 'left') as 'left' | 'center' | 'right';
    const titleSize = Number(params.titleSize ?? def('titleSize') ?? 18);

    return (
        <div className={styles.root} style={{ textAlign: align }}>
            {title && (
                <div className={styles.title} style={{ fontSize: titleSize }}>
                    {title}
                </div>
            )}
            {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>
    );
}

export default TitleWidget;
