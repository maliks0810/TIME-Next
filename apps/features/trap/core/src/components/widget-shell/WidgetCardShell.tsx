import React from 'react';
import { Card, theme } from 'antd';
import { ExpandOutlined } from '@ant-design/icons';
import {
    useTheme,
    getThemeSurfaceMeta,
} from '../../theme/ThemeContext';
import {
    WidgetSizeContext,
    WidgetPixels,
} from './WidgetSizeContext';
import { WidgetMaximizeOverlay } from './WidgetMaximizeOverlay';
import { useIsMaximized } from './WidgetMaximizeContext';
import { ThemeName } from '../../theme/types';

export default function WidgetCardShell(props: {
    style?: Record<string, string>;
    children: React.ReactNode;
    containerClassname?: string;
    overflow?: 'auto' | 'hidden';
    /** Enable the hover expand -> fullscreen popup. */
    expandable?: boolean;
    /** Content to render maximized; defaults to children. */
    maximizedChildren?: React.ReactNode;
}) {
    const { token } = theme.useToken();
    const { themeName } = useTheme();
    const surfaceMeta = getThemeSurfaceMeta(themeName as ThemeName);
    const overflow = props.overflow ?? 'auto';
    const alreadyMaximized = useIsMaximized();

    const measureRef = React.useRef<HTMLDivElement | null>(null);
    const [pixels, setPixels] = React.useState<WidgetPixels>({
        widthPx: 0,
        heightPx: 0,
    });
    const [hovered, setHovered] = React.useState(false);
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        const element = measureRef.current;
        if (!element) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setPixels({
                    widthPx: entry.contentRect.width,
                    heightPx: entry.contentRect.height,
                });
            }
        });

        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    const isWealthLight = themeName === 'wealthLight';
    const isWealthDark = themeName === 'wealthDark';
    const isWealth = isWealthLight || isWealthDark;

    const cardStyle: React.CSSProperties = React.useMemo(() => {
        if (isWealthLight) {
            return {
                height: '100%',
                overflow,
                borderRadius: 3,
                border: '1px solid rgba(120,84,24,0.30)',
                background: '#fffdf8',
                boxShadow: 'none',
                backdropFilter: 'blur(7px)',
                WebkitBackdropFilter: 'blur(7px)',
            };
        }

        if (isWealthDark) {
            return {
                height: '100%',
                overflow,
                borderRadius: 3,
                border: '1px solid rgba(230,180,90,0.16)',
                background: 'rgba(17,13,8,0.66)',
                boxShadow: 'none',
                backdropFilter: 'blur(7px)',
                WebkitBackdropFilter: 'blur(7px)',
            };
        }

        if (surfaceMeta.isGradientTheme) {
            return {
                height: '100%',
                overflow,
                border: '1px solid transparent',
                borderRadius: 10,
                background:
                    `linear-gradient(${token.colorBgContainer}, ${token.colorBgContainer}) padding-box, ` +
                    `${surfaceMeta.widgetBorderGradient} border-box`,
                boxShadow:
                    `inset 0 1px 0 rgba(255,255,255,0.06), ` +
                    `0 0 2px ${surfaceMeta.hudGlow}`,
            };
        }

        return {
            height: '100%',
            overflow,
            borderRadius: 10,
            border: `1px solid ${token.colorBorderSecondary}`,
            boxShadow: 'none',
            background: token.colorBgContainer,
        };
    }, [
        isWealthLight,
        isWealthDark,
        overflow,
        surfaceMeta.isGradientTheme,
        surfaceMeta.widgetBorderGradient,
        surfaceMeta.hudGlow,
        token.colorBgContainer,
        token.colorBorderSecondary,
    ]);

    const style: React.CSSProperties = {
        ...cardStyle,
        ...props.style,
    };

    const showExpand = Boolean(props.expandable && !alreadyMaximized);

    const expandButtonStyle: React.CSSProperties = isWealth
        ? {
              position: 'absolute',
              top: 0,
              right: 0,
              zIndex: 5,
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: isWealthLight
                  ? '1px solid rgba(120,84,24,0.30)'
                  : '1px solid rgba(230,180,90,0.30)',
              borderRadius: 2,
              background: isWealthLight
                  ? '#f6f0e0'
                  : 'rgba(16,13,9,0.94)',
              color: token.colorTextSecondary,
              cursor: 'pointer',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.15s ease',
              pointerEvents: hovered ? 'auto' : 'none',
          }
        : {
              position: 'absolute',
              top: 0,
              right: 0,
              zIndex: 5,
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadius,
              background: token.colorBgElevated,
              color: token.colorTextSecondary,
              cursor: 'pointer',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.15s ease',
              pointerEvents: hovered ? 'auto' : 'none',
          };

    return (
        <>
            <WidgetSizeContext.Provider value={pixels}>
                <Card
                    className={props.containerClassname}
                    size="small"
                    styles={{
                        body: {
                            padding: 12,
                            height: '100%',
                        },
                    }}
                    style={style}
                >
                    <div
                        ref={measureRef}
                        style={{
                            position: 'relative',
                            height: '100%',
                            width: '100%',
                            minHeight: 0,
                        }}
                        onMouseEnter={
                            showExpand
                                ? () => setHovered(true)
                                : undefined
                        }
                        onMouseLeave={
                            showExpand
                                ? () => setHovered(false)
                                : undefined
                        }
                    >
                        {showExpand && (
                            <button
                                type="button"
                                onClick={() => setOpen(true)}
                                aria-label="Expand"
                                style={expandButtonStyle}
                            >
                                <ExpandOutlined />
                            </button>
                        )}

                        {props.children}
                    </div>
                </Card>
            </WidgetSizeContext.Provider>

            {props.expandable && (
                <WidgetMaximizeOverlay
                    open={open}
                    onClose={() => setOpen(false)}
                >
                    {props.maximizedChildren ?? props.children}
                </WidgetMaximizeOverlay>
            )}
        </>
    );
}
