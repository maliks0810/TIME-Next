import { SelectorItem } from "./types/alphaDashboard";

interface PillSelectorProps<T extends string> {
  items: Array<SelectorItem<T>>;
  value: T;
  onChange: (value: T) => void;
}

const ui = {
  pills: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap" as const,
  },
  pill: {
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#0f172a",
    borderRadius: 999,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  activePill: {
    background: "#0f172a",
    color: "#ffffff",
    borderColor: "#0f172a",
  },
};

export function PillSelector<T extends string>({
  items,
  value,
  onChange,
}: PillSelectorProps<T>) {
  return (
    <div style={ui.pills}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            style={{ ...ui.pill, ...(active ? ui.activePill : null) }}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
