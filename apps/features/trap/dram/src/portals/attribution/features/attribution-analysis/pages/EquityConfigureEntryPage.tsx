import { Button, Card, Col, Row, Typography } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import PathBanner from "../components/PathBanner";

export default function EquityConfigureEntryPage() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const source = search.get("source") || "landing";

  return (
    <div style={{margin:'16px'}}>
      <Typography.Title level={2}>Configure Entry</Typography.Title>
      <PathBanner text={source === "workspace" ? "Path B: Workspace -> Reconfigure -> Wizard opens with mock backend state." : "Path A: Persona Home -> Configure -> Start New / Continue Draft / Load Preset."} />
      <Row gutter={[16,16]}>
        <Col xs={24} md={8}><Card title="Start New"><Typography.Paragraph>Build a new equity workflow from scratch.</Typography.Paragraph><Button type="primary" onClick={() => navigate(`/dram/attribution/dashboard/equity/wizard?source=${source}`)}>Start New</Button></Card></Col>
        <Col xs={24} md={8}><Card title="Continue Draft"><Typography.Paragraph>Resume the saved equity workflow draft.</Typography.Paragraph><Button onClick={() => navigate(`/dram/attribution/dashboard/equity/wizard?source=${source}`)}>Continue</Button></Card></Col>
        <Col xs={24} md={8}><Card title="Load Preset"><Typography.Paragraph>Load a reusable preset such as Sector Selection Compare.</Typography.Paragraph><Button onClick={() => navigate(`/dram/attribution/dashboard/equity/wizard?source=${source}`)}>Load Preset</Button></Card></Col>
      </Row>
    </div>
  );
}
