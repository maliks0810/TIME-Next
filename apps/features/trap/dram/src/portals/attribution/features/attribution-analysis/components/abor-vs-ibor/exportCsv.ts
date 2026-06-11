export interface CsvColumn<T> {
  key: keyof T;
  header: string;
  format?: (value: T[keyof T], row: T) => string;
}

function escapeCsvValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function exportRowsToCsv<T extends Record<string, unknown> | object>(
  fileName: string,
  rows: T[],
  columns: CsvColumn<T>[],
): void {
  const headers = columns.map((column) => escapeCsvValue(column.header)).join(",");

  const dataLines = rows.map((row) =>
    columns
      .map((column) => {
        const rawValue = row[column.key];
        const formatted = column.format
          ? column.format(rawValue, row)
          : String(rawValue ?? "");

        return escapeCsvValue(formatted);
      })
      .join(","),
  );

  const csv = [headers, ...dataLines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}