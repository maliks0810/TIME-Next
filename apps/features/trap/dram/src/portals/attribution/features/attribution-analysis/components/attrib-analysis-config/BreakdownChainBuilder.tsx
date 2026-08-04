import React from "react";
import {
  Button,
  Card,
  Empty,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  HolderOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  EMPTY_BREAKDOWN_CHAIN,
  type BreakdownChain,
  type BreakdownLevel,
  type BreakdownPreset,
} from "./ConfigTabbedCompact";
import { AssetClass } from "../../lib/types";
import { filterDimensionsForAssetClass } from "./breakdownScoping";

const { Text } = Typography;


interface BreakdownChainBuilderProps {
  value?: BreakdownChain;
  onChange: (next: BreakdownChain) => void;
  availableDimensions: BreakdownLevel[];
  presets: BreakdownPreset[];
  /** Currently selected asset class — filters available dimensions and presets. */
  assetClass?: AssetClass | null;
}


const groupColors: Record<string, string> = {
  classification: "blue",
  geo: "green",
  credit: "orange",
  custom: "default",
};

function SortableLevelRow({
  level,
  index,
  onRemove,
}: {
  level: BreakdownLevel;
  index: number;
  onRemove: (dimensionId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: level.dimensionId });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 8px",
    marginBottom: 4,
    background: "#ffffff",
    border: "1px solid #d8dee9",
    borderRadius: 6,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <span
        {...attributes}
        {...listeners}
        style={{ cursor: "grab", color: "#64748b" }}
      >
        <HolderOutlined />
      </span>
      <Tag color="default" style={{ margin: 0, fontSize: 11 }}>
        L{index + 1}
      </Tag>
      <Text style={{ flex: 1 }}>{level.label}</Text>

      {level.group && (
        <Tag color={groupColors[level.group] ?? "default"} style={{ margin: 0 }}>
          {level.group}
        </Tag>
      )}

      <Tooltip title="Remove level">
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onRemove(level.dimensionId)}
        />
      </Tooltip>
    </div>
  );
}


interface BreakdownChainBuilderProps {
  value?: BreakdownChain;
  onChange: (next: BreakdownChain) => void;
  availableDimensions: BreakdownLevel[];
  presets: BreakdownPreset[];
  /** Currently selected asset class — filters available dimensions and presets. */
  assetClass?: AssetClass | null;
}

export function BreakdownChainBuilder({
  value,
  onChange,
  availableDimensions,
  presets,
  assetClass,
}: BreakdownChainBuilderProps) {
  const chain = value ?? EMPTY_BREAKDOWN_CHAIN;

  const scopedDimensions = React.useMemo(
    () => filterDimensionsForAssetClass(availableDimensions, assetClass ?? null),
    [availableDimensions, assetClass],
  );

  // const scopedPresets = React.useMemo(
  //   () => filterPresetsForAssetClass(presets, assetClass ?? null),
  //   [presets, assetClass],
  // );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const selectedIds = React.useMemo(
    () => new Set(chain.levels.map((l) => l.dimensionId)),
    [chain.levels],
  );

  const remainingDimensions = React.useMemo(
    () => scopedDimensions.filter((d) => !selectedIds.has(d.dimensionId)),
    [scopedDimensions, selectedIds],
  );

  // const presetOptions = React.useMemo(() => {
  //   const groups: Record<string, { label: string; value: string }[]> = {};
  //   for (const preset of scopedPresets) {
  //     const key = preset.category;
  //     if (!groups[key]) groups[key] = [];
  //     groups[key].push({ label: preset.label, value: preset.id });
  //   }
  //   return Object.entries(groups).map(([category, options]) => ({
  //     label: category.charAt(0).toUpperCase() + category.slice(1),
  //     options,
  //   }));
  // }, [scopedPresets]);

  // const handleApplyPreset = (presetId: string) => {
  //   const preset = scopedPresets.find((p) => p.id === presetId);
  //   if (!preset) return;
  //   onChange({
  //     presetId: preset.id,
  //     levels: [...preset.levels],
  //   });
  // };

  const handleAddLevel = (dimensionId: string) => {
    const dimension = scopedDimensions.find((d) => d.dimensionId === dimensionId);
    if (!dimension) return;
    console.log(presets);
    onChange({
      presetId: undefined,
      levels: [...chain.levels, dimension],
    });
  };


  const handleRemoveLevel = (dimensionId: string) => {
    onChange({
      presetId: undefined,
      levels: chain.levels.filter((l) => l.dimensionId !== dimensionId),
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;
    const oldIndex = chain.levels.findIndex(
      (l) => l.dimensionId === active.id,
    );
    const newIndex = chain.levels.findIndex(
      (l) => l.dimensionId === over.id,
    );
    if (oldIndex < 0 || newIndex < 0) return;
    onChange({
      presetId: undefined,
      levels: arrayMove(chain.levels, oldIndex, newIndex),
    });
  };

  // const handleClear = () => onChange(EMPTY_BREAKDOWN_CHAIN);

  return (
    <Space direction="vertical" size={8} style={{ width: "100%" }}>
      {/* Preset picker */}
      {/* <Space size={6} style={{ width: "100%" }}>
        <Select
          size="small"
          style={{ flex: 1, minWidth: 240 }}
          placeholder="Load preset chain (e.g., GICS L1-L2)"
          value={chain.presetId}
          onChange={handleApplyPreset}
          options={presetOptions}
          allowClear
        />
        <Tooltip title="Clear all levels">
          <Button
            size="small"
            onClick={handleClear}
            disabled={chain.levels.length === 0}
          >
            Clear
          </Button>
        </Tooltip>
      </Space> */}

      {/* Current chain */}
      <Card
        size="small"
        title={
          <Space size={6}>
            <Text strong style={{ fontSize: 12 }}>
              Drill-down chain
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {chain.levels.length === 0
                ? "No levels — analysis will use a flat grouping"
                : `${chain.levels.length} level${chain.levels.length > 1 ? "s" : ""}`}
            </Text>
          </Space>
        }
        style={{ borderRadius: 6 }}
        bodyStyle={{ padding: 8 }}
      >
        {chain.levels.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Add levels below"
            style={{ margin: "8px 0" }}
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={chain.levels.map((l) => l.dimensionId)}
              strategy={verticalListSortingStrategy}
            >
              {chain.levels.map((level, index) => (
                <SortableLevelRow
                  key={level.dimensionId}
                  level={level}
                  index={index}
                  onRemove={handleRemoveLevel}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </Card>

      {/* Add level */}
      {remainingDimensions.length > 0 && (
        <Select
          size="small"
          style={{ width: "100%" }}
          placeholder="Add a level to the chain"
          value={undefined}
          onChange={handleAddLevel}
          showSearch
          optionFilterProp="label"
          options={remainingDimensions.map((d) => ({
            label: d.label,
            value: d.dimensionId,
          }))}
          suffixIcon={<PlusOutlined />}
        />
      )}
    </Space>
  );
}