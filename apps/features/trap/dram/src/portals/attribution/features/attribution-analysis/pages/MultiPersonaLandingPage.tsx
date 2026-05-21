import { Button, Card, Col, Row, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import PathBanner from "../components/PathBanner";

export default function MultiPersonaLandingPage() {
  const navigate = useNavigate();
  return (
    <div>
      <Typography.Title level={2}>Multi-Persona Landing</Typography.Title>
      <PathBanner text="Landing page path: select Equity persona, then open Configure Workflow." />
      <Row gutter={[16,16]}>
        <Col xs={24} md={12} lg={8}>
          <Card title="Performance / Equity">
            <Typography.Title level={5}>Equity Performance Analyst</Typography.Title>
            <Typography.Paragraph>Multiple portfolios selected now render as portfolio groups with each portfolio owning its own period and metric bands.</Typography.Paragraph>
            <Button type="primary" onClick={() => navigate("/equity/home")}>Enter Persona</Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
