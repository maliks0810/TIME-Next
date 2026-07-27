import React from 'react';
import { createPortal } from 'react-dom';
import { FullscreenExitOutlined } from '@ant-design/icons';
import { WidgetMaximizeContext } from './WidgetMaximizeContext';
import styles from './WidgetMaximizeOverlay.module.scss';

type Props = {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

/**
 * Finds the element that actually carries the antd CSS-variable theme tokens,
 * so the maximized widget inherits the same --ant-color-* values as its in-grid
 * twin (portaling to document.body would render outside the theme scope).
 */
let cachedThemeRoot: HTMLElement | null = null;
function getThemeRoot(): HTMLElement {
    if (cachedThemeRoot && document.contains(cachedThemeRoot)) {
        return cachedThemeRoot;
    }
    const defines = (el: Element | null): boolean => {
        if (!el) return false;
        const v = getComputedStyle(el as HTMLElement)
            .getPropertyValue('--ant-color-primary')
            .trim();
        return v !== '';
    };
    if (defines(document.documentElement)) {
        cachedThemeRoot = document.documentElement;
        return cachedThemeRoot;
    }
    if (defines(document.body)) {
        cachedThemeRoot = document.body;
        return cachedThemeRoot;
    }
    const all = document.querySelectorAll<HTMLElement>('body *');
    for (const el of all) {
        if (defines(el)) {
            cachedThemeRoot = el;
            return cachedThemeRoot;
        }
    }
    cachedThemeRoot = document.body;
    return cachedThemeRoot;
}

/**
 * Fullscreen overlay that renders a single widget at max. Provides
 * WidgetMaximizeContext(maximized=true) so the widget forces its max layout.
 *
 * The corner control is a RESTORE (exit-fullscreen) action, NOT a close/X — the
 * overlay is a temporary "work large" view; dismissing it returns the widget to
 * the grid to continue working, it does not close/discard anything.
 */
export const WidgetMaximizeOverlay = ({ open, onClose, children }: Props) => {
    const [target, setTarget] = React.useState<HTMLElement | null>(null);

    React.useEffect(() => {
        if (open) setTarget(getThemeRoot());
    }, [open]);

    React.useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    React.useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    if (!open || !target) return null;

    return createPortal(
        <WidgetMaximizeContext.Provider value={{ maximized: true }}>
            <div className={styles.scrim} onClick={onClose}>
                <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Restore"
                        title="Restore"
                    >
                        <FullscreenExitOutlined />
                    </button>
                    <div className={styles.body}>{children}</div>
                </div>
            </div>
        </WidgetMaximizeContext.Provider>,
        target
    );
};