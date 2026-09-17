import { buildDram2UrlNonAttribution } from "../api/services";
import { downloadExport } from "../api/download";

export async function exportSnapshotBookPdf(): Promise<void> {

  const exportUrl = buildDram2UrlNonAttribution(
          `/api/performance/snapshot-book/export/pdf/?include_funds=true&include_ucits_usd=true&include_ucits_eur=true&include_strategy=true`
        );
        await downloadExport(
          exportUrl,
          `Daily Flash_Performance Snapshot.pdf`
  );
}