import React from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Segmented,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography
} from "antd";
import type { TableProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  AuditOutlined,
  BarChartOutlined,
  ColumnWidthOutlined,
  CompressOutlined,
  DragOutlined,
  ExpandAltOutlined,
  GroupOutlined,
  ReloadOutlined,
  TableOutlined,
  UnorderedListOutlined
} from "@ant-design/icons";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DriverAnalysisResult, DriverRow } from "./driverTypes";
import type { DriverColumnConfigItem, DriverColumnConfigState } from "./columnConfigTypes";
import { DriverEChartsPanel } from "./DriverEChartsPanel";
import { AttributionAnalysisPanel } from "./AttributionAnalysisPanel";

const { Text } = Typography;

export type DriverGridViewMode = "flat" | "period";

type ResultSectionId =
  | "kpis"
  | "charts"
  | "attribution"
  | "audit"
  | "topDrivers"
  | "bottomDrivers";

/** Column span presets (AntD 24-col grid). "half" = 12, "full" = 24. */
type SectionSpan = "half" | "full";

interface DriverResultsPanelProps {
  result?: DriverAnalysisResult;
  gridViewMode: DriverGridViewMode;
  onGridViewModeChange: (mode: DriverGridViewMode) => void;
  columnConfig: DriverColumnConfigState;
}

type PeriodGroupRow = {
  key: string;
  portfolioId: string;
  period: string;
  direction: "top" | "bottom";
  rank: number;
  driverName: string;
  metricName: string;
  metricLabel: string;
  metricValue: number;
  metricDisplay: string;
  isPeriodGroup: true;
  children: DriverRow[];
};

type DriverGridRow = DriverRow | PeriodGroupRow;

function isPeriodGroupRow(row: DriverGridRow): row is PeriodGroupRow {
  return "isPeriodGroup" in row && row.isPeriodGroup === true;
}

const RESULT_ORDER_STORAGE_KEY = "driver-analysis-result-order-v3";
const RESULT_SPAN_STORAGE_KEY = "driver-analysis-result-spans-v3";
const RESULT_COLLAPSED_STORAGE_KEY = "driver-analysis-result-collapsed-state-v3";

const resultSectionIds: ResultSectionId[] = [
  "kpis",
  "charts",
  "attribution",
  "audit",
  "topDrivers",
  "bottomDrivers"
];

const sectionLabels: Record<ResultSectionId, string> = {
  kpis: "KPI Summary",
  charts: "Driver Charts",
  attribution: "Attribution Analysis",
  audit: "Run Audit",
  topDrivers: "Top Drivers",
  bottomDrivers: "Bottom Drivers"
};

const sectionDescriptions: Record<ResultSectionId, string> = {
  kpis: "Portfolio, period, and contribution totals",
  charts: "Top and bottom driver visuals",
  attribution: "Attribution KPIs, effects, and breakdown",
  audit: "Run metadata and processing summary",
  topDrivers: "Highest positive contributors",
  bottomDrivers: "Largest detractors"
};

type ResultCollapsedState = Record<ResultSectionId, boolean>;
type ResultSpanState = Record<ResultSectionId, SectionSpan>;

const defaultCollapsedState: ResultCollapsedState = {
  kpis: false,
  charts: false,
  attribution: false,
  audit: false,
  topDrivers: false,
  bottomDrivers: false
};

const defaultSpanState: ResultSpanState = {
  kpis: "full",
  charts: "half",
  attribution: "full",
  audit: "half",
  topDrivers: "half",
  bottomDrivers: "half"
};

const defaultOrder: ResultSectionId[] = [...resultSectionIds];

const cardStyle: React.CSSProperties = {
  borderRadius: 8,
  border: "1px solid #d8dee9",
  boxShadow: "0 1px 4px rgba(15, 23, 42, 0.03)"
};

const cardBodyStyle: React.CSSProperties = { padding: 10 };

const headerStripStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 8px",
  borderBottom: "1px solid #e5e7eb",
  background: "#f8fafc",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8
};

const dragHandleStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  cursor: "grab",
  padding: "2px 6px",
  borderRadius: 4,
  background: "#eef2f7"
};

const gridItemOuterStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d8dee9",
  borderRadius: 8,
  boxShadow: "0 1px 4px rgba(15, 23, 42, 0.03)",
  overflow: "hidden",
  height: "100%",
  display: "flex",
  flexDirection: "column"
};

const formatBps = (value: number) => `${(value * 10000).toFixed(1)} bps`;

