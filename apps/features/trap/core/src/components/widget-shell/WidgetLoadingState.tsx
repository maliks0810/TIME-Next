import React from "react";
import { Space, Spin, Typography } from "antd";

export default function WidgetLoadingState() {
  return (
    <Space>
      <Spin size="small" />
      <Typography.Text type="secondary">Loading…</Typography.Text>
    </Space>
  );
}