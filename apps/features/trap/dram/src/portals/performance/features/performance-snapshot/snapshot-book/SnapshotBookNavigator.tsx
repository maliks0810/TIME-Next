import { CheckCircleFilled, WarningFilled } from "@ant-design/icons";
import { Checkbox, List, Typography } from "antd";
import React from "react";
import { SNAPSHOT_REPORTS } from "./reportManifest";
import type { SnapshotReportId, SnapshotReportStatus } from "./types";

const { Text } = Typography;

interface Props {
  activeReport: SnapshotReportId;
  selectedReports: SnapshotReportId[];
  statuses: Partial<Record<SnapshotReportId, SnapshotReportStatus>>;
  onSelect: (id: SnapshotReportId) => void;
  onSelectionChange: (ids: SnapshotReportId[]) => void;
}

export default function SnapshotBookNavigator(props: Props): React.ReactElement {
  const toggle = (id: SnapshotReportId, checked: boolean): void => {
    const next = checked
      ? [...new Set([...props.selectedReports, id])]
      : props.selectedReports.filter((item) => item !== id);
    props.onSelectionChange(next);
  };

  return (
    <aside className="snapshot-book-nav" aria-label="Snapshot reports">
      <Text className="snapshot-book-nav-title">REPORT BOOK</Text>
      <List
        dataSource={[...SNAPSHOT_REPORTS]}
        renderItem={(report) => {
          const status = props.statuses[report.id];
          return (
            <List.Item
              className={props.activeReport === report.id ? "is-active" : undefined}
              onClick={() => props.onSelect(report.id)}
            >
              <Checkbox
                checked={props.selectedReports.includes(report.id)}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => toggle(report.id, event.target.checked)}
                aria-label={`Include ${report.shortTitle}`}
              />
              <span className="snapshot-book-sequence">{report.sequence}</span>
              <span className="snapshot-book-nav-label">{report.shortTitle}</span>
              {status?.ready ? (
                status.warningCount > 0 ? <WarningFilled className="status-warning" /> : <CheckCircleFilled className="status-ready" />
              ) : null}
            </List.Item>
          );
        }}
      />
    </aside>
  );
}
