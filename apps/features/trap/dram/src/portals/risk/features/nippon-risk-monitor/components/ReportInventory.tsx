import React from "react";
import { Card, List, Button, Space } from "antd";
import { DownloadOutlined, FileExcelOutlined } from "@ant-design/icons";

export type ReportInventoryProps = {
  title: string;
  reports: string[];
  onDownload: (name: string) => void;
  onViewReport: (name: string) => void;
  emptyText?: string;
  highlight?: boolean;
  extra?: React.ReactNode;
};

export const ReportInventory: React.FC<ReportInventoryProps> = ({
  title,
  reports,
  onDownload,
  onViewReport,
  emptyText = "No reports for this month",
  highlight = false,
  extra,
}) => {
  return (
    <Card title={`${title} (${reports.length})`} extra={extra}>
      <List<string>
        dataSource={reports}
        locale={{ emptyText }}
        renderItem={(item: string) => (
          <List.Item
            actions={[
              <Space key={`actions-${item}`}>
                <Button
                  size="small"
                  icon={<FileExcelOutlined />}
                  onClick={() => onViewReport(item)}
                >
                  View
                </Button>

                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  type={highlight ? "primary" : "default"}
                  onClick={() => onDownload(item)}
                >
                  Download
                </Button>
              </Space>
            ]}
          >
            <span
              style={
                highlight
                  ? { color: "#52c41a", fontWeight: 500 }
                  : undefined
              }
            >
              {highlight ? "✅ " : ""}
              {item}
            </span>
          </List.Item>
        )}
      />
    </Card>
  );
};