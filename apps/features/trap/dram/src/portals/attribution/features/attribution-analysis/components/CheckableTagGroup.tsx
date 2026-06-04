import React, { useMemo } from "react";
import { Tag, Space, Button } from "antd";

const { CheckableTag } = Tag;

/**
 * Generic option type
 */
export type CheckableTagOption<T extends string> = {
  label: string;
  value: T;
  disabled?: boolean;
};

/**
 * Props
 */
export type CheckableTagGroupProps<T extends string> = {
  options: CheckableTagOption<T>[];

  /** Controlled value */
  value?: T[];

  /** Default value (for uncontrolled mode) */
  defaultValue?: T[];

  /** Change handler */
  onChange?: (next: T[]) => void;

  /** Layout */
  gap?: number;

  /** Features */
  showSelectAll?: boolean;
  showClear?: boolean;

  /** Disable whole group */
  disabled?: boolean;
};

/**
 * Reusable CheckableTagGroup
 */
export function CheckableTagGroup<T extends string>(
  props: CheckableTagGroupProps<T>
) {
  const {
    options,
    value,
    defaultValue = [],
    onChange,
    gap = 8,
    showSelectAll = false,
    showClear = false,
    disabled = false,
  } = props;

  // fallback internal state if uncontrolled
  const [internal, setInternal] = React.useState<T[]>(defaultValue);

  const isControlled = value !== undefined;
  const selected = isControlled ? value! : internal;

  const update = (next: T[]) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  /**
   * Toggle single
   */
  const toggle = (val: T, checked: boolean) => {
    if (disabled) return;

    const next = checked
      ? [...selected, val]
      : selected.filter((v) => v !== val);

    update(next);
  };

  /**
   * Select all (only non-disabled)
   */
  const allEnabledValues = useMemo(
    () => options.filter((o) => !o.disabled).map((o) => o.value),
    [options]
  );

  const handleSelectAll = () => {
    update(allEnabledValues);
  };

  const handleClear = () => {
    update([]);
  };

  /**
   * Helpers
   */
  const isAllSelected =
    allEnabledValues.length > 0 &&
    allEnabledValues.every((v) => selected.includes(v));

  return (
    <div>
      {(showSelectAll || showClear) && (
        <Space style={{ marginBottom: 8 }}>
          {showSelectAll && (
            <Button
              size="small"
              onClick={handleSelectAll}
              disabled={disabled || isAllSelected}
            >
              Select All
            </Button>
          )}

          {showClear && (
            <Button
              size="small"
              onClick={handleClear}
              disabled={disabled || selected.length === 0}
            >
              Clear
            </Button>
          )}
        </Space>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap }}>
        {options.map((opt) => (
          <CheckableTag
            key={opt.value}
            checked={selected.includes(opt.value)}
            onChange={(checked: boolean) =>
              toggle(opt.value, checked)
            }
          >
            {opt.label}
          </CheckableTag>
        ))}
      </div>
    </div>
  );
}
