import React from "react";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import type { UnifiedAttributionRow } from "../types/unifiedDriverAttribution";

interface ExportButtonProps {
  rows: UnifiedAttributionRow[];
  fileName?: string;
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export function ExportButton({ rows, fileName = "driver-attribution-export.csv" }: ExportButtonProps): React.ReactElement {
  function handleExport(): void {
    const headers = ["period", "group", "driverSide", "driverRank", "driverScoreBps", "allocationEffect", "selectionEffect", "interactionEffect", "totalEffect"];
    const lines = [headers.join(",")];
    rows.forEach((row) => {
      const values = [
        row.periodId,
        row.groupLabel,
        row.driverSide ?? "",
        row.driverRank?.toString() ?? "",
        row.driverScoreBps?.toString() ?? "",
        row.values.allocationEffect?.toString() ?? "",
        row.values.selectionEffect?.toString() ?? "",
        row.values.interactionEffect?.toString() ?? "",
        row.values.totalEffect?.toString() ?? row.values.manualValue?.toString() ?? "",
      ];
      lines.push(values.map(escapeCsv).join(","));
    });

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  return <Button icon={<DownloadOutlined />} onClick={handleExport}>Export</Button>;
}
