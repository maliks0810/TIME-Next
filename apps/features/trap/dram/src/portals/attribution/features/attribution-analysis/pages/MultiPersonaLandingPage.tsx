import { Button, Card, Col, Row, Typography } from "antd";
import PathBanner from "../components/PathBanner";
import { Props } from "../lib/types";

export default function MultiPersonaLandingPage({ onCallback }: Props)  {
  return (
    <div style={{margin:'16px'}}>
      <Typography.Title level={2}>Overview</Typography.Title>
      <PathBanner text="Landing page path: select Equity persona, then open Configure Workflow." />
      <Row gutter={[16,16]}>
        <Col xs={24} md={12} lg={8}>
          <Card title="Performance / Equity">
            <Typography.Title level={5}>Equity Performance Analyst</Typography.Title>
            <Button type="primary" onClick={() => onCallback?.('eq-landing')}>Enter Persona</Button>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Card title="Performance / Emerging Market">
            <Typography.Title level={5}>Emerging Market Performance Analyst</Typography.Title>
            <Button type="primary" onClick={() => onCallback?.('em-landing')}>Enter Persona</Button>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Card title="Performance / Fixed Income">
            <Typography.Title level={5}>Fixed Income Performance Analyst</Typography.Title>
            <Button type="primary" onClick={() => onCallback?.('fi-landing')}>Enter Persona</Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
