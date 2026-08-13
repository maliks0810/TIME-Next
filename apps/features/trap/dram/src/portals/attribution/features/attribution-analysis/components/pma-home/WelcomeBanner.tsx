import {
  Badge,
  Card,
  Col,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";

import {
  AuditOutlined,
  FundOutlined,
  PieChartOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

const { Title, Text } = Typography;

export interface WelcomeBannerProps {
  userName: string;
  persona: string;
  location?: string;
  date?: Date;

  assignedPortfolios?: number;
  activeAnalyses?: number;

  kpis?: {
    title: string;
    value: number | string;
  }[];
}

const PERSONA_ICONS: Record<string, React.ReactNode> = {
  "PMA Analyst": <FundOutlined />,
  "Portfolio Manager": <PieChartOutlined />,
  "Client Services": <TeamOutlined />,
  "Portfolio Specialist": <AuditOutlined />,
};

const PERSONA_MESSAGES: Record<string, string> = {
  "PMA Analyst":
    "Monitor attribution trends, investigate performance drivers, and continue active analyses.",

  "Portfolio Manager":
    "Review portfolio outcomes, assess benchmark-relative performance, and identify investment opportunities.",

  "Client Services":
    "Access portfolio insights, performance commentary, and client reporting materials.",

  "Portfolio Specialist":
    "Validate portfolio analytics, support investment teams, and monitor operational exceptions.",
};

function getGreeting(date: Date): string {
  const hour = dayjs(date).hour();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";

  return "Good evening";
}

export default function WelcomeBanner({
  userName,
  persona,
  location = "Los Angeles",
  date = new Date(),
  assignedPortfolios,
  activeAnalyses,
  kpis = [],
}: WelcomeBannerProps) {
  const greeting = getGreeting(date);

  const personaMessage =
    PERSONA_MESSAGES[persona] ??
    "Access portfolio analytics and insights.";

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 12,
        overflow: "hidden",
        boxShadow:
          "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
      }}
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      <Row>
        {/* Left Accent */}
        <Col flex="5px">
          <div
            style={{
              height: "100%",
              background: "#7C3AED",
            }}
          />
        </Col>

        {/* Main Content */}
        <Col flex="auto">
          <div
            style={{
              padding: "24px 28px",
              background:
                "linear-gradient(90deg, #FFFFFF 0%, #FAF7FF 100%)",
            }}
          >
            <Row gutter={[24, 24]} align="middle">
              {/* Greeting */}
              <Col xs={24} xl={14}>
                <Space direction="vertical" size={10}>
                  <Space align="center" wrap>
                    <Title
                      level={2}
                      style={{
                        margin: 0,
                        fontWeight: 700,
                      }}
                    >
                      {greeting}, {userName}
                    </Title>

                    <Tag
                      icon={PERSONA_ICONS[persona]}
                      style={{
                        background: "#7C3AED",
                        color: "#fff",
                        border: 0,
                        borderRadius: 999,
                        fontWeight: 600,
                        paddingInline: 12,
                      }}
                    >
                      {persona}
                    </Tag>
                  </Space>

                  <Text
                    type="secondary"
                    style={{
                      fontSize: 13,
                    }}
                  >
                    {dayjs(date).format(
                      "dddd, MMMM D, YYYY"
                    )}{" "}
                    • {location}
                  </Text>

                  <Text
                    style={{
                      fontSize: 14,
                      color: "#595959",
                      maxWidth: 700,
                      lineHeight: 1.6,
                    }}
                  >
                    {personaMessage}
                  </Text>

                  {(assignedPortfolios !== undefined ||
                    activeAnalyses !== undefined) && (
                    <Space wrap>
                      {assignedPortfolios !== undefined && (
                        <Badge
                          status="processing"
                          text={`${assignedPortfolios} Assigned Portfolios`}
                        />
                      )}

                      {activeAnalyses !== undefined && (
                        <Badge
                          status="warning"
                          text={`${activeAnalyses} Analyses In Progress`}
                        />
                      )}
                    </Space>
                  )}
                </Space>
              </Col>

              {/* KPI Section */}
              <Col xs={24} xl={10}>
                <Row gutter={[12, 12]}>
                  {kpis.map((kpi) => (
                    <Col
                      xs={12}
                      sm={12}
                      md={12}
                      xl={12}
                      key={kpi.title}
                    >
                      <Card
                        size="small"
                        styles={{
                          body: {
                            padding: 12,
                          },
                        }}
                      >
                        <Statistic
                          title={kpi.title}
                          value={kpi.value}
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </Card>
  );
}