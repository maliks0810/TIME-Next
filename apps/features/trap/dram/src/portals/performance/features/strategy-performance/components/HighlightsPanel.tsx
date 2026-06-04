import React from "react";
import { Card, Typography } from "antd";
import { formatPct } from "../model/helper";
import { Highlights } from "../api/types";
import { safeSpread } from "../charts/buildSnapshotChartOption.ts";

const { Title, Text } = Typography;

type Props = {
  highlights: Highlights;
};

export function HighlightsPanel({ highlights }: Props): React.JSX.Element {
  return (
    <Card title="Highlights" size="small">
      <div style={{ display: "grid", gap: 12 }}>
        <Card size="small" styles={{ body: { padding: 12, background: "#f6ffed" } }}>
          <Text type="secondary">Best Horizon</Text>
          <div>
            <Title level={5} style={{ margin: "4px 0 0" }}>
              {highlights.best
                ? `${highlights.best.label}: ${formatPct(highlights.best.netReturn)}`
                : "N/A"}
            </Title>
          </div>
        </Card>

        <Card size="small" styles={{ body: { padding: 12, background: "#fff2f0" } }}>
          <Text type="secondary">Worst Horizon</Text>
          <div>
            <Title level={5} style={{ margin: "4px 0 0" }}>
              {highlights.worst
                ? `${highlights.worst.label}: ${formatPct(highlights.worst.netReturn)}`
                : "N/A"}
            </Title>
          </div>
        </Card>

        <Card size="small" styles={{ body: { padding: 12, background: "#fff7e6" } }}>
          <Text type="secondary">Largest Spread</Text>
          <div>
            <Title level={5} style={{ margin: "4px 0 0" }}>

            {highlights.largestSpread
              ? `${highlights.largestSpread.label}: ${formatPct(
                  safeSpread(
                    highlights.largestSpread.grossReturn,
                    highlights.largestSpread.netReturn,
                  ),
                  3,
                )}`
              : "N/A"}

            </Title>
          </div>
        </Card>
      </div>
    </Card>
  );
}