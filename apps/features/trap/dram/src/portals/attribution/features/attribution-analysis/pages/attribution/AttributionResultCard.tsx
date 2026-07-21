import React from "react";
import { Button, Col, Space, Tooltip, Typography } from "antd";
import {
  ColumnWidthOutlined,
  CompressOutlined,
  DragOutlined,
  ExpandAltOutlined,
} from "@ant-design/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const { Text } = Typography;

export type AttribSectionSpan = "half" | "full";

const headerStripStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 8px",
  borderBottom: "1px solid #e5e7eb",
  background: "#f8fafc",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const dragHandleStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  cursor: "grab",
  padding: "2px 6px",
  borderRadius: 4,
  background: "#eef2f7",
};

const gridItemOuterStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d8dee9",
  borderRadius: 8,
  boxShadow: "0 1px 4px rgba(15, 23, 42, 0.03)",
  overflow: "hidden",
  height: "100%",
  display: "flex",
  flexDirection: "column",
};

interface AttributionResultCardProps {
  id: string;
  title: string;
  description?: string;
  span: AttribSectionSpan;
  collapsed: boolean;
  onToggleCollapsed: (id: string) => void;
  onToggleSpan: (id: string) => void;
  children: React.ReactNode;
}

export function AttributionResultCard({
  id,
  title,
  description,
  span,
  collapsed,
  onToggleCollapsed,
  onToggleSpan,
  children,
}: AttributionResultCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const sortableStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 10 : undefined,
    height: "100%",
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
            title={`Drag to rearrange ${title}`}
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
            <Text strong>{title}</Text>
            {!collapsed && description && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                {description}
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
          <div
            className="result-grid-content"
            style={{ padding: 8, flex: 1, minHeight: 0 }}
          >
            {children}
          </div>
        )}
      </div>
    </Col>
  );
}