const formatMetricValue = (
  value: number,
  format: DriverAnalysisResult["metric"]["format"]
) => {
  if (format === "usd") {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
  if (format === "percent") {
    return `${(value * 100).toFixed(2)}%`;
  }
  if (format === "number") {
    return value.toFixed(6);
  }
  return formatBps(value);
};

const createPeriodGroupRows = (
  rows: DriverRow[],
  result: DriverAnalysisResult,
  direction: "top" | "bottom"
): DriverGridRow[] => {
  const groupRows: Array<PeriodGroupRow | undefined> = result.periods.map((period) => {
    const periodRows = rows
      .filter((row) => row.period === period)
      .sort((a, b) => a.portfolioId.localeCompare(b.portfolioId) || a.rank - b.rank);

    if (periodRows.length === 0) return undefined;

    const total = periodRows.reduce((sum, row) => sum + row.metricValue, 0);

    return {
      key: `${direction}-period-group-${period}`,
      portfolioId: result.portfolioIds.length > 1 ? "Multiple" : result.portfolioId,
      period,
      direction,
      rank: 0,
      driverName: `${period} ${direction === "top" ? "Top" : "Bottom"} Drivers`,
      metricName: result.metric.name,
      metricLabel: result.metric.label,
      metricValue: total,
      metricDisplay: formatMetricValue(total, result.metric.format),
      isPeriodGroup: true,
      children: periodRows
    };
  });

  return groupRows.filter((row): row is PeriodGroupRow => row !== undefined);
};

const isNumericColumnCategory = (category?: string) =>
  ["Metric", "Attribution", "Returns", "Risk", "P&L"].includes(category ?? "");

const createColumns = (
  selectedColumns: DriverColumnConfigItem[]
): ColumnsType<DriverGridRow> =>
  selectedColumns.map((column) => {
    if (column.key === "period") {
      return {
        title: column.title,
        dataIndex: "period",
        width: column.width ?? 90,
        fixed: "left",
        render: (value, row) => (
          <Tag color={isPeriodGroupRow(row) ? "geekblue" : "blue"}>{value}</Tag>
        )
      };
    }

    if (column.key === "rank") {
      return {
        title: column.title,
        dataIndex: "rank",
        width: column.width ?? 70,
        align: "center",
        render: (value, row) => (isPeriodGroupRow(row) ? "\u2014" : value)
      };
    }

    if (column.key === "driverName") {
      return {
        title: column.title,
        dataIndex: "driverName",
        width: column.width ?? 220,
        ellipsis: true,
        render: (value, row) => (
          <Text
            strong={isPeriodGroupRow(row)}
            style={isPeriodGroupRow(row) ? { color: "#0f172a" } : undefined}
          >
            {value}
          </Text>
        )
      };
    }

    if (column.key === "metricDisplay") {
      return {
        title: column.title,
        dataIndex: "metricDisplay",
        width: column.width ?? 140,
        align: "right",
        render: (value, row) => (
          <Text
            strong={isPeriodGroupRow(row)}
            type={row.direction === "top" ? "success" : "danger"}
          >
            {value}
          </Text>
        )
      };
    }

    return {
      title: column.title,
      dataIndex: column.dataIndex,
      width: column.width ?? 140,
      ellipsis: true,
      align: isNumericColumnCategory(column.category) ? "right" : "left",
      render: (value: unknown, row: DriverGridRow) => {
        if (isPeriodGroupRow(row) && column.key !== "metricLabel") {
          return column.key === "metricDisplay" ? row.metricDisplay : "\u2014";
        }
        if (typeof value === "number") {
          return formatBps(value);
        }
        return value === undefined || value === null || value === "" ? "\u2014" : String(value);
      }
    };
  });

/* ---------------- persistence helpers ---------------- */

function loadOrder(): ResultSectionId[] {
  try {
    const raw = window.localStorage.getItem(RESULT_ORDER_STORAGE_KEY);
    if (!raw) return defaultOrder;
    const parsed = JSON.parse(raw) as ResultSectionId[];
    const valid = parsed.filter((id) => resultSectionIds.includes(id));
    const missing = defaultOrder.filter((id) => !valid.includes(id));
    return [...valid, ...missing];
  } catch {
    return defaultOrder;
  }
}

function persistOrder(order: ResultSectionId[]) {
  window.localStorage.setItem(RESULT_ORDER_STORAGE_KEY, JSON.stringify(order));
}

function loadSpans(): ResultSpanState {
  try {
    const raw = window.localStorage.getItem(RESULT_SPAN_STORAGE_KEY);
    if (!raw) return defaultSpanState;
    return { ...defaultSpanState, ...(JSON.parse(raw) as Partial<ResultSpanState>) };
  } catch {
    return defaultSpanState;
  }
}

function persistSpans(state: ResultSpanState) {
  window.localStorage.setItem(RESULT_SPAN_STORAGE_KEY, JSON.stringify(state));
}

function loadCollapsed(): ResultCollapsedState {
  try {
    const raw = window.localStorage.getItem(RESULT_COLLAPSED_STORAGE_KEY);
    if (!raw) return defaultCollapsedState;
    return {
      ...defaultCollapsedState,
      ...(JSON.parse(raw) as Partial<ResultCollapsedState>)
    };
  } catch {
    return defaultCollapsedState;
  }
}

function persistCollapsed(state: ResultCollapsedState) {
  window.localStorage.setItem(RESULT_COLLAPSED_STORAGE_KEY, JSON.stringify(state));
}

/* ---------------- sortable card ---------------- */

interface SortableResultCardProps {
  id: ResultSectionId;
  span: SectionSpan;
  collapsed: boolean;
  onToggleCollapsed: (id: ResultSectionId) => void;
  onToggleSpan: (id: ResultSectionId) => void;
  children: React.ReactNode;
}

function SortableResultCard({
  id,
  span,
  collapsed,
  onToggleCollapsed,
  onToggleSpan,
  children
}: SortableResultCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const sortableStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 10 : undefined,
    height: "100%"
  };

  const colSpan = span === "full" ? 24 : 12;

  return (
    <Col xs={24} md={colSpan}>
      <div
        ref={setNodeRef}
        style={{ ...gridItemOuterStyle, ...sortableStyle }}
        className={`result-grid-item ${collapsed ? "result-grid-item-collapsed" : ""}`}
      >
        <div className="result-card-header-strip" style={headerStripStyle}>
          <span
            className="result-card-drag-handle"
            title={`Drag to rearrange ${sectionLabels[id]}`}
            style={dragHandleStyle}
            {...attributes}
            {...listeners}
          >
            <DragOutlined style={{ color: "#64748b", fontSize: 12 }} />
            <Text type="secondary" style={{ fontSize: 11 }}>
              Move
            </Text>
          </span>

          <Space
            direction="vertical"
            size={0}
            className="result-card-title-block"
            style={{ flex: 1 }}
          >
            <Text strong>{sectionLabels[id]}</Text>
            {!collapsed && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                {sectionDescriptions[id]}
              </Text>
            )}
          </Space>

          <Space size={4} className="result-card-actions">
            <Tooltip title={span === "full" ? "Shrink to half width" : "Expand to full width"}>
              <Button
                size="small"
                type="text"
                icon={<ColumnWidthOutlined />}
                onClick={() => onToggleSpan(id)}
              />
            </Tooltip>
            <Tooltip title={collapsed ? "Expand component" : "Collapse to title only"}>
              <Button
                size="small"
                type="text"
                icon={collapsed ? <ExpandAltOutlined /> : <CompressOutlined />}
                onClick={() => onToggleCollapsed(id)}
              />
            </Tooltip>
          </Space>
        </div>
        {!collapsed && (
          <div className="result-grid-content" style={{ padding: 8, flex: 1, minHeight: 0 }}>
            {children}
          </div>
        )}
      </div>
    </Col>
  );
}

