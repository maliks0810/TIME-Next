/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';  
import ExcelJS from 'exceljs';  
import { Button } from 'antd';  
import { saveAs } from 'file-saver';  
import { formatDate } from '../../../lib/helpers';
import { RecommendationItem } from '../lib/types';  
import ExcelIcon from '../../analyst-performance/lib/icons';
  
interface ClientSideExportProps {  
  data: RecommendationItem[];  
  runDate: any;  
}

const parseNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;

  // Handle "1,234.56" or "$1,234.56" etc.
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  const num = Number(cleaned);

  return Number.isFinite(num) ? num : null;
};

  
export const ClientSideExport: React.FC<ClientSideExportProps> = ({ data, runDate }) => {  
  const [isExcelPreparing, setIsExcelPreparing] = React.useState<boolean>(false);  
  
  const exportToExcel = async () => {  
    try {  
      setIsExcelPreparing(true);  
      const workbook = new ExcelJS.Workbook();  
      workbook.creator = 'TCW Risk and Research';  
      workbook.created = new Date();  
  
      const sheet = workbook.addWorksheet('Buy List', { views: [{ showGridLines: false }] });  
  
      // Merge cells and format header with text  
      sheet.mergeCells('A1:E1');  
      sheet.getCell('A1').value = {  
        richText: [  
          {  
            font: { size: 12, name: 'ScalaSansLF-Bold' },  
            text: `${data.some(item => item.droppedDate) ? 'US Equity Research Department - Analyst Dropped List' : 'US Equity Research Department - Analyst Buy List'}`  
          }  
        ],  
      };  
      sheet.mergeCells('A2:E2');  
      sheet.getCell('A2').value = {  
        richText: [  
          { font: { size: 9, name: 'ScalaSansLF-Regular' }, text: `As of ${runDate}` },  
        ],  
      };  
      sheet.mergeCells('F3:M3');  
      sheet.getCell('F3').value = {  
        richText: [  
          { font: { size: 9, name: 'Times New Roman' }, text: 'Buy Recommendations Initiated During Past 12 Months are Denoted with a <' },  
        ],  
      };  
      sheet.getCell('A3').border = {  
        bottom: { style: 'thin' },  
      };  
  
      const headers = [  
        'Sector', 'Industry', 'Analyst', 'Ticker', 'Security Name', 'Market Cap ($MM)',  
        'Current Price', 'Target Price', 'ESG Score', 'Upside', 'Buy Rec Date', 'LTM',  
        'YTD Performance', 'No. Portfolios', 'TCW Dollar Exposure', 'Portfolios'  
      ];  
  
      // Check if any item has a removedDate field  
      const hasRemovedDate = data.some(item => item.droppedDate);  
  
      if (hasRemovedDate) {  
        headers.push('Removed Date');  
      }  
  
      const headerRow = sheet.getRow(4);  
      headerRow.height = 45;  
  
      headers.forEach((header, index) => {  
        const cell = headerRow.getCell(index + 1);  
        cell.value = {  
          richText: [  
            {  
              font: {  
                size: 10, color: { argb: 'FFFFFFFF' }, name: 'Times New Roman', bold: true,  
              },  
              text: header,  
            },  
          ],  
        };  
        cell.fill = {  
          type: 'pattern',  
          pattern: 'solid',  
          fgColor: { argb: '22425F' },  
        };  
        cell.alignment = {  
          wrapText: true,  
          vertical: 'middle',  
          horizontal: 'center',  
        };  
      });  
  
      // Assign widths and key  
      const columns = [  
        { key: 'sector', width: 20 },  
        { key: 'industry', width: 20 },  
        { key: 'analyst', width: 10 },  
        { key: 'ticker', width: 10 },  
        { key: 'securityName', width: 30 },  
        { key: 'marketCap', width: 8 },  
        { key: 'currentPrice', width: 8 },  
        { key: 'targetPrice', width: 8 },  
        { key: 'esgScore', width: 8 },  
        { key: 'upside', width: 9 },  
        { key: 'buyRecDate', width: 10 },  
        { key: 'ltm', width: 5 },  
        { key: 'ytdPerformance', width: 10 },  
        { key: 'portfolioCount', width: 6 },  
        { key: 'tcwDollarExposure', width: 16 },  
        { key: 'portfolios', width: 100 }  
      ];  
  
      if (hasRemovedDate) {  
        columns.push({ key: 'removedDate', width: 10 });  
      }  
  
      sheet.columns = columns;  
  
      
      const formattedData = data.map((item: RecommendationItem) => ({
        ...item,
        marketCap: parseNumber(item.marketCap) ?? '',
        currentPrice: parseNumber(item.currentPrice) ?? '',
      }));
  
  
      sheet.addRows(formattedData);  
  
      const startRow = 5;  
  
      for (let i = 0; i < formattedData.length; i++) {  
        const rowNumber = startRow + i;  
  
        sheet.getCell(rowNumber, 6).numFmt = '#,##0'; // Market Cap with commas + 2 decimals
        sheet.getCell(rowNumber, 7).numFmt = '#,##0.00'; // Current Price
        sheet.getCell(rowNumber, 8).numFmt = '#,##0'; // Target
        sheet.getCell(rowNumber, 9).numFmt = '0.00'; // ESG Score
        sheet.getCell(rowNumber, 10).numFmt = '0.00%'; // Upside  
        sheet.getCell(rowNumber, 13).numFmt = '0.00%'; // YTD Perf Total Return   
        sheet.getCell(rowNumber, 15).numFmt = '$0.00'; // TCW Dollar Exposure
  
        // Set the removedDate value if it exists  
        if (hasRemovedDate && formattedData[i].droppedDate) {  
          sheet.getCell(rowNumber, headers.length).value = formattedData[i].droppedDate;  
        }  
      }  
  
      // Merge identical sector and industry cells by tracking identical cells needed to merge and then merging once initial pass is completed  
      // Implemented because Excel does not allow merging of already merged cells  
  
      // Also check if buyRecDate is within last year  
      let sectorStart = startRow;  
      let industryStart = startRow;  
  
      const oneYearAgo = new Date();  
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);  
  
      for (let i = 0; i < formattedData.length; i++) {  
        const currentRow = startRow + i;  
        const nextRow = currentRow + 1;  
  
        if (i < formattedData.length - 1) {  
          const currentSector = formattedData[i].sector;  
          const nextSector = formattedData[i + 1].sector;  
          const currentIndustry = formattedData[i].industry;  
          const nextIndustry = formattedData[i + 1].industry;  
  
          let isSectorBottomRow = false;  
  
          // Merge sector cells  
          if (currentSector === nextSector) {  
            if (sectorStart === currentRow) {  
              sectorStart = currentRow;  
            }  
          } else {  
            if (sectorStart !== currentRow) {  
              sheet.mergeCells(`A${sectorStart}:A${currentRow}`);  
              sheet.getCell(`A${currentRow}`).alignment = { vertical: 'middle', horizontal: 'left' };  
  
              // Iterates over A to P and applies a bottom border  
              for (let col = 0; col < 15; col++) {  
                const borderCell = String.fromCharCode(65 + col);  
                sheet.getCell(`${borderCell}${currentRow}`).border = {  
                  bottom: { style: 'thin' },  
                };  
              }  
              isSectorBottomRow = true;  
            } else {  
              for (let col = 0; col < 13; col++) {  
                const borderCell = String.fromCharCode(65 + col);  
                sheet.getCell(`${borderCell}${currentRow}`).border = {  
                  bottom: { style: 'thin' },  
                };  
              }  
              isSectorBottomRow = true;  
            }  
            sectorStart = nextRow;  
          }  
  
          // Merge industry cells  
          if (currentIndustry === nextIndustry) {  
            if (industryStart === currentRow) {  
              industryStart = currentRow;  
            }  
          } else {  
            if (industryStart !== currentRow) {  
              sheet.mergeCells(`B${industryStart}:B${currentRow}`);  
              sheet.getCell(`B${currentRow}`).alignment = { vertical: 'middle', horizontal: 'left' };  
            }  
            if (isSectorBottomRow) {  
              sheet.getCell(`B${currentRow}`).border = {  
                bottom: { style: 'thin' },  
              };  
            } else {  
              sheet.getCell(`B${currentRow}`).border = {  
                bottom: { style: 'hair' },  
              };  
            }  
            industryStart = nextRow;  
          }  
  
          // Assigns the < if within last 12 months  
          const buyRecDate = new Date(formattedData[i].buyRecDate);  
          if (buyRecDate > oneYearAgo) {  
            sheet.getCell(`L${currentRow}`).value = '<';  
          }  
  
          // Set alternating row colors in columns except sector and industry  
          if (i % 2 === 0) {  
            for (let col = 3; col <= 15; col++) {  
              sheet.getCell(`${String.fromCharCode(65 + col)}${currentRow}`).fill = {  
                type: 'pattern',  
                pattern: 'solid',  
                fgColor: { argb: 'DEDEDE' },  
              };  
            }  
          }  
        }  
      }  
      if (sectorStart !== formattedData.length + startRow - 1) {  
        sheet.mergeCells(`A${sectorStart}:A${formattedData.length + startRow - 1}`);  
        sheet.getCell(`A${formattedData.length + startRow - 1}`).alignment = { vertical: 'middle', horizontal: 'left' };  
      }  
      if (industryStart !== formattedData.length + startRow - 1) {  
        sheet.mergeCells(`B${industryStart}:B${formattedData.length + startRow - 1}`);  
        sheet.getCell(`B${formattedData.length + startRow - 1}`).alignment = { vertical: 'middle', horizontal: 'left' };  
      }  
      const style = {  
        font: { name: 'Times New Roman', size: 8 },  
      };  
  
      // Can't set style by range according to ExcelJS Issue #379 - setting individually and running a loop  
      for (let row = 4; row <= sheet.rowCount; row++) {  
        const currentRow = sheet.getRow(row);  
        for (let col = 1; col <= 16; col++) {  
          const cell = currentRow.getCell(col);  
          cell.font = style.font;  
        }  
      }  
      const rawDate = new Date().toDateString();  
      const today = formatDate(rawDate);  
      const buffer = await workbook.xlsx.writeBuffer();  
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });  
      saveAs(blob, `${hasRemovedDate ? `Analyst Dropped List ${today}.xlsx` : `Analyst Buy List ${today}.xlsx`}`);  
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
      <Button  
        icon={<ExcelIcon />}  
        loading={isExcelPreparing}  
        onClick={exportToExcel}  
      />  
    </div>  
  );  
};