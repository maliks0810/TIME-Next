import React from 'react';
import { Card, theme } from 'antd';
import { ExpandOutlined } from '@ant-design/icons';
import { useTheme, getThemeSurfaceMeta } from '../../theme/ThemeContext';
import { WidgetSizeContext, WidgetPixels } from './WidgetSizeContext';
import { WidgetMaximizeOverlay } from './WidgetMaximizeOverlay';
import { useIsMaximized } from './WidgetMaximizeContext';
import { ThemeName } from '../../theme/types';

export default function WidgetCardShell(props: {
    style?: Record<string, string>;
    children: React.ReactNode;
    containerClassname?: string;
    overflow?: 'auto' | 'hidden';
    /** Enable the hover expand → fullscreen popup. */
    expandable?: boolean;
    /** Content to render maximized (defaults to children). */
    maximizedChildren?: React.ReactNode;
}) {
    const { token } = theme.useToken();
    const { themeName } = useTheme();
    const surfaceMeta = getThemeSurfaceMeta(themeName as ThemeName);
    const overflow = props.overflow ?? 'auto';
    const alreadyMax = useIsMaximized();

    const measureRef = React.useRef<HTMLDivElement | null>(null);
    const [pixels, setPixels] = React.useState<WidgetPixels>({ widthPx: 0, heightPx: 0 });
    const [hovered, setHovered] = React.useState(false);
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        const el = measureRef.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setPixels({ widthPx: entry.contentRect.width, heightPx: entry.contentRect.height });
            }
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const cardStyle: React.CSSProperties = surfaceMeta.isGradientTheme
        ? {
              height: '100%',
              overflow,
              border: '1px solid transparent',
              borderRadius: 10,
              background:
                  `linear-gradient(${token.colorBgContainer}, ${token.colorBgContainer}) padding-box, ` +
                  `${surfaceMeta.widgetBorderGradient} border-box`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 2px ${surfaceMeta.hudGlow}`,
          }
        : {
              height: '100%',
              overflow,
              borderRadius: 10,
              border: `1px solid ${token.colorBorderSecondary}`,
              boxShadow: 'none',
              background: token.colorBgContainer,
          };

    const style = { ...cardStyle, ...props.style };

    // Show the expand icon only when expandable AND not already in the popup.
    const showExpand = props.expandable && !alreadyMax;

    return (
        <>
            <WidgetSizeContext.Provider value={pixels}>
                <Card
                    className={props.containerClassname}
                    size="small"
                    styles={{ body: { padding: 12, height: '100%' } }}
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
                        onMouseEnter={showExpand ? () => setHovered(true) : undefined}
                        onMouseLeave={showExpand ? () => setHovered(false) : undefined}
                    >
                        {showExpand && (
                            <button
                                onClick={() => setOpen(true)}
                                aria-label="Expand"
                                style={{
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
                                }}
                            >
                                <ExpandOutlined />
                            </button>
                        )}

                        {props.children}
                    </div>
                </Card>
            </WidgetSizeContext.Provider>

            {props.expandable && (
                <WidgetMaximizeOverlay open={open} onClose={() => setOpen(false)}>
                    {props.maximizedChildren ?? props.children}
                </WidgetMaximizeOverlay>
            )}
        </>
    );
}