/* ---------------- main component ---------------- */

export function DriverResultsPanel({
  result,
  gridViewMode,
  onGridViewModeChange,
  columnConfig
}: DriverResultsPanelProps) {
  const [order, setOrder] = React.useState<ResultSectionId[]>(() => loadOrder());
  const [spans, setSpans] = React.useState<ResultSpanState>(() => loadSpans());
  const [collapsedState, setCollapsedState] = React.useState<ResultCollapsedState>(
    () => loadCollapsed()
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!result) {
    return (
      <Card size="small" style={cardStyle} bodyStyle={{ padding: 28 }}>
        <Empty
          description="Configure the driver analysis controls and run analysis."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  const resetResultLayout = () => {
    setOrder(defaultOrder);
    persistOrder(defaultOrder);
    setSpans(defaultSpanState);
    persistSpans(defaultSpanState);
    setCollapsedState(defaultCollapsedState);
    persistCollapsed(defaultCollapsedState);
    window.dispatchEvent(new Event("resize"));
  };

  const handleToggleCollapsed = (sectionId: ResultSectionId) => {
    const next: ResultCollapsedState = {
      ...collapsedState,
      [sectionId]: !collapsedState[sectionId]
    };
    setCollapsedState(next);
    persistCollapsed(next);
    window.dispatchEvent(new Event("resize"));
  };

  const handleToggleSpan = (sectionId: ResultSectionId) => {
    const next: ResultSpanState = {
      ...spans,
      [sectionId]: spans[sectionId] === "full" ? "half" : "full"
    };
    setSpans(next);
    persistSpans(next);
    window.dispatchEvent(new Event("resize"));
  };

  const expandAllResultSections = () => {
    setCollapsedState(defaultCollapsedState);
    persistCollapsed(defaultCollapsedState);
    window.dispatchEvent(new Event("resize"));
  };

  const collapseAllResultSections = () => {
    const next = resultSectionIds.reduce<ResultCollapsedState>(
      (state, sectionId) => ({ ...state, [sectionId]: true }),
      { ...defaultCollapsedState }
    );
    setCollapsedState(next);
    persistCollapsed(next);
    window.dispatchEvent(new Event("resize"));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id) as ResultSectionId;
    const overId = String(over.id) as ResultSectionId;
    const oldIndex = order.indexOf(activeId);
    const newIndex = order.indexOf(overId);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(order, oldIndex, newIndex);
    setOrder(next);
    persistOrder(next);
  };

  const topTotal = result.topDrivers.reduce((sum, row) => sum + row.metricValue, 0);
  const bottomTotal = result.bottomDrivers.reduce((sum, row) => sum + row.metricValue, 0);

  const topRows: DriverGridRow[] =
    gridViewMode === "period"
      ? createPeriodGroupRows(result.topDrivers, result, "top")
      : result.topDrivers;

  const bottomRows: DriverGridRow[] =
    gridViewMode === "period"
      ? createPeriodGroupRows(result.bottomDrivers, result, "bottom")
      : result.bottomDrivers;

  const tableExpandable: TableProps<DriverGridRow>["expandable"] =
    gridViewMode === "period"
      ? { defaultExpandAllRows: true, indentSize: 14 }
      : undefined;

  const gridModeToggle = (
    <Segmented
      size="small"
      value={gridViewMode}
      onChange={(value) => onGridViewModeChange(value as DriverGridViewMode)}
      options={[
        { label: "Flat", value: "flat", icon: <UnorderedListOutlined /> },
        { label: "By Period", value: "period", icon: <GroupOutlined /> }
      ]}
    />
  );

  const sections: Record<ResultSectionId, React.ReactNode> = {
    kpis: (
      <Row gutter={[10, 10]}>
        <Col xs={24} md={6}>
          <Card size="small" style={cardStyle} bodyStyle={cardBodyStyle}>
            <Statistic
              title="Portfolios"
              value={
                result.portfolioIds.length === 1
                  ? result.portfolioId
                  : result.portfolioIds.length
              }
              suffix={result.portfolioIds.length === 1 ? undefined : "selected"}
              valueStyle={{ fontSize: 18, fontWeight: 600 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {result.portfolioIds.join(", ")} \u00b7 As of {result.asOfDate}
            </Text>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card size="small" style={cardStyle} bodyStyle={cardBodyStyle}>
            <Statistic
              title="Periods"
              value={result.periods.join(", ")}
              valueStyle={{ fontSize: 18, fontWeight: 600 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Multi-period run
            </Text>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card size="small" style={cardStyle} bodyStyle={cardBodyStyle}>
            <Statistic
              title="Top Total"
              value={topTotal * 10000}
              precision={2}
              suffix="bps"
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: "#1d4ed8", fontSize: 18, fontWeight: 600 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {result.summary.topCount} rows
            </Text>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card size="small" style={cardStyle} bodyStyle={cardBodyStyle}>
            <Statistic
              title="Bottom Total"
              value={bottomTotal * 10000}
              precision={2}
              suffix="bps"
              prefix={<ArrowDownOutlined />}
              valueStyle={{ color: "#b91c1c", fontSize: 18, fontWeight: 600 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {result.summary.bottomCount} rows
            </Text>
          </Card>
        </Col>
      </Row>
    ),
    charts: <DriverEChartsPanel result={result} />,
    attribution: result.attributionBreakdown?.length ? (
      <AttributionAnalysisPanel result={result} />
    ) : null,
    audit: (
      <Card
        size="small"
        style={cardStyle}
        title={
          <Space>
            <AuditOutlined />
            Run Audit
          </Space>
        }
      >
        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          <Text>
            <strong>Run ID:</strong> {result.runId}
          </Text>
          <Text>
            <strong>Status:</strong> <Tag color="green">{result.summary.status}</Tag>
          </Text>
          <Text>
            <strong>Portfolios:</strong> {result.portfolioIds.join(", ")}
          </Text>
          <Text>
            <strong>Metric:</strong> {result.metric.label}
          </Text>
          <Text>
            <strong>Group:</strong> {result.groupBy.join(", ")}
          </Text>
          <Text>
            <strong>Grid:</strong>{" "}
            {gridViewMode === "period" ? "Grouped by period" : "Flat rows"}
          </Text>
          <Text>
            <strong>Layout:</strong> Drag by header; toggle half/full width
          </Text>
          <Text>
            <strong>Input Rows:</strong> {result.summary.inputRows}
          </Text>
          <Text>
            <strong>Filtered:</strong> {result.summary.filteredRows}
          </Text>
          <Text>
            <strong>Duration:</strong> {result.summary.durationMs} ms
          </Text>
        </Space>
      </Card>
    ),
    topDrivers: (
      <Card
        size="small"
        style={cardStyle}
        title={
          <Space>
            <ArrowUpOutlined />
            <TableOutlined />
            Top Drivers
          </Space>
        }
        extra={gridModeToggle}
      >
        <Table<DriverGridRow>
          rowKey="key"
          size="small"
          bordered
          columns={createColumns(columnConfig.selectedColumns)}
          dataSource={topRows}
          expandable={tableExpandable}
          pagination={gridViewMode === "period" ? false : { pageSize: 8, size: "small" }}
          scroll={{ x: 980 }}
          rowClassName={(row) =>
            isPeriodGroupRow(row) ? "driver-period-group-row" : ""
          }
        />
      </Card>
    ),
    bottomDrivers: (
      <Card
        size="small"
        style={cardStyle}
        title={
          <Space>
            <ArrowDownOutlined />
            <TableOutlined />
            Bottom Drivers
          </Space>
        }
        extra={gridModeToggle}
      >
        <Table<DriverGridRow>
          rowKey="key"
          size="small"
          bordered
          columns={createColumns(columnConfig.selectedColumns)}
          dataSource={bottomRows}
          expandable={tableExpandable}
          pagination={gridViewMode === "period" ? false : { pageSize: 8, size: "small" }}
          scroll={{ x: 980 }}
          rowClassName={(row) =>
            isPeriodGroupRow(row) ? "driver-period-group-row" : ""
          }
        />
      </Card>
    )
  };

  const activeOrderedIds = order.filter((sectionId) => Boolean(sections[sectionId]));

  return (
    <Space direction="vertical" size={10} style={{ width: "100%" }}>
      {result.summary.warnings && result.summary.warnings.length > 0 && (
        <Alert
          type="warning"
          showIcon
          message="Analysis completed with warnings"
          description={result.summary.warnings.join(" ")}
        />
      )}

      <Card size="small" style={cardStyle} bodyStyle={{ padding: "6px 10px" }}>
        <Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
          <Space size={6} wrap>
            <BarChartOutlined style={{ color: "#1d4ed8" }} />
            <Text strong>Result Layout</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Drag card headers to reorder \u00b7 toggle half/full width \u00b7 collapse to
              title-only rows.
            </Text>
          </Space>
          <Space size={6} wrap>
            <Button size="small" onClick={expandAllResultSections}>
              Expand All
            </Button>
            <Button size="small" onClick={collapseAllResultSections}>
              Collapse All
            </Button>
            <Tooltip title="Restore default order, widths, and expanded state">
              <Button size="small" icon={<ReloadOutlined />} onClick={resetResultLayout}>
                Reset Layout
              </Button>
            </Tooltip>
          </Space>
        </Space>
      </Card>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={activeOrderedIds} strategy={rectSortingStrategy}>
          <Row gutter={[10, 10]} align="stretch">
            {activeOrderedIds.map((sectionId) => (
              <SortableResultCard
                key={sectionId}
                id={sectionId}
                span={spans[sectionId]}
                collapsed={collapsedState[sectionId]}
                onToggleCollapsed={handleToggleCollapsed}
                onToggleSpan={handleToggleSpan}
              >
                {sections[sectionId]}
              </SortableResultCard>
            ))}
          </Row>
        </SortableContext>
      </DndContext>
    </Space>
  );
}
