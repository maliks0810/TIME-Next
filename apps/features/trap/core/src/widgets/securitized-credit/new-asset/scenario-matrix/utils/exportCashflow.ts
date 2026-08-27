/**
 * Scenario Matrix — self-describing XLSX export of a bound scenario's cash flow,
 * via the standard exceljs path (same as the Table widget).
 */
import { Workbook } from "exceljs";
import type { Scenario } from "../types";
import { SCENARIO_USER, assumptionString, nowStamp } from "./scenarioSummary";

type ExportInput = {
    scenario: Scenario;
    dealName: string;
    trancheName: string;
    rows: Array<{ id: string; label: string; on: boolean }>;
    unit: Record<string, string>;
    fileName: string;
};

export async function exportCashflowXlsx(input: ExportInput): Promise<void> {
    const { scenario, dealName, trancheName, rows, unit, fileName } = input;
    if (!scenario.cashflow) return;

    const wb = new Workbook();
    const sheet = wb.addWorksheet("Cash Flow");
    sheet.addRow(["TCW TRAP — Scenario Cash Flow Export"]);
    sheet.addRow(["Deal", dealName]);
    sheet.addRow(["Tranche", trancheName]);
    sheet.addRow(["Scenario", scenario.name]);
    sheet.addRow(["Price", scenario.price]);
    sheet.addRow(["Assumptions", assumptionString(rows, unit, scenario)]);
    sheet.addRow(["Exported", nowStamp()]);
    sheet.addRow(["User", SCENARIO_USER]);
    sheet.addRow([]);
    sheet.addRow(["Period", "Beg Bal", "Principal", "Interest", "Defaults", "Recovery", "End Bal"]);
    scenario.cashflow.forEach((p) => {
        sheet.addRow([p.period, p.beginBal, p.principal, p.interest, p.defaults, p.recovery, p.endBal]);
    });

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${fileName}.xlsx`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}