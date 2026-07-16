import React from "react";
import { Alert, Button, Card, Col, Input, Popconfirm, Row, Select, Space, Tag, Typography } from "antd";
import { DeleteOutlined, FolderOpenOutlined, PlayCircleOutlined, SaveOutlined, StarFilled, StarOutlined } from "@ant-design/icons";
import type { DriverSavedView } from "./savedViewsStorage";

const { Text } = Typography;

interface SavedViewsPanelProps {
  views: DriverSavedView[];
  activeViewId?: string;
  favoriteViewId?: string;
  defaultName: string;
  onSave: (name: string, description?: string) => void;
  onDelete: (viewId: string) => void;
  onSetFavorite: (viewId: string | undefined) => void;
  onLoad: (viewId: string, options?: { autoRun?: boolean }) => void;
}

export function SavedViewsPanel({
  views,
  activeViewId,
  favoriteViewId,
  defaultName,
  onSave,
  onLoad,
  onDelete,
  onSetFavorite
}: SavedViewsPanelProps) {
  const [selectedViewId, setSelectedViewId] = React.useState<string | undefined>(activeViewId);
  const [viewName, setViewName] = React.useState(defaultName);
  const [description, setDescription] = React.useState("");

  React.useEffect(() => {
    setSelectedViewId(activeViewId);
  }, [activeViewId]);

  React.useEffect(() => {
    setViewName(defaultName);
  }, [defaultName]);

  const selectedView = views.find((view) => view.id === selectedViewId);
  const isSelectedFavorite = Boolean(selectedViewId && favoriteViewId === selectedViewId);

  return (
    <Card
      title="Saved Views"
      size="small"
      style={{ marginBottom: 10, borderRadius: 8, border: "1px solid #d8dee9" }}
      bodyStyle={{ padding: 10 }}
      extra={<Tag color="blue">{views.length} saved</Tag>}
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Row gutter={8}>
          <Col span={16}>
            <Select
              size="small"
              allowClear
              showSearch
              style={{ width: "100%" }}
              placeholder="Load a saved view"
              value={selectedViewId}
              optionFilterProp="label"
              onChange={setSelectedViewId}
              options={views.map((view) => ({
                label: favoriteViewId === view.id ? `★ ${view.name}` : view.name,
                value: view.id
              }))}
            />
          </Col>
          <Col span={8}>
            <Space size={6}>
              <Button
                size="small"
                icon={<FolderOpenOutlined />}
                disabled={!selectedViewId}
                onClick={() => selectedViewId && onLoad(selectedViewId)}
              >
                Load
              </Button>

              <Button
                size="small"
                type="primary"
                ghost
                icon={<PlayCircleOutlined />}
                onClick={() => onLoad(selectedViewId ?? "", { autoRun: true })}
              >
                Load & Run
              </Button>

              <Button
                size="small"
                icon={isSelectedFavorite ? <StarFilled /> : <StarOutlined />}
                disabled={!selectedViewId}
                onClick={() => onSetFavorite(isSelectedFavorite ? undefined : selectedViewId)}
              >
                {isSelectedFavorite ? "Unset" : "Favorite"}
              </Button>
              <Popconfirm
                title="Delete saved view?"
                description="This removes the saved configuration from local storage."
                okText="Delete"
                okButtonProps={{ danger: true }}
                onConfirm={() => selectedViewId && onDelete(selectedViewId)}
                disabled={!selectedViewId}
              >
                <Button size="small" danger icon={<DeleteOutlined />} disabled={!selectedViewId} />
              </Popconfirm>
            </Space>
          </Col>
        </Row>

        {selectedView && (
          <Alert
            type="info"
            showIcon
            message={<Space>{selectedView.name}{favoriteViewId === selectedView.id && <Tag color="gold" icon={<StarFilled />}>Favorite</Tag>}</Space>}
            description={
              <Space direction="vertical" size={2}>
                <Text style={{ fontSize: 12 }}>
                  Portfolios: {selectedView.formState.portfolioIds.join(", ")} · Periods: {selectedView.formState.periods.join(", ")} · Metric: {selectedView.formState.metric.label}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Updated {new Date(selectedView.updatedAt).toLocaleString()}
                </Text>
              </Space>
            }
          />
        )}

        <Row gutter={8}>
          <Col span={12}>
            <Input
              size="small"
              value={viewName}
              placeholder="View name"
              onChange={(event) => setViewName(event.target.value)}
            />
          </Col>
          <Col span={8}>
            <Input
              size="small"
              value={description}
              placeholder="Description optional"
              onChange={(event) => setDescription(event.target.value)}
            />
          </Col>
          <Col span={4}>
            <Button
              size="small"
              type="primary"
              icon={<SaveOutlined />}
              disabled={!viewName.trim()}
              onClick={() => onSave(viewName, description)}
              block
            >
              Save
            </Button>
          </Col>
        </Row>

        <Text type="secondary" style={{ fontSize: 12 }}>
          Saved views persist portfolio scope, periods, metric, dataset source, filters, grid mode, selected columns, and can be marked as the favorite view to preload on page load.
        </Text>
      </Space>
    </Card>
  );
}
