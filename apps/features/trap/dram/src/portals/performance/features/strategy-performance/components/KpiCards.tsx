import React from "react";
import { Card, Col, Row, Typography } from "antd";
import type { KpiCardItem } from "../api/types";
import { formatPct, getToneColor } from "../model/helper";

const { Title, Text } = Typography;

type Props = {
  items: KpiCardItem[];
};

export function KpiCards({ items }: Props): React.JSX.Element {
  return (
    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
      {items.map((item) => (
        <Col key={item.key} xs={24} sm={12} lg={8} xl={4}>
          <Card size="small">
            <Text type="secondary">{item.title}</Text>
            <div style={{ marginTop: 8 }}>
              <Title
                level={4}
                style={{ margin: 0, color: getToneColor(item.tone) }}
              >
                {formatPct(item.value, item.key.includes("spread") ? 3 : 2)}
              </Title>
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {item.helper}
            </Text>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
