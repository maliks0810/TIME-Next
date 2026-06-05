
type AxiosResponseLike<T> = { data: T };

export function hasData<T>(v: unknown): v is AxiosResponseLike<T> {
  return typeof v === "object" && v !== null && "data" in v;
}

export function unwrapData<T>(resp: unknown): T {
  return hasData<T>(resp) ? resp.data : (resp as T);
}


export type WorksheetListResponse = {
  worksheets: string[];
};

export type WorksheetColumn = {
  title: string;
  dataIndex: string;
  key: string;
  ellipsis?: boolean;
  width?: number;
};

export type WorksheetPreviewResponse = {
  worksheetName: string;
  rowCount: number;
  columnCount: number;
  columns: WorksheetColumn[];
  rows: Record<string, unknown>[];
  truncated?: boolean;
};

export type WorksheetListPayload =
  | { worksheets: string[] }
  | { sheetNames: string[] }
  | string[];

// Minimal HTML entity decode for common cases (avoids pulling a DOM parser)
export function decodeHtml(s: string): string {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

// Make a safe object key that matches columns <-> rows for Table
export function toSafeKey(k: string): string {
  const decoded = decodeHtml(k);
  return decoded
    .replace(/[\\/]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "_");
}

export function normalizePreview(preview: WorksheetPreviewResponse): WorksheetPreviewResponse {
  const colMap = new Map<string, string>();
  const normalizedCols: WorksheetColumn[] = preview.columns.map((c) => {
    const title = decodeHtml(String(c.title));
    const safe = toSafeKey(String(c.dataIndex ?? c.key ?? title));
    colMap.set(String(c.dataIndex ?? c.key ?? title), safe);
    return { ...c, title, dataIndex: safe, key: safe };
  });

  const normalizedRows = preview.rows.map((r) => {
    const out: Record<string, unknown> = {};
    for (const [rawKey, val] of Object.entries(r)) {
      const safe = colMap.get(rawKey) ?? toSafeKey(rawKey);
      out[safe] = val;
    }
    return out;
  });

  return { ...preview, columns: normalizedCols, rows: normalizedRows };
}


export function parseWorksheetNames(payload: WorksheetListPayload): string[] {
  if (Array.isArray(payload)) return payload;
  if ("worksheets" in payload) return payload.worksheets;
  if ("sheetNames" in payload) return payload.sheetNames;
  return [];
}
