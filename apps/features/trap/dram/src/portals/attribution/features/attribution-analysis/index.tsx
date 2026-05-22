import { Card, Col, Row, Typography } from "antd";
import PathBanner from "./components/PathBanner";
import { AttributionLink } from "./routing/AttributionLink";

export function AttributionWorkspacePage() {
  return (
    <div>
      <Typography.Title level={2}>Multi-Persona Landing</Typography.Title>
      <PathBanner text="Landing page path: select Equity persona, then open Configure Workflow." />
      <Row gutter={[16,16]}>
        <Col xs={24} md={12} lg={8}>
          <Card title="Attribution / Equity">
            <Typography.Title level={5}>Equity Performance Analyst</Typography.Title>
            <Typography.Paragraph>Multiple portfolios selected now render as portfolio groups with each portfolio owning its own period and metric bands.</Typography.Paragraph>
            <AttributionLink route="dashboard">
              Go to Dashboard
            </AttributionLink>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
