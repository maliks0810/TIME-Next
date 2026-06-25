import React from "react";
import { ConfigProvider, theme } from "antd";

interface EnterpriseThemeProviderProps {
  children: React.ReactNode;
}

export function EnterpriseThemeProvider({ children }: EnterpriseThemeProviderProps) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1d4ed8",
          colorInfo: "#2563eb",
          colorSuccess: "#15803d",
          colorWarning: "#b45309",
          colorError: "#b91c1c",
          colorBgLayout: "#f3f6fb",
          colorBgContainer: "#ffffff",
          colorBorder: "#d8dee9",
          borderRadius: 6,
          borderRadiusLG: 8,
          fontSize: 13,
          fontSizeHeading5: 15,
          controlHeight: 30,
          controlHeightSM: 26,
          controlHeightLG: 34,
          padding: 12,
          paddingSM: 8,
          paddingXS: 4,
          margin: 12,
          marginSM: 8,
          marginXS: 4
        },
        components: {
          Card: {
            headerHeight: 38,
            paddingLG: 12
          },
          Drawer: {
            paddingLG: 12
          },
          Table: {
            headerBg: "#f8fafc",
            headerColor: "#334155",
            cellPaddingBlock: 6,
            cellPaddingInline: 8,
            rowHoverBg: "#f1f5f9"
          },
          Form: {
            itemMarginBottom: 10,
            labelFontSize: 12
          },
          Select: {
            optionFontSize: 13
          },
          Button: {
            controlHeight: 30,
            paddingInline: 12
          },
          Tag: {
            borderRadiusSM: 4
          }
        }
      }}
    >
      {children}
    </ConfigProvider>
  );
}
