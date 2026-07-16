import React from "react";
import { Button, Card, Empty, Input, Space, Tag, Tooltip, Typography } from "antd";
import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  HolderOutlined,
  SearchOutlined
} from "@ant-design/icons";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DriverColumnConfigItem, DriverColumnConfigState } from "./columnConfigTypes";

const { Text } = Typography;

type ListSide = "available" | "selected";

interface ColumnConfiguratorProps {
  value: DriverColumnConfigState;
  onChange: (next: DriverColumnConfigState) => void;
}

interface ColumnRowProps {
  column: DriverColumnConfigItem;
  selected?: boolean;
  sortable?: boolean;
  onClick?: () => void;
}

function ColumnRow({ column, selected, sortable, onClick }: ColumnRowProps) {
  const sortableApi = useSortable({ id: column.key, disabled: !sortable });
  const draggableApi = useDraggable({ id: column.key, disabled: sortable });

  const attributes = sortable ? sortableApi.attributes : draggableApi.attributes;
  const listeners = sortable ? sortableApi.listeners : draggableApi.listeners;
  const setNodeRef = sortable ? sortableApi.setNodeRef : draggableApi.setNodeRef;
  const transform = sortable ? sortableApi.transform : draggableApi.transform;
  const transition = sortable ? sortableApi.transition : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 8px",
        marginBottom: 4,
        border: selected ? "1px solid #2563eb" : "1px solid #d8dee9",
        borderRadius: 6,
        background: selected ? "#eff6ff" : "#fff",
        cursor: "pointer",
        boxShadow: selected ? "0 1px 4px rgba(37, 99, 235, 0.18)" : undefined
      }}
      onClick={onClick}
    >
      <span
        {...attributes}
        {...listeners}
        style={{ cursor: "grab", color: "#64748b", display: "inline-flex" }}
      >
        <HolderOutlined />
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <Text strong={column.required} ellipsis style={{ display: "block" }}>
          {column.title}
        </Text>
        <Text type="secondary" style={{ fontSize: 11 }}>
          {column.category ?? "General"} · {column.dataIndex}
        </Text>
      </div>

      {column.required && <Tag color="red">Required</Tag>}
    </div>
  );
}

interface ColumnListProps {
  title: string;
  side: ListSide;
  columns: DriverColumnConfigItem[];
  selectedKey?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSelect: (key: string) => void;
  sortable?: boolean;
}

function ColumnList({
  title,
  side,
  columns,
  selectedKey,
  searchValue,
  onSearchChange,
  onSelect,
  sortable
}: ColumnListProps) {
  const { setNodeRef, isOver } = useDroppable({ id: side });

  const filteredColumns = columns.filter((column) => {
    const term = searchValue.trim().toLowerCase();
    if (!term) return true;

    return (
      column.title.toLowerCase().includes(term) ||
      column.dataIndex.toLowerCase().includes(term) ||
      column.category?.toLowerCase().includes(term)
    );
  });

  return (
    <Card
      size="small"
      title={
        <Space>
          <span>{title}</span>
          <Tag>{columns.length}</Tag>
        </Space>
      }
      bodyStyle={{ padding: 8 }}
      style={{
        flex: 1,
        minWidth: 0,
        borderRadius: 8,
        border: isOver ? "1px solid #2563eb" : "1px solid #d8dee9"
      }}
    >
      <Input
        size="small"
        allowClear
        prefix={<SearchOutlined />}
        placeholder={`Search ${title.toLowerCase()}`}
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        style={{ marginBottom: 8 }}
      />

      <div
        ref={setNodeRef}
        style={{
          minHeight: 320,
          maxHeight: 360,
          overflowY: "auto",
          padding: 4,
          borderRadius: 6,
          background: isOver ? "#eff6ff" : "#f8fafc"
        }}
      >
        {filteredColumns.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No columns" />
        ) : sortable ? (
          <SortableContext items={columns.map((column) => column.key)} strategy={verticalListSortingStrategy}>
            {filteredColumns.map((column) => (
              <ColumnRow
                key={column.key}
                column={column}
                sortable
                selected={selectedKey === column.key}
                onClick={() => onSelect(column.key)}
              />
            ))}
          </SortableContext>
        ) : (
          filteredColumns.map((column) => (
            <ColumnRow
              key={column.key}
              column={column}
              selected={selectedKey === column.key}
              onClick={() => onSelect(column.key)}
            />
          ))
        )}
      </div>
    </Card>
  );
}

