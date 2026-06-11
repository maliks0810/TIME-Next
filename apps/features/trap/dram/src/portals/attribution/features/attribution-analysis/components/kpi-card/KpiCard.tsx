import React from "react";
import { Card, Typography } from "antd";

const { Title, Text } = Typography;

export type Kpi = {
  title: string;
  subtitle: string;
  value: string;
  actionLink: string;
  status?: "success" | "warning" | "error";
};

type KpiCardProps = {
  kpi: Kpi;
  onCallback?: (info: string) => void;
};

export const KpiCard: React.FC<KpiCardProps> = ({ kpi, onCallback }) => {

  const getStatusColor = () => {
    switch (kpi.status) {
      case "success":
        return "#5F8650";
      case "warning":
        return "#faad14";
      case "error":
        return "#ff4d4f";
      default:
        return "#013D7D";
    }
  };

  return (
    <Card
      hoverable
      onClick={() => onCallback?.(kpi.actionLink)}
      style={{
        borderRadius: 12,
        cursor: "pointer",
        borderLeft: `4px solid ${getStatusColor()}`,
      }}
      bodyStyle={{ padding: 16 }}
    >
      <div style={{ marginBottom: 8 }}>
        <Text type="secondary">{kpi.subtitle}</Text>
      </div>

      <Title level={3} style={{ margin: 0 }}>
        {kpi.value}
      </Title>

      <div style={{ marginTop: 8 }}>
        <Text strong>{kpi.title}</Text>
      </div>
    </Card>
  );
};