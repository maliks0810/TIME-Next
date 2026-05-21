import React from "react";
import { Row, Col, Card, Statistic, Tag } from "antd";
import { KpiItem } from "../lib";

type Props = {
  items: KpiItem[];
};

export const KpiStrip: React.FC<Props> = ({ items }) => {
  return (
    <Row gutter={16}>
      {items.map((kpi, idx) => (
        <Col key={idx} span={24 / items.length}>
          <Card>
            <Statistic
              title={kpi.title}
              value={kpi.value}
              suffix={
                kpi.highlight === "green" ? (
                  <Tag color="green">{kpi.suffix ?? "Validated"}</Tag>
                ) : (
                  kpi.suffix
                )
              }
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};