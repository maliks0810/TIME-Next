import React from "react";
import { Row, Col } from "antd";
import { Kpi, KpiCard } from "./KpiCard";

type Props = {
  kpis: Kpi[];
};

export const KpiGrid: React.FC<Props> = ({ kpis }) => {
  return (
    <Row gutter={[16, 16]}>
      {kpis.map((kpi) => (
        <Col key={kpi.title} xs={24} sm={12} md={12} lg={6}>
          <KpiCard kpi={kpi} />
        </Col>
      ))}
    </Row>
  );
};