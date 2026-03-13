/* eslint-disable @typescript-eslint/no-explicit-any */
import "devextreme/dist/css/dx.light.css";
import { useCallback, useEffect, useState } from "react";
import DataGrid, {
  Column,
  SearchPanel,
  Grouping,
  GroupPanel,
  LoadPanel,
  Paging,
  Scrolling,
} from "devextreme-react/data-grid";
import FormatPercent, {
  formatAnalystPerformanceLabel,
  FormatBMPercent,
  formatDate,
} from "../../../lib/helpers";
import { getCoverageList } from "../../../../../lib/services";
import { Coverage } from "../../../lib/types";
import { CoverageExport } from "./CoverageExport";
import "../../../../../lib/styles.scss";

export default function CoverageDataGrid() {
  const [data, setData] = useState<Coverage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [runDate, setRunDate] = useState("");

  const fetchCoverageList = useCallback(async () => {
    setIsLoading(true);
    try {
      const resp = await getCoverageList();
      const now = new Date();
      setRunDate(formatDate(now.toString()));

      const items = (resp.data as any).equitiesAnalystCoverageList.results.results;
      const json: Coverage[] = items.map((item: any) => ({
        coverageDate: item.coverageDate,
        securityKey: item.securityKey,
        ticker: String(item.ticker ?? "").toUpperCase(),
        isin: String(item.isin ?? "").toUpperCase(),
        companyName: item.companyName,
        sectorName: item.sectorName,
        groupName: item.groupName,
        industryName: item.industryName,
        subIndustryName: item.subIndustryName,
        benchmarkWeight: item.benchmarkWeight,
        onBuyList: item.onBuyList,
        marketCap: item.marketCap,
        mtd: item.mtd,
        qtd: item.qtd,
        ytd: item.ytd,
        analystName: formatAnalystPerformanceLabel(item.analystName),
      }));

      setData(json);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        console.warn(`An error has occurred receiving the coverage list: ${e}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoverageList();
  }, [fetchCoverageList]);

  const onCellPrepared = (e: any) => {
    if (e.rowType === "data" && e.column.dataField === "ticker") {
      e.cellElement.style.fontWeight = "bold";
    }

    if (
      e.rowType === "group" &&
      ["analystName", "sectorName", "industryName"].includes(e.column.dataField)
    ) {
      const colonIndex = e.cellElement.textContent.indexOf(":");
      if (colonIndex !== -1) {
        e.cellElement.textContent = e.cellElement.textContent
          .substring(colonIndex + 1)
          .trim();
      }
    }

    if (e.rowType === "header") {
      e.cellElement.style.textAlign = "center";
    }

    if (
      e.rowType === "data" &&
      ["isin", "benchmarkWeight", "mtd", "qtd", "ytd", "marketCap", "coverageDate"].includes(
        e.column.dataField
      )
    ) {
      e.cellElement.style.textAlign = "right";
    }

    if (e.rowType === "data" && ["mtd", "qtd", "ytd"].includes(e.column.dataField)) {
      const value = parseFloat(e.value);
      if (!isNaN(value)) {
        if (value > 0) e.cellElement.style.color = "#175340";
        else if (value < 0) e.cellElement.style.color = "#A33A29";
      }
    }
  };

  return (
    <div style={{ margin: "24px 3%" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontWeight: 600 }}>US Equity Research Department - Analyst Coverage List</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ opacity: 0.8 }}>As of {runDate}</div>
          <CoverageExport data={data} runDate={runDate} />
        </div>
      </div>

      <DataGrid
        className="analyst-coverage-datagrid analyst-coverage-headers"
        dataSource={data}
        showBorders={false}
        showColumnLines={false}
        showRowLines={false}
        keyExpr="securityKey"
        allowColumnReordering
        rowAlternationEnabled={true}
        onCellPrepared={onCellPrepared}
        height={`calc(90vh - var(--main-header-height))`}
      >
        <Scrolling mode="virtual" />
        <SearchPanel visible={true} />
        <GroupPanel visible={true} />
        <Grouping autoExpandAll={false} />
        <Paging enabled={false} />

        <Column dataField="analystName" groupIndex={0} />
        <Column width={"10%"} dataField="sectorName" caption="Sector" dataType="string" />
        <Column width={"17%"} dataField="industryName" caption="Industry" dataType="string" />
        <Column width={"15%"} dataField="companyName" dataType="string" />
        <Column width={"5%"} dataField="ticker" dataType="string" />
        <Column width={"9%"} dataField="isin" caption="ISIN" />

        <Column
          width={"6%"}
          dataField="benchmarkWeight"
          caption="Ignored"
          headerCellRender={() => (
            <div style={{ textAlign: "center" }}>
              Benchmark <br />
              Weight %
            </div>
          )}
          calculateCellValue={(row) => Number((row as any).benchmarkWeight)}
          cellRender={({ value }) => <FormatBMPercent value={value} />}
        />

        <Column
          width={"6%"}
          dataField="onBuyList"
          dataType="boolean"
          caption="Ignored"
          headerCellRender={() => (
            <div style={{ textAlign: "center" }}>
              On Buy <br />
              List
            </div>
          )}
        />

        <Column
          width={"6%"}
          dataField="marketCap"
          caption="Ignored"
          headerCellRender={() => (
            <div style={{ textAlign: "center" }}>
              Market <br />
              Cap $MM
            </div>
          )}
          calculateCellValue={(row) => Number((row as any).marketCap)}
          cellRender={({ value }) =>
            Number(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
          }
        />

        <Column
          width={"6%"}
          dataField="mtd"
          caption="MTD %"
          dataType="number"
          calculateCellValue={(row) => Number((row as any).mtd)}
          cellRender={({ value }) => <FormatPercent value={value} />}
        />
        <Column
          width={"6%"}
          dataField="qtd"
          caption="QTD %"
          dataType="number"
          calculateCellValue={(row) => Number((row as any).qtd)}
          cellRender={({ value }) => <FormatPercent value={value} />}
        />
        <Column
          width={"6%"}
          dataField="ytd"
          caption="YTD %"
          dataType="number"
          calculateCellValue={(row) => Number((row as any).ytd)}
          cellRender={({ value }) => <FormatPercent value={value} />}
        />

        <Column width={"8%"} dataField="coverageDate" dataType="date" />
        <LoadPanel enabled={isLoading} />
      </DataGrid>
    </div>
  );
}