export function ColumnConfigurator({ value, onChange }: ColumnConfiguratorProps) {
  const [availableSearch, setAvailableSearch] = React.useState("");
  const [selectedSearch, setSelectedSearch] = React.useState("");
  const [activeColumn, setActiveColumn] = React.useState<DriverColumnConfigItem | null>(null);
  const [selectedAvailableKey, setSelectedAvailableKey] = React.useState<string>();
  const [selectedSelectedKey, setSelectedSelectedKey] = React.useState<string>();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const allColumns = React.useMemo(
    () => [...value.availableColumns, ...value.selectedColumns],
    [value.availableColumns, value.selectedColumns]
  );

  const findColumn = (key: string) => allColumns.find((column) => column.key === key);

  const moveAvailableToSelected = (key?: string) => {
    if (!key) return;

    const column = value.availableColumns.find((item) => item.key === key);
    if (!column) return;

    onChange({
      availableColumns: value.availableColumns.filter((item) => item.key !== key),
      selectedColumns: [...value.selectedColumns, column]
    });

    setSelectedAvailableKey(undefined);
    setSelectedSelectedKey(key);
  };

  const moveSelectedToAvailable = (key?: string) => {
    if (!key) return;

    const column = value.selectedColumns.find((item) => item.key === key);
    if (!column || column.required) return;

    onChange({
      availableColumns: [...value.availableColumns, column].sort((a, b) => a.title.localeCompare(b.title)),
      selectedColumns: value.selectedColumns.filter((item) => item.key !== key)
    });

    setSelectedSelectedKey(undefined);
    setSelectedAvailableKey(key);
  };

  const moveSelectedUp = () => {
    if (!selectedSelectedKey) return;

    const currentIndex = value.selectedColumns.findIndex((item) => item.key === selectedSelectedKey);
    if (currentIndex <= 0) return;

    onChange({
      ...value,
      selectedColumns: arrayMove(value.selectedColumns, currentIndex, currentIndex - 1)
    });
  };

  const moveSelectedDown = () => {
    if (!selectedSelectedKey) return;

    const currentIndex = value.selectedColumns.findIndex((item) => item.key === selectedSelectedKey);
    if (currentIndex < 0 || currentIndex >= value.selectedColumns.length - 1) return;

    onChange({
      ...value,
      selectedColumns: arrayMove(value.selectedColumns, currentIndex, currentIndex + 1)
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const column = findColumn(String(event.active.id));
    setActiveColumn(column ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);

    const activeKey = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : undefined;
    if (!overId) return;

    const activeInAvailable = value.availableColumns.some((column) => column.key === activeKey);
    const activeInSelected = value.selectedColumns.some((column) => column.key === activeKey);

    if (activeInAvailable) {
      const column = value.availableColumns.find((item) => item.key === activeKey);
      const selectedDropIndex = value.selectedColumns.findIndex((item) => item.key === overId);

      if (column && (overId === "selected" || selectedDropIndex >= 0)) {
        const nextSelected = [...value.selectedColumns];
        nextSelected.splice(selectedDropIndex >= 0 ? selectedDropIndex : nextSelected.length, 0, column);

        onChange({
          availableColumns: value.availableColumns.filter((item) => item.key !== activeKey),
          selectedColumns: nextSelected
        });

        setSelectedAvailableKey(undefined);
        setSelectedSelectedKey(activeKey);
        return;
      }
    }

    if (activeInSelected) {
      const availableDropTarget =
        overId === "available" || value.availableColumns.some((column) => column.key === overId);

      if (availableDropTarget) {
        moveSelectedToAvailable(activeKey);
        return;
      }

      const oldIndex = value.selectedColumns.findIndex((column) => column.key === activeKey);
      const newIndex = value.selectedColumns.findIndex((column) => column.key === overId);

      if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
        onChange({
          ...value,
          selectedColumns: arrayMove(value.selectedColumns, oldIndex, newIndex)
        });
      }
    }
  };

  const canRemoveSelected =
    selectedSelectedKey &&
    !value.selectedColumns.find((column) => column.key === selectedSelectedKey)?.required;

  return (
    <div>
      <Space
        align="center"
        style={{ width: "100%", justifyContent: "space-between", marginBottom: 8 }}
      >
        <div>
          <Text strong>Column Configuration</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Choose visible columns and arrange their display order.
          </Text>
        </div>

        <Tag color="blue">{value.selectedColumns.length} selected</Tag>
      </Space>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
          <ColumnList
            title="Available Columns"
            side="available"
            columns={value.availableColumns}
            selectedKey={selectedAvailableKey}
            searchValue={availableSearch}
            onSearchChange={setAvailableSearch}
            onSelect={(key) => {
              setSelectedAvailableKey(key);
              setSelectedSelectedKey(undefined);
            }}
          />

          <Space direction="vertical" size={6} style={{ justifyContent: "center", minWidth: 42 }}>
            <Tooltip title="Move to selected">
              <Button
                size="small"
                icon={<ArrowRightOutlined />}
                disabled={!selectedAvailableKey}
                onClick={() => moveAvailableToSelected(selectedAvailableKey)}
              />
            </Tooltip>

            <Tooltip title="Move to available">
              <Button
                size="small"
                icon={<ArrowLeftOutlined />}
                disabled={!canRemoveSelected}
                onClick={() => moveSelectedToAvailable(selectedSelectedKey)}
              />
            </Tooltip>

            <div style={{ height: 12 }} />

            <Tooltip title="Move selected column up">
              <Button size="small" icon={<ArrowUpOutlined />} disabled={!selectedSelectedKey} onClick={moveSelectedUp} />
            </Tooltip>

            <Tooltip title="Move selected column down">
              <Button size="small" icon={<ArrowDownOutlined />} disabled={!selectedSelectedKey} onClick={moveSelectedDown} />
            </Tooltip>
          </Space>

          <ColumnList
            title="Selected Columns"
            side="selected"
            columns={value.selectedColumns}
            selectedKey={selectedSelectedKey}
            searchValue={selectedSearch}
            onSearchChange={setSelectedSearch}
            onSelect={(key) => {
              setSelectedSelectedKey(key);
              setSelectedAvailableKey(undefined);
            }}
            sortable
          />
        </div>

        <DragOverlay>
          {activeColumn ? (
            <div
              style={{
                padding: "6px 8px",
                border: "1px solid #2563eb",
                borderRadius: 6,
                background: "#fff",
                boxShadow: "0 6px 16px rgba(15, 23, 42, 0.18)"
              }}
            >
              <Text strong>{activeColumn.title}</Text>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
