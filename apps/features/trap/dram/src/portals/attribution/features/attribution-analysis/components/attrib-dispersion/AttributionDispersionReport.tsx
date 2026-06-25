import { useMemo, useState } from "react";
import { AttributionDispersionResponse, Primitive } from "../../lib/types";

type Props = { data?: AttributionDispersionResponse; className?: string };

function formatCellValue(v: Primitive | undefined) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "string") return v;
  const abs = Math.abs(v);
  if (abs !== 0 && abs < 1) return v.toLocaleString(undefined, { maximumFractionDigits: 5 });
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

const columnLabel = (col: string) => col.replaceAll("_", " ");

export default function AttributionDispersionReport({ data, className }: Props) {
  const grids = data?.data.grids ?? [];
  const [activeGridIdx, setActiveGridIdx] = useState(0);

  const activeGrid = grids[activeGridIdx];

  const columns = useMemo(() => {
    if (!activeGrid?.rows?.length) return [];
    const keySet = new Set<string>();
    for (const r of activeGrid.rows) Object.keys(r).forEach((k) => keySet.add(k));
    return Array.from(keySet);
  }, [activeGrid]);

const { page_title } = data?.data.metadata ?? {};

  return (
    <div className={className} style={{ fontFamily: "Segoe UI, system-ui, sans-serif" }}>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>{page_title ?? "Report"}</h2>
      </div>

      {grids.length > 1 && (
        <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {grids.map((g, idx) => (
            <button
              key={`${g.title}-${idx}`}
              type="button"
              onClick={() => setActiveGridIdx(idx)}
            >
              {g.title}
            </button>
          ))}
        </div>
      )}

      {!activeGrid ? (
        <div>No grids available.</div>
      ) : (
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c}>{columnLabel(c)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeGrid.rows?.map((row, ridx) => (
              <tr key={ridx}>
                {columns.map((c) => (
                  <td key={`${ridx}-${c}`}>{formatCellValue(row[c])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
