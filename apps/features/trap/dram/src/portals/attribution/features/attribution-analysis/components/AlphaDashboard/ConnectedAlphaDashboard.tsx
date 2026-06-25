import { FC, useEffect, useState } from "react";
import { Alert, Card, Col, DatePicker, Row, Select, Space, Spin } from "antd";
import dayjs, { Dayjs } from "dayjs";

import AlphaDashboard from "./AlphaDashboard";
import { getAlphaRankings, type DashboardPayload, type MetricKey } from "./types/alphaDashboard";
import { getLastMonthEnd } from "./utils/alphaDashboardHelpers";

interface ConnectedAlphaDashboardProps {
  initialAsOfDate?: string;
  initialTopN?: number;
  initialMetric?: MetricKey;
}

export const ConnectedAlphaDashboard: FC<ConnectedAlphaDashboardProps> = ({
  initialAsOfDate = getLastMonthEnd(),
  initialTopN = 5,
  // initialMetric = "alpha",
}) => {
  const [asOfDate, setAsOfDate] = useState<string>(initialAsOfDate);
  const [topN, setTopN] = useState<number>(initialTopN);
  // const [metric, setMetric] = useState<MetricKey>(initialMetric);

  const [payload, setPayload] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const data = await getAlphaRankings({
          asOfDate,
          topN,
          // "alpha",
        });
        if (!cancelled) {
          setPayload(data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setPayload(null);
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [asOfDate, topN]);

  return (
    <div>
      <Card title="Alpha Ranking Dashboard" style={{ marginBottom: 16 }}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Row gutter={[12, 12]}>
            <Col xs={24} md={8} lg={6}>
              <DatePicker
                style={{ width: "100%" }}
                value={dayjs(asOfDate)}
                onChange={(value: Dayjs | null) => {
                  if (value) {
                    setAsOfDate(value.format("YYYY-MM-DD"));
                  }
                }}
              />
            </Col>

            <Col xs={24} md={8} lg={6}>
              <Select<number>
                style={{ width: "100%" }}
                value={topN}
                onChange={(value: number) => setTopN(value)}
                options={[3, 5, 10, 15].map((n) => ({
                  label: `Top ${n}`,
                  value: n,
                }))}
              />
            </Col>

            {/* <Col xs={24} md={8} lg={12}>
              <Segmented<MetricKey>
                block
                value={metric}
                onChange={(value) => setMetric(value)}
                options={[
                  { label: "Alpha", value: "alpha" },
                  { label: "Gross Return", value: "portfolioReturn" },
                  { label: "Net Return", value: "netReturn" },
                ]}
              />
            </Col> */}
          </Row>
        </Space>
      </Card>

      {loading ? (
        <Card>
          <Spin />
        </Card>
      ) : error ? (
        <Alert type="error" message="Failed to load dashboard" description={error} />
      ) : payload ? (
        <AlphaDashboard payload={payload} />
      ) : (
        <Alert type="warning" message="No data available" />
      )}
    </div>
  );
};

export default ConnectedAlphaDashboard;
