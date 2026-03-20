import React from 'react';
import { Card, theme } from 'antd';

import { useTheme, getThemeSurfaceMeta } from '../../theme/ThemeContext';

export default function WidgetCardShell(props: { children: React.ReactNode }) {
    const { token } = theme.useToken();
    const { themeName } = useTheme();
    const surfaceMeta = getThemeSurfaceMeta(themeName);

    const cardStyle: React.CSSProperties = surfaceMeta.isGradientTheme
        ? {
              height: '100%',
              overflow: 'auto',
              border: '1px solid transparent',
              borderRadius: 10,
              background: `${
                  `linear-gradient(${token.colorBgContainer}, ${token.colorBgContainer}) padding-box, ` +
                  `${surfaceMeta.widgetBorderGradient} border-box`
              }`,
              boxShadow: `
          inset 0 1px 0 rgba(255,255,255,0.06),
          0 0 2px ${surfaceMeta.hudGlow}
        `,
          }
        : {
              height: '100%',
              overflow: 'auto',
              borderRadius: 10,
              border: `1px solid ${token.colorBorderSecondary}`,
              boxShadow: 'none',
              background: token.colorBgContainer,
          };

    return (
        <Card size="small" bodyStyle={{ padding: 12, height: '100%' }} style={cardStyle}>
            {props.children}
        </Card>
    );
}
