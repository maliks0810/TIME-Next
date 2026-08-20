import axios from "axios";
import type { SnapshotBookPdfRequest } from "./types";

const api = axios.create({ baseURL: "/api" });

function filenameFromDisposition(value: string | undefined): string | null {
  const match = value?.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? null;
}

export async function exportSnapshotBookPdf(request: SnapshotBookPdfRequest): Promise<void> {
  const response = await api.post<Blob>(
    "/performance/snapshot-book/export/pdf/",
    request,
    { responseType: "blob" },
  );
  const filename =
    filenameFromDisposition(response.headers["content-disposition"] as string | undefined) ??
    `TCW_Daily_Performance_Snapshot_Book_${request.asOfDate.replaceAll("-", "")}.pdf`;
  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
