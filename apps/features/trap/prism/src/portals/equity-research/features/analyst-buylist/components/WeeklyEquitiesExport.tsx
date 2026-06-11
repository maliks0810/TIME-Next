/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { Button } from 'antd';
import { saveAs } from 'file-saver';
import { formatDate } from '../../../lib/helpers';
import ExcelIcon from '../../analyst-performance/lib/icons';
import { getWeeklyEquitiesExport } from '../../../../../lib/services';

const XLSX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

// Prefer the server-provided filename (Content-Disposition) when present.
const resolveFilename = (headers: any, fallback: string): string => {
  const disposition = headers?.['content-disposition'];
  if (typeof disposition === 'string') {
    const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i.exec(disposition);
    if (match?.[1]) {
      try {
        return decodeURIComponent(match[1]);
      } catch {
        return match[1];
      }
    }
  }
  return fallback;
};

export const WeeklyEquitiesExport: React.FC = () => {
  const [isExcelPreparing, setIsExcelPreparing] = React.useState<boolean>(false);

  const exportToExcel = async () => {
    try {
      setIsExcelPreparing(true);

      const resp = await getWeeklyEquitiesExport();

      const today = formatDate(new Date().toDateString());
      const filename = resolveFilename(resp.headers, `Weekly Equities ${today}.xlsx`);

      const blob = new Blob([resp.data], { type: XLSX_MIME_TYPE });
      saveAs(blob, filename);
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.warn('An error has occurred. Please try again.');
      }
    } finally {
      setIsExcelPreparing(false);
    }
  };

  return (
    <div>
      <Button icon={<ExcelIcon />} loading={isExcelPreparing} onClick={exportToExcel} />
    </div>
  );
};